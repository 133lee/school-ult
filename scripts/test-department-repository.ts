import { DepartmentStatus } from "@prisma/client";
import { departmentRepository } from "@/features/departments/department.repository";
import prisma from "@/lib/db/prisma";

/**
 * Test script for Department Repository
 *
 * Tests all CRUD operations and query methods in the department repository.
 *
 * Run with: npx tsx scripts/test-department-repository.ts
 */

let createdDepartmentId: string | null = null;

async function testDepartmentRepository() {
  console.log("=".repeat(60));
  console.log("Department Repository Test");
  console.log("=".repeat(60));
  console.log();

  try {
    // ==================== TEST 1: CREATE ====================
    console.log("📝 TEST 1: Create department");

    const department = await departmentRepository.create({
      name: "Mathematics Department",
      code: "MATH",
      description: "Handles all mathematics subjects",
      status: DepartmentStatus.ACTIVE,
    });

    createdDepartmentId = department.id;

    console.log("✅ Department created");
    console.log(`   ID: ${department.id}`);
    console.log(`   Name: ${department.name}`);
    console.log(`   Code: ${department.code}`);
    console.log(`   Status: ${department.status}`);
    console.log();

    // ==================== TEST 2: READ ALL ====================
    console.log("📋 TEST 2: Read all departments");

    const allDepartments = await departmentRepository.findAll();

    console.log("✅ Departments retrieved");
    console.log(`   Total count: ${allDepartments.length}`);
    console.log();

    // ==================== TEST 3: READ BY ID ====================
    console.log("🔍 TEST 3: Read department by ID");

    const foundDepartment = await departmentRepository.findById(
      createdDepartmentId
    );

    if (!foundDepartment) {
      throw new Error("Department not found by ID");
    }

    console.log("✅ Department found by ID");
    console.log(`   Name: ${foundDepartment.name}`);
    console.log();

    // ==================== TEST 4: READ BY ID WITH RELATIONS ====================
    console.log("🔍 TEST 4: Read department by ID with relations");

    const departmentWithRelations =
      await departmentRepository.findByIdWithRelations(createdDepartmentId);

    if (!departmentWithRelations) {
      throw new Error("Department not found with relations");
    }

    console.log("✅ Department found with relations");
    console.log(`   Subjects count: ${departmentWithRelations.subjects.length}`);
    console.log(
      `   Teachers count: ${departmentWithRelations.teacherProfiles.length}`
    );
    console.log();

    // ==================== TEST 5: UPDATE ====================
    console.log("✏️  TEST 5: Update department");

    const updatedDepartment = await departmentRepository.update(
      createdDepartmentId,
      {
        description: "Updated description for mathematics",
      }
    );

    console.log("✅ Department updated");
    console.log(`   Description: ${updatedDepartment.description}`);
    console.log();

    // ==================== TEST 6: FIND BY CODE ====================
    console.log("🔍 TEST 6: Find by code");

    const foundByCode = await departmentRepository.findByCode("MATH");

    if (!foundByCode) {
      throw new Error("Department not found by code");
    }

    console.log("✅ Department found by code");
    console.log(`   Name: ${foundByCode.name}`);
    console.log();

    // ==================== TEST 7: FIND BY NAME ====================
    console.log("🔍 TEST 7: Find by name");

    const foundByName = await departmentRepository.findByName(
      "Mathematics Department"
    );

    if (!foundByName) {
      throw new Error("Department not found by name");
    }

    console.log("✅ Department found by name");
    console.log(`   Code: ${foundByName.code}`);
    console.log();

    // ==================== TEST 8: FIND BY STATUS ====================
    console.log("🔍 TEST 8: Find by status");

    const activeDepartments = await departmentRepository.findByStatus(
      DepartmentStatus.ACTIVE
    );

    console.log("✅ Departments found by status");
    console.log(`   Active departments: ${activeDepartments.length}`);
    console.log();

    // ==================== TEST 9: CHECK EXISTENCE ====================
    console.log("✅ TEST 9: Check department existence");

    const existsByCode = await departmentRepository.existsByCode("MATH");
    const existsByName = await departmentRepository.existsByName(
      "Mathematics Department"
    );

    console.log("✅ Existence checks completed");
    console.log(`   Exists by code: ${existsByCode}`);
    console.log(`   Exists by name: ${existsByName}`);
    console.log();

    // ==================== TEST 10: GET COUNTS ====================
    console.log("📊 TEST 10: Get subject and teacher counts");

    const subjectCount = await departmentRepository.getSubjectCount(
      createdDepartmentId
    );
    const teacherCount = await departmentRepository.getTeacherCount(
      createdDepartmentId
    );

    console.log("✅ Counts retrieved");
    console.log(`   Subjects: ${subjectCount}`);
    console.log(`   Teachers: ${teacherCount}`);
    console.log();

    // ==================== TEST 11: DELETE ====================
    console.log("🗑️  TEST 11: Delete department");

    const deletedDepartment = await departmentRepository.delete(
      createdDepartmentId
    );

    console.log("✅ Department deleted");
    console.log(`   Deleted: ${deletedDepartment.name}`);
    console.log();

    // ==================== TEST 12: VERIFY DELETION ====================
    console.log("🔍 TEST 12: Verify deletion");

    const verifyDeleted = await departmentRepository.findById(
      createdDepartmentId
    );

    if (verifyDeleted) {
      throw new Error("Department still exists after deletion");
    }

    console.log("✅ Deletion verified - department no longer exists");
    console.log();

    // ==================== SUCCESS ====================
    console.log("=".repeat(60));
    console.log("✨ All repository tests passed!");
    console.log("=".repeat(60));
    console.log();
    console.log("Summary:");
    console.log("  ✓ Create department");
    console.log("  ✓ Read all departments");
    console.log("  ✓ Read by ID");
    console.log("  ✓ Read by ID with relations");
    console.log("  ✓ Update department");
    console.log("  ✓ Find by code");
    console.log("  ✓ Find by name");
    console.log("  ✓ Find by status");
    console.log("  ✓ Check existence");
    console.log("  ✓ Get counts");
    console.log("  ✓ Delete department");
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
    // Cleanup: Delete test department if it still exists
    if (createdDepartmentId) {
      try {
        await prisma.department.delete({
          where: { id: createdDepartmentId },
        });
      } catch {
        // Already deleted
      }
    }

    await prisma.$disconnect();
  }
}

// Execute the test
testDepartmentRepository();
