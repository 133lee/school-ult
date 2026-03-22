import { Gender, StudentStatus } from "@prisma/client";
import prisma from "@/lib/db/prisma";
import {
  studentService,
  UnauthorizedError,
  NotFoundError,
  ValidationError,
} from "@/features/students/student.service";

/**
 * Test script for Student Service validation
 *
 * This script validates the service layer by testing business logic,
 * validation rules, and role-based authorization.
 *
 * Run with: npx tsx scripts/test-student-service.ts
 */

// Test contexts for different roles
const adminContext = {
  userId: "test-admin-001",
  role: "ADMIN" as const,
};

const clerkContext = {
  userId: "test-clerk-001",
  role: "CLERK" as const,
};

const teacherContext = {
  userId: "test-teacher-001",
  role: "TEACHER" as const,
};

async function testStudentService() {
  console.log("=".repeat(60));
  console.log("Student Service Validation Test");
  console.log("=".repeat(60));
  console.log();

  let createdStudentId: string | null = null;

  try {
    // ==================== TEST 1: CREATE STUDENT (SUCCESS) ====================
    console.log("📝 TEST 1: Creating a student with ADMIN role...");

    const newStudent = await studentService.createStudent(
      {
        studentNumber: `STU2024${Math.floor(Math.random() * 1000)
          .toString()
          .padStart(3, "0")}`,
        firstName: "Alice",
        middleName: "Naomi",
        lastName: "Banda",
        dateOfBirth: new Date("2012-04-10"),
        gender: Gender.FEMALE,
        admissionDate: new Date("2024-01-10"),
        address: "456 Service Test Ave, Lusaka",
        medicalInfo: "No allergies",
      },
      adminContext
    );

    createdStudentId = newStudent.id;

    console.log("✅ Student created successfully");
    console.log(`   ID: ${newStudent.id}`);
    console.log(`   Student Number: ${newStudent.studentNumber}`);
    console.log(`   Name: ${newStudent.firstName} ${newStudent.lastName}`);
    console.log(`   Status: ${newStudent.status}`);
    console.log();

    // ==================== TEST 2: CLERK CAN CREATE ====================
    console.log("📝 TEST 2: Verifying CLERK role can create students...");

    const clerkStudent = await studentService.createStudent(
      {
        studentNumber: `STU2024${Math.floor(Math.random() * 1000)
          .toString()
          .padStart(3, "0")}`,
        firstName: "Bernard",
        lastName: "Mulenga",
        dateOfBirth: new Date("2013-08-20"),
        gender: Gender.MALE,
        admissionDate: new Date("2024-01-15"),
      },
      clerkContext
    );

    console.log("✅ CLERK successfully created student");
    console.log(`   Student Number: ${clerkStudent.studentNumber}`);
    console.log();

    // Cleanup clerk's student
    await studentService.deleteStudent(clerkStudent.id, adminContext);

    // ==================== TEST 3: TEACHER CANNOT CREATE ====================
    console.log("🚫 TEST 3: Verifying TEACHER role cannot create students...");

    try {
      await studentService.createStudent(
        {
          studentNumber: `STU2024999`,
          firstName: "Should",
          lastName: "Fail",
          dateOfBirth: new Date("2012-01-01"),
          gender: Gender.MALE,
          admissionDate: new Date("2024-01-01"),
        },
        teacherContext
      );
      throw new Error("TEACHER should not be able to create students");
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
      await studentService.createStudent(
        {
          studentNumber: `STU2024998`,
          firstName: "Too",
          lastName: "Young",
          dateOfBirth: new Date(
            new Date().getFullYear() - 3,
            0,
            1
          ), // 3 years old
          gender: Gender.MALE,
          admissionDate: new Date("2024-01-01"),
        },
        adminContext
      );
      throw new Error("Should reject student under 5 years old");
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
      await studentService.createStudent(
        {
          studentNumber: `STU2024997`,
          firstName: "Too",
          lastName: "Old",
          dateOfBirth: new Date(
            new Date().getFullYear() - 30,
            0,
            1
          ), // 30 years old
          gender: Gender.MALE,
          admissionDate: new Date("2024-01-01"),
        },
        adminContext
      );
      throw new Error("Should reject student over 25 years old");
    } catch (error) {
      if (error instanceof ValidationError && error.message.includes("Invalid age")) {
        console.log("✅ Age validation working correctly");
        console.log(`   Error: ${error.message}`);
      } else {
        throw error;
      }
    }
    console.log();

    // ==================== TEST 6: ADMISSION DATE VALIDATION ====================
    console.log("🔍 TEST 6: Testing admission date validation (future date)...");

    try {
      const futureDate = new Date();
      futureDate.setFullYear(futureDate.getFullYear() + 1);

      await studentService.createStudent(
        {
          studentNumber: `STU2024996`,
          firstName: "Future",
          lastName: "Student",
          dateOfBirth: new Date("2012-01-01"),
          gender: Gender.MALE,
          admissionDate: futureDate,
        },
        adminContext
      );
      throw new Error("Should reject future admission date");
    } catch (error) {
      if (error instanceof ValidationError && error.message.includes("Admission date")) {
        console.log("✅ Admission date validation working correctly");
        console.log(`   Error: ${error.message}`);
      } else {
        throw error;
      }
    }
    console.log();

    // ==================== TEST 7: STUDENT NUMBER FORMAT VALIDATION ====================
    console.log("🔍 TEST 7: Testing student number format validation...");

    try {
      await studentService.createStudent(
        {
          studentNumber: "INVALID-FORMAT",
          firstName: "Bad",
          lastName: "Format",
          dateOfBirth: new Date("2012-01-01"),
          gender: Gender.MALE,
          admissionDate: new Date("2024-01-01"),
        },
        adminContext
      );
      throw new Error("Should reject invalid student number format");
    } catch (error) {
      if (error instanceof ValidationError && error.message.includes("Invalid student number format")) {
        console.log("✅ Student number format validation working correctly");
        console.log(`   Error: ${error.message}`);
      } else {
        throw error;
      }
    }
    console.log();

    // ==================== TEST 8: DUPLICATE STUDENT NUMBER ====================
    console.log("🔍 TEST 8: Testing duplicate student number prevention...");

    try {
      await studentService.createStudent(
        {
          studentNumber: newStudent.studentNumber, // Use existing number
          firstName: "Duplicate",
          lastName: "Number",
          dateOfBirth: new Date("2012-01-01"),
          gender: Gender.MALE,
          admissionDate: new Date("2024-01-01"),
        },
        adminContext
      );
      throw new Error("Should reject duplicate student number");
    } catch (error) {
      if (error instanceof ValidationError && error.message.includes("already exists")) {
        console.log("✅ Duplicate student number prevention working");
        console.log(`   Error: ${error.message}`);
      } else {
        throw error;
      }
    }
    console.log();

    // ==================== TEST 9: GET STUDENT BY ID ====================
    console.log("🔍 TEST 9: Fetching student by ID...");

    const fetchedStudent = await studentService.getStudentById(
      createdStudentId,
      adminContext
    );

    if (!fetchedStudent) {
      throw new Error("Student not found after creation");
    }

    console.log("✅ Student retrieved successfully");
    console.log(`   Name: ${fetchedStudent.firstName} ${fetchedStudent.lastName}`);
    console.log(`   Status: ${fetchedStudent.status}`);
    console.log();

    // ==================== TEST 10: GET STUDENTS WITH PAGINATION ====================
    console.log("📋 TEST 10: Fetching students with pagination...");

    const paginatedResult = await studentService.getStudents(
      undefined,
      { page: 1, pageSize: 5 },
      adminContext
    );

    console.log("✅ Pagination working correctly");
    console.log(`   Total students: ${paginatedResult.meta.total}`);
    console.log(`   Page: ${paginatedResult.meta.page}`);
    console.log(`   Page size: ${paginatedResult.meta.pageSize}`);
    console.log(`   Total pages: ${paginatedResult.meta.totalPages}`);
    console.log(`   Retrieved: ${paginatedResult.data.length} student(s)`);
    console.log();

    // ==================== TEST 11: SEARCH STUDENTS ====================
    console.log("🔎 TEST 11: Testing student search...");

    const searchResult = await studentService.getStudents(
      { search: "Alice" },
      { page: 1, pageSize: 10 },
      adminContext
    );

    console.log("✅ Search working correctly");
    console.log(`   Found: ${searchResult.data.length} student(s) matching 'Alice'`);
    console.log();

    // ==================== TEST 12: FILTER BY STATUS ====================
    console.log("🔍 TEST 12: Filtering students by status...");

    const activeStudents = await studentService.getStudentsByStatus(
      StudentStatus.ACTIVE,
      adminContext
    );

    console.log(`✅ Found ${activeStudents.length} active student(s)`);
    console.log();

    // ==================== TEST 13: UPDATE STUDENT ====================
    console.log("✏️  TEST 13: Updating student information...");

    const updatedStudent = await studentService.updateStudent(
      createdStudentId,
      {
        firstName: "Alicia",
        medicalInfo: "Updated: Wears glasses",
      },
      adminContext
    );

    console.log("✅ Student updated successfully");
    console.log(`   Updated Name: ${updatedStudent.firstName} ${updatedStudent.lastName}`);
    console.log(`   Updated Medical Info: ${updatedStudent.medicalInfo}`);
    console.log();

    // ==================== TEST 14: TEACHER CANNOT UPDATE ====================
    console.log("🚫 TEST 14: Verifying TEACHER cannot update students...");

    try {
      await studentService.updateStudent(
        createdStudentId,
        { firstName: "Should Fail" },
        teacherContext
      );
      throw new Error("TEACHER should not be able to update students");
    } catch (error) {
      if (error instanceof UnauthorizedError) {
        console.log("✅ TEACHER correctly denied permission to update");
        console.log(`   Error: ${error.message}`);
      } else {
        throw error;
      }
    }
    console.log();

    // ==================== TEST 15: CHANGE STUDENT STATUS ====================
    console.log("📊 TEST 15: Changing student status...");

    const statusChanged = await studentService.changeStudentStatus(
      createdStudentId,
      StudentStatus.SUSPENDED,
      adminContext
    );

    console.log("✅ Student status changed successfully");
    console.log(`   New Status: ${statusChanged.status}`);
    console.log();

    // ==================== TEST 16: GRADUATE STUDENT ====================
    console.log("🎓 TEST 16: Graduating student...");

    const graduated = await studentService.changeStudentStatus(
      createdStudentId,
      StudentStatus.GRADUATED,
      adminContext
    );

    console.log("✅ Student graduated successfully");
    console.log(`   Status: ${graduated.status}`);
    console.log();

    // ==================== TEST 17: CANNOT CHANGE GRADUATED STATUS ====================
    console.log("🚫 TEST 17: Verifying graduated students cannot be modified...");

    try {
      await studentService.changeStudentStatus(
        createdStudentId,
        StudentStatus.ACTIVE,
        adminContext
      );
      throw new Error("Should not be able to change graduated student status");
    } catch (error) {
      if (error instanceof ValidationError && error.message.includes("Cannot change status")) {
        console.log("✅ Graduated student protection working correctly");
        console.log(`   Error: ${error.message}`);
      } else {
        throw error;
      }
    }
    console.log();

    // ==================== TEST 18: WITHDRAW STUDENT ====================
    console.log("📤 TEST 18: Withdrawing student (soft delete)...");

    // First, set back to ACTIVE to test withdrawal
    await prisma.student.update({
      where: { id: createdStudentId },
      data: { status: StudentStatus.ACTIVE },
    });

    const withdrawn = await studentService.withdrawStudent(
      createdStudentId,
      adminContext
    );

    console.log("✅ Student withdrawn successfully");
    console.log(`   Status: ${withdrawn.status}`);
    console.log();

    // ==================== TEST 19: TEACHER CANNOT DELETE ====================
    console.log("🚫 TEST 19: Verifying TEACHER cannot delete students...");

    try {
      await studentService.deleteStudent(createdStudentId, teacherContext);
      throw new Error("TEACHER should not be able to delete students");
    } catch (error) {
      if (error instanceof UnauthorizedError) {
        console.log("✅ TEACHER correctly denied permission to delete");
        console.log(`   Error: ${error.message}`);
      } else {
        throw error;
      }
    }
    console.log();

    // ==================== TEST 20: DELETE STUDENT (ADMIN ONLY) ====================
    console.log("🗑️  TEST 20: Deleting student (hard delete - ADMIN only)...");

    const deletedStudent = await studentService.deleteStudent(
      createdStudentId,
      adminContext
    );

    console.log("✅ Student deleted successfully by ADMIN");
    console.log(`   Deleted: ${deletedStudent.firstName} ${deletedStudent.lastName}`);
    console.log();

    // ==================== TEST 21: VERIFY DELETION ====================
    console.log("🔍 TEST 21: Verifying deletion...");

    const shouldBeNull = await studentService.getStudentById(
      createdStudentId,
      adminContext
    );

    if (shouldBeNull !== null) {
      throw new Error("Student still exists after deletion");
    }

    console.log("✅ Deletion confirmed - student no longer exists");
    console.log();

    // ==================== SUCCESS ====================
    console.log("=".repeat(60));
    console.log("✨ All service layer tests passed successfully!");
    console.log("=".repeat(60));
    console.log();
    console.log("Summary:");
    console.log("  ✓ Create operation (with permission checks)");
    console.log("  ✓ Read operations (single, list, pagination, search)");
    console.log("  ✓ Update operation (with permission checks)");
    console.log("  ✓ Delete operation (with permission checks)");
    console.log("  ✓ Age validation (5-25 years)");
    console.log("  ✓ Admission date validation (no future dates)");
    console.log("  ✓ Student number format validation (STU2024001)");
    console.log("  ✓ Duplicate student number prevention");
    console.log("  ✓ Status change operations");
    console.log("  ✓ Graduated student protection (immutable)");
    console.log("  ✓ Role-based access control (ADMIN, CLERK, TEACHER)");
    console.log("  ✓ Soft delete (withdrawal)");
    console.log("  ✓ Hard delete (ADMIN only)");
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
        await prisma.student.delete({ where: { id: createdStudentId } });
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
testStudentService();
