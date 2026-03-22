import { ClassStatus } from "@prisma/client";
import { classRepository } from "@/features/classes/class.repository";
import prisma from "@/lib/db/prisma";

/**
 * Test script for Class Repository
 *
 * Validates all repository methods work correctly with the database.
 * Run with: npx tsx scripts/test-class-repository.ts
 */

let createdClassId: string | null = null;
let testGradeId: string | null = null;

async function testClassRepository() {
  console.log("=".repeat(60));
  console.log("Class Repository Test");
  console.log("=".repeat(60));
  console.log();

  try {
    // ==================== SETUP: GET OR CREATE TEST GRADE ====================
    console.log("⚙️  SETUP: Getting or creating test grade...");

    let testGrade = await prisma.grade.findFirst({
      where: { level: "GRADE_1" },
    });

    if (!testGrade) {
      testGrade = await prisma.grade.create({
        data: {
          level: "GRADE_1",
          name: "Grade 1",
          schoolLevel: "PRIMARY",
          sequence: 1,
        },
      });
    }

    testGradeId = testGrade.id;

    console.log("✅ Test grade ready");
    console.log(`   Grade ID: ${testGradeId}`);
    console.log(`   Grade: ${testGrade.name}`);
    console.log();

    // ==================== TEST 1: CREATE CLASS ====================
    console.log("📝 TEST 1: Creating a new class...");

    const newClass = await classRepository.create({
      name: "Test A",
      capacity: 40,
      status: ClassStatus.ACTIVE,
      currentEnrolled: 0,
      grade: {
        connect: { id: testGradeId },
      },
    });

    createdClassId = newClass.id;

    console.log("✅ Class created successfully");
    console.log(`   Class ID: ${newClass.id}`);
    console.log(`   Name: ${newClass.name}`);
    console.log(`   Grade ID: ${newClass.gradeId}`);
    console.log(`   Capacity: ${newClass.capacity}`);
    console.log(`   Status: ${newClass.status}`);
    console.log();

    // ==================== TEST 2: READ ALL CLASSES ====================
    console.log("📋 TEST 2: Reading all classes...");

    const allClasses = await classRepository.findAll();

    console.log("✅ Classes retrieved successfully");
    console.log(`   Total classes: ${allClasses.length}`);
    console.log();

    // ==================== TEST 3: READ BY ID WITH RELATIONS ====================
    console.log("🔍 TEST 3: Reading class by ID with relations...");

    const classWithRelations = await classRepository.findByIdWithRelations(
      createdClassId
    );

    if (!classWithRelations) {
      throw new Error("Class not found");
    }

    console.log("✅ Class with relations retrieved successfully");
    console.log(`   Class ID: ${classWithRelations.id}`);
    console.log(`   Name: ${classWithRelations.name}`);
    console.log(`   Grade: ${classWithRelations.grade?.name}`);
    console.log(`   Enrollments: ${classWithRelations.enrollments?.length || 0}`);
    console.log(
      `   Class Teachers: ${classWithRelations.classTeacherAssignments?.length || 0}`
    );
    console.log(
      `   Subject Teachers: ${classWithRelations.subjectTeacherAssignments?.length || 0}`
    );
    console.log();

    // ==================== TEST 4: UPDATE CLASS ====================
    console.log("✏️  TEST 4: Updating class...");

    const updatedClass = await classRepository.update(createdClassId, {
      capacity: 45,
      currentEnrolled: 5,
    });

    console.log("✅ Class updated successfully");
    console.log(`   New Capacity: ${updatedClass.capacity}`);
    console.log(`   Current Enrolled: ${updatedClass.currentEnrolled}`);
    console.log();

    // ==================== TEST 5: FIND BY GRADE AND NAME ====================
    console.log("🔍 TEST 5: Finding class by grade and name...");

    const foundClass = await classRepository.findByGradeAndName(
      testGradeId,
      "Test A"
    );

    if (!foundClass) {
      throw new Error("Class not found by grade and name");
    }

    console.log("✅ Class found by grade and name");
    console.log(`   Class ID: ${foundClass.id}`);
    console.log(`   Name: ${foundClass.name}`);
    console.log();

    // ==================== TEST 6: FIND BY GRADE ID ====================
    console.log("📚 TEST 6: Finding classes by grade ID...");

    const gradeClasses = await classRepository.findByGradeId(testGradeId);

    console.log("✅ Classes found by grade ID");
    console.log(`   Number of classes: ${gradeClasses.length}`);
    console.log();

    // ==================== TEST 7: FIND BY STATUS ====================
    console.log("🔍 TEST 7: Finding classes by status...");

    const activeClasses = await classRepository.findByStatus(ClassStatus.ACTIVE);

    console.log("✅ Classes found by status");
    console.log(`   Active classes: ${activeClasses.length}`);
    console.log();

    // ==================== TEST 8: CHECK EXISTENCE ====================
    console.log("🔎 TEST 8: Checking class existence...");

    const exists = await classRepository.existsByGradeAndName(
      testGradeId,
      "Test A"
    );

    console.log("✅ Existence check successful");
    console.log(`   Class exists: ${exists}`);
    console.log();

    // ==================== TEST 9: DELETE CLASS ====================
    console.log("🗑️  TEST 9: Deleting class...");

    const deletedClass = await classRepository.delete(createdClassId);

    console.log("✅ Class deleted successfully");
    console.log(`   Deleted class: ${deletedClass.name}`);
    console.log();

    // ==================== TEST 10: VERIFY DELETION ====================
    console.log("🔍 TEST 10: Verifying deletion...");

    const shouldBeNull = await classRepository.findById(createdClassId);

    if (shouldBeNull !== null) {
      throw new Error("Class should not exist after deletion");
    }

    console.log("✅ Deletion verified - class no longer exists");
    console.log();

    // ==================== SUCCESS ====================
    console.log("=".repeat(60));
    console.log("✨ All repository tests passed successfully!");
    console.log("=".repeat(60));
    console.log();
    console.log("Summary:");
    console.log("  ✓ Create class");
    console.log("  ✓ Read all classes");
    console.log("  ✓ Read by ID with relations");
    console.log("  ✓ Update class");
    console.log("  ✓ Find by grade and name");
    console.log("  ✓ Find by grade ID");
    console.log("  ✓ Find by status");
    console.log("  ✓ Check existence");
    console.log("  ✓ Delete class");
    console.log("  ✓ Verify deletion");
    console.log();
  } catch (error) {
    console.error();
    console.error("=".repeat(60));
    console.error("❌ Test Failed");
    console.error("=".repeat(60));
    console.error();

    if (error instanceof Error) {
      console.error("Error:", error.message);
      console.error();
      if (error.stack) {
        console.error("Stack trace:");
        console.error(error.stack);
      }
    } else {
      console.error("Unknown error:", error);
    }

    process.exit(1);
  } finally {
    // Cleanup: Remove test class if it still exists
    if (createdClassId) {
      try {
        await prisma.class.deleteMany({
          where: { id: createdClassId },
        });
      } catch (e) {
        // Ignore cleanup errors
      }
    }

    await prisma.$disconnect();
  }
}

// Execute the test
testClassRepository();
