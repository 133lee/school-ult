import { parentService, ServiceContext, UnauthorizedError, NotFoundError, ValidationError } from "../features/parents/parent.service";
import { ParentStatus, VulnerabilityStatus } from "@prisma/client";

const adminContext: ServiceContext = { userId: "admin-1", role: "ADMIN" };
const teacherContext: ServiceContext = { userId: "teacher-1", role: "TEACHER" };
const clerkContext: ServiceContext = { userId: "clerk-1", role: "CLERK" };

let createdParentId: string;

async function testParentService() {
  console.log("🧪 Testing Parent Service\n");

  let testsPassed = 0;
  let testsFailed = 0;

  // Helper function to run a test
  async function runTest(name: string, fn: () => Promise<void>) {
    try {
      await fn();
      console.log(`✅ ${name}`);
      testsPassed++;
    } catch (error) {
      console.error(`❌ ${name}`);
      console.error(`   Error: ${error instanceof Error ? error.message : String(error)}`);
      testsFailed++;
    }
  }

  // ==================== CREATE TESTS ====================

  await runTest("1. ADMIN can create guardian", async () => {
    const parent = await parentService.createParent(
      {
        firstName: "Grace",
        lastName: "Banda",
        phone: "+260977555123",
        email: "grace.banda@email.com",
        address: "789 Kabwe Road, Lusaka",
        occupation: "Nurse",
        status: ParentStatus.ACTIVE,
        vulnerability: VulnerabilityStatus.NOT_VULNERABLE,
      },
      adminContext
    );
    createdParentId = parent.id;
    if (!parent.id) throw new Error("Guardian ID not returned");
  });

  await runTest("2. CLERK can create guardian", async () => {
    const parent = await parentService.createParent(
      {
        firstName: "Peter",
        lastName: "Mulenga",
        phone: "+260966777888",
        email: "peter.m@email.com",
        occupation: "Driver",
      },
      clerkContext
    );
    if (!parent.id) throw new Error("Guardian ID not returned");
    // Clean up
    await parentService.deleteParent(parent.id, adminContext);
  });

  await runTest("3. TEACHER cannot create guardian", async () => {
    try {
      await parentService.createParent(
        {
          firstName: "Test",
          lastName: "User",
          phone: "+260955111222",
        },
        teacherContext
      );
      throw new Error("Should have thrown UnauthorizedError");
    } catch (error) {
      if (!(error instanceof UnauthorizedError)) {
        throw error;
      }
    }
  });

  await runTest("4. Reject duplicate phone number", async () => {
    try {
      await parentService.createParent(
        {
          firstName: "Another",
          lastName: "Parent",
          phone: "+260977555123", // Duplicate
        },
        adminContext
      );
      throw new Error("Should have thrown ValidationError");
    } catch (error) {
      if (!(error instanceof ValidationError)) {
        throw error;
      }
    }
  });

  await runTest("5. Reject duplicate email", async () => {
    try {
      await parentService.createParent(
        {
          firstName: "Another",
          lastName: "Parent",
          phone: "+260966888999",
          email: "grace.banda@email.com", // Duplicate
        },
        adminContext
      );
      throw new Error("Should have thrown ValidationError");
    } catch (error) {
      if (!(error instanceof ValidationError)) {
        throw error;
      }
    }
  });

  await runTest("6. Reject invalid phone format", async () => {
    try {
      await parentService.createParent(
        {
          firstName: "Test",
          lastName: "User",
          phone: "12345", // Invalid
        },
        adminContext
      );
      throw new Error("Should have thrown ValidationError");
    } catch (error) {
      if (!(error instanceof ValidationError)) {
        throw error;
      }
    }
  });

  await runTest("7. Reject invalid email format", async () => {
    try {
      await parentService.createParent(
        {
          firstName: "Test",
          lastName: "User",
          phone: "+260955333444",
          email: "invalid-email", // Invalid
        },
        adminContext
      );
      throw new Error("Should have thrown ValidationError");
    } catch (error) {
      if (!(error instanceof ValidationError)) {
        throw error;
      }
    }
  });

  await runTest("8. Reject invalid name (numbers)", async () => {
    try {
      await parentService.createParent(
        {
          firstName: "Test123", // Invalid
          lastName: "User",
          phone: "+260955444555",
        },
        adminContext
      );
      throw new Error("Should have thrown ValidationError");
    } catch (error) {
      if (!(error instanceof ValidationError)) {
        throw error;
      }
    }
  });

  // ==================== READ TESTS ====================

  await runTest("9. Get guardian by ID", async () => {
    const parent = await parentService.getParentById(createdParentId, adminContext);
    if (parent.id !== createdParentId) throw new Error("Wrong guardian returned");
  });

  await runTest("10. Get guardian with relations", async () => {
    const parent = await parentService.getParentByIdWithRelations(createdParentId, adminContext);
    if (!parent.studentGuardians) throw new Error("Relations not loaded");
  });

  await runTest("11. TEACHER can read guardian", async () => {
    const parent = await parentService.getParentById(createdParentId, teacherContext);
    if (!parent) throw new Error("Guardian not found");
  });

  await runTest("12. Get all guardians with pagination", async () => {
    const result = await parentService.getParents(
      {},
      { page: 1, pageSize: 10 },
      adminContext
    );
    if (!result.data) throw new Error("No data returned");
    if (!result.meta) throw new Error("No meta returned");
  });

  await runTest("13. Filter by status", async () => {
    const result = await parentService.getParents(
      { status: ParentStatus.ACTIVE },
      { page: 1, pageSize: 10 },
      adminContext
    );
    if (result.data.some(p => p.status !== ParentStatus.ACTIVE)) {
      throw new Error("Filter not working");
    }
  });

  await runTest("14. Filter by vulnerability", async () => {
    const result = await parentService.getParents(
      { vulnerability: VulnerabilityStatus.NOT_VULNERABLE },
      { page: 1, pageSize: 10 },
      adminContext
    );
    if (result.data.some(p => p.vulnerability !== VulnerabilityStatus.NOT_VULNERABLE)) {
      throw new Error("Filter not working");
    }
  });

  await runTest("15. Search by name", async () => {
    const result = await parentService.getParents(
      { search: "Banda" },
      { page: 1, pageSize: 10 },
      adminContext
    );
    if (!result.data.some(p => p.lastName === "Banda")) {
      throw new Error("Search not working");
    }
  });

  await runTest("16. Non-existent ID returns NotFoundError", async () => {
    try {
      await parentService.getParentById("non-existent-id", adminContext);
      throw new Error("Should have thrown NotFoundError");
    } catch (error) {
      if (!(error instanceof NotFoundError)) {
        throw error;
      }
    }
  });

  // ==================== UPDATE TESTS ====================

  await runTest("17. ADMIN can update guardian", async () => {
    const updated = await parentService.updateParent(
      createdParentId,
      { occupation: "Doctor" },
      adminContext
    );
    if (updated.occupation !== "Doctor") throw new Error("Update failed");
  });

  await runTest("18. CLERK can update guardian", async () => {
    const updated = await parentService.updateParent(
      createdParentId,
      { address: "New Address" },
      clerkContext
    );
    if (updated.address !== "New Address") throw new Error("Update failed");
  });

  await runTest("19. TEACHER cannot update guardian", async () => {
    try {
      await parentService.updateParent(
        createdParentId,
        { occupation: "Engineer" },
        teacherContext
      );
      throw new Error("Should have thrown UnauthorizedError");
    } catch (error) {
      if (!(error instanceof UnauthorizedError)) {
        throw error;
      }
    }
  });

  await runTest("20. Cannot update to duplicate phone", async () => {
    // Create another guardian
    const another = await parentService.createParent(
      {
        firstName: "Another",
        lastName: "Guardian",
        phone: "+260955999888",
      },
      adminContext
    );

    try {
      await parentService.updateParent(
        createdParentId,
        { phone: "+260955999888" }, // Duplicate
        adminContext
      );
      throw new Error("Should have thrown ValidationError");
    } catch (error) {
      if (!(error instanceof ValidationError)) {
        throw error;
      }
    } finally {
      await parentService.deleteParent(another.id, adminContext);
    }
  });

  // ==================== DELETE TESTS ====================

  await runTest("21. TEACHER cannot delete guardian", async () => {
    try {
      await parentService.deleteParent(createdParentId, teacherContext);
      throw new Error("Should have thrown UnauthorizedError");
    } catch (error) {
      if (!(error instanceof UnauthorizedError)) {
        throw error;
      }
    }
  });

  await runTest("22. CLERK cannot delete guardian", async () => {
    try {
      await parentService.deleteParent(createdParentId, clerkContext);
      throw new Error("Should have thrown UnauthorizedError");
    } catch (error) {
      if (!(error instanceof UnauthorizedError)) {
        throw error;
      }
    }
  });

  await runTest("23. ADMIN can delete guardian", async () => {
    const deleted = await parentService.deleteParent(createdParentId, adminContext);
    if (deleted.id !== createdParentId) throw new Error("Wrong guardian deleted");
  });

  await runTest("24. Verify deletion", async () => {
    try {
      await parentService.getParentById(createdParentId, adminContext);
      throw new Error("Guardian should be deleted");
    } catch (error) {
      if (!(error instanceof NotFoundError)) {
        throw error;
      }
    }
  });

  // ==================== SUMMARY ====================
  console.log("\n" + "=".repeat(50));
  console.log(`Tests passed: ${testsPassed}`);
  console.log(`Tests failed: ${testsFailed}`);
  console.log("=".repeat(50));

  if (testsFailed > 0) {
    process.exit(1);
  }
}

testParentService()
  .then(() => {
    console.log("\n✅ All tests passed!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n❌ Test suite failed:");
    console.error(error);
    process.exit(1);
  });
