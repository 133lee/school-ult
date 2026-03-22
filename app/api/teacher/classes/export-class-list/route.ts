import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import prisma from "@/lib/db/prisma";
import React from "react";
import { renderToStream } from "@react-pdf/renderer";
import { ClassListPDF } from "@/lib/pdf/class-list-pdf";
import { getSchoolInfo, getSchoolLogoBase64 } from "@/lib/settings/school-info-helper";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

/**
 * GET /api/teacher/classes/export-class-list?classId=xxx&mode=class|subject
 *
 * Export class list (students) as PDF
 */
export async function GET(request: NextRequest) {
  try {
    // Get and verify token
    const token = request.headers.get("Authorization")?.replace("Bearer ", "");
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as {
      userId: string;
      role: string;
    };

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const classId = searchParams.get("classId");
    const mode = searchParams.get("mode") as "class" | "subject" | null;

    if (!classId) {
      return NextResponse.json(
        { error: "classId parameter is required" },
        { status: 400 }
      );
    }

    if (!mode || !["class", "subject"].includes(mode)) {
      return NextResponse.json(
        { error: "mode parameter must be 'class' or 'subject'" },
        { status: 400 }
      );
    }

    // Get teacher profile
    const teacherProfile = await prisma.teacherProfile.findUnique({
      where: { userId: decoded.userId },
      select: { id: true },
    });

    if (!teacherProfile) {
      return NextResponse.json(
        { error: "Teacher profile not found" },
        { status: 404 }
      );
    }

    // Get active academic year
    const academicYear = await prisma.academicYear.findFirst({
      where: { isActive: true },
    });

    if (!academicYear) {
      return NextResponse.json(
        { error: "No active academic year found" },
        { status: 404 }
      );
    }

    // Verify teacher has access to this class
    let subjectName = "";

    if (mode === "class") {
      const classTeacherAssignment =
        await prisma.classTeacherAssignment.findFirst({
          where: {
            teacherId: teacherProfile.id,
            classId,
            academicYearId: academicYear.id,
          },
        });

      if (!classTeacherAssignment) {
        return NextResponse.json(
          { error: "You are not the class teacher for this class" },
          { status: 403 }
        );
      }
    } else if (mode === "subject") {
      const subjectTeacherAssignment =
        await prisma.subjectTeacherAssignment.findFirst({
          where: {
            teacherId: teacherProfile.id,
            classId,
            academicYearId: academicYear.id,
          },
          include: { subject: true },
        });

      if (!subjectTeacherAssignment) {
        return NextResponse.json(
          { error: "You do not teach any subject in this class" },
          { status: 403 }
        );
      }

      subjectName = subjectTeacherAssignment.subject.name;
    }

    // Get class data
    const classData = await prisma.class.findUnique({
      where: { id: classId },
      include: { grade: true },
    });

    if (!classData) {
      return NextResponse.json({ error: "Class not found" }, { status: 404 });
    }

    // Get students
    const enrollments = await prisma.studentClassEnrollment.findMany({
      where: {
        classId,
        academicYearId: academicYear.id,
        status: "ACTIVE",
      },
      include: {
        student: true,
      },
      orderBy: [
        { student: { lastName: "asc" } },
        { student: { firstName: "asc" } },
      ],
    });

    if (enrollments.length === 0) {
      return NextResponse.json(
        { error: "No students found in this class" },
        { status: 404 }
      );
    }

    // Fetch school settings
    const schoolInfo = await getSchoolInfo();
    const logoBase64 = await getSchoolLogoBase64();

    // Prepare data for PDF
    const className = `${classData.grade.name} ${classData.name}`;
    const title =
      mode === "class"
        ? `Class List - ${className}`
        : `Class List - ${className}`;

    const students = enrollments.map((e) => ({
      studentNumber: e.student.studentNumber,
      firstName: e.student.firstName,
      middleName: e.student.middleName,
      lastName: e.student.lastName,
      gender: e.student.gender,
      dateOfBirth: e.student.dateOfBirth,
      admissionDate: e.student.admissionDate,
      status: e.student.status,
    }));

    // Generate PDF
    const pdfComponent = React.createElement(ClassListPDF, {
      title,
      className,
      academicYear: String(academicYear.year),
      subjectName: subjectName || undefined,
      students,
      generatedDate: new Date().toLocaleDateString("en-GB"),
      schoolName: schoolInfo.name,
      logoUrl: logoBase64 || undefined,
    });

    const stream = await renderToStream(pdfComponent as any);

    const chunks: Buffer[] = [];
    for await (const chunk of stream) {
      chunks.push(typeof chunk === "string" ? Buffer.from(chunk) : Buffer.from(chunk));
    }
    const pdfBuffer = Buffer.concat(chunks);

    if (pdfBuffer.length === 0) {
      return NextResponse.json(
        { error: "Failed to generate PDF" },
        { status: 500 }
      );
    }

    // Generate filename
    const safeModeText = mode === "class" ? "ClassTeacher" : "SubjectTeacher";
    const safeClassName = className.replace(/[^a-zA-Z0-9]/g, "_");
    const safeSubject = subjectName
      ? "_" + subjectName.replace(/[^a-zA-Z0-9]/g, "_")
      : "";
    const filename = `ClassList_${safeClassName}${safeSubject}_${safeModeText}_${new Date().toISOString().split("T")[0]}.pdf`;

    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (error: any) {
    console.error("Error exporting class list:", error);
    return NextResponse.json(
      { error: error.message || "Failed to export class list" },
      { status: 500 }
    );
  }
}
