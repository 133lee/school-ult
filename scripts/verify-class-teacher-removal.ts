import prisma from "@/lib/db/prisma";

async function verifyClassTeacherRemoval() {
  console.log("🔍 Verifying Class Teacher Removal for Grade 1A...\n");

  try {
    // Find Grade 1A class
    const grade1A = await prisma.class.findFirst({
      where: {
        name: "A",
        grade: {
          name: "Grade 1",
        },
      },
      include: {
        grade: {
          select: {
            id: true,
            name: true,
            schoolLevel: true,
          },
        },
      },
    });

    if (!grade1A) {
      console.log("❌ Grade 1A class not found");
      return;
    }

    console.log(`✅ Found Grade 1A class:`);
    console.log(`   Class ID: ${grade1A.id}`);
    console.log(`   Class Name: ${grade1A.name}`);
    console.log(`   Grade: ${grade1A.grade?.name}`);
    console.log(`   School Level: ${grade1A.grade?.schoolLevel}\n`);

    // Get active academic year
    const activeYear = await prisma.academicYear.findFirst({
      where: { isActive: true },
    });

    if (!activeYear) {
      console.log("❌ No active academic year found");
      return;
    }

    console.log(`📅 Active Academic Year:`);
    console.log(`   Year ID: ${activeYear.id}`);
    console.log(`   Year: ${activeYear.year}\n`);

    // Check ClassTeacherAssignment
    const classTeacherAssignments = await prisma.classTeacherAssignment.findMany({
      where: {
        classId: grade1A.id,
        academicYearId: activeYear.id,
      },
      include: {
        teacher: {
          select: {
            firstName: true,
            lastName: true,
            staffNumber: true,
          },
        },
      },
    });

    console.log(`📋 Class Teacher Assignments for Grade 1A (Current Year):`);
    if (classTeacherAssignments.length === 0) {
      console.log(`   ✅ No class teacher assignments found (CORRECT - teacher was removed)`);
    } else {
      console.log(`   ❌ Found ${classTeacherAssignments.length} assignment(s) (INCORRECT - should be 0):`);
      classTeacherAssignments.forEach((assignment, index) => {
        console.log(`   ${index + 1}. Teacher: ${assignment.teacher.firstName} ${assignment.teacher.lastName} (${assignment.teacher.staffNumber})`);
      });
    }
    console.log();

    // Check SubjectTeacherAssignments
    const subjectTeacherAssignments = await prisma.subjectTeacherAssignment.findMany({
      where: {
        classId: grade1A.id,
        academicYearId: activeYear.id,
      },
      include: {
        teacher: {
          select: {
            firstName: true,
            lastName: true,
            staffNumber: true,
          },
        },
        subject: {
          select: {
            name: true,
            code: true,
          },
        },
      },
    });

    console.log(`📚 Subject Teacher Assignments for Grade 1A (Current Year):`);
    if (subjectTeacherAssignments.length === 0) {
      console.log(`   ✅ No subject teacher assignments found (CORRECT for PRIMARY grade - all removed)`);
    } else {
      console.log(`   ❌ Found ${subjectTeacherAssignments.length} assignment(s) (INCORRECT - should be 0 for PRIMARY):`);
      subjectTeacherAssignments.forEach((assignment, index) => {
        console.log(`   ${index + 1}. Subject: ${assignment.subject.name} (${assignment.subject.code})`);
        console.log(`      Teacher: ${assignment.teacher.firstName} ${assignment.teacher.lastName} (${assignment.teacher.staffNumber})`);
      });
    }
    console.log();

    // Summary
    console.log("=" .repeat(60));
    console.log("VERIFICATION SUMMARY:");
    console.log("=" .repeat(60));

    const isClassTeacherRemoved = classTeacherAssignments.length === 0;
    const areSubjectsRemoved = subjectTeacherAssignments.length === 0;

    if (isClassTeacherRemoved && areSubjectsRemoved) {
      console.log("✅ PASS: Class teacher and all subject assignments successfully removed");
      console.log("✅ PRIMARY grade business rule working correctly");
    } else {
      console.log("❌ FAIL: Repository method did not work correctly");
      if (!isClassTeacherRemoved) {
        console.log("   - Class teacher assignment still exists");
      }
      if (!areSubjectsRemoved) {
        console.log("   - Subject assignments still exist (should be removed for PRIMARY)");
      }
    }
    console.log("=" .repeat(60));

  } catch (error) {
    console.error("Error during verification:", error);
  } finally {
    await prisma.$disconnect();
  }
}

verifyClassTeacherRemoval();
