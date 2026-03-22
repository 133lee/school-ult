/**
 * Test script for Parent API Routes
 *
 * This script validates the API layer by making HTTP requests
 * to the parent endpoints and verifying responses.
 *
 * Prerequisites:
 * - Dev server must be running: npm run dev
 * - Database must be seeded with at least one user
 *
 * Run with: npx tsx scripts/test-parent-api.ts
 */

const API_BASE_URL = "http://localhost:3000/api";

// Test user credentials (should exist in database)
const ADMIN_CREDENTIALS = {
  email: "admin@school.gov.zm",
  password: "Admin@123",
};

const TEACHER_CREDENTIALS = {
  email: "teacher1@school.gov.zm",
  password: "Teacher@123",
};

let adminToken: string | null = null;
let teacherToken: string | null = null;
let createdParentId: string | null = null;

/**
 * Helper: Make authenticated API request
 */
async function apiRequest(
  endpoint: string,
  options: RequestInit = {},
  token: string | null = adminToken
): Promise<any> {
  const url = `${API_BASE_URL}${endpoint}`;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...((options.headers as Record<string, string>) || {}),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
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

async function testParentAPI() {
  console.log("=".repeat(60));
  console.log("Parent API Routes Validation Test");
  console.log("=".repeat(60));
  console.log();

  try {
    // ==================== TEST 1: LOGIN AS ADMIN ====================
    console.log("🔐 TEST 1: Authenticating as ADMIN...");

    const adminLoginResponse = await apiRequest(
      "/auth/login",
      {
        method: "POST",
        body: JSON.stringify(ADMIN_CREDENTIALS),
      },
      null
    );

    if (adminLoginResponse.status !== 200 || !adminLoginResponse.data.success) {
      throw new Error(
        `Admin login failed: ${
          adminLoginResponse.data.error || "Unknown error"
        }`
      );
    }

    adminToken = adminLoginResponse.data.data.token;

    console.log("✅ Admin authentication successful");
    console.log(`   Token: ${adminToken?.substring(0, 20)}...`);
    console.log(`   User: ${adminLoginResponse.data.data.user.email}`);
    console.log(`   Role: ${adminLoginResponse.data.data.user.role}`);
    console.log();

    // ==================== TEST 2: LOGIN AS TEACHER ====================
    console.log("🔐 TEST 2: Authenticating as TEACHER...");

    const teacherLoginResponse = await apiRequest(
      "/auth/login",
      {
        method: "POST",
        body: JSON.stringify(TEACHER_CREDENTIALS),
      },
      null
    );

    if (
      teacherLoginResponse.status !== 200 ||
      !teacherLoginResponse.data.success
    ) {
      throw new Error(
        `Teacher login failed: ${
          teacherLoginResponse.data.error || "Unknown error"
        }`
      );
    }

    teacherToken = teacherLoginResponse.data.data.token;

    console.log("✅ Teacher authentication successful");
    console.log(`   Token: ${teacherToken?.substring(0, 20)}...`);
    console.log(`   User: ${teacherLoginResponse.data.data.user.email}`);
    console.log(`   Role: ${teacherLoginResponse.data.data.user.role}`);
    console.log();

    // ==================== TEST 3: GET ALL PARENTS ====================
    console.log("📋 TEST 3: GET /api/parents (List guardians)...");

    const listResponse = await apiRequest("/parents?page=1&pageSize=5");

    if (listResponse.status !== 200 || !listResponse.data.success) {
      throw new Error("Failed to fetch guardians");
    }

    console.log("✅ Guardians retrieved successfully");
    console.log(`   Total: ${listResponse.data.meta.total}`);
    console.log(`   Page: ${listResponse.data.meta.page}`);
    console.log(`   Page Size: ${listResponse.data.meta.pageSize}`);
    console.log(`   Retrieved: ${listResponse.data.data.length} guardian(s)`);
    console.log();

    // ==================== TEST 4: GET PARENTS WITH SEARCH ====================
    console.log("🔍 TEST 4: GET /api/parents?search=... (Search guardians)...");

    const searchResponse = await apiRequest("/parents?search=Banda");

    if (searchResponse.status !== 200 || !searchResponse.data.success) {
      throw new Error("Failed to search guardians");
    }

    console.log("✅ Search completed successfully");
    console.log(
      `   Found: ${searchResponse.data.data.length} guardian(s) matching search`
    );
    console.log();

    // ==================== TEST 5: CREATE PARENT (ADMIN) ====================
    console.log("📝 TEST 5: POST /api/parents (Create guardian as ADMIN)...");

    const createResponse = await apiRequest("/parents", {
      method: "POST",
      body: JSON.stringify({
        firstName: "Test",
        lastName: "Guardian",
        phone: "+260977999888",
        email: "test.guardian@email.com",
        address: "123 Test Street, Lusaka",
        occupation: "Engineer",
      }),
    });

    if (createResponse.status !== 201 || !createResponse.data.success) {
      throw new Error(
        `Failed to create guardian: ${
          createResponse.data.error || "Unknown error"
        }`
      );
    }

    createdParentId = createResponse.data.data.id;

    console.log("✅ Guardian created successfully");
    console.log(`   ID: ${createResponse.data.data.id}`);
    console.log(`   Phone: ${createResponse.data.data.phone}`);
    console.log(
      `   Name: ${createResponse.data.data.firstName} ${createResponse.data.data.lastName}`
    );
    console.log();

    // ==================== TEST 6: CREATE DUPLICATE PHONE (SHOULD FAIL) ====================
    console.log(
      "❌ TEST 6: POST /api/parents (Duplicate phone - should fail)..."
    );

    const duplicateResponse = await apiRequest("/parents", {
      method: "POST",
      body: JSON.stringify({
        firstName: "Another",
        lastName: "Guardian",
        phone: "+260977999888", // Duplicate
      }),
    });

    if (duplicateResponse.status === 201 || duplicateResponse.data.success) {
      throw new Error("Should have rejected duplicate phone!");
    }

    console.log("✅ Duplicate phone correctly rejected");
    console.log(`   Error: ${duplicateResponse.data.error}`);
    console.log();

    // ==================== TEST 7: INVALID PHONE FORMAT (SHOULD FAIL) ====================
    console.log(
      "❌ TEST 7: POST /api/parents (Invalid phone - should fail)..."
    );

    const invalidResponse = await apiRequest("/parents", {
      method: "POST",
      body: JSON.stringify({
        firstName: "Test",
        lastName: "User",
        phone: "12345", // Invalid
      }),
    });

    if (invalidResponse.status === 201 || invalidResponse.data.success) {
      throw new Error("Should have rejected invalid phone format!");
    }

    console.log("✅ Invalid phone format correctly rejected");
    console.log(`   Error: ${invalidResponse.data.error}`);
    console.log();

    // ==================== TEST 8: TEACHER CANNOT CREATE (SHOULD FAIL) ====================
    console.log(
      "🚫 TEST 8: POST /api/parents (TEACHER create - should fail)..."
    );

    const teacherCreateResponse = await apiRequest(
      "/parents",
      {
        method: "POST",
        body: JSON.stringify({
          firstName: "Test",
          lastName: "Guardian",
          phone: "+260966555444",
        }),
      },
      teacherToken
    );

    if (
      teacherCreateResponse.status === 201 ||
      teacherCreateResponse.data.success
    ) {
      throw new Error("TEACHER should not be able to create guardians!");
    }

    console.log("✅ TEACHER correctly denied creation permission");
    console.log(`   Error: ${teacherCreateResponse.data.error}`);
    console.log();

    // ==================== TEST 9: GET SINGLE PARENT ====================
    console.log("🔍 TEST 9: GET /api/parents/:id (Get single guardian)...");

    const getResponse = await apiRequest(`/parents/${createdParentId}`);

    if (getResponse.status !== 200 || !getResponse.data.success) {
      throw new Error("Failed to fetch guardian by ID");
    }

    console.log("✅ Guardian retrieved successfully");
    console.log(`   ID: ${getResponse.data.data.id}`);
    console.log(`   Phone: ${getResponse.data.data.phone}`);
    console.log(
      `   Name: ${getResponse.data.data.firstName} ${getResponse.data.data.lastName}`
    );
    console.log();

    // ==================== TEST 10: GET PARENT WITH RELATIONS ====================
    console.log(
      "🔗 TEST 10: GET /api/parents/:id?include=relations (With relations)..."
    );

    const relationsResponse = await apiRequest(
      `/parents/${createdParentId}?include=relations`
    );

    if (relationsResponse.status !== 200 || !relationsResponse.data.success) {
      throw new Error("Failed to fetch guardian with relations");
    }

    console.log("✅ Guardian with relations retrieved successfully");
    console.log(
      `   Students: ${
        relationsResponse.data.data.studentGuardians?.length || 0
      }`
    );
    console.log();

    // ==================== TEST 11: UPDATE PARENT ====================
    console.log("✏️ TEST 11: PATCH /api/parents/:id (Update guardian)...");

    const updateResponse = await apiRequest(`/parents/${createdParentId}`, {
      method: "PATCH",
      body: JSON.stringify({
        occupation: "Doctor",
      }),
    });

    if (updateResponse.status !== 200 || !updateResponse.data.success) {
      throw new Error("Failed to update guardian");
    }

    console.log("✅ Guardian updated successfully");
    console.log(`   New occupation: ${updateResponse.data.data.occupation}`);
    console.log();

    // ==================== TEST 12: UPDATE TO DUPLICATE PHONE (SHOULD FAIL) ====================
    console.log(
      "❌ TEST 12: PATCH /api/parents/:id (Duplicate phone - should fail)..."
    );

    // First create another guardian
    const another = await apiRequest("/parents", {
      method: "POST",
      body: JSON.stringify({
        firstName: "Another",
        lastName: "Guardian",
        phone: "+260955888777",
      }),
    });

    const dupUpdateResponse = await apiRequest(`/parents/${createdParentId}`, {
      method: "PATCH",
      body: JSON.stringify({
        phone: "+260955888777", // Duplicate
      }),
    });

    if (dupUpdateResponse.status === 200 || dupUpdateResponse.data.success) {
      throw new Error("Should have rejected duplicate phone!");
    }

    console.log("✅ Duplicate phone correctly rejected in update");
    console.log(`   Error: ${dupUpdateResponse.data.error}`);
    console.log();

    // Clean up the extra guardian
    await apiRequest(`/parents/${another.data.data.id}`, { method: "DELETE" });

    // ==================== TEST 13: TEACHER CANNOT UPDATE (SHOULD FAIL) ====================
    console.log(
      "🚫 TEST 13: PATCH /api/parents/:id (TEACHER update - should fail)..."
    );

    const teacherUpdateResponse = await apiRequest(
      `/parents/${createdParentId}`,
      {
        method: "PATCH",
        body: JSON.stringify({
          occupation: "Lawyer",
        }),
      },
      teacherToken
    );

    if (
      teacherUpdateResponse.status === 200 ||
      teacherUpdateResponse.data.success
    ) {
      throw new Error("TEACHER should not be able to update guardians!");
    }

    console.log("✅ TEACHER correctly denied update permission");
    console.log(`   Error: ${teacherUpdateResponse.data.error}`);
    console.log();

    // ==================== TEST 14: TEACHER CANNOT DELETE (SHOULD FAIL) ====================
    console.log(
      "🚫 TEST 14: DELETE /api/parents/:id (TEACHER delete - should fail)..."
    );

    const teacherDeleteResponse = await apiRequest(
      `/parents/${createdParentId}`,
      {
        method: "DELETE",
      },
      teacherToken
    );

    if (
      teacherDeleteResponse.status === 200 ||
      teacherDeleteResponse.data.success
    ) {
      throw new Error("TEACHER should not be able to delete guardians!");
    }

    console.log("✅ TEACHER correctly denied delete permission");
    console.log(`   Error: ${teacherDeleteResponse.data.error}`);
    console.log();

    // ==================== TEST 15: DELETE PARENT (ADMIN) ====================
    console.log(
      "🗑️ TEST 15: DELETE /api/parents/:id (Delete guardian as ADMIN)..."
    );

    const deleteResponse = await apiRequest(`/parents/${createdParentId}`, {
      method: "DELETE",
    });

    if (deleteResponse.status !== 200 || !deleteResponse.data.success) {
      throw new Error("Failed to delete guardian");
    }

    console.log("✅ Guardian deleted successfully");
    console.log(`   Deleted ID: ${createdParentId}`);
    console.log();

    // ==================== TEST 16: VERIFY DELETION ====================
    console.log(
      "🔍 TEST 16: GET /api/parents/:id (Verify deletion - should 404)..."
    );

    const verifyResponse = await apiRequest(`/parents/${createdParentId}`);

    if (verifyResponse.status !== 404) {
      throw new Error("Guardian should have been deleted (expected 404)");
    }

    console.log("✅ Guardian deletion verified (404 Not Found)");
    console.log();

    // ==================== ALL TESTS PASSED ====================
    console.log("=".repeat(60));
    console.log("✅ ALL TESTS PASSED!");
    console.log("=".repeat(60));
    console.log();
    console.log("Summary:");
    console.log("  - Authentication: ✅");
    console.log("  - List & Search: ✅");
    console.log("  - Create (ADMIN): ✅");
    console.log("  - Validation: ✅");
    console.log("  - Authorization: ✅");
    console.log("  - Read: ✅");
    console.log("  - Update (ADMIN): ✅");
    console.log("  - Delete (ADMIN): ✅");
    console.log();
  } catch (error) {
    console.error();
    console.error("=".repeat(60));
    console.error("❌ TEST FAILED");
    console.error("=".repeat(60));
    console.error();
    console.error(
      "Error:",
      error instanceof Error ? error.message : String(error)
    );
    console.error();
    process.exit(1);
  }
}

// Run the tests
testParentAPI();
