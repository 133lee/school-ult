import { NextRequest, NextResponse } from 'next/server';
import { renderToStream } from '@react-pdf/renderer';
import { reportCardService } from '@/features/report-cards/reportCard.service';
import { verifyToken } from '@/lib/auth/jwt';
import { AuthContext } from '@/lib/auth/authorization';
import { UnauthorizedError, NotFoundError } from '@/lib/errors';
import {
  SeniorReportCard,
  JuniorReportCard,
  Form1ReportCard,
  getReportCardType,
} from '@/components/report-cards';
import { getSchoolInfo, getSchoolLogoBase64 } from '@/lib/settings/school-info-helper';
import React from 'react';

/**
 * GET /api/report-cards/[id]/pdf
 * Generate and download PDF for a specific report card
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Await params (Next.js 15+ requirement)
    const { id } = await params;

    // Extract and verify JWT token
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      );
    }

    const context: AuthContext = {
      userId: decoded.userId,
      role: decoded.role as any,
    };

    // Fetch report card data
    const reportCard = await reportCardService.getReportCardWithRelations(
      id,
      context
    );

    if (!reportCard) {
      return NextResponse.json(
        { error: 'Report card not found' },
        { status: 404 }
      );
    }

    // Fetch school settings
    const schoolInfo = await getSchoolInfo();
    const logoBase64 = await getSchoolLogoBase64();

    // Transform data for PDF
    const pdfData = {
      pupilName: `${reportCard.student.firstName} ${reportCard.student.middleName || ''} ${reportCard.student.lastName}`.trim(),
      class: reportCard.class.name,
      classTeacher: `${reportCard.classTeacher.firstName} ${reportCard.classTeacher.lastName}`,
      year: reportCard.academicYear.year.toString(),
      bestOfSix: reportCard.averageMark?.toFixed(1) || 'N/A',
      status: reportCard.promotionStatus || 'In Progress',
      subjects: reportCard.subjects.map((sub) => ({
        name: sub.subject.name,
        mid: sub.midMark ?? '-',
        eot: sub.eotMark ?? '-',
        comment: sub.remarks || '',
      })),
      teacherComment: reportCard.classTeacherRemarks || '',
      headTeacherComment: reportCard.headTeacherRemarks || '',
      schoolName: schoolInfo.name,
      logoUrl: logoBase64 || undefined,
    };

    // Determine report card type based on grade level
    const reportCardType = getReportCardType(reportCard.class.grade.level);

    // Select appropriate component
    let pdfComponent;
    switch (reportCardType) {
      case 'JUNIOR':
        pdfComponent = React.createElement(JuniorReportCard, { data: pdfData });
        break;
      case 'FORM1':
        pdfComponent = React.createElement(Form1ReportCard, { data: pdfData });
        break;
      case 'SENIOR':
      default:
        pdfComponent = React.createElement(SeniorReportCard, { data: pdfData });
        break;
    }

    // Generate PDF stream
    const stream = await renderToStream(pdfComponent);

    // Convert stream to buffer for Next.js response
    const chunks: Uint8Array[] = [];
    for await (const chunk of stream) {
      chunks.push(chunk);
    }
    const pdfBuffer = Buffer.concat(chunks);

    // Return PDF with appropriate headers
    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="ReportCard_${reportCard.student.studentNumber}_${reportCard.term.termType}.pdf"`,
      },
    });
  } catch (error: any) {
    console.error('Error generating PDF:', error);

    if (error instanceof UnauthorizedError) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }

    if (error instanceof NotFoundError) {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }

    return NextResponse.json(
      { error: 'Failed to generate PDF' },
      { status: 500 }
    );
  }
}
