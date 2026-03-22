import 'dotenv/config';
import prisma from './lib/db/prisma';

async function testAPIResponse() {
  console.log('🔍 Testing Performance API Response Format\n');

  // Find a student in Grade 8 Blue
  const student = await prisma.student.findFirst({
    where: {
      enrollments: {
        some: {
          class: {
            name: 'Blue',
            grade: {
              level: 'GRADE_8',
            },
          },
          status: 'ACTIVE',
        },
      },
    },
    include: {
      enrollments: {
        where: { status: 'ACTIVE' },
        include: {
          class: true,
          academicYear: true,
        },
      },
    },
  });

  if (!student || !student.enrollments.length) {
    console.log('❌ No student found in Grade 8 Blue');
    return;
  }

  const enrollment = student.enrollments[0];

  console.log(`Student: ${student.firstName} ${student.lastName}`);
  console.log(`Class: ${enrollment.class.name}`);
  console.log(`\nSimulating API call to:`);
  console.log(`/api/students/${student.id}/performance?classId=${enrollment.classId}&academicYearId=${enrollment.academicYearId}`);
  console.log('\n' + '='.repeat(70));

  // Import the performance calculator
  const {
    calculatePercentage,
    percentageToECZPoints,
    percentageToOldSystemGrade,
    calculateBestSixPoints,
    getCurriculumType,
  } = await import('./lib/services/performance-calculator');

  // Get grade level
  const classData = await prisma.class.findUnique({
    where: { id: enrollment.classId },
    select: {
      grade: {
        select: {
          level: true,
        },
      },
    },
  });

  if (!classData?.grade) {
    console.log('❌ Class or grade not found');
    return;
  }

  const curriculumType = getCurriculumType(classData.grade.level);

  // Get active term
  const activeTerm = await prisma.term.findFirst({
    where: {
      academicYearId: enrollment.academicYearId,
      isActive: true,
    },
  });

  if (!activeTerm) {
    console.log('⚠️  No active term found');
    return;
  }

  // Get class subjects
  const classSubjects = await prisma.classSubject.findMany({
    where: { classId: enrollment.classId },
    select: {
      subjectId: true,
      isCore: true,
      subject: { select: { name: true } },
    },
  });

  const subjectCoreMap = new Map(
    classSubjects.map((cs) => [cs.subjectId, cs.isCore])
  );

  // Get CAT assessments
  const assessments = await prisma.assessment.findMany({
    where: {
      classId: enrollment.classId,
      termId: activeTerm.id,
      status: 'COMPLETED',
      examType: 'CAT',
    },
    include: {
      subject: { select: { id: true, name: true } },
      results: {
        where: { studentId: student.id },
        select: { marksObtained: true },
      },
    },
  });

  // Calculate scores
  const scores = assessments
    .filter((a) => a.results.length)
    .map((a) => {
      const pct = calculatePercentage(
        a.results[0].marksObtained,
        a.totalMarks
      );
      return {
        subject: a.subject.name,
        subjectId: a.subjectId,
        score: a.results[0].marksObtained,
        totalMarks: a.totalMarks,
        isCore: subjectCoreMap.get(a.subjectId) ?? false,
        percentage: pct,
        points:
          curriculumType === 'NEW_SYSTEM'
            ? percentageToECZPoints(pct)
            : percentageToOldSystemGrade(pct),
      };
    });

  let bestSixValue = null;
  let bestSixCount = null;
  let bestSixType = 'points';
  let bestSixMax = null;

  if (scores.length) {
    const result = calculateBestSixPoints(scores, curriculumType);
    if (result) {
      bestSixValue = result.value;
      bestSixCount = result.count;
      bestSixType = result.type;
      bestSixMax = result.maxValue;
    }
  }

  // This is what the API returns
  const apiResponse = {
    bestSix: bestSixValue,
    bestSixCount,
    bestSixType,
    bestSixMax,
    curriculumType,
  };

  console.log('\n📤 API Response (what gets sent to frontend):');
  console.log(JSON.stringify(apiResponse, null, 2));

  console.log('\n🔍 Frontend will receive:');
  console.log(`   bestSix: ${apiResponse.bestSix} (${typeof apiResponse.bestSix})`);
  console.log(`   bestSixCount: ${apiResponse.bestSixCount}`);
  console.log(`   bestSixType: ${apiResponse.bestSixType}`);
  console.log(`   bestSixMax: ${apiResponse.bestSixMax}`);
  console.log(`   curriculumType: ${apiResponse.curriculumType}`);

  console.log('\n💡 Expected UI Display:');
  if (bestSixValue !== null && bestSixType === 'percentage') {
    console.log(`   Label: "Best ${bestSixCount} (Total %)"`);
    console.log(`   Value: "${bestSixValue}/600"`);
  } else if (bestSixValue !== null && bestSixType === 'points') {
    console.log(`   Label: "Best ${bestSixCount} (ECZ Points)"`);
    console.log(`   Value: "${bestSixValue} Points"`);
  } else {
    console.log(`   Value: "N/A" ⚠️  (bestSix is null!)`);
  }

  await prisma.$disconnect();
}

testAPIResponse().catch((e) => {
  console.error('Error:', e);
  process.exit(1);
});
