/**
 * Test script for Subject API Routes
 *
 * This script validates the API layer by making HTTP requests
 * to the subject endpoints and verifying responses.
 *
 * Prerequisites:
 * - Dev server must be running: npm run dev
 * - Database must be seeded with at least one user
 *
 * Run with: npx tsx scripts/test-subject-api.ts
 */

const API_BASE_URL = "http://localhost:3000/api";

// Test user credentials (should exist in database)
const ADMIN_CREDENTIALS = {
  email: "admin@school.zm",
  password: "Admin123!",
};

const TEACHER_CREDENTIALS = {
  email: "teacher@school.zm",
  password: "Admin123!",
};

let adminToken: string | null = null;
let teacherToken: string | null = null;
let createdSubjectId: string | null = null;
let mathDeptId: string | null = null;

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

async function testSubjectAPI() {
  console.log("=".repeat(60));
  console.log("Subject API Routes Validation Test");
  console.log("=".repeat(60));
  console.log();

  try {
    // ==================== TEST 1: LOGIN AS ADMIN ====================
    console.log("🔐 TEST 1: Authenticating as ADMIN...");

    const adminLoginResponse = await apiRequest("/auth/login", {
      method: "POST",
      body: JSON.stringify(ADMIN_CREDENTIALS),
    }, null);

    if (adminLoginResponse.status !== 200 || !adminLoginResponse.data.success) {
      throw new Error(
        `Admin login failed: ${adminLoginResponse.data.error || "Unknown error"}`
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

    const teacherLoginResponse = await apiRequest("/auth/login", {
      method: "POST",
      body: JSON.stringify(TEACHER_CREDENTIALS),
    }, null);

    if (teacherLoginResponse.status !== 200 || !teacherLoginResponse.data.success) {
      throw new Error(
        `Teacher login failed: ${teacherLoginResponse.data.error || "Unknown error"}`
      );
    }

    teacherToken = teacherLoginResponse.data.data.token;

    console.log("✅ Teacher authentication successful");
    console.log(`   Token: ${teacherToken?.substring(0, 20)}...`);
    console.log(`   User: ${teacherLoginResponse.data.data.user.email}`);
    console.log(`   Role: ${teacherLoginResponse.data.data.user.role}`);
    console.log();

    // ==================== TEST 3: GET MATH DEPARTMENT ====================
    console.log("🏢 TEST 3: Getting Math Department ID...");

    const deptResponse = await apiRequest("/departments");

    if (deptResponse.status !== 200 || !deptResponse.data.success) {
      throw new Error("Failed to fetch departments");
    }

    const mathDept = deptResponse.data.data.find((d: any) => d.code === "MATH");
    if (!mathDept) {
      throw new Error("Math department not found in database");
    }

    mathDeptId = mathDept.id;

    console.log("✅ Math Department found");
    console.log(`   ID: ${mathDeptId}`);
    console.log(`   Name: ${mathDept.name}`);
    console.log();

    // ==================== TEST 4: GET ALL SUBJECTS ====================
    console.log("📋 TEST 4: GET /api/subjects (List subjects)...");

    const listResponse = await apiRequest("/subjects?page=1&pageSize=5");

    if (listResponse.status !== 200 || !listResponse.data.success) {
      throw new Error("Failed to fetch subjects");
    }

    console.log("✅ Subjects retrieved successfully");
    console.log(`   Total: ${listResponse.data.meta.total}`);
    console.log(`   Page: ${listResponse.data.meta.page}`);
    console.log(`   Page Size: ${listResponse.data.meta.pageSize}`);
    console.log(`   Retrieved: ${listResponse.data.data.length} subject(s)`);
    console.log();

    // ==================== TEST 5: GET SUBJECTS WITH SEARCH ====================
    console.log("🔍 TEST 5: GET /api/subjects?search=Math (Search subjects)...");

    const searchResponse = await apiRequest("/subjects?search=Math");

    if (searchResponse.status !== 200 || !searchResponse.data.success) {
      throw new Error("Failed to search subjects");
    }

    console.log("✅ Search completed successfully");
    console.log(`   Found: ${searchResponse.data.data.length} subject(s) matching 'Math'`);
    console.log();

    // ==================== TEST 6: GET SUBJECTS BY DEPARTMENT ====================
    console.log("🏢 TEST 6: GET /api/subjects?departmentId=... (Filter by department)...");

    const filterResponse = await apiRequest(`/subjects?departmentId=${mathDeptId}`);

    if (filterResponse.status !== 200 || !filterResponse.data.success) {
      throw new Error("Failed to filter subjects by department");
    }

    console.log("✅ Filter completed successfully");
    console.log(`   Found: ${filterResponse.data.data.length} subject(s) in Math department`);
    console.log();

    // ==================== TEST 7: CREATE SUBJECT (ADMIN) ====================
    console.log("📝 TEST 7: POST /api/subjects (Create subject as ADMIN)...");

    const createResponse = await apiRequest("/subjects", {
      method: "POST",
      body: JSON.stringify({
        name: "Advanced Physics",
        code: "APHYS",
        description: "Advanced physics for upper grades",
        departmentId: mathDeptId,
      }),
    });

    if (createResponse.status !== 201 || !createResponse.data.success) {
      throw new Error(
        `Failed to create subject: ${
          createResponse.data.error || "Unknown error"
        }`
      );
    }

    createdSubjectId = createResponse.data.data.id;

    console.log("✅ Subject created successfully");
    console.log(`   ID: ${createResponse.data.data.id}`);
    console.log(`   Code: ${createResponse.data.data.code}`);
    console.log(`   Name: ${createResponse.data.data.name}`);
    console.log();

    // ==================== TEST 8: CREATE DUPLICATE CODE (SHOULD FAIL) ====================
    console.log("❌ TEST 8: POST /api/subjects (Duplicate code - should fail)...");

    const duplicateResponse = await apiRequest("/subjects", {
      method: "POST",
      body: JSON.stringify({
        name: "Another Physics",
        code: "APHYS", // Duplicate code
        description: "Test duplicate",
      }),
    });

    if (duplicateResponse.status === 201 || duplicateResponse.data.success) {
      throw new Error("Should have rejected duplicate code!");
    }

    console.log("✅ Duplicate code correctly rejected");
    console.log(`   Error: ${duplicateResponse.data.error}`);
    console.log();

    // ==================== TEST 9: INVALID CODE FORMAT (SHOULD FAIL) ====================
    console.log("❌ TEST 9: POST /api/subjects (Invalid code - should fail)...");

    const invalidResponse = await apiRequest("/subjects", {
      method: "POST",
      body: JSON.stringify({
        name: "Test Subject",
        code: "invalid-code", // lowercase and hyphen not allowed
        description: "Test",
      }),
    });

    if (invalidResponse.status === 201 || invalidResponse.data.success) {
      throw new Error("Should have rejected invalid code format!");
    }

    console.log("✅ Invalid code format correctly rejected");
    console.log(`   Error: ${invalidResponse.data.error}`);
    console.log();

    // ==================== TEST 10: TEACHER CANNOT CREATE (SHOULD FAIL) ====================
    console.log("🚫 TEST 10: POST /api/subjects (TEACHER create - should fail)...");

    const teacherCreateResponse = await apiRequest("/subjects", {
      method: "POST",
      body: JSON.stringify({
        name: "Test Subject",
        code: "TEST",
        description: "Test",
      }),
    }, teacherToken);

    if (teacherCreateResponse.status === 201 || teacherCreateResponse.data.success) {
      throw new Error("TEACHER should not be able to create subjects!");
    }

    console.log("✅ TEACHER correctly denied creation permission");
    console.log(`   Error: ${teacherCreateResponse.data.error}`);
    console.log();

    // ==================== TEST 11: GET SINGLE SUBJECT ====================
    console.log("🔍 TEST 11: GET /api/subjects/:id (Get single subject)...");

    const getResponse = await apiRequest(`/subjects/${createdSubjectId}`);

    if (getResponse.status !== 200 || !getResponse.data.success) {
      throw new Error("Failed to fetch subject by ID");
    }

    console.log("✅ Subject retrieved successfully");
    console.log(`   ID: ${getResponse.data.data.id}`);
    console.log(`   Code: ${getResponse.data.data.code}`);
    console.log(`   Name: ${getResponse.data.data.name}`);
    console.log();

    // ==================== TEST 12: GET SUBJECT WITH RELATIONS ====================
    console.log("🔗 TEST 12: GET /api/subjects/:id?include=relations (With relations)...");

    const relationsResponse = await apiRequest(`/subjects/${createdSubjectId}?include=relations`);

    if (relationsResponse.status !== 200 || !relationsResponse.data.success) {
      throw new Error("Failed to fetch subject with relations");
    }

    console.log("✅ Subject with relations retrieved successfully");
    console.log(`   Department: ${relationsResponse.data.data.department ? 'Loaded' : 'None'}`);
    console.log(`   Grades: ${relationsResponse.data.data.grades?.length || 0}`);
    console.log(`   Teachers: ${relationsResponse.data.data.teachers?.length || 0}`);
    console.log();

    // ==================== TEST 13: UPDATE SUBJECT ====================
    console.log("✏️ TEST 13: PATCH /api/subjects/:id (Update subject)...");

    const updateResponse = await apiRequest(`/subjects/${createdSubjectId}`, {
      method: "PATCH",
      body: JSON.stringify({
        description: "Updated description for Advanced Physics",
      }),
    });

    if (updateResponse.status !== 200 || !updateResponse.data.success) {
      throw new Error("Failed to update subject");
    }

    console.log("✅ Subject updated successfully");
    console.log(`   New description: ${updateResponse.data.data.description}`);
    console.log();

    // ==================== TEST 14: UPDATE TO DUPLICATE CODE (SHOULD FAIL) ====================
    console.log("❌ TEST 14: PATCH /api/subjects/:id (Duplicate code - should fail)...");

    const dupUpdateResponse = await apiRequest(`/subjects/${createdSubjectId}`, {
      method: "PATCH",
      body: JSON.stringify({
        code: "MATH", // Existing code
      }),
    });

    if (dupUpdateResponse.status === 200 || dupUpdateResponse.data.success) {
      throw new Error("Should have rejected duplicate code!");
    }

    console.log("✅ Duplicate code correctly rejected in update");
    console.log(`   Error: ${dupUpdateResponse.data.error}`);
    console.log();

    // ==================== TEST 15: TEACHER CANNOT UPDATE (SHOULD FAIL) ====================
    console.log("🚫 TEST 15: PATCH /api/subjects/:id (TEACHER update - should fail)...");

    const teacherUpdateResponse = await apiRequest(`/subjects/${createdSubjectId}`, {
      method: "PATCH",
      body: JSON.stringify({
        description: "Teacher trying to update",
      }),
    }, teacherToken);

    if (teacherUpdateResponse.status === 200 || teacherUpdateResponse.data.success) {
      throw new Error("TEACHER should not be able to update subjects!");
    }

    console.log("✅ TEACHER correctly denied update permission");
    console.log(`   Error: ${teacherUpdateResponse.data.error}`);
    console.log();

    // ==================== TEST 16: TEACHER CANNOT DELETE (SHOULD FAIL) ====================
    console.log("🚫 TEST 16: DELETE /api/subjects/:id (TEACHER delete - should fail)...");

    const teacherDeleteResponse = await apiRequest(`/subjects/${createdSubjectId}`, {
      method: "DELETE",
    }, teacherToken);

    if (teacherDeleteResponse.status === 200 || teacherDeleteResponse.data.success) {
      throw new Error("TEACHER should not be able to delete subjects!");
    }

    console.log("✅ TEACHER correctly denied delete permission");
    console.log(`   Error: ${teacherDeleteResponse.data.error}`);
    console.log();

    // ==================== TEST 17: DELETE SUBJECT (ADMIN) ====================
    console.log("🗑️ TEST 17: DELETE /api/subjects/:id (Delete subject as ADMIN)...");

    const deleteResponse = await apiRequest(`/subjects/${createdSubjectId}`, {
      method: "DELETE",
    });

    if (deleteResponse.status !== 200 || !deleteResponse.data.success) {
      throw new Error("Failed to delete subject");
    }

    console.log("✅ Subject deleted successfully");
    console.log(`   Deleted ID: ${createdSubjectId}`);
    console.log();

    // ==================== TEST 18: VERIFY DELETION ====================
    console.log("🔍 TEST 18: GET /api/subjects/:id (Verify deletion - should 404)...");

    const verifyResponse = await apiRequest(`/subjects/${createdSubjectId}`);

    if (verifyResponse.status !== 404) {
      throw new Error("Subject should have been deleted (expected 404)");
    }

    console.log("✅ Subject deletion verified (404 Not Found)");
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
    console.error("Error:", error instanceof Error ? error.message : String(error));
    console.error();
    process.exit(1);
  }
}

// Run the tests
testSubjectAPI();
