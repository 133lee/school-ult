import { Gender, StaffStatus, QualificationLevel, Role } from "@prisma/client";
import prisma from "@/lib/db/prisma";
import {
  teacherService,
  UnauthorizedError,
  NotFoundError,
  ValidationError,
} from "@/features/teachers/teacher.service";

/**
 * Test script for Teacher Service validation
 *
 * This script validates the service layer by testing business logic,
 * validation rules, and role-based authorization.
 *
 * Run with: npx tsx scripts/test-teacher-service.ts
 */

// Test contexts for different roles
const adminContext = {
  userId: "test-admin-001",
  role: "ADMIN" as const,
};

const headTeacherContext = {
  userId: "test-head-teacher-001",
  role: "HEAD_TEACHER" as const,
};

const teacherContext = {
  userId: "test-teacher-001",
  role: "TEACHER" as const,
};

async function testTeacherService() {
  console.log("=".repeat(60));
  console.log("Teacher Service Validation Test");
  console.log("=".repeat(60));
  console.log();

  let createdUserId: string | null = null;
  let headTeacherUserId: string | null = null;
  let createdTeacherId: string | null = null;

  try {
    // ==================== SETUP: CREATE TEST USERS ====================
    console.log("👤 SETUP: Creating test user accounts...");

    const newUser = await prisma.user.create({
      data: {
        email: `test-teacher-service-${Date.now()}@school.zm`,
        passwordHash: "$2a$10$testHashedPassword123456789",
        role: Role.TEACHER,
        isActive: true,
      },
    });
    createdUserId = newUser.id;

    const headTeacherUser = await prisma.user.create({
      data: {
        email: `test-head-teacher-${Date.now()}@school.zm`,
        passwordHash: "$2a$10$testHashedPassword123456789",
        role: Role.HEAD_TEACHER,
        isActive: true,
      },
    });
    headTeacherUserId = headTeacherUser.id;

    console.log("✅ Test users created");
    console.log();

    // ==================== TEST 1: CREATE TEACHER (SUCCESS) ====================
    console.log("📝 TEST 1: Creating a teacher with ADMIN role...");

    const newTeacher = await teacherService.createTeacher(
      {
        userId: createdUserId,
        staffNumber: `STAFF2024${Math.floor(Math.random() * 1000)
          .toString()
          .padStart(3, "0")}`,
        firstName: "Chanda",
        middleName: "Grace",
        lastName: "Phiri",
        dateOfBirth: new Date("1988-06-15"),
        gender: Gender.FEMALE,
        phone: "+260977123456",
        address: "Plot 789, Kabulonga, Lusaka",
        qualification: QualificationLevel.DEGREE,
        yearsExperience: 8,
        hireDate: new Date("2016-01-10"),
      },
      adminContext
    );

    createdTeacherId = newTeacher.id;

    console.log("✅ Teacher created successfully");
    console.log(`   ID: ${newTeacher.id}`);
    console.log(`   Staff Number: ${newTeacher.staffNumber}`);
    console.log(`   Name: ${newTeacher.firstName} ${newTeacher.lastName}`);
    console.log(`   Status: ${newTeacher.status}`);
    console.log();

    // ==================== TEST 2: HEAD_TEACHER CAN CREATE ====================
    console.log("📝 TEST 2: Verifying HEAD_TEACHER role can create teachers...");

    const headTeacherCreatedTeacher = await teacherService.createTeacher(
      {
        userId: headTeacherUserId,
        staffNumber: `STAFF2024${Math.floor(Math.random() * 1000)
          .toString()
          .padStart(3, "0")}`,
        firstName: "Patrick",
        lastName: "Zulu",
        dateOfBirth: new Date("1985-03-20"),
        gender: Gender.MALE,
        phone: "+260976654321",
        qualification: QualificationLevel.MASTERS,
        hireDate: new Date("2015-02-15"),
      },
      headTeacherContext
    );

    console.log("✅ HEAD_TEACHER successfully created teacher");
    console.log(`   Staff Number: ${headTeacherCreatedTeacher.staffNumber}`);
    console.log();

    // Cleanup head teacher's created teacher
    await teacherService.deleteTeacher(headTeacherCreatedTeacher.id, adminContext);

    // ==================== TEST 3: TEACHER CANNOT CREATE ====================
    console.log("🚫 TEST 3: Verifying TEACHER role cannot create teachers...");

    try {
      await teacherService.createTeacher(
        {
          userId: createdUserId,
          staffNumber: `STAFF2024999`,
          firstName: "Should",
          lastName: "Fail",
          dateOfBirth: new Date("1990-01-01"),
          gender: Gender.MALE,
          phone: "+260975999999",
          qualification: QualificationLevel.DEGREE,
          hireDate: new Date("2020-01-01"),
        },
        teacherContext
      );
      throw new Error("TEACHER should not be able to create teachers");
    } catch (error) {
      if (error instanceof UnauthorizedError) {
        console.log("✅ TEACHER correctly denied permission to create");
        console.log(`   Error: ${error.message}`);
      } else {
        throw error;
      }
    }
    console.log();

    // ==================== TEST 4: AGE VALIDATION (TOO YOUNG) ====================
    console.log("🔍 TEST 4: Testing age validation (too young)...");

    try {
      await teacherService.createTeacher(
        {
          userId: createdUserId,
          staffNumber: `STAFF2024998`,
          firstName: "Too",
          lastName: "Young",
          dateOfBirth: new Date(
            new Date().getFullYear() - 18,
            0,
            1
          ), // 18 years old
          gender: Gender.MALE,
          phone: "+260975111111",
          qualification: QualificationLevel.DEGREE,
          hireDate: new Date("2020-01-01"),
        },
        adminContext
      );
      throw new Error("Should reject teacher under 21 years old");
    } catch (error) {
      if (error instanceof ValidationError && error.message.includes("Invalid age")) {
        console.log("✅ Age validation working correctly");
        console.log(`   Error: ${error.message}`);
      } else {
        throw error;
      }
    }
    console.log();

    // ==================== TEST 5: AGE VALIDATION (TOO OLD) ====================
    console.log("🔍 TEST 5: Testing age validation (too old)...");

    try {
      await teacherService.createTeacher(
        {
          userId: createdUserId,
          staffNumber: `STAFF2024997`,
          firstName: "Too",
          lastName: "Old",
          dateOfBirth: new Date(
            new Date().getFullYear() - 75,
            0,
            1
          ), // 75 years old
          gender: Gender.MALE,
          phone: "+260975222222",
          qualification: QualificationLevel.DEGREE,
          hireDate: new Date("1975-01-01"),
        },
        adminContext
      );
      throw new Error("Should reject teacher over 70 years old");
    } catch (error) {
      if (error instanceof ValidationError && error.message.includes("Invalid age")) {
        console.log("✅ Age validation working correctly");
        console.log(`   Error: ${error.message}`);
      } else {
        throw error;
      }
    }
    console.log();

    // ==================== TEST 6: HIRE DATE VALIDATION ====================
    console.log("🔍 TEST 6: Testing hire date validation (future date)...");

    try {
      const futureDate = new Date();
      futureDate.setFullYear(futureDate.getFullYear() + 1);

      await teacherService.createTeacher(
        {
          userId: createdUserId,
          staffNumber: `STAFF2024996`,
          firstName: "Future",
          lastName: "Hire",
          dateOfBirth: new Date("1990-01-01"),
          gender: Gender.MALE,
          phone: "+260975333333",
          qualification: QualificationLevel.DEGREE,
          hireDate: futureDate,
        },
        adminContext
      );
      throw new Error("Should reject future hire date");
    } catch (error) {
      if (error instanceof ValidationError && error.message.includes("Hire date")) {
        console.log("✅ Hire date validation working correctly");
        console.log(`   Error: ${error.message}`);
      } else {
        throw error;
      }
    }
    console.log();

    // ==================== TEST 7: STAFF NUMBER FORMAT VALIDATION ====================
    console.log("🔍 TEST 7: Testing staff number format validation...");

    try {
      await teacherService.createTeacher(
        {
          userId: createdUserId,
          staffNumber: "INVALID-FORMAT",
          firstName: "Bad",
          lastName: "Format",
          dateOfBirth: new Date("1990-01-01"),
          gender: Gender.MALE,
          phone: "+260975444444",
          qualification: QualificationLevel.DEGREE,
          hireDate: new Date("2020-01-01"),
        },
        adminContext
      );
      throw new Error("Should reject invalid staff number format");
    } catch (error) {
      if (error instanceof ValidationError && error.message.includes("Invalid staff number format")) {
        console.log("✅ Staff number format validation working correctly");
        console.log(`   Error: ${error.message}`);
      } else {
        throw error;
      }
    }
    console.log();

    // ==================== TEST 8: PHONE NUMBER VALIDATION ====================
    console.log("🔍 TEST 8: Testing phone number validation...");

    try {
      await teacherService.createTeacher(
        {
          userId: createdUserId,
          staffNumber: `STAFF2024995`,
          firstName: "Bad",
          lastName: "Phone",
          dateOfBirth: new Date("1990-01-01"),
          gender: Gender.MALE,
          phone: "123456789", // Invalid format
          qualification: QualificationLevel.DEGREE,
          hireDate: new Date("2020-01-01"),
        },
        adminContext
      );
      throw new Error("Should reject invalid phone number format");
    } catch (error) {
      if (error instanceof ValidationError && error.message.includes("Invalid phone number format")) {
        console.log("✅ Phone number validation working correctly");
        console.log(`   Error: ${error.message}`);
      } else {
        throw error;
      }
    }
    console.log();

    // ==================== TEST 9: YEARS EXPERIENCE VALIDATION ====================
    console.log("🔍 TEST 9: Testing years of experience validation...");

    try {
      await teacherService.createTeacher(
        {
          userId: createdUserId,
          staffNumber: `STAFF2024994`,
          firstName: "Invalid",
          lastName: "Experience",
          dateOfBirth: new Date("1990-01-01"),
          gender: Gender.MALE,
          phone: "+260975555555",
          qualification: QualificationLevel.DEGREE,
          yearsExperience: -5, // Negative years
          hireDate: new Date("2020-01-01"),
        },
        adminContext
      );
      throw new Error("Should reject negative years of experience");
    } catch (error) {
      if (error instanceof ValidationError && error.message.includes("Years of experience")) {
        console.log("✅ Years of experience validation working correctly");
        console.log(`   Error: ${error.message}`);
      } else {
        throw error;
      }
    }
    console.log();

    // ==================== TEST 10: GET TEACHERS WITH FILTERS ====================
    console.log("📋 TEST 10: Getting teachers with filters...");

    const result = await teacherService.getTeachers(
      {
        status: StaffStatus.ACTIVE,
      },
      {
        page: 1,
        pageSize: 10,
      }
    );

    console.log("✅ Teachers retrieved successfully");
    console.log(`   Total: ${result.meta.total}`);
    console.log(`   Page: ${result.meta.page}/${result.meta.totalPages}`);
    console.log(`   Retrieved: ${result.data.length} teacher(s)`);
    console.log();

    // ==================== TEST 11: GET TEACHER BY ID ====================
    console.log("🔍 TEST 11: Getting teacher by ID...");

    const foundTeacher = await teacherService.getTeacherById(
      createdTeacherId,
      adminContext
    );

    if (!foundTeacher) {
      throw new Error("Teacher not found after creation");
    }

    console.log("✅ Teacher retrieved successfully");
    console.log(`   Name: ${foundTeacher.firstName} ${foundTeacher.lastName}`);
    console.log(`   Staff Number: ${foundTeacher.staffNumber}`);
    console.log();

    // ==================== TEST 12: GET TEACHER BY STAFF NUMBER ====================
    console.log("🔎 TEST 12: Getting teacher by staff number...");

    const teacherByStaffNumber = await teacherService.getTeacherByStaffNumber(
      newTeacher.staffNumber,
      adminContext
    );

    console.log("✅ Teacher found by staff number");
    console.log(`   Name: ${teacherByStaffNumber?.firstName} ${teacherByStaffNumber?.lastName}`);
    console.log();

    // ==================== TEST 13: UPDATE TEACHER ====================
    console.log("✏️  TEST 13: Updating teacher information...");

    const updatedTeacher = await teacherService.updateTeacher(
      createdTeacherId,
      {
        yearsExperience: 12,
        qualification: QualificationLevel.MASTERS,
        phone: "+260977999888",
      },
      adminContext
    );

    console.log("✅ Teacher updated successfully");
    console.log(`   Years Experience: 8 → ${updatedTeacher.yearsExperience}`);
    console.log(`   Qualification: DEGREE → ${updatedTeacher.qualification}`);
    console.log();

    // ==================== TEST 14: CHANGE STATUS BUSINESS RULE ====================
    console.log("🔍 TEST 14: Testing status change business rules...");

    // Retire the teacher
    const retiredTeacher = await teacherService.retireTeacher(
      createdTeacherId,
      adminContext
    );

    console.log("✅ Teacher retired successfully");
    console.log(`   Status: ${retiredTeacher.status}`);

    // Try to change status of retired teacher (should fail)
    try {
      await teacherService.changeTeacherStatus(
        createdTeacherId,
        StaffStatus.ACTIVE,
        adminContext
      );
      throw new Error("Should not allow status change for retired teachers");
    } catch (error) {
      if (error instanceof ValidationError && error.message.includes("retired teachers")) {
        console.log("✅ Retired teacher status protection working correctly");
        console.log(`   Error: ${error.message}`);
      } else {
        throw error;
      }
    }
    console.log();

    // ==================== TEST 15: DELETE AUTHORIZATION ====================
    console.log("🚫 TEST 15: Testing delete authorization...");

    try {
      await teacherService.deleteTeacher(createdTeacherId, teacherContext);
      throw new Error("TEACHER should not be able to delete teachers");
    } catch (error) {
      if (error instanceof UnauthorizedError) {
        console.log("✅ Non-ADMIN correctly denied permission to delete");
        console.log(`   Error: ${error.message}`);
      } else {
        throw error;
      }
    }
    console.log();

    // ==================== TEST 16: DELETE TEACHER ====================
    console.log("🗑️  TEST 16: Deleting teacher (ADMIN only)...");

    const deletedTeacher = await teacherService.deleteTeacher(
      createdTeacherId,
      adminContext
    );

    console.log("✅ Teacher deleted successfully");
    console.log(`   Deleted: ${deletedTeacher.firstName} ${deletedTeacher.lastName}`);
    console.log();

    // ==================== TEST 17: VERIFY DELETION ====================
    console.log("🔍 TEST 17: Verifying deletion...");

    const shouldBeNull = await teacherService.getTeacherById(
      createdTeacherId,
      adminContext
    );

    if (shouldBeNull !== null) {
      throw new Error("Teacher still exists after deletion");
    }

    console.log("✅ Deletion confirmed - teacher no longer exists");
    console.log();

    // ==================== SUCCESS ====================
    console.log("=".repeat(60));
    console.log("✨ All service tests passed successfully!");
    console.log("=".repeat(60));
    console.log();
    console.log("Summary:");
    console.log("  ✓ Create operation with ADMIN");
    console.log("  ✓ Create operation with HEAD_TEACHER");
    console.log("  ✓ Authorization checks (TEACHER cannot create)");
    console.log("  ✓ Age validation (min 21, max 70 years)");
    console.log("  ✓ Hire date validation");
    console.log("  ✓ Staff number format validation");
    console.log("  ✓ Phone number validation (Zambian format)");
    console.log("  ✓ Years of experience validation");
    console.log("  ✓ Get teachers with filters and pagination");
    console.log("  ✓ Get teacher by ID");
    console.log("  ✓ Get teacher by staff number");
    console.log("  ✓ Update operation");
    console.log("  ✓ Status change business rules (RETIRED is final)");
    console.log("  ✓ Delete authorization (ADMIN only)");
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
        await teacherService.deleteTeacher(createdTeacherId, adminContext);
        console.log("✅ Cleanup successful");
      } catch (cleanupError) {
        console.log("ℹ️  Cleanup not needed or already completed");
      }
    }

    process.exit(1);
  } finally {
    // Cleanup users
    if (createdUserId) {
      try {
        await prisma.user.delete({ where: { id: createdUserId } });
      } catch (e) {
        // Ignore
      }
    }

    if (headTeacherUserId) {
      try {
        await prisma.user.delete({ where: { id: headTeacherUserId } });
      } catch (e) {
        // Ignore
      }
    }

    // Ensure Prisma connection is closed
    await prisma.$disconnect();
    console.log("🔌 Database connection closed");
  }
}

// Execute the test
testTeacherService();
