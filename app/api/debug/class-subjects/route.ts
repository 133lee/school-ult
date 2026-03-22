// TEMPORARY: Check class subjects and teacher assignments
import { NextResponse } from 'next/server';
import prisma from '@/lib/db/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const className = searchParams.get('class') || 'Grade 8 Blue';

    // Find the class
    const classRecord = await prisma.class.findFirst({
      where: {
        name: {
          contains: className,
          mode: 'insensitive'
        }
      },
      include: {
        gradeLevel: true,
        gradeSubjects: {
          include: {
            subject: true
          }
        }
      }
    });

    if (!classRecord) {
      return NextResponse.json({
        error: `Class '${className}' not found`
      }, { status: 404 });
    }

    // Get all subject-teacher assignments for this grade level
    const assignments = await prisma.subjectTeacherAssignment.findMany({
      where: {
        gradeLevelId: classRecord.gradeLevelId,
        classId: classRecord.id
      },
      include: {
        subject: true,
        teacher: {
          include: {
            user: true
          }
        }
      }
    });

    // Map subjects to their teachers
    const subjectsWithTeachers = classRecord.gradeSubjects.map(gs => {
      const assignment = assignments.find(a => a.subjectId === gs.subjectId);
      return {
        subjectId: gs.subjectId,
        subjectName: gs.subject.name,
        subjectCode: gs.subject.code,
        hasTeacher: !!assignment,
        teacher: assignment ? {
          id: assignment.teacher.id,
          name: `${assignment.teacher.user.firstName} ${assignment.teacher.user.lastName}`,
          email: assignment.teacher.user.email
        } : null
      };
    });

    const missingTeachers = subjectsWithTeachers.filter(s => !s.hasTeacher);

    return NextResponse.json({
      class: {
        id: classRecord.id,
        name: classRecord.name,
        gradeLevel: classRecord.gradeLevel.name
      },
      totalSubjects: subjectsWithTeachers.length,
      subjectsWithTeachers: subjectsWithTeachers.filter(s => s.hasTeacher).length,
      subjectsWithoutTeachers: missingTeachers.length,
      subjects: subjectsWithTeachers,
      missingAssignments: missingTeachers.map(s => ({
        subjectId: s.subjectId,
        subjectName: s.subjectName,
        subjectCode: s.subjectCode
      }))
    });

  } catch (error: any) {
    return NextResponse.json({
      error: error.message,
      stack: error.stack
    }, { status: 500 });
  }
}
