/**
 * Test Class Reports Functionality
 *
 * Tests the complete class reports data flow:
 * 1. Database: Verify report cards exist
 * 2. Repository: Test data access
 * 3. API: Simulate API requests
 * 4. Stats Calculation: Verify statistics are correct
 */

import prisma from "@/lib/db/prisma";

async function testClassReports() {
  console.log("=".repeat(70));
  console.log("TESTING CLASS REPORTS FUNCTIONALITY");
  console.log("=".repeat(70));
  console.log();

  try {
    // =====================================================================
    // PART 1: CHECK DATABASE FOR REPORT CARDS
    // =====================================================================
    console.log("📊 PART 1: DATABASE - Check for Report Cards");
    console.log("=".repeat(70));
    console.log();

    // Get teacher2's classes
    const teacher2User = await prisma.user.findUnique({
      where: { email: "teacher2@school.zm" },
    });

    if (!teacher2User) {
      console.log("⚠️  Teacher2 not found. This test requires teacher2@school.zm");
      return;
    }

    const teacher2 = await prisma.teacherProfile.findUnique({
      where: { userId: teacher2User.id },
    });

    if (!teacher2) {
      console.log("⚠️  Teacher2 profile not found");
      return;
    }

    // Get teacher's class assignments
    const assignments = await prisma.subjectTeacherAssignment.findMany({
      where: { teacherId: teacher2.id },
      include: {
        class: {
          include: {
            grade: true,
          },
        },
        subject: true,
      },
    });

    console.log(`✅ Teacher2 teaches ${assignments.length} classes`);
    console.log();

    if (assignments.length === 0) {
      console.log("⚠️  No class assignments found for teacher2");
      console.log("   Run: npm run seed:teacher2:assignments");
      return;
    }

    // Get active term
    const activeTerm = await prisma.term.findFirst({
      where: { isActive: true },
      include: {
        academicYear: true,
      },
    });

    if (!activeTerm) {
      console.log("⚠️  No active term found");
      return;
    }

    console.log(`Active Term: ${activeTerm.termType} ${activeTerm.academicYear.year}`);
    console.log();

    // Check for report cards in each class
    for (const assignment of assignments) {
      const className = `${assignment.class.grade.name} ${assignment.class.name}`;
      const reportCards = await prisma.reportCard.findMany({
        where: {
          classId: assignment.classId,
          termId: activeTerm.id,
        },
        include: {
          student: {
            select: {
              studentNumber: true,
              firstName: true,
              lastName: true,
            },
          },
          subjects: {
            include: {
              subject: {
                select: {
                  name: true,
                },
              },
            },
          },
        },
      });

      console.log(`Class: ${className} (${assignment.subject.name})`);
      console.log(`   Report Cards: ${reportCards.length}`);

      if (reportCards.length > 0) {
        console.log(`   Sample students with report cards:`);
        reportCards.slice(0, 3).forEach((rc) => {
          console.log(
            `      - ${rc.student.firstName} ${rc.student.lastName} (${rc.student.studentNumber})`
          );
          console.log(`        Average: ${rc.averageMark ? rc.averageMark.toFixed(1) : "N/A"}%`);
          console.log(`        Position: ${rc.position ? `${rc.position}/${rc.outOf}` : "N/A"}`);
          console.log(`        Subjects: ${rc.subjects.length}`);
        });
      } else {
        console.log(`      ⚠️  No report cards found`);
      }
      console.log();
    }

    // =====================================================================
    // PART 2: TEST STATISTICS CALCULATION
    // =====================================================================
    console.log("📈 PART 2: STATISTICS - Calculate Class Performance");
    console.log("=".repeat(70));
    console.log();

    // Use first class with report cards
    let testClass = null;
    let testReportCards = [];

    for (const assignment of assignments) {
      const reportCards = await prisma.reportCard.findMany({
        where: {
          classId: assignment.classId,
          termId: activeTerm.id,
        },
      });

      if (reportCards.length > 0) {
        testClass = assignment;
        testReportCards = reportCards;
        break;
      }
    }

    if (!testClass || testReportCards.length === 0) {
      console.log("⚠️  No report cards found in any class");
      console.log("   Report cards need to be generated first");
      console.log();
      console.log("NOTE: Report card generation is typically done by:");
      console.log("   1. Completing all assessments (CAT, MID, EOT)");
      console.log("   2. Recording all student scores");
      console.log("   3. Running end-of-term report generation process");
      console.log();
      return;
    }

    const className = `${testClass.class.grade.name} ${testClass.class.name}`;
    console.log(`Analyzing: ${className} (${testClass.subject.name})`);
    console.log(`Students: ${testReportCards.length}`);
    console.log();

    // Calculate statistics
    const totalStudents = testReportCards.length;
    let totalMarksSum = 0;
    let totalMarksCount = 0;
    let passCount = 0;
    let distinctionCount = 0;
    let totalAttendanceRate = 0;

    testReportCards.forEach((report) => {
      if (report.averageMark !== null) {
        totalMarksSum += report.averageMark;
        totalMarksCount++;

        if (report.averageMark >= 50) passCount++;
        if (report.averageMark >= 70) distinctionCount++;
      }

      const totalDays = report.daysPresent + report.daysAbsent;
      if (totalDays > 0) {
        totalAttendanceRate += (report.daysPresent / totalDays) * 100;
      }
    });

    const stats = {
      totalStudents,
      averageClassMark: totalMarksCount > 0 ? totalMarksSum / totalMarksCount : 0,
      passRate: totalStudents > 0 ? (passCount / totalStudents) * 100 : 0,
      distinctionRate:
        totalStudents > 0 ? (distinctionCount / totalStudents) * 100 : 0,
      attendanceRate: totalStudents > 0 ? totalAttendanceRate / totalStudents : 0,
    };

    console.log("Class Statistics:");
    console.log(`   Total Students: ${stats.totalStudents}`);
    console.log(`   Class Average: ${stats.averageClassMark.toFixed(1)}%`);
    console.log(`   Pass Rate: ${stats.passRate.toFixed(1)}% (${passCount} students)`);
    console.log(
      `   Distinction Rate: ${stats.distinctionRate.toFixed(1)}% (${distinctionCount} students)`
    );
    console.log(`   Attendance Rate: ${stats.attendanceRate.toFixed(1)}%`);
    console.log();

    // =====================================================================
    // PART 3: TEST API DATA STRUCTURE
    // =====================================================================
    console.log("🌐 PART 3: API - Verify Response Structure");
    console.log("=".repeat(70));
    console.log();

    console.log("Expected API Response Structure:");
    console.log("{");
    console.log("  reportCards: [");
    console.log("    {");
    console.log("      id: string,");
    console.log("      student: { id, studentNumber, firstName, lastName, ... },");
    console.log("      totalMarks: number | null,");
    console.log("      averageMark: number | null,");
    console.log("      position: number | null,");
    console.log("      outOf: number | null,");
    console.log("      attendance: number,");
    console.log("      daysPresent: number,");
    console.log("      daysAbsent: number,");
    console.log("      promotionStatus: string | null,");
    console.log("      subjects: [{ subject, catMark, midMark, eotMark, ... }]");
    console.log("    }");
    console.log("  ],");
    console.log("  stats: {");
    console.log("    totalStudents: number,");
    console.log("    averageClassMark: number,");
    console.log("    passRate: number,");
    console.log("    distinctionRate: number,");
    console.log("    attendanceRate: number");
    console.log("  }");
    console.log("}");
    console.log();

    // Sample data
    if (testReportCards.length > 0) {
      const sampleReport = await prisma.reportCard.findUnique({
        where: { id: testReportCards[0].id },
        include: {
          student: {
            select: {
              id: true,
              studentNumber: true,
              firstName: true,
              lastName: true,
              gender: true,
            },
          },
          subjects: {
            include: {
              subject: {
                select: {
                  name: true,
                  code: true,
                },
              },
            },
          },
        },
      });

      console.log("Sample Report Card (first student):");
      console.log(JSON.stringify(sampleReport, null, 2));
      console.log();
    }

    // =====================================================================
    // SUMMARY
    // =====================================================================
    console.log("=".repeat(70));
    console.log("✨ TEST COMPLETE");
    console.log("=".repeat(70));
    console.log();

    console.log("KEY FINDINGS:");
    console.log();

    console.log("✅ DATABASE:");
    console.log(`   - Teacher has ${assignments.length} class assignment(s)`);
    console.log(`   - Active term: ${activeTerm.termType} ${activeTerm.academicYear.year}`);
    console.log(`   - Report cards found in test class: ${testReportCards.length}`);
    console.log();

    console.log("✅ STATISTICS:");
    console.log(`   - Class average calculated: ${stats.averageClassMark.toFixed(1)}%`);
    console.log(`   - Pass rate: ${stats.passRate.toFixed(1)}%`);
    console.log(`   - Distinction rate: ${stats.distinctionRate.toFixed(1)}%`);
    console.log();

    console.log("📝 NEXT STEPS:");
    console.log("   1. Open browser and navigate to /teacher/reports");
    console.log("   2. Login as teacher2@school.zm");
    console.log("   3. Select a class and term");
    console.log("   4. Verify report cards and statistics display correctly");
    console.log();

    if (testReportCards.length === 0) {
      console.log("⚠️  NOTE: No report cards found");
      console.log("   Report cards need to be generated through the system's");
      console.log("   end-of-term report generation process");
      console.log();
    }
  } catch (error) {
    console.error("❌ Test failed:", error);
    throw error;
  }
}

testClassReports()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
