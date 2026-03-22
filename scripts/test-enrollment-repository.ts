import {
  Gender,
  StudentStatus,
  EnrollmentStatus,
  GradeLevel,
} from "@prisma/client";
import prisma from "@/lib/db/prisma";
import { enrollmentRepository } from "@/features/enrollments/enrollment.repository";

/**
 * Test script for Enrollment Repository validation
 *
 * This script validates the repository layer by performing CRUD operations
 * through the EnrollmentRepository abstraction.
 *
 * Prerequisites:
 * - Active academic year must exist
 * - At least one class must exist
 * - Test creates its own student
 *
 * Run with: npx tsx scripts/test-enrollment-repository.ts
 */

async function testEnrollmentRepository() {
  console.log("=".repeat(60));
  console.log("Enrollment Repository Validation Test");
  console.log("=".repeat(60));
  console.log();

  let createdStudentId: string | null = null;
  let createdEnrollmentId: string | null = null;
  let academicYearId: string | null = null;
  let classId: string | null = null;
  let secondClassId: string | null = null;

  try {
    // ==================== SETUP: Prerequisites ====================
    console.log("🔧 SETUP: Preparing test environment...");
    console.log();

    // Find or create active academic year
    let academicYear = await prisma.academicYear.findFirst({
      where: { isActive: true },
    });

    if (!academicYear) {
      console.log("   Creating test academic year...");
      academicYear = await prisma.academicYear.create({
        data: {
          year: 2024,
          startDate: new Date("2024-01-01"),
          endDate: new Date("2024-12-31"),
          isActive: true,
          isClosed: false,
        },
      });
    }

    academicYearId = academicYear.id;
    console.log(
      `✅ Academic Year: ${academicYear.year} (ID: ${academicYearId})`
    );

    // Find or create grade
    let grade = await prisma.grade.findFirst({
      where: { level: GradeLevel.GRADE_1 },
    });

    if (!grade) {
      console.log("   Creating test grade...");
      grade = await prisma.grade.create({
        data: {
          level: GradeLevel.GRADE_1,
          name: "Grade 1",
          schoolLevel: "PRIMARY",
          sequence: 1,
        },
      });
    }

    // Find or create first class
    let testClass = await prisma.class.findFirst({
      where: { gradeId: grade.id },
    });

    if (!testClass) {
      console.log("   Creating test class A...");
      testClass = await prisma.class.create({
        data: {
          name: "A",
          gradeId: grade.id,
          capacity: 40,
          status: "ACTIVE",
        },
      });
    }

    classId = testClass.id;
    console.log(`✅ Class: ${grade.name}-${testClass.name} (ID: ${classId})`);

    // Create second class for transfer test
    console.log("   Creating test class B...");
    const secondClass = await prisma.class.create({
      data: {
        name: `B-TEST-${Date.now()}`,
        gradeId: grade.id,
        capacity: 40,
        status: "ACTIVE",
      },
    });

    secondClassId = secondClass.id;
    console.log(
      `✅ Second Class: ${grade.name}-${secondClass.name} (ID: ${secondClassId})`
    );

    // Create test student
    console.log("   Creating test student...");
    const testStudent = await prisma.student.create({
      data: {
        studentNumber: `ENROLL-TEST-${Date.now()}`,
        firstName: "Test",
        middleName: "Enrollment",
        lastName: "Student",
        dateOfBirth: new Date("2015-03-20"),
        gender: Gender.MALE,
        admissionDate: new Date("2024-01-10"),
        status: StudentStatus.ACTIVE,
        address: "Test Address, Lusaka",
      },
    });

    createdStudentId = testStudent.id;
    console.log(
      `✅ Student: ${testStudent.firstName} ${testStudent.lastName} (${testStudent.studentNumber})`
    );
    console.log();

    // ==================== TEST 1: CREATE ENROLLMENT ====================
    console.log("📝 TEST 1: Creating a new enrollment...");

    const newEnrollment = await enrollmentRepository.create({
      student: { connect: { id: createdStudentId } },
      class: { connect: { id: classId } },
      academicYear: { connect: { id: academicYearId } },
      status: EnrollmentStatus.ACTIVE,
    });

    createdEnrollmentId = newEnrollment.id;

    console.log("✅ Enrollment created successfully");
    console.log(`   ID: ${newEnrollment.id}`);
    console.log(`   Student: ${createdStudentId}`);
    console.log(`   Class: ${classId}`);
    console.log(`   Academic Year: ${academicYearId}`);
    console.log(`   Status: ${newEnrollment.status}`);
    console.log();

    // ==================== TEST 2: READ BY ID ====================
    console.log("🔍 TEST 2: Fetching enrollment by ID...");

    const foundEnrollment = await enrollmentRepository.findById(
      createdEnrollmentId
    );

    if (!foundEnrollment) {
      throw new Error("Enrollment not found after creation");
    }

    console.log("✅ Enrollment retrieved successfully");
    console.log(`   Status: ${foundEnrollment.status}`);
    console.log(
      `   Enrollment Date: ${
        foundEnrollment.enrollmentDate.toISOString().split("T")[0]
      }`
    );
    console.log();

    // ==================== TEST 3: READ WITH RELATIONS ====================
    console.log("📚 TEST 3: Fetching enrollment with full relations...");

    const enrollmentWithRelations =
      await enrollmentRepository.findByIdWithRelations(createdEnrollmentId);

    if (!enrollmentWithRelations) {
      throw new Error("Enrollment with relations not found");
    }

    console.log("✅ Enrollment with relations retrieved");
    console.log(
      `   Student Name: ${enrollmentWithRelations.student.firstName} ${enrollmentWithRelations.student.lastName}`
    );
    console.log(`   Class: ${enrollmentWithRelations.class.name}`);
    console.log(`   Grade: ${enrollmentWithRelations.class.grade.name}`);
    console.log(
      `   Academic Year: ${enrollmentWithRelations.academicYear.year}`
    );
    console.log(
      `   Guardians: ${enrollmentWithRelations.student.studentGuardians.length}`
    );
    console.log();

    // ==================== TEST 4: FIND ACTIVE BY STUDENT AND YEAR ====================
    console.log("🔎 TEST 4: Finding active enrollment by student and year...");

    const activeEnrollment =
      await enrollmentRepository.findActiveByStudentAndYear(
        createdStudentId,
        academicYearId
      );

    if (!activeEnrollment) {
      throw new Error("Active enrollment not found");
    }

    console.log("✅ Active enrollment found");
    console.log(`   Class: ${activeEnrollment.class.name}`);
    console.log(`   Grade: ${activeEnrollment.class.grade.name}`);
    console.log();

    // ==================== TEST 5: CHECK EXISTENCE ====================
    console.log("✔️  TEST 5: Checking enrollment existence...");

    const exists = await enrollmentRepository.existsByStudentAndYear(
      createdStudentId,
      academicYearId
    );

    console.log(`✅ Enrollment exists: ${exists}`);
    console.log();

    // ==================== TEST 6: COUNT ACTIVE IN CLASS ====================
    console.log("🔢 TEST 6: Counting active enrollments in class...");

    const activeCount = await enrollmentRepository.countActiveInClass(
      classId,
      academicYearId
    );

    console.log(`✅ Active enrollments in class: ${activeCount}`);
    console.log();

    // ==================== TEST 7: GET CLASS ROSTER ====================
    console.log("📋 TEST 7: Getting class roster...");

    const roster = await enrollmentRepository.findByClassAndYear(
      classId,
      academicYearId
    );

    console.log(`✅ Class roster retrieved: ${roster.length} student(s)`);
    if (roster.length > 0) {
      console.log(
        `   First student: ${roster[0].student.firstName} ${roster[0].student.lastName}`
      );
    }
    console.log();

    // ==================== TEST 8: GET STUDENT ENROLLMENT HISTORY ====================
    console.log("📜 TEST 8: Getting student enrollment history...");

    const history = await enrollmentRepository.findByStudent(createdStudentId);

    console.log(
      `✅ Enrollment history retrieved: ${history.length} enrollment(s)`
    );
    console.log();

    // ==================== TEST 9: UPDATE ENROLLMENT ====================
    console.log("✏️  TEST 9: Updating enrollment status to COMPLETED...");

    const updatedEnrollment = await enrollmentRepository.updateStatus(
      createdEnrollmentId,
      EnrollmentStatus.COMPLETED
    );

    console.log("✅ Enrollment updated successfully");
    console.log(`   New status: ${updatedEnrollment.status}`);
    console.log();

    // ==================== TEST 10: FIND BY STATUS ====================
    console.log("🔍 TEST 10: Finding enrollments by status...");

    const completedEnrollments = await enrollmentRepository.findByStatus(
      EnrollmentStatus.COMPLETED,
      academicYearId
    );

    console.log(
      `✅ Found ${completedEnrollments.length} completed enrollment(s)`
    );
    console.log();

    // ==================== TEST 11: COUNT BY STATUS ====================
    console.log("🔢 TEST 11: Counting enrollments by status...");

    const completedCount = await enrollmentRepository.countByClassAndStatus(
      classId,
      academicYearId,
      EnrollmentStatus.COMPLETED
    );

    console.log(`✅ Completed enrollments in class: ${completedCount}`);
    console.log();

    // ==================== TEST 12: TRANSACTION TEST ====================
    console.log("🔄 TEST 12: Testing transaction operations...");

    // Reset to ACTIVE for transfer test
    await enrollmentRepository.updateStatus(
      createdEnrollmentId,
      EnrollmentStatus.ACTIVE
    );

    const transferResult = await enrollmentRepository.withTransaction(
      async (tx) => {
        // Update enrollment to new class
        const updated = await enrollmentRepository.updateInTransaction(
          tx,
          createdEnrollmentId!,
          {
            class: { connect: { id: secondClassId! } },
          }
        );

        // Verify within same transaction
        const verified = await enrollmentRepository.findByIdInTransaction(
          tx,
          createdEnrollmentId!
        );

        return { updated, verified };
      }
    );

    console.log("✅ Transaction completed successfully");
    console.log(`   Updated class ID: ${transferResult.updated.classId}`);
    console.log(`   Verified class ID: ${transferResult.verified?.classId}`);
    console.log();

    // ==================== TEST 13: GET STATISTICS ====================
    console.log("📊 TEST 13: Getting enrollment statistics...");

    const stats = await enrollmentRepository.getStatsByAcademicYear(
      academicYearId
    );

    console.log("✅ Statistics retrieved");
    console.log(`   Total: ${stats.total}`);
    console.log(`   Active: ${stats.active}`);
    console.log(`   Completed: ${stats.completed}`);
    console.log(`   Male: ${stats.byGender.male}`);
    console.log(`   Female: ${stats.byGender.female}`);
    console.log();

    // ==================== TEST 14: BULK UPDATE ====================
    console.log("📦 TEST 14: Testing bulk status update...");

    const bulkUpdateCount = await enrollmentRepository.bulkUpdateStatus(
      [createdEnrollmentId],
      EnrollmentStatus.WITHDRAWN
    );

    console.log(
      `✅ Bulk update completed: ${bulkUpdateCount} record(s) updated`
    );
    console.log();

    // ==================== TEST 15: PAGINATION ====================
    console.log("📄 TEST 15: Testing pagination...");

    const paginatedResults = await enrollmentRepository.findMany({
      skip: 0,
      take: 5,
      where: { academicYearId },
      orderBy: { enrollmentDate: "desc" },
    });

    console.log(`✅ Paginated results: ${paginatedResults.length} record(s)`);
    console.log();

    // ==================== TEST 16: DELETE ====================
    console.log("🗑️  TEST 16: Deleting test enrollment...");

    const deletedEnrollment = await enrollmentRepository.delete(
      createdEnrollmentId
    );

    console.log("✅ Enrollment deleted successfully");
    console.log(`   Deleted ID: ${deletedEnrollment.id}`);
    console.log();

    // ==================== TEST 17: VERIFY DELETION ====================
    console.log("🔍 TEST 17: Verifying deletion...");

    const shouldBeNull = await enrollmentRepository.findById(
      createdEnrollmentId
    );

    if (shouldBeNull !== null) {
      throw new Error("Enrollment still exists after deletion");
    }

    console.log("✅ Deletion confirmed - enrollment no longer exists");
    console.log();

    // ==================== SUCCESS ====================
    console.log("=".repeat(60));
    console.log("✨ All repository tests passed successfully!");
    console.log("=".repeat(60));
    console.log();
    console.log("Summary:");
    console.log("  ✓ Create operation");
    console.log("  ✓ Read by ID operation");
    console.log("  ✓ Read with relations");
    console.log("  ✓ Find active by student and year");
    console.log("  ✓ Check existence");
    console.log("  ✓ Count operations");
    console.log("  ✓ Class roster retrieval");
    console.log("  ✓ Student enrollment history");
    console.log("  ✓ Update operations");
    console.log("  ✓ Find by status");
    console.log("  ✓ Transaction operations");
    console.log("  ✓ Statistics aggregation");
    console.log("  ✓ Bulk operations");
    console.log("  ✓ Pagination");
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

    process.exit(1);
  } finally {
    // ==================== CLEANUP ====================
    console.log("🧹 CLEANUP: Removing test data...");

    try {
      // Delete enrollment if it exists
      if (createdEnrollmentId) {
        try {
          await enrollmentRepository.delete(createdEnrollmentId);
          console.log("✅ Test enrollment cleaned up");
        } catch {
          console.log("ℹ️  Enrollment already deleted");
        }
      }

      // Delete test student
      if (createdStudentId) {
        await prisma.student.delete({ where: { id: createdStudentId } });
        console.log("✅ Test student cleaned up");
      }

      // Delete second test class
      if (secondClassId) {
        await prisma.class.delete({ where: { id: secondClassId } });
        console.log("✅ Second test class cleaned up");
      }
    } catch (cleanupError) {
      console.log("⚠️  Some cleanup operations failed (this is usually okay)");
    }

    // Ensure Prisma connection is closed
    await prisma.$disconnect();
    console.log("🔌 Database connection closed");
    console.log();
  }
}

// Execute the test
testEnrollmentRepository();
