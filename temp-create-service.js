const fs = require('fs');

const serviceCode = String.raw`import prisma from "@/lib/db/prisma";
import { NotFoundError } from "@/lib/http/errors";
import { logger } from "@/lib/logger/logger";
import type {
  StudentView,
  ClassView,
  ClassWithStudents,
  TeacherStudentsResponse,
} from "./teacher-app.types";

export class TeacherStudentService {
  async getStudentsForTeacher(
    userId: string,
    view: "class-teacher" | "subject-teacher" = "class-teacher",
    classId?: string | null
  ): Promise<TeacherStudentsResponse> {
    logger.info("Getting students for teacher", { userId, view, classId });
    
    const teacher = await prisma.teacherProfile.findUnique({
      where: { userId },
      select: { id: true },
    });
    
    if (!teacher) {
      throw new NotFoundError("Teacher profile not found");
    }
    
    const academicYear = await prisma.academicYear.findFirst({
      where: { isActive: true },
      select: { id: true, year: true },
    });
    
    if (!academicYear) {
      throw new NotFoundError("No active academic year found");
    }
    
    if (view === "class-teacher") {
      return this.getClassTeacherStudents(teacher.id, academicYear.id);
    } else {
      return this.getSubjectTeacherStudents(teacher.id, academicYear.id, classId);
    }
  }
  
  private async getClassTeacherStudents(
    teacherId: string,
    academicYearId: string
  ): Promise<TeacherStudentsResponse> {
    const assignment = await prisma.classTeacherAssignment.findFirst({
      where: { teacherId, academicYearId },
      include: {
        class: {
          include: {
            grade: true,
            enrollments: {
              where: { academicYearId },
              include: {
                student: {
                  include: {
                    studentGuardians: {
                      take: 1,
                      include: { guardian: true },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });
    
    if (!assignment) {
      logger.info("No class teacher assignment found", { teacherId });
      return { view: "class-teacher", class: null, students: [] };
    }
    
    const classView: ClassView = {
      id: assignment.class.id,
      name: assignment.class.name,
      grade: assignment.class.grade.name,
      gradeLevel: assignment.class.grade.level.toString(),
      capacity: assignment.class.capacity,
      enrolled: assignment.class.enrollments.length,
    };
    
    const students = assignment.class.enrollments.map((enrollment) =>
      this.mapToStudentView(enrollment.student, enrollment.student.studentGuardians)
    );
    
    logger.info("Found ${students.length} students for class teacher", { teacherId, classId: classView.id });
    
    return { view: "class-teacher", class: classView, students };
  }
  
  private async getSubjectTeacherStudents(
    teacherId: string,
    academicYearId: string,
    classId?: string | null
  ): Promise<TeacherStudentsResponse> {
    const assignments = await prisma.subjectTeacherAssignment.findMany({
      where: {
        teacherId,
        academicYearId,
        ...(classId ? { classId } : {}),
      },
      include: {
        class: {
          include: {
            grade: true,
            enrollments: {
              where: { academicYearId },
              include: {
                student: {
                  include: {
                    studentGuardians: {
                      take: 1,
                      include: { guardian: true },
                    },
                  },
                },
              },
            },
          },
        },
        subject: true,
      },
    });
    
    const classes: ClassWithStudents[] = assignments.map((assignment) => ({
      id: assignment.class.id,
      name: assignment.class.name,
      grade: assignment.class.grade.name,
      gradeLevel: assignment.class.grade.level.toString(),
      subject: assignment.subject.name,
      subjectCode: assignment.subject.code,
      subjectId: assignment.subject.id,
      capacity: assignment.class.capacity,
      enrolled: assignment.class.enrollments.length,
      students: assignment.class.enrollments.map((enrollment) =>
        this.mapToStudentView(enrollment.student, enrollment.student.studentGuardians)
      ),
    }));
    
    logger.info("Found ${classes.length} classes for subject teacher", {
      teacherId,
      totalStudents: classes.reduce((sum, c) => sum + c.students.length, 0),
    });
    
    return { view: "subject-teacher", classes, selectedClassId: classId };
  }
  
  private mapToStudentView(student: any, guardians: any[]): StudentView {
    const fullName = "$"+ "{student.firstName} $"+ "{student.middleName || ''} $"+ "{student.lastName}";
    const guardianName = guardians[0] ? "$"+ "{guardians[0].guardian.firstName} $"+ "{guardians[0].guardian.lastName}" : null;
    
    return {
      id: student.id,
      studentNumber: student.studentNumber,
      firstName: student.firstName,
      middleName: student.middleName,
      lastName: student.lastName,
      fullName: fullName.trim(),
      gender: student.gender,
      dateOfBirth: student.dateOfBirth,
      status: student.status,
      vulnerability: student.vulnerability,
      hasGuardian: guardians.length > 0,
      guardianName,
    };
  }
  
  async canAccessClass(userId: string, classId: string): Promise<boolean> {
    const teacher = await prisma.teacherProfile.findUnique({
      where: { userId },
      select: { id: true },
    });
    
    if (!teacher) return false;
    
    const academicYear = await prisma.academicYear.findFirst({
      where: { isActive: true },
      select: { id: true },
    });
    
    if (!academicYear) return false;
    
    const classTeacherAssignment = await prisma.classTeacherAssignment.findFirst({
      where: { teacherId: teacher.id, classId, academicYearId: academicYear.id },
    });
    
    if (classTeacherAssignment) return true;
    
    const subjectTeacherAssignment = await prisma.subjectTeacherAssignment.findFirst({
      where: { teacherId: teacher.id, classId, academicYearId: academicYear.id },
    });
    
    return !!subjectTeacherAssignment;
  }
}

export const teacherStudentService = new TeacherStudentService();
`;

// Fix template strings
const finalCode = serviceCode.replace(/"\$"/g, '`$').replace(/\$"\+/g, '$').replace(/\"\{/g, '{');

fs.writeFileSync('features/teachers/teacher-student.service.ts', finalCode);
console.log('TeacherStudentService created');
