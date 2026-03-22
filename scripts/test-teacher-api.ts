import { Gender, StaffStatus, QualificationLevel, Role } from "@prisma/client";
import prisma from "@/lib/db/prisma";

/**
 * Test script for Teacher API Routes
 *
 * This script validates the API layer by making HTTP requests
 * to the teacher endpoints and verifying responses.
 *
 * Prerequisites:
 * - Dev server must be running: npm run dev
 * - Database must be seeded with at least one user
 *
 * Run with: npx tsx scripts/test-teacher-api.ts
 */

const API_BASE_URL = "http://localhost:3000/api";

// Test user credentials (should exist in database)
const TEST_CREDENTIALS = {
  email: "admin@school.zm",
  password: "Admin123!",
};

let authToken: string | null = null;
let createdTeacherId: string | null = null;
let testUserId: string | null = null;

/**
 * Helper: Make authenticated API request
 */
async function apiRequest(
  endpoint: string,
  options: RequestInit = {}
): Promise<any> {
  const url = `${API_BASE_URL}${endpoint}`;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...((options.headers as Record<string, string>) || {}),
  };

  if (authToken) {
    headers["Authorization"] = `Bearer ${authToken}`;
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  const data = await response.json();

  return {
    status: response.status,
    data,
  };
}

async function testTeacherAPI() {
  console.log("=".repeat(60));
  console.log("Teacher API Routes Validation Test");
  console.log("=".repeat(60));
  console.log();

  try {
    // ==================== SETUP: CREATE TEST USER ====================
    console.log("👤 SETUP: Creating test user for teacher...");

    const testUser = await prisma.user.create({
      data: {
        email: `test-api-teacher-${Date.now()}@school.zm`,
        passwordHash: "$2a$10$testHashedPassword123456789",
        role: Role.TEACHER,
        isActive: true,
      },
    });

    testUserId = testUser.id;

    console.log("✅ Test user created");
    console.log(`   User ID: ${testUserId}`);
    console.log();

    // ==================== TEST 1: LOGIN ====================
    console.log("🔐 TEST 1: Authenticating with API...");

    const loginResponse = await apiRequest("/auth/login", {
      method: "POST",
      body: JSON.stringify(TEST_CREDENTIALS),
    });

    if (loginResponse.status !== 200 || !loginResponse.data.success) {
      throw new Error(
        `Login failed: ${loginResponse.data.error || "Unknown error"}`
      );
    }

    authToken = loginResponse.data.data.token;

    console.log("✅ Authentication successful");
    console.log(`   Token: ${authToken?.substring(0, 20)}...`);
    console.log(`   User: ${loginResponse.data.data.user.email}`);
    console.log(`   Role: ${loginResponse.data.data.user.role}`);
    console.log();

    // ==================== TEST 2: GET ALL TEACHERS ====================
    console.log("📋 TEST 2: GET /api/teachers (List teachers)...");

    const listResponse = await apiRequest("/teachers?page=1&pageSize=5");

    if (listResponse.status !== 200 || !listResponse.data.success) {
      throw new Error("Failed to fetch teachers");
    }

    console.log("✅ Teachers retrieved successfully");
    console.log(`   Total: ${listResponse.data.meta.total}`);
    console.log(`   Page: ${listResponse.data.meta.page}`);
    console.log(`   Page Size: ${listResponse.data.meta.pageSize}`);
    console.log(`   Retrieved: ${listResponse.data.data.length} teacher(s)`);
    console.log();

    // ==================== TEST 3: CREATE TEACHER ====================
    console.log("📝 TEST 3: POST /api/teachers (Create teacher)...");

    const createResponse = await apiRequest("/teachers", {
      method: "POST",
      body: JSON.stringify({
        userId: testUserId,
        staffNumber: `STAFF2024${Math.floor(Math.random() * 1000)
          .toString()
          .padStart(3, "0")}`,
        firstName: "API",
        middleName: "Test",
        lastName: "Teacher",
        dateOfBirth: "1988-05-15",
        gender: Gender.MALE,
        phone: "+260977123456",
        address: "123 API Test Street, Lusaka",
        qualification: QualificationLevel.DEGREE,
        yearsExperience: 5,
        hireDate: "2019-01-10",
      }),
    });

    if (createResponse.status !== 201 || !createResponse.data.success) {
      throw new Error(
        `Failed to create teacher: ${
          createResponse.data.error || "Unknown error"
        }`
      );
    }

    createdTeacherId = createResponse.data.data.id;

    console.log("✅ Teacher created successfully");
    console.log(`   ID: ${createResponse.data.data.id}`);
    console.log(`   Staff Number: ${createResponse.data.data.staffNumber}`);
    console.log(
      `   Name: ${createResponse.data.data.firstName} ${createResponse.data.data.lastName}`
    );
    console.log();

    // ==================== TEST 4: GET SINGLE TEACHER ====================
    console.log("🔍 TEST 4: GET /api/teachers/:id (Get single teacher)...");

    const getResponse = await apiRequest(`/teachers/${createdTeacherId}`);

    if (getResponse.status !== 200 || !getResponse.data.success) {
      throw new Error("Failed to fetch teacher by ID");
    }

    console.log("✅ Teacher retrieved successfully");
    console.log(`   ID: ${getResponse.data.data.id}`);
    console.log(
      `   Name: ${getResponse.data.data.firstName} ${getResponse.data.data.lastName}`
    );
    console.log(`   Staff Number: ${getResponse.data.data.staffNumber}`);
    console.log();

    // ==================== TEST 5: GET WITH RELATIONS ====================
    console.log(
      "🔍 TEST 5: GET /api/teachers/:id?include=relations (With relations)..."
    );

    const getWithRelationsResponse = await apiRequest(
      `/teachers/${createdTeacherId}?include=relations`
    );

    if (
      getWithRelationsResponse.status !== 200 ||
      !getWithRelationsResponse.data.success
    ) {
      throw new Error("Failed to fetch teacher with relations");
    }

    console.log("✅ Teacher with relations retrieved successfully");
    console.log(`   Has user relation: ${!!getWithRelationsResponse.data.data.user}`);
    console.log(
      `   Subjects: ${getWithRelationsResponse.data.data.subjects?.length || 0}`
    );
    console.log(
      `   Class Assignments: ${
        getWithRelationsResponse.data.data.classTeacherAssignments?.length || 0
      }`
    );
    console.log();

    // ==================== TEST 6: UPDATE TEACHER ====================
    console.log("✏️  TEST 6: PATCH /api/teachers/:id (Update teacher)...");

    const updateResponse = await apiRequest(`/teachers/${createdTeacherId}`, {
      method: "PATCH",
      body: JSON.stringify({
        yearsExperience: 10,
        qualification: QualificationLevel.MASTERS,
        phone: "+260977999888",
      }),
    });

    if (updateResponse.status !== 200 || !updateResponse.data.success) {
      throw new Error(
        `Failed to update teacher: ${
          updateResponse.data.error || "Unknown error"
        }`
      );
    }

    console.log("✅ Teacher updated successfully");
    console.log(`   Years Experience: ${updateResponse.data.data.yearsExperience}`);
    console.log(`   Qualification: ${updateResponse.data.data.qualification}`);
    console.log(`   Phone: ${updateResponse.data.data.phone}`);
    console.log();

    // ==================== TEST 7: GET WITH FILTERS ====================
    console.log("🔍 TEST 7: GET /api/teachers?status=ACTIVE (With filters)...");

    const filteredResponse = await apiRequest(
      "/teachers?status=ACTIVE&page=1&pageSize=5"
    );

    if (filteredResponse.status !== 200 || !filteredResponse.data.success) {
      throw new Error("Failed to fetch filtered teachers");
    }

    console.log("✅ Filtered teachers retrieved successfully");
    console.log(`   Active teachers: ${filteredResponse.data.meta.total}`);
    console.log();

    // ==================== TEST 8: SEARCH TEACHERS ====================
    console.log("🔎 TEST 8: GET /api/teachers?search=API (Search)...");

    const searchResponse = await apiRequest("/teachers?search=API");

    if (searchResponse.status !== 200 || !searchResponse.data.success) {
      throw new Error("Failed to search teachers");
    }

    console.log("✅ Search completed successfully");
    console.log(`   Results: ${searchResponse.data.data.length} teacher(s)`);
    console.log();

    // ==================== TEST 9: VALIDATION ERROR ====================
    console.log("🚫 TEST 9: Testing validation (invalid phone number)...");

    const validationResponse = await apiRequest(`/teachers/${createdTeacherId}`, {
      method: "PATCH",
      body: JSON.stringify({
        phone: "invalid-phone",
      }),
    });

    if (validationResponse.status === 400) {
      console.log("✅ Validation error caught correctly");
      console.log(`   Error: ${validationResponse.data.error}`);
    } else {
      throw new Error("Should have returned 400 for invalid phone");
    }
    console.log();

    // ==================== TEST 10: NOT FOUND ERROR ====================
    console.log("🚫 TEST 10: Testing not found error...");

    const notFoundResponse = await apiRequest("/teachers/non-existent-id");

    if (notFoundResponse.status === 404) {
      console.log("✅ Not found error handled correctly");
      console.log(`   Error: ${notFoundResponse.data.error}`);
    } else {
      throw new Error("Should have returned 404 for non-existent teacher");
    }
    console.log();

    // ==================== TEST 11: DELETE TEACHER ====================
    console.log("🗑️  TEST 11: DELETE /api/teachers/:id (Delete teacher)...");

    const deleteResponse = await apiRequest(`/teachers/${createdTeacherId}`, {
      method: "DELETE",
    });

    if (deleteResponse.status !== 200 || !deleteResponse.data.success) {
      throw new Error(
        `Failed to delete teacher: ${
          deleteResponse.data.error || "Unknown error"
        }`
      );
    }

    console.log("✅ Teacher deleted successfully");
    console.log(
      `   Deleted: ${deleteResponse.data.data.firstName} ${deleteResponse.data.data.lastName}`
    );
    console.log();

    // ==================== TEST 12: VERIFY DELETION ====================
    console.log("🔍 TEST 12: Verifying deletion...");

    const verifyDeleteResponse = await apiRequest(`/teachers/${createdTeacherId}`);

    if (verifyDeleteResponse.status === 404) {
      console.log("✅ Deletion confirmed - teacher no longer exists");
    } else {
      throw new Error("Teacher should not exist after deletion");
    }
    console.log();

    // ==================== SUCCESS ====================
    console.log("=".repeat(60));
    console.log("✨ All API tests passed successfully!");
    console.log("=".repeat(60));
    console.log();
    console.log("Summary:");
    console.log("  ✓ Authentication");
    console.log("  ✓ List teachers (GET /api/teachers)");
    console.log("  ✓ Create teacher (POST /api/teachers)");
    console.log("  ✓ Get single teacher (GET /api/teachers/:id)");
    console.log("  ✓ Get with relations (?include=relations)");
    console.log("  ✓ Update teacher (PATCH /api/teachers/:id)");
    console.log("  ✓ Filter teachers (?status=ACTIVE)");
    console.log("  ✓ Search teachers (?search=query)");
    console.log("  ✓ Validation errors (400)");
    console.log("  ✓ Not found errors (404)");
    console.log("  ✓ Delete teacher (DELETE /api/teachers/:id)");
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
      if (error.stack) {
        console.error("Stack trace:");
        console.error(error.stack);
      }
    } else {
      console.error("Unknown error:", error);
    }

    process.exit(1);
  } finally {
    // Cleanup: Remove test user
    if (testUserId) {
      try {
        await prisma.user.delete({ where: { id: testUserId } });
        console.log("🧹 Test user cleaned up");
      } catch (e) {
        // Ignore cleanup errors
      }
    }

    await prisma.$disconnect();
  }
}

// Execute the test
testTeacherAPI();
