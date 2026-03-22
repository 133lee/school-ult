import "dotenv/config";
import { ClassStatus, Role } from "@prisma/client";
import prisma from "@/lib/db/prisma";

/**
 * Test script for Class API Routes
 *
 * This script validates the API layer by making HTTP requests
 * to the class endpoints and verifying responses.
 *
 * Prerequisites:
 * - Dev server must be running: npm run dev
 * - Database must be seeded with at least one user
 *
 * Run with: npx tsx scripts/test-class-api.ts
 */

const API_BASE_URL = "http://localhost:3000/api";

// Test user credentials (should exist in database)
const TEST_CREDENTIALS = {
  email: "admin@school.gov.zm",
  password: "Admin@123",
};

let authToken: string | null = null;
let createdClassId: string | null = null;
let testGradeId: string | null = null;

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

  const responseText = await response.text();

  let data;
  try {
    data = JSON.parse(responseText);
  } catch (err) {
    console.error(`Failed to parse JSON response from ${url}`);
    console.error(`Response status: ${response.status}`);
    console.error(`Response text: ${responseText}`);
    throw err;
  }

  return {
    status: response.status,
    data,
  };
}

async function testClassAPI() {
  console.log("=".repeat(60));
  console.log("Class API Routes Validation Test");
  console.log("=".repeat(60));
  console.log();

  try {
    // ==================== SETUP: CREATE OR GET TEST GRADE ====================
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

    // ==================== TEST 2: GET ALL CLASSES ====================
    console.log("📋 TEST 2: GET /api/classes (List classes)...");

    const listResponse = await apiRequest("/classes?page=1&pageSize=5");

    if (listResponse.status !== 200 || !listResponse.data.success) {
      throw new Error("Failed to fetch classes");
    }

    console.log("✅ Classes retrieved successfully");
    console.log(`   Total: ${listResponse.data.meta.total}`);
    console.log(`   Page: ${listResponse.data.meta.page}`);
    console.log(`   Page Size: ${listResponse.data.meta.pageSize}`);
    console.log(`   Retrieved: ${listResponse.data.data.length} class(es)`);
    console.log();

    // ==================== TEST 3: CREATE CLASS ====================
    console.log("📝 TEST 3: POST /api/classes (Create class)...");

    const createResponse = await apiRequest("/classes", {
      method: "POST",
      body: JSON.stringify({
        gradeId: testGradeId,
        name: `API Test ${Math.floor(Math.random() * 1000)}`,
        capacity: 40,
      }),
    });

    if (createResponse.status !== 201 || !createResponse.data.success) {
      throw new Error(
        `Failed to create class: ${
          createResponse.data.error || "Unknown error"
        }`
      );
    }

    createdClassId = createResponse.data.data.id;

    console.log("✅ Class created successfully");
    console.log(`   ID: ${createResponse.data.data.id}`);
    console.log(`   Name: ${createResponse.data.data.name}`);
    console.log(`   Capacity: ${createResponse.data.data.capacity}`);
    console.log(`   Status: ${createResponse.data.data.status}`);
    console.log();

    // ==================== TEST 4: GET SINGLE CLASS ====================
    console.log("🔍 TEST 4: GET /api/classes/:id (Get single class)...");

    const getResponse = await apiRequest(`/classes/${createdClassId}`);

    if (getResponse.status !== 200 || !getResponse.data.success) {
      console.error("Response:", JSON.stringify(getResponse, null, 2));
      throw new Error(
        `Failed to fetch class by ID: ${getResponse.data.error || "Unknown error"}`
      );
    }

    console.log("✅ Class retrieved successfully");
    console.log(`   ID: ${getResponse.data.data.id}`);
    console.log(`   Name: ${getResponse.data.data.name}`);
    console.log(`   Capacity: ${getResponse.data.data.capacity}`);
    console.log();

    // ==================== TEST 5: GET WITH RELATIONS ====================
    console.log(
      "🔍 TEST 5: GET /api/classes/:id?include=relations (With relations)..."
    );

    const getWithRelationsResponse = await apiRequest(
      `/classes/${createdClassId}?include=relations`
    );

    if (
      getWithRelationsResponse.status !== 200 ||
      !getWithRelationsResponse.data.success
    ) {
      throw new Error("Failed to fetch class with relations");
    }

    console.log("✅ Class with relations retrieved successfully");
    console.log(`   Has grade relation: ${!!getWithRelationsResponse.data.data.grade}`);
    console.log(
      `   Enrollments: ${getWithRelationsResponse.data.data.enrollments?.length || 0}`
    );
    console.log(
      `   Class Teachers: ${
        getWithRelationsResponse.data.data.classTeacherAssignments?.length || 0
      }`
    );
    console.log(
      `   Subject Teachers: ${
        getWithRelationsResponse.data.data.subjectTeacherAssignments?.length || 0
      }`
    );
    console.log();

    // ==================== TEST 6: UPDATE CLASS ====================
    console.log("✏️  TEST 6: PATCH /api/classes/:id (Update class)...");

    const updateResponse = await apiRequest(`/classes/${createdClassId}`, {
      method: "PATCH",
      body: JSON.stringify({
        capacity: 45,
      }),
    });

    if (updateResponse.status !== 200 || !updateResponse.data.success) {
      throw new Error(
        `Failed to update class: ${
          updateResponse.data.error || "Unknown error"
        }`
      );
    }

    console.log("✅ Class updated successfully");
    console.log(`   New Capacity: ${updateResponse.data.data.capacity}`);
    console.log();

    // ==================== TEST 7: GET WITH FILTERS ====================
    console.log("🔍 TEST 7: GET /api/classes?status=ACTIVE (With filters)...");

    const filteredResponse = await apiRequest(
      "/classes?status=ACTIVE&page=1&pageSize=5"
    );

    if (filteredResponse.status !== 200 || !filteredResponse.data.success) {
      throw new Error("Failed to fetch filtered classes");
    }

    console.log("✅ Filtered classes retrieved successfully");
    console.log(`   Active classes: ${filteredResponse.data.meta.total}`);
    console.log();

    // ==================== TEST 8: SEARCH CLASSES ====================
    console.log("🔎 TEST 8: GET /api/classes?search=API (Search)...");

    const searchResponse = await apiRequest("/classes?search=API");

    if (searchResponse.status !== 200 || !searchResponse.data.success) {
      throw new Error("Failed to search classes");
    }

    console.log("✅ Search completed successfully");
    console.log(`   Results: ${searchResponse.data.data.length} class(es)`);
    console.log();

    // ==================== TEST 9: VALIDATION ERROR ====================
    console.log("🚫 TEST 9: Testing validation (invalid capacity)...");

    const validationResponse = await apiRequest(`/classes/${createdClassId}`, {
      method: "PATCH",
      body: JSON.stringify({
        capacity: 200, // Above maximum
      }),
    });

    if (validationResponse.status === 400) {
      console.log("✅ Validation error caught correctly");
      console.log(`   Error: ${validationResponse.data.error}`);
    } else {
      throw new Error("Should have returned 400 for invalid capacity");
    }
    console.log();

    // ==================== TEST 10: NOT FOUND ERROR ====================
    console.log("🚫 TEST 10: Testing not found error...");

    const notFoundResponse = await apiRequest("/classes/non-existent-id");

    if (notFoundResponse.status === 404) {
      console.log("✅ Not found error handled correctly");
      console.log(`   Error: ${notFoundResponse.data.error}`);
    } else {
      throw new Error("Should have returned 404 for non-existent class");
    }
    console.log();

    // ==================== TEST 11: DELETE CLASS ====================
    console.log("🗑️  TEST 11: DELETE /api/classes/:id (Delete class)...");

    const deleteResponse = await apiRequest(`/classes/${createdClassId}`, {
      method: "DELETE",
    });

    if (deleteResponse.status !== 200 || !deleteResponse.data.success) {
      throw new Error(
        `Failed to delete class: ${
          deleteResponse.data.error || "Unknown error"
        }`
      );
    }

    console.log("✅ Class deleted successfully");
    console.log(
      `   Deleted: ${deleteResponse.data.data.name}`
    );
    console.log();

    // ==================== TEST 12: VERIFY DELETION ====================
    console.log("🔍 TEST 12: Verifying deletion...");

    const verifyDeleteResponse = await apiRequest(`/classes/${createdClassId}`);

    if (verifyDeleteResponse.status === 404) {
      console.log("✅ Deletion confirmed - class no longer exists");
    } else {
      throw new Error("Class should not exist after deletion");
    }
    console.log();

    // ==================== SUCCESS ====================
    console.log("=".repeat(60));
    console.log("✨ All API tests passed successfully!");
    console.log("=".repeat(60));
    console.log();
    console.log("Summary:");
    console.log("  ✓ Authentication");
    console.log("  ✓ List classes (GET /api/classes)");
    console.log("  ✓ Create class (POST /api/classes)");
    console.log("  ✓ Get single class (GET /api/classes/:id)");
    console.log("  ✓ Get with relations (?include=relations)");
    console.log("  ✓ Update class (PATCH /api/classes/:id)");
    console.log("  ✓ Filter classes (?status=ACTIVE)");
    console.log("  ✓ Search classes (?search=query)");
    console.log("  ✓ Validation errors (400)");
    console.log("  ✓ Not found errors (404)");
    console.log("  ✓ Delete class (DELETE /api/classes/:id)");
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
    await prisma.$disconnect();
  }
}

// Execute the test
testClassAPI();
