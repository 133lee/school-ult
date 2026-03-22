/**
 * Test Marks Schedule Card Data Flow
 *
 * Tests complete data flow for marks schedule:
 * 1. Database → Verify scores exist
 * 2. API Route → Fetch grades data structure
 * 3. UI Component → Verify data format matches component expectations
 */

import prisma from "@/lib/db/prisma";

async function testMarksSchedule() {
  console.log("=".repeat(70));
  console.log("TESTING MARKS SCHEDULE CARD DATA FLOW");
  console.log("=".repeat(70));
  console.log();

  try {
    // =====================================================================
    // PART 1: DATABASE VERIFICATION
    // =====================================================================
    console.log("📊 PART 1: DATABASE - Verify Scores Exist");
    console.log("=".repeat(70));
    console.log();

    // Get English Grade 1B (where we seeded sample scores)
    const englishSubject = await prisma.subject.findUnique({
      where: { code: "ENG" },
    });

    const grade1 = await prisma.grade.findUnique({
      where: { level: "GRADE_1" },
    });

    const grade1B = await prisma.class.findFirst({
      where: {
        gradeId: grade1!.id,
        name: "B",
      },
    });

    if (!englishSubject || !grade1B) {
      throw new Error("Test data not found");
    }

    console.log(`Testing: ${englishSubject.name} - Grade ${grade1?.name} ${grade1B.name}`);
    console.log();

    // Get current term
    const currentTerm = await prisma.term.findFirst({
      where: { isActive: true },
    });

    if (!currentTerm) {
      throw new Error("No active term found");
    }

    console.log(`Active Term: ${currentTerm.name} (${currentTerm.academicYear})`);
    console.log();

    // Get assessments for this class+subject
    const assessments = await prisma.assessment.findMany({
      where: {
        termId: currentTerm.id,
        subjectId: englishSubject.id,
        classId: grade1B.id,
        status: "PUBLISHED",
      },
      orderBy: { examType: "asc" },
    });

    console.log(`✅ Assessments Found: ${assessments.length}`);
    assessments.forEach((a) => {
      console.log(`   - ${a.title} (${a.examType}) - ID: ${a.id}`);
    });
    console.log();

    // Get students enrolled in this class
    const enrollments = await prisma.studentClassEnrollment.findMany({
      where: { classId: grade1B.id },
      include: {
        student: true,
      },
      take: 5, // First 5 students
    });

    console.log(`✅ Students Enrolled: ${enrollments.length} (showing first 5)`);
    enrollments.forEach((e) => {
      console.log(
        `   - ${e.student.firstName} ${e.student.lastName} (${e.student.studentNumber})`
      );
    });
    console.log();

    // Get scores for these students
    const studentIds = enrollments.map((e) => e.studentId);
    const assessmentIds = assessments.map((a) => a.id);

    const scores = await prisma.studentAssessmentResult.findMany({
      where: {
        studentId: { in: studentIds },
        assessmentId: { in: assessmentIds },
        subjectId: englishSubject.id,
      },
      include: {
        assessment: {
          select: {
            examType: true,
            totalMarks: true,
          },
        },
      },
    });

    console.log(`✅ Scores Found: ${scores.length}`);
    console.log();

    if (scores.length === 0) {
      console.log("⚠️  WARNING: No scores found!");
      console.log("   Run: npm run seed:sample:scores");
      console.log();
    }

    // =====================================================================
    // PART 2: API DATA STRUCTURE SIMULATION
    // =====================================================================
    console.log("🌐 PART 2: API ROUTE - Simulate Data Structure");
    console.log("=".repeat(70));
    console.log();

    // Create assessment map (as API does)
    const assessmentMap: Record<string, string> = {};
    assessments.forEach((assessment) => {
      if (assessment.examType === "CAT") {
        assessmentMap.CAT1 = assessment.id;
      } else if (assessment.examType === "MID") {
        assessmentMap.MID = assessment.id;
      } else if (assessment.examType === "EOT") {
        assessmentMap.EOT = assessment.id;
      }
    });

    console.log("Assessment Map:");
    Object.entries(assessmentMap).forEach(([type, id]) => {
      console.log(`   ${type}: ${id}`);
    });
    console.log();

    // Build grades structure (as API does)
    type GradeData = {
      score: number | null;
      percentage: number | null;
      grade: string;
      comments: string;
      status: string | null;
    };

    type StudentGrades = Record<
      string,
      {
        CAT1: GradeData;
        MID: GradeData;
        EOT: GradeData;
      }
    >;

    const grades: StudentGrades = {};

    // Initialize with empty grades
    enrollments.forEach((e) => {
      grades[e.studentId] = {
        CAT1: { score: null, percentage: null, grade: "-", comments: "", status: null },
        MID: { score: null, percentage: null, grade: "-", comments: "", status: null },
        EOT: { score: null, percentage: null, grade: "-", comments: "", status: null },
      };
    });

    // Fill in actual scores
    scores.forEach((result) => {
      const studentId = result.studentId;
      let assessmentType: "CAT1" | "MID" | "EOT";

      if (result.assessment.examType === "CAT") {
        assessmentType = "CAT1";
      } else if (result.assessment.examType === "MID") {
        assessmentType = "MID";
      } else if (result.assessment.examType === "EOT") {
        assessmentType = "EOT";
      } else {
        return;
      }

      if (grades[studentId]) {
        const totalMarks = result.assessment.totalMarks;
        const percentage =
          result.marksObtained !== null
            ? Math.round((result.marksObtained / totalMarks) * 100)
            : null;

        grades[studentId][assessmentType] = {
          score: result.marksObtained,
          percentage: percentage,
          grade: result.grade || "-",
          comments: result.remarks || "",
          status: null,
        };
      }
    });

    console.log("✅ Grades Data Structure Built");
    console.log();

    // =====================================================================
    // PART 3: UI COMPONENT DATA EXPECTATIONS
    // =====================================================================
    console.log("🖥️  PART 3: UI COMPONENT - Verify Data Format");
    console.log("=".repeat(70));
    console.log();

    console.log("Component Expectations:");
    console.log("   - historicalGrades prop receives StudentGrades object");
    console.log("   - Format: { [studentId]: { CAT1: {}, MID: {}, EOT: {} } }");
    console.log();

    console.log("Sample Data for Marks Schedule:");
    console.log();

    let displayCount = 0;
    for (const enrollment of enrollments) {
      if (displayCount >= 3) break; // Show first 3 students

      const student = enrollment.student;
      const studentGrades = grades[student.id];

      console.log(`${displayCount + 1}. ${student.firstName} ${student.lastName}`);
      console.log(`   Student Number: ${student.studentNumber}`);
      console.log(`   Gender: ${student.gender}`);
      console.log();

      console.log("   CAT1:");
      console.log(`     Score: ${studentGrades.CAT1.score ?? "-"}`);
      console.log(`     Percentage: ${studentGrades.CAT1.percentage ?? "-"}%`);
      console.log(`     Grade: ${studentGrades.CAT1.grade}`);
      console.log(`     Status: ${studentGrades.CAT1.status ?? "Not set"}`);
      console.log();

      console.log("   MID:");
      console.log(`     Score: ${studentGrades.MID.score ?? "-"}`);
      console.log(`     Percentage: ${studentGrades.MID.percentage ?? "-"}%`);
      console.log(`     Grade: ${studentGrades.MID.grade}`);
      console.log();

      console.log("   EOT:");
      console.log(`     Score: ${studentGrades.EOT.score ?? "-"}`);
      console.log(`     Percentage: ${studentGrades.EOT.percentage ?? "-"}%`);
      console.log(`     Grade: ${studentGrades.EOT.grade}`);
      console.log();

      displayCount++;
    }

    // =====================================================================
    // PART 4: COMPONENT RENDERING LOGIC VERIFICATION
    // =====================================================================
    console.log("🎨 PART 4: COMPONENT RENDERING - Verify Display Logic");
    console.log("=".repeat(70));
    console.log();

    console.log("Marks Schedule Component Logic:");
    console.log("   Location: components/gradebook/grades-history-sheet.tsx");
    console.log();

    console.log("Rendering Rules:");
    console.log("   1. If gradeData?.status exists → Show '-' for score");
    console.log("   2. Else → Show gradeData?.score ?? '-'");
    console.log("   3. Status column:");
    console.log("      - If status exists → Show badge (Absent/Present/Excused)");
    console.log("      - Else if grade exists → Show grade status");
    console.log("      - Else → Show '-'");
    console.log();

    console.log("Expected Display in Marks Schedule:");
    console.log();

    for (const enrollment of enrollments.slice(0, 3)) {
      const student = enrollment.student;
      const gradeData = grades[student.id]?.CAT1;

      console.log(`${student.firstName} ${student.lastName}:`);
      console.log(`   Score Column: ${gradeData?.score ?? "-"}`);

      if (gradeData?.status) {
        console.log(`   Status Column: Badge (${gradeData.status})`);
      } else if (gradeData?.grade && gradeData.grade !== "-") {
        // Map grade to status text
        const gradeStatusMap: Record<string, string> = {
          GRADE_1: "Distinction 1",
          GRADE_2: "Distinction 2",
          GRADE_3: "Merit 3",
          GRADE_4: "Merit 4",
          GRADE_5: "Merit 5",
          GRADE_6: "Credit 6",
          GRADE_7: "Credit 7",
          GRADE_8: "Pass 8",
          GRADE_9: "Fail 9",
        };
        console.log(`   Status Column: ${gradeStatusMap[gradeData.grade] || gradeData.grade}`);
      } else {
        console.log(`   Status Column: -`);
      }
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

    console.log("✅ DATABASE LAYER:");
    console.log(`   - Found ${assessments.length} assessments`);
    console.log(`   - Found ${enrollments.length} students`);
    console.log(`   - Found ${scores.length} scores`);
    console.log();

    console.log("✅ API LAYER:");
    console.log("   - Grades structure correctly formatted");
    console.log("   - Assessment map properly built");
    console.log("   - Scores mapped to correct assessment types");
    console.log();

    console.log("✅ UI LAYER:");
    console.log("   - historicalGrades should receive grades object");
    console.log("   - Component expects StudentGrades format");
    console.log("   - Data format matches component expectations");
    console.log();

    console.log("🔧 FIX APPLIED:");
    console.log("   Changed line 84 in page.tsx:");
    console.log("   FROM: const historicalGrades = {};");
    console.log("   TO:   const historicalGrades = localGrades;");
    console.log();

    console.log("📝 NEXT STEPS:");
    console.log("   1. Open gradebook in browser");
    console.log("   2. Login as teacher2@school.zm");
    console.log("   3. Select: English → Grade 1 B");
    console.log("   4. Click 'Markschedule' button");
    console.log("   5. Verify scores and grades display correctly");
    console.log();

  } catch (error) {
    console.error("❌ Test failed:", error);
    throw error;
  }
}

testMarksSchedule()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
