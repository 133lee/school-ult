import { Gender, QualificationLevel, StaffStatus, Role } from "@prisma/client";
import prisma from "@/lib/db/prisma";
import { teacherRepository } from "@/features/teachers/teacher.repository";

/**
 * Test script for Teacher Repository validation
 *
 * This script validates the repository layer by performing CRUD operations
 * through the TeacherRepository abstraction.
 *
 * Run with: npx tsx scripts/test-teacher-repository.ts
 */

async function testTeacherRepository() {
  console.log("=".repeat(60));
  console.log("Teacher Repository Validation Test");
  console.log("=".repeat(60));
  console.log();

  let createdUserId: string | null = null;
  let createdTeacherId: string | null = null;

  try {
    // ==================== CREATE USER ====================
    console.log("👤 SETUP: Creating test user account...");

    const newUser = await prisma.user.create({
      data: {
        email: `test-teacher-${Date.now()}@school.zm`,
        passwordHash: "$2a$10$testHashedPassword123456789",
        role: Role.TEACHER,
        isActive: true,
      },
    });

    createdUserId = newUser.id;

    console.log("✅ User account created");
    console.log(`   Email: ${newUser.email}`);
    console.log(`   Role: ${newUser.role}`);
    console.log();

    // ==================== CREATE ====================
    console.log("📝 TEST 1: Creating a new teacher record...");

    const newTeacher = await teacherRepository.create({
      staffNumber: `TEST-${Date.now()}`,
      firstName: "Mwenya",
      middleName: "Joseph",
      lastName: "Kaluba",
      dateOfBirth: new Date("1985-06-15"),
      gender: Gender.MALE,
      phone: "+260977123456",
      address: "Plot 456, Rhodes Park, Lusaka",
      qualification: QualificationLevel.DEGREE,
      yearsExperience: 8,
      status: StaffStatus.ACTIVE,
      hireDate: new Date("2016-01-15"),
      user: {
        connect: { id: createdUserId },
      },
    });

    createdTeacherId = newTeacher.id;

    console.log("✅ Teacher created successfully");
    console.log(`   ID: ${newTeacher.id}`);
    console.log(`   Staff Number: ${newTeacher.staffNumber}`);
    console.log(`   Name: ${newTeacher.firstName} ${newTeacher.middleName} ${newTeacher.lastName}`);
    console.log();

    // ==================== READ ALL ====================
    console.log("📋 TEST 2: Fetching all teachers...");

    const allTeachers = await teacherRepository.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
    });

    console.log(`✅ Retrieved ${allTeachers.length} teacher(s)`);
    console.log(`   Most recent: ${allTeachers[0]?.firstName} ${allTeachers[0]?.lastName}`);
    console.log();

    // ==================== READ BY ID ====================
    console.log("🔍 TEST 3: Fetching teacher by ID...");

    const foundTeacher = await teacherRepository.findByIdWithRelations(createdTeacherId);

    if (!foundTeacher) {
      throw new Error("Teacher not found after creation");
    }

    console.log("✅ Teacher retrieved successfully");
    console.log(`   Name: ${foundTeacher.firstName} ${foundTeacher.middleName} ${foundTeacher.lastName}`);
    console.log(`   Date of Birth: ${foundTeacher.dateOfBirth.toISOString().split("T")[0]}`);
    console.log(`   Gender: ${foundTeacher.gender}`);
    console.log(`   Status: ${foundTeacher.status}`);
    console.log(`   User Email: ${foundTeacher.user?.email}`);
    console.log(`   Subjects: ${foundTeacher.subjects.length}`);
    console.log();

    // ==================== UPDATE ====================
    console.log("✏️  TEST 4: Updating teacher record...");

    const updatedTeacher = await teacherRepository.update(createdTeacherId, {
      yearsExperience: 10,
      qualification: QualificationLevel.MASTERS,
      phone: "+260977999888",
    });

    console.log("✅ Teacher updated successfully");
    console.log(`   Updated Years Experience: ${updatedTeacher.yearsExperience}`);
    console.log(`   Updated Qualification: ${updatedTeacher.qualification}`);
    console.log(`   Updated Phone: ${updatedTeacher.phone}`);
    console.log();

    // ==================== READ BY STAFF NUMBER ====================
    console.log("🔎 TEST 5: Fetching by staff number...");

    const teacherByStaffNumber = await teacherRepository.findByStaffNumber(
      newTeacher.staffNumber
    );

    if (!teacherByStaffNumber) {
      throw new Error("Teacher not found by staff number");
    }

    console.log("✅ Teacher found by staff number");
    console.log(`   Staff Number: ${teacherByStaffNumber.staffNumber}`);
    console.log(`   Name: ${teacherByStaffNumber.firstName} ${teacherByStaffNumber.lastName}`);
    console.log();

    // ==================== READ BY USER ID ====================
    console.log("🔎 TEST 6: Fetching by user ID...");

    const teacherByUserId = await teacherRepository.findByUserId(createdUserId);

    if (!teacherByUserId) {
      throw new Error("Teacher not found by user ID");
    }

    console.log("✅ Teacher found by user ID");
    console.log(`   User ID: ${createdUserId}`);
    console.log(`   Teacher: ${teacherByUserId.firstName} ${teacherByUserId.lastName}`);
    console.log();

    // ==================== FILTER BY STATUS ====================
    console.log("🔍 TEST 7: Filtering teachers by status...");

    const activeTeachers = await teacherRepository.findByStatus(StaffStatus.ACTIVE);

    console.log(`✅ Found ${activeTeachers.length} active teacher(s)`);
    console.log();

    // ==================== CHECK EXISTENCE ====================
    console.log("🔍 TEST 8: Checking staff number existence...");

    const exists = await teacherRepository.existsByStaffNumber(newTeacher.staffNumber);
    const notExists = await teacherRepository.existsByStaffNumber("NON-EXISTENT-STAFF");

    console.log(`✅ Staff number '${newTeacher.staffNumber}' exists: ${exists}`);
    console.log(`✅ Non-existent staff number exists: ${notExists}`);
    console.log();

    // ==================== DELETE ====================
    console.log("🗑️  TEST 9: Deleting test teacher...");

    const deletedTeacher = await teacherRepository.delete(createdTeacherId);

    console.log("✅ Teacher deleted successfully");
    console.log(`   Deleted: ${deletedTeacher.firstName} ${deletedTeacher.lastName}`);
    console.log();

    // ==================== VERIFY DELETION ====================
    console.log("🔍 TEST 10: Verifying deletion...");

    const shouldBeNull = await teacherRepository.findById(createdTeacherId);

    if (shouldBeNull !== null) {
      throw new Error("Teacher still exists after deletion");
    }

    console.log("✅ Deletion confirmed - teacher no longer exists");
    console.log();

    // ==================== SUCCESS ====================
    console.log("=".repeat(60));
    console.log("✨ All repository tests passed successfully!");
    console.log("=".repeat(60));
    console.log();
    console.log("Summary:");
    console.log("  ✓ Create operation");
    console.log("  ✓ Read all operation");
    console.log("  ✓ Read by ID with relations");
    console.log("  ✓ Update operation");
    console.log("  ✓ Read by staff number");
    console.log("  ✓ Read by user ID");
    console.log("  ✓ Filter by status");
    console.log("  ✓ Check existence");
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

    // Cleanup: attempt to delete test teacher if it exists
    if (createdTeacherId) {
      try {
        console.log("🧹 Attempting cleanup of test teacher...");
        await teacherRepository.delete(createdTeacherId);
        console.log("✅ Cleanup successful");
      } catch (cleanupError) {
        console.log("ℹ️  Cleanup not needed or already completed");
      }
    }

    // Cleanup: attempt to delete test user if it exists
    if (createdUserId) {
      try {
        console.log("🧹 Attempting cleanup of test user...");
        await prisma.user.delete({ where: { id: createdUserId } });
        console.log("✅ User cleanup successful");
      } catch (cleanupError) {
        console.log("ℹ️  User cleanup not needed or already completed");
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
testTeacherRepository();
