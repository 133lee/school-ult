import { Gender, StudentStatus } from "@prisma/client";

/**
 * Test script for Student API Routes
 *
 * This script validates the API layer by making HTTP requests
 * to the student endpoints and verifying responses.
 *
 * Prerequisites:
 * - Dev server must be running: npm run dev
 * - Database must be seeded with at least one user
 *
 * Run with: npx tsx scripts/test-student-api.ts
 */

const API_BASE_URL = "http://localhost:3000/api";

// Test user credentials (should exist in database)
const TEST_CREDENTIALS = {
  email: "admin@school.gov.zm",
  password: "Admin@123",
};

let authToken: string | null = null;
let createdStudentId: string | null = null;

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

async function testStudentAPI() {
  console.log("=".repeat(60));
  console.log("Student API Routes Validation Test");
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

    // ==================== TEST 2: GET ALL STUDENTS ====================
    console.log("📋 TEST 2: GET /api/students (List students)...");

    const listResponse = await apiRequest("/students?page=1&pageSize=5");

    if (listResponse.status !== 200 || !listResponse.data.success) {
      throw new Error("Failed to fetch students");
    }

    console.log("✅ Students retrieved successfully");
    console.log(`   Total: ${listResponse.data.meta.total}`);
    console.log(`   Page: ${listResponse.data.meta.page}`);
    console.log(`   Page Size: ${listResponse.data.meta.pageSize}`);
    console.log(`   Retrieved: ${listResponse.data.data.length} student(s)`);
    console.log();

    // ==================== TEST 3: CREATE STUDENT ====================
    console.log("📝 TEST 3: POST /api/students (Create student)...");

    const createResponse = await apiRequest("/students", {
      method: "POST",
      body: JSON.stringify({
        studentNumber: `STU-${new Date().getFullYear()}-${Math.floor(Math.random() * 10000)
          .toString()
          .padStart(4, "0")}`,
        firstName: "API",
        middleName: "Test",
        lastName: "Student",
        dateOfBirth: "2012-05-15",
        gender: Gender.MALE,
        admissionDate: "2024-01-10",
        address: "123 API Test Street",
        medicalInfo: "API Test - No allergies",
      }),
    });

    if (createResponse.status !== 201 || !createResponse.data.success) {
      throw new Error(
        `Failed to create student: ${
          createResponse.data.error || "Unknown error"
        }`
      );
    }

    createdStudentId = createResponse.data.data.id;

    console.log("✅ Student created successfully");
    console.log(`   ID: ${createResponse.data.data.id}`);
    console.log(`   Student Number: ${createResponse.data.data.studentNumber}`);
    console.log(
      `   Name: ${createResponse.data.data.firstName} ${createResponse.data.data.lastName}`
    );
    console.log();

    // ==================== TEST 4: GET SINGLE STUDENT ====================
    console.log("🔍 TEST 4: GET /api/students/:id (Get single student)...");

    const getResponse = await apiRequest(`/students/${createdStudentId}`);

    if (getResponse.status !== 200 || !getResponse.data.success) {
      throw new Error("Failed to fetch student by ID");
    }

    console.log("✅ Student retrieved successfully");
    console.log(
      `   Name: ${getResponse.data.data.firstName} ${getResponse.data.data.lastName}`
    );
    console.log(`   Status: ${getResponse.data.data.status}`);
    console.log();

    // ==================== TEST 5: GET STUDENT WITH RELATIONS ====================
    console.log(
      "🔍 TEST 5: GET /api/students/:id?include=relations (With relations)..."
    );

    const getWithRelationsResponse = await apiRequest(
      `/students/${createdStudentId}?include=relations`
    );

    if (
      getWithRelationsResponse.status !== 200 ||
      !getWithRelationsResponse.data.success
    ) {
      throw new Error("Failed to fetch student with relations");
    }

    console.log("✅ Student with relations retrieved successfully");
    console.log(
      `   Guardians: ${getWithRelationsResponse.data.data.studentGuardians.length}`
    );
    console.log(
      `   Enrollments: ${getWithRelationsResponse.data.data.enrollments.length}`
    );
    console.log();

    // ==================== TEST 6: UPDATE STUDENT ====================
    console.log("✏️  TEST 6: PATCH /api/students/:id (Update student)...");

    const updateResponse = await apiRequest(`/students/${createdStudentId}`, {
      method: "PATCH",
      body: JSON.stringify({
        firstName: "Updated",
        medicalInfo: "Updated: Wears glasses",
      }),
    });

    if (updateResponse.status !== 200 || !updateResponse.data.success) {
      throw new Error("Failed to update student");
    }

    console.log("✅ Student updated successfully");
    console.log(
      `   Updated Name: ${updateResponse.data.data.firstName} ${updateResponse.data.data.lastName}`
    );
    console.log(
      `   Updated Medical Info: ${updateResponse.data.data.medicalInfo}`
    );
    console.log();

    // ==================== TEST 7: SEARCH STUDENTS ====================
    console.log("🔎 TEST 7: GET /api/students?search=... (Search)...");

    const searchResponse = await apiRequest(
      `/students?search=Updated&page=1&pageSize=10`
    );

    if (searchResponse.status !== 200 || !searchResponse.data.success) {
      throw new Error("Failed to search students");
    }

    console.log("✅ Search working correctly");
    console.log(`   Found: ${searchResponse.data.data.length} student(s)`);
    console.log();

    // ==================== TEST 8: FILTER BY STATUS ====================
    console.log("🔍 TEST 8: GET /api/students?status=... (Filter)...");

    const filterResponse = await apiRequest(
      `/students?status=${StudentStatus.ACTIVE}&page=1&pageSize=10`
    );

    if (filterResponse.status !== 200 || !filterResponse.data.success) {
      throw new Error("Failed to filter students");
    }

    console.log("✅ Filter working correctly");
    console.log(
      `   Found: ${filterResponse.data.meta.total} active student(s)`
    );
    console.log();

    // ==================== TEST 9: CHANGE STATUS ====================
    console.log("📊 TEST 9: PATCH /api/students/:id/status (Change status)...");

    const statusResponse = await apiRequest(
      `/students/${createdStudentId}/status`,
      {
        method: "PATCH",
        body: JSON.stringify({
          status: StudentStatus.SUSPENDED,
        }),
      }
    );

    if (statusResponse.status !== 200 || !statusResponse.data.success) {
      throw new Error("Failed to change student status");
    }

    console.log("✅ Student status changed successfully");
    console.log(`   New Status: ${statusResponse.data.data.status}`);
    console.log();

    // ==================== TEST 10: WITHDRAW STUDENT ====================
    console.log("📤 TEST 10: POST /api/students/:id/withdraw (Withdraw)...");

    const withdrawResponse = await apiRequest(
      `/students/${createdStudentId}/withdraw`,
      {
        method: "POST",
      }
    );

    if (withdrawResponse.status !== 200 || !withdrawResponse.data.success) {
      throw new Error("Failed to withdraw student");
    }

    console.log("✅ Student withdrawn successfully");
    console.log(`   Status: ${withdrawResponse.data.data.status}`);
    console.log();

    // ==================== TEST 11: VALIDATION - INVALID AGE ====================
    console.log("🚫 TEST 11: Validation - Invalid age (too young)...");

    const invalidAgeResponse = await apiRequest("/students", {
      method: "POST",
      body: JSON.stringify({
        studentNumber: `STU-${new Date().getFullYear()}-9999`,
        firstName: "Too",
        lastName: "Young",
        dateOfBirth: new Date(new Date().getFullYear() - 2, 0, 1).toISOString(),
        gender: Gender.MALE,
        admissionDate: "2024-01-01",
      }),
    });

    if (invalidAgeResponse.status === 400) {
      console.log("✅ Age validation working correctly");
      console.log(`   Error: ${invalidAgeResponse.data.error}`);
    } else {
      throw new Error("Should have rejected student with invalid age");
    }
    console.log();

    // ==================== TEST 12: VALIDATION - DUPLICATE STUDENT NUMBER ====================
    console.log("🚫 TEST 12: Validation - Duplicate student number...");

    const studentNumber = createResponse.data.data.studentNumber;

    const duplicateResponse = await apiRequest("/students", {
      method: "POST",
      body: JSON.stringify({
        studentNumber,
        firstName: "Duplicate",
        lastName: "Number",
        dateOfBirth: "2012-01-01",
        gender: Gender.MALE,
        admissionDate: "2024-01-01",
      }),
    });

    if (duplicateResponse.status === 400) {
      console.log("✅ Duplicate prevention working correctly");
      console.log(`   Error: ${duplicateResponse.data.error}`);
    } else {
      throw new Error("Should have rejected duplicate student number");
    }
    console.log();

    // ==================== TEST 13: DELETE STUDENT ====================
    console.log("🗑️  TEST 13: DELETE /api/students/:id (Delete)...");

    const deleteResponse = await apiRequest(`/students/${createdStudentId}`, {
      method: "DELETE",
    });

    if (deleteResponse.status !== 200 || !deleteResponse.data.success) {
      throw new Error("Failed to delete student");
    }

    console.log("✅ Student deleted successfully");
    console.log(
      `   Deleted: ${deleteResponse.data.data.firstName} ${deleteResponse.data.data.lastName}`
    );
    console.log();

    // ==================== TEST 14: VERIFY DELETION ====================
    console.log("🔍 TEST 14: Verify deletion (404 expected)...");

    const verifyDeleteResponse = await apiRequest(
      `/students/${createdStudentId}`
    );

    if (verifyDeleteResponse.status === 404) {
      console.log("✅ Deletion confirmed - student not found");
    } else {
      throw new Error("Student still exists after deletion");
    }
    console.log();

    // ==================== SUCCESS ====================
    console.log("=".repeat(60));
    console.log("✨ All API tests passed successfully!");
    console.log("=".repeat(60));
    console.log();
    console.log("Summary:");
    console.log("  ✓ Authentication");
    console.log("  ✓ List students (with pagination)");
    console.log("  ✓ Create student");
    console.log("  ✓ Get student by ID");
    console.log("  ✓ Get student with relations");
    console.log("  ✓ Update student");
    console.log("  ✓ Search students");
    console.log("  ✓ Filter students by status");
    console.log("  ✓ Change student status");
    console.log("  ✓ Withdraw student");
    console.log("  ✓ Age validation");
    console.log("  ✓ Duplicate prevention");
    console.log("  ✓ Delete student");
    console.log("  ✓ Verify deletion (404)");
    console.log();
  } catch (error) {
    console.error();
    console.error("=".repeat(60));
    console.error("❌ API Test Failed");
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
    if (createdStudentId && authToken) {
      try {
        console.log("🧹 Attempting cleanup of test student...");
        await apiRequest(`/students/${createdStudentId}`, {
          method: "DELETE",
        });
        console.log("✅ Cleanup successful");
      } catch (cleanupError) {
        console.log("ℹ️  Cleanup not needed or already completed");
      }
    }

    process.exit(1);
  }
}

// Execute the test
testStudentAPI();
