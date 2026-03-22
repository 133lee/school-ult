import { DepartmentStatus } from "@prisma/client";
import prisma from "@/lib/db/prisma";

/**
 * Test script for Department API Routes
 *
 * This script validates the API layer by making HTTP requests
 * to the department endpoints and verifying responses.
 *
 * Prerequisites:
 * - Dev server must be running: npm run dev
 * - Database must be seeded with at least one user
 *
 * Run with: npx tsx scripts/test-department-api.ts
 */

const API_BASE_URL = "http://localhost:3000/api";

// Test user credentials (should exist in database)
const TEST_CREDENTIALS = {
  email: "admin@school.zm",
  password: "Admin123!",
};

let authToken: string | null = null;
let createdDepartmentId: string | null = null;

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

async function testDepartmentAPI() {
  console.log("=".repeat(60));
  console.log("Department API Routes Validation Test");
  console.log("=".repeat(60));
  console.log();

  try {
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

    // ==================== TEST 2: GET ALL DEPARTMENTS ====================
    console.log("📋 TEST 2: GET /api/departments (List departments)...");

    const listResponse = await apiRequest("/departments?page=1&pageSize=5");

    if (listResponse.status !== 200 || !listResponse.data.success) {
      console.error("List Response:", JSON.stringify(listResponse, null, 2));
      throw new Error(
        `Failed to fetch departments: ${listResponse.data.error || "Unknown error"}`
      );
    }

    console.log("✅ Departments retrieved successfully");
    console.log(`   Total: ${listResponse.data.meta.total}`);
    console.log(`   Page: ${listResponse.data.meta.page}`);
    console.log(`   Page Size: ${listResponse.data.meta.pageSize}`);
    console.log(`   Retrieved: ${listResponse.data.data.length} department(s)`);
    console.log();

    // ==================== TEST 3: CREATE DEPARTMENT ====================
    console.log("📝 TEST 3: POST /api/departments (Create department)...");

    const createResponse = await apiRequest("/departments", {
      method: "POST",
      body: JSON.stringify({
        name: `API Test Department ${Math.floor(Math.random() * 1000)}`,
        code: `TEST${Math.floor(Math.random() * 100)}`,
        description: "Test department created via API",
      }),
    });

    if (createResponse.status !== 201 || !createResponse.data.success) {
      throw new Error(
        `Failed to create department: ${
          createResponse.data.error || "Unknown error"
        }`
      );
    }

    createdDepartmentId = createResponse.data.data.id;

    console.log("✅ Department created successfully");
    console.log(`   ID: ${createResponse.data.data.id}`);
    console.log(`   Name: ${createResponse.data.data.name}`);
    console.log(`   Code: ${createResponse.data.data.code}`);
    console.log(`   Status: ${createResponse.data.data.status}`);
    console.log();

    // ==================== TEST 4: GET SINGLE DEPARTMENT ====================
    console.log("🔍 TEST 4: GET /api/departments/:id (Get single department)...");

    const getResponse = await apiRequest(`/departments/${createdDepartmentId}`);

    if (getResponse.status !== 200 || !getResponse.data.success) {
      console.error("Response:", JSON.stringify(getResponse, null, 2));
      throw new Error(
        `Failed to fetch department by ID: ${
          getResponse.data.error || "Unknown error"
        }`
      );
    }

    console.log("✅ Department retrieved successfully");
    console.log(`   ID: ${getResponse.data.data.id}`);
    console.log(`   Name: ${getResponse.data.data.name}`);
    console.log(`   Code: ${getResponse.data.data.code}`);
    console.log();

    // ==================== TEST 5: GET WITH RELATIONS ====================
    console.log(
      "🔍 TEST 5: GET /api/departments/:id?include=relations (With relations)..."
    );

    const getWithRelationsResponse = await apiRequest(
      `/departments/${createdDepartmentId}?include=relations`
    );

    if (
      getWithRelationsResponse.status !== 200 ||
      !getWithRelationsResponse.data.success
    ) {
      throw new Error("Failed to fetch department with relations");
    }

    console.log("✅ Department with relations retrieved successfully");
    console.log(
      `   Subjects: ${getWithRelationsResponse.data.data.subjects?.length || 0}`
    );
    console.log(
      `   Teachers: ${
        getWithRelationsResponse.data.data.teacherProfiles?.length || 0
      }`
    );
    console.log();

    // ==================== TEST 6: UPDATE DEPARTMENT ====================
    console.log("✏️  TEST 6: PATCH /api/departments/:id (Update department)...");

    const updateResponse = await apiRequest(
      `/departments/${createdDepartmentId}`,
      {
        method: "PATCH",
        body: JSON.stringify({
          description: "Updated description via API",
        }),
      }
    );

    if (updateResponse.status !== 200 || !updateResponse.data.success) {
      throw new Error(
        `Failed to update department: ${
          updateResponse.data.error || "Unknown error"
        }`
      );
    }

    console.log("✅ Department updated successfully");
    console.log(`   New Description: ${updateResponse.data.data.description}`);
    console.log();

    // ==================== TEST 7: GET WITH FILTERS ====================
    console.log(
      "🔍 TEST 7: GET /api/departments?status=ACTIVE (With filters)..."
    );

    const filteredResponse = await apiRequest(
      "/departments?status=ACTIVE&page=1&pageSize=5"
    );

    if (filteredResponse.status !== 200 || !filteredResponse.data.success) {
      throw new Error("Failed to fetch filtered departments");
    }

    console.log("✅ Filtered departments retrieved successfully");
    console.log(`   Active departments: ${filteredResponse.data.meta.total}`);
    console.log();

    // ==================== TEST 8: SEARCH DEPARTMENTS ====================
    console.log("🔎 TEST 8: GET /api/departments?search=API (Search)...");

    const searchResponse = await apiRequest("/departments?search=API");

    if (searchResponse.status !== 200 || !searchResponse.data.success) {
      throw new Error("Failed to search departments");
    }

    console.log("✅ Search completed successfully");
    console.log(`   Results: ${searchResponse.data.data.length} department(s)`);
    console.log();

    // ==================== TEST 9: VALIDATION ERROR ====================
    console.log("🚫 TEST 9: Testing validation (invalid code)...");

    const validationResponse = await apiRequest(`/departments`, {
      method: "POST",
      body: JSON.stringify({
        name: "Invalid Department",
        code: "a", // Too short
      }),
    });

    if (validationResponse.status === 400) {
      console.log("✅ Validation error caught correctly");
      console.log(`   Error: ${validationResponse.data.error}`);
    } else {
      throw new Error("Should have returned 400 for invalid code");
    }
    console.log();

    // ==================== TEST 10: NOT FOUND ERROR ====================
    console.log("🚫 TEST 10: Testing not found error...");

    const notFoundResponse = await apiRequest("/departments/non-existent-id");

    if (notFoundResponse.status === 404) {
      console.log("✅ Not found error handled correctly");
      console.log(`   Error: ${notFoundResponse.data.error}`);
    } else {
      throw new Error("Should have returned 404 for non-existent department");
    }
    console.log();

    // ==================== TEST 11: DELETE DEPARTMENT ====================
    console.log("🗑️  TEST 11: DELETE /api/departments/:id (Delete department)...");

    const deleteResponse = await apiRequest(
      `/departments/${createdDepartmentId}`,
      {
        method: "DELETE",
      }
    );

    if (deleteResponse.status !== 200 || !deleteResponse.data.success) {
      throw new Error(
        `Failed to delete department: ${
          deleteResponse.data.error || "Unknown error"
        }`
      );
    }

    console.log("✅ Department deleted successfully");
    console.log(`   Deleted: ${deleteResponse.data.data.name}`);
    console.log();

    // ==================== TEST 12: VERIFY DELETION ====================
    console.log("🔍 TEST 12: Verifying deletion...");

    const verifyDeleteResponse = await apiRequest(
      `/departments/${createdDepartmentId}`
    );

    if (verifyDeleteResponse.status === 404) {
      console.log("✅ Deletion confirmed - department no longer exists");
    } else {
      throw new Error("Department should not exist after deletion");
    }
    console.log();

    // ==================== SUCCESS ====================
    console.log("=".repeat(60));
    console.log("✨ All API tests passed successfully!");
    console.log("=".repeat(60));
    console.log();
    console.log("Summary:");
    console.log("  ✓ Authentication");
    console.log("  ✓ List departments (GET /api/departments)");
    console.log("  ✓ Create department (POST /api/departments)");
    console.log("  ✓ Get single department (GET /api/departments/:id)");
    console.log("  ✓ Get with relations (?include=relations)");
    console.log("  ✓ Update department (PATCH /api/departments/:id)");
    console.log("  ✓ Filter departments (?status=ACTIVE)");
    console.log("  ✓ Search departments (?search=query)");
    console.log("  ✓ Validation errors (400)");
    console.log("  ✓ Not found errors (404)");
    console.log("  ✓ Delete department (DELETE /api/departments/:id)");
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
testDepartmentAPI();
