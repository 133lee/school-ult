import { Gender, StudentStatus } from "@prisma/client";
import prisma from "@/lib/db/prisma";
import { studentRepository } from "@/features/students/student.repository";

/**
 * Test script for Student Repository validation
 *
 * This script validates the repository layer by performing CRUD operations
 * through the StudentRepository abstraction.
 *
 * Run with: npx tsx scripts/test-student-repository.ts
 */

async function testStudentRepository() {
  console.log("=".repeat(60));
  console.log("Student Repository Validation Test");
  console.log("=".repeat(60));
  console.log();

  let createdStudentId: string | null = null;

  try {
    // ==================== CREATE ====================
    console.log("📝 TEST 1: Creating a new student record...");

    const newStudent = await studentRepository.create({
      studentNumber: `TEST-${Date.now()}`,
      firstName: "John",
      middleName: "Maxwell",
      lastName: "Doe",
      dateOfBirth: new Date("2010-05-15"),
      gender: Gender.MALE,
      admissionDate: new Date("2024-01-10"),
      status: StudentStatus.ACTIVE,
      address: "123 Test Street, Lusaka",
      medicalInfo: "No known allergies",
    });

    createdStudentId = newStudent.id;

    console.log("✅ Student created successfully");
    console.log(`   ID: ${newStudent.id}`);
    console.log(`   Student Number: ${newStudent.studentNumber}`);
    console.log(`   Name: ${newStudent.firstName} ${newStudent.lastName}`);
    console.log();

    // ==================== READ ALL ====================
    console.log("📋 TEST 2: Fetching all students...");

    const allStudents = await studentRepository.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
    });

    console.log(`✅ Retrieved ${allStudents.length} student(s)`);
    console.log(`   Most recent: ${allStudents[0]?.firstName} ${allStudents[0]?.lastName}`);
    console.log();

    // ==================== READ BY ID ====================
    console.log("🔍 TEST 3: Fetching student by ID...");

    const foundStudent = await studentRepository.findByIdWithRelations(createdStudentId);

    if (!foundStudent) {
      throw new Error("Student not found after creation");
    }

    console.log("✅ Student retrieved successfully");
    console.log(`   Name: ${foundStudent.firstName} ${foundStudent.middleName} ${foundStudent.lastName}`);
    console.log(`   Date of Birth: ${foundStudent.dateOfBirth.toISOString().split("T")[0]}`);
    console.log(`   Gender: ${foundStudent.gender}`);
    console.log(`   Status: ${foundStudent.status}`);
    console.log(`   Guardians: ${foundStudent.studentGuardians.length}`);
    console.log();

    // ==================== UPDATE ====================
    console.log("✏️  TEST 4: Updating student record...");

    const updatedStudent = await studentRepository.update(createdStudentId, {
      firstName: "Jane",
      gender: Gender.FEMALE,
      medicalInfo: "Updated: Wears glasses",
    });

    console.log("✅ Student updated successfully");
    console.log(`   Updated Name: ${updatedStudent.firstName} ${updatedStudent.lastName}`);
    console.log(`   Updated Gender: ${updatedStudent.gender}`);
    console.log(`   Updated Medical Info: ${updatedStudent.medicalInfo}`);
    console.log();

    // ==================== READ BY STUDENT NUMBER ====================
    console.log("🔎 TEST 5: Fetching by student number...");

    const studentByNumber = await studentRepository.findByStudentNumber(
      newStudent.studentNumber
    );

    if (!studentByNumber) {
      throw new Error("Student not found by student number");
    }

    console.log("✅ Student found by student number");
    console.log(`   Student Number: ${studentByNumber.studentNumber}`);
    console.log(`   Name: ${studentByNumber.firstName} ${studentByNumber.lastName}`);
    console.log();

    // ==================== FILTER BY STATUS ====================
    console.log("🔍 TEST 6: Filtering students by status...");

    const activeStudents = await studentRepository.findByStatus(StudentStatus.ACTIVE);

    console.log(`✅ Found ${activeStudents.length} active student(s)`);
    console.log();

    // ==================== DELETE ====================
    console.log("🗑️  TEST 7: Deleting test student...");

    const deletedStudent = await studentRepository.delete(createdStudentId);

    console.log("✅ Student deleted successfully");
    console.log(`   Deleted: ${deletedStudent.firstName} ${deletedStudent.lastName}`);
    console.log();

    // ==================== VERIFY DELETION ====================
    console.log("🔍 TEST 8: Verifying deletion...");

    const shouldBeNull = await studentRepository.findById(createdStudentId);

    if (shouldBeNull !== null) {
      throw new Error("Student still exists after deletion");
    }

    console.log("✅ Deletion confirmed - student no longer exists");
    console.log();

    // ==================== SUCCESS ====================
    console.log("=".repeat(60));
    console.log("✨ All repository tests passed successfully!");
    console.log("=".repeat(60));
    console.log();
    console.log("Summary:");
    console.log("  ✓ Create operation");
    console.log("  ✓ Read all operation");
    console.log("  ✓ Read by ID operation");
    console.log("  ✓ Update operation");
    console.log("  ✓ Read by unique field operation");
    console.log("  ✓ Filter operation");
    console.log("  ✓ Delete operation");
    console.log("  ✓ Deletion verification");
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
      console.error("Stack trace:");
      console.error(error.stack);
    } else {
      console.error("Unknown error:", error);
    }

    console.error();

    // Cleanup: attempt to delete test student if it exists
    if (createdStudentId) {
      try {
        console.log("🧹 Attempting cleanup of test student...");
        await studentRepository.delete(createdStudentId);
        console.log("✅ Cleanup successful");
      } catch (cleanupError) {
        console.log("ℹ️  Cleanup not needed or already completed");
      }
    }

    process.exit(1);
  } finally {
    // Ensure Prisma connection is closed
    await prisma.$disconnect();
    console.log("🔌 Database connection closed");
  }
}

// Execute the test
testStudentRepository();
