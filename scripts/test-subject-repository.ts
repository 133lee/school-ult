import { subjectRepository } from "@/features/subjects/subject.repository";
import prisma from "@/lib/db/prisma";

/**
 * Test script for Subject Repository
 *
 * Tests all CRUD operations and query methods in the subject repository.
 *
 * Run with: npx tsx scripts/test-subject-repository.ts
 */

let createdSubjectId: string | null = null;
let testDepartmentId: string | null = null;
let testGradeId: string | null = null;

async function testSubjectRepository() {
  console.log("=".repeat(60));
  console.log("Subject Repository Test");
  console.log("=".repeat(60));
  console.log();

  try {
    // ==================== SETUP: CREATE TEST DEPARTMENT ====================
    console.log("⚙️  SETUP: Creating test department...");

    const testDepartment = await prisma.department.create({
      data: {
        name: "Test Science Department",
        code: "TESTSCI",
      },
    });
    testDepartmentId = testDepartment.id;

    console.log("✅ Test department created");
    console.log();

    // ==================== SETUP: GET TEST GRADE ====================
    console.log("⚙️  SETUP: Getting test grade...");

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
    console.log();

    // ==================== TEST 1: CREATE ====================
    console.log("📝 TEST 1: Create subject");

    const subject = await subjectRepository.create({
      name: "Mathematics",
      code: "MATH101",
      description: "Basic Mathematics",
      department: {
        connect: { id: testDepartmentId },
      },
    });

    createdSubjectId = subject.id;

    console.log("✅ Subject created");
    console.log(`   ID: ${subject.id}`);
    console.log(`   Name: ${subject.name}`);
    console.log(`   Code: ${subject.code}`);
    console.log();

    // ==================== TEST 2: READ ALL ====================
    console.log("📋 TEST 2: Read all subjects");

    const allSubjects = await subjectRepository.findAll();

    console.log("✅ Subjects retrieved");
    console.log(`   Total count: ${allSubjects.length}`);
    console.log();

    // ==================== TEST 3: READ BY ID ====================
    console.log("🔍 TEST 3: Read subject by ID");

    const foundSubject = await subjectRepository.findById(createdSubjectId);

    if (!foundSubject) {
      throw new Error("Subject not found by ID");
    }

    console.log("✅ Subject found by ID");
    console.log(`   Name: ${foundSubject.name}`);
    console.log();

    // ==================== TEST 4: READ BY ID WITH RELATIONS ====================
    console.log("🔍 TEST 4: Read subject by ID with relations");

    const subjectWithRelations =
      await subjectRepository.findByIdWithRelations(createdSubjectId);

    if (!subjectWithRelations) {
      throw new Error("Subject not found with relations");
    }

    console.log("✅ Subject found with relations");
    console.log(`   Department: ${subjectWithRelations.department?.name || "None"}`);
    console.log(`   Grades count: ${subjectWithRelations.gradeSubjects.length}`);
    console.log(`   Teachers count: ${subjectWithRelations.teacherSubjects.length}`);
    console.log();

    // ==================== TEST 5: UPDATE ====================
    console.log("✏️  TEST 5: Update subject");

    const updatedSubject = await subjectRepository.update(createdSubjectId, {
      description: "Updated: Advanced Mathematics",
    });

    console.log("✅ Subject updated");
    console.log(`   Description: ${updatedSubject.description}`);
    console.log();

    // ==================== TEST 6: FIND BY CODE ====================
    console.log("🔍 TEST 6: Find by code");

    const foundByCode = await subjectRepository.findByCode("MATH101");

    if (!foundByCode) {
      throw new Error("Subject not found by code");
    }

    console.log("✅ Subject found by code");
    console.log(`   Name: ${foundByCode.name}`);
    console.log();

    // ==================== TEST 7: FIND BY NAME ====================
    console.log("🔍 TEST 7: Find by name");

    const foundByName = await subjectRepository.findByName("Mathematics");

    if (!foundByName) {
      throw new Error("Subject not found by name");
    }

    console.log("✅ Subject found by name");
    console.log(`   Code: ${foundByName.code}`);
    console.log();

    // ==================== TEST 8: FIND BY DEPARTMENT ====================
    console.log("🔍 TEST 8: Find by department");

    const deptSubjects = await subjectRepository.findByDepartment(
      testDepartmentId!
    );

    console.log("✅ Subjects found by department");
    console.log(`   Subjects in department: ${deptSubjects.length}`);
    console.log();

    // ==================== TEST 9: CHECK EXISTENCE ====================
    console.log("✅ TEST 9: Check subject existence");

    const existsByCode = await subjectRepository.existsByCode("MATH101");
    const existsByName = await subjectRepository.existsByName("Mathematics");

    console.log("✅ Existence checks completed");
    console.log(`   Exists by code: ${existsByCode}`);
    console.log(`   Exists by name: ${existsByName}`);
    console.log();

    // ==================== TEST 10: ASSIGN TO GRADE ====================
    console.log("📊 TEST 10: Assign subject to grade");

    await subjectRepository.assignToGrade(createdSubjectId, testGradeId!, true);

    console.log("✅ Subject assigned to grade");
    console.log();

    // ==================== TEST 11: GET COUNTS ====================
    console.log("📊 TEST 11: Get teacher and grade counts");

    const teacherCount = await subjectRepository.getTeacherCount(
      createdSubjectId
    );
    const gradeCount = await subjectRepository.getGradeCount(createdSubjectId);

    console.log("✅ Counts retrieved");
    console.log(`   Teachers: ${teacherCount}`);
    console.log(`   Grades: ${gradeCount}`);
    console.log();

    // ==================== TEST 12: REMOVE FROM GRADE ====================
    console.log("🗑️  TEST 12: Remove subject from grade");

    await subjectRepository.removeFromGrade(createdSubjectId, testGradeId!);

    console.log("✅ Subject removed from grade");
    console.log();

    // ==================== TEST 13: DELETE ====================
    console.log("🗑️  TEST 13: Delete subject");

    const deletedSubject = await subjectRepository.delete(createdSubjectId);

    console.log("✅ Subject deleted");
    console.log(`   Deleted: ${deletedSubject.name}`);
    console.log();

    // ==================== TEST 14: VERIFY DELETION ====================
    console.log("🔍 TEST 14: Verify deletion");

    const verifyDeleted = await subjectRepository.findById(createdSubjectId);

    if (verifyDeleted) {
      throw new Error("Subject still exists after deletion");
    }

    console.log("✅ Deletion verified - subject no longer exists");
    console.log();

    // ==================== SUCCESS ====================
    console.log("=".repeat(60));
    console.log("✨ All repository tests passed!");
    console.log("=".repeat(60));
    console.log();
    console.log("Summary:");
    console.log("  ✓ Create subject");
    console.log("  ✓ Read all subjects");
    console.log("  ✓ Read by ID");
    console.log("  ✓ Read by ID with relations");
    console.log("  ✓ Update subject");
    console.log("  ✓ Find by code");
    console.log("  ✓ Find by name");
    console.log("  ✓ Find by department");
    console.log("  ✓ Check existence");
    console.log("  ✓ Assign to grade");
    console.log("  ✓ Get counts");
    console.log("  ✓ Remove from grade");
    console.log("  ✓ Delete subject");
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
    // Cleanup: Delete test data
    if (createdSubjectId) {
      try {
        await prisma.subject.delete({
          where: { id: createdSubjectId },
        });
      } catch {
        // Already deleted
      }
    }

    if (testDepartmentId) {
      try {
        await prisma.department.delete({
          where: { id: testDepartmentId },
        });
      } catch {
        // Might have relations
      }
    }

    await prisma.$disconnect();
  }
}

// Execute the test
testSubjectRepository();
