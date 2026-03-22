import { PromotionStatus } from "@prisma/client";

/**
 * Test script for Report Card API Routes
 *
 * Prerequisites:
 * - Dev server must be running: npm run dev
 * - Database must be seeded with at least one admin/teacher user
 * - Must have assessments and attendance data
 *
 * Run with: npm run test:reportcard:api
 */

const API_BASE_URL = "http://localhost:3000/api";

const TEST_CREDENTIALS = {
  email: "admin@school.zm",
  password: "Admin123!",
};

let authToken: string | null = null;
let createdReportCardId: string | null = null;
let testStudentId: string | null = null;
let testClassId: string | null = null;
let testTermId: string | null = null;
let testTeacherId: string | null = null;

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

async function testReportCardAPI() {
  console.log("=".repeat(60));
  console.log("Report Card API Routes Validation Test");
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

    authToken = loginResponse.data.data?.token;

    console.log("✅ Authentication successful");
    console.log(`   User: ${TEST_CREDENTIALS.email}`);
    console.log();

    // ==================== SETUP: GET TEST DATA IDS ====================
    console.log("🔧 SETUP: Getting test data IDs...");

    // Get a student
    const studentsResponse = await apiRequest("/students?pageSize=1");
    if (studentsResponse.status === 200 && studentsResponse.data.data?.length > 0) {
      testStudentId = studentsResponse.data.data[0].id;
      console.log(`   ✓ Student ID: ${testStudentId}`);
    } else {
      throw new Error("No students found. Please seed students first.");
    }

    // Get a class
    const classesResponse = await apiRequest("/classes?pageSize=1");
    if (classesResponse.status === 200 && classesResponse.data.data?.length > 0) {
      testClassId = classesResponse.data.data[0].id;
      console.log(`   ✓ Class ID: ${testClassId}`);
    } else {
      throw new Error("No classes found. Please seed classes first.");
    }

    // Get a term
    const termsResponse = await apiRequest("/terms?pageSize=1");
    if (termsResponse.status === 200 && termsResponse.data.data?.length > 0) {
      testTermId = termsResponse.data.data[0].id;
      console.log(`   ✓ Term ID: ${testTermId}`);
    } else {
      throw new Error("No terms found. Please seed terms first.");
    }

    // Get a teacher
    const teachersResponse = await apiRequest("/teachers?pageSize=1");
    if (teachersResponse.status === 200 && teachersResponse.data.data?.length > 0) {
      testTeacherId = teachersResponse.data.data[0].id;
      console.log(`   ✓ Teacher ID: ${testTeacherId}`);
    } else {
      throw new Error("No teachers found. Please seed teachers first.");
    }

    console.log();

    // ==================== TEST 2: GENERATE REPORT CARD ====================
    console.log("📝 TEST 2: POST /api/report-cards (Generate report card)...");

    const generateResponse = await apiRequest("/report-cards", {
      method: "POST",
      body: JSON.stringify({
        studentId: testStudentId,
        classId: testClassId,
        termId: testTermId,
        classTeacherId: testTeacherId,
      }),
    });

    if (generateResponse.status !== 201) {
      console.error(`   Status: ${generateResponse.status}`);
      console.error(`   Response:`, JSON.stringify(generateResponse.data, null, 2));
      throw new Error(
        `Failed to generate report card: ${generateResponse.data.error || "Unknown error"}`
      );
    }

    createdReportCardId = generateResponse.data.id;

    console.log("✅ Report card generated successfully");
    console.log(`   ID: ${generateResponse.data.id}`);
    console.log(`   Total Marks: ${generateResponse.data.totalMarks}`);
    console.log(`   Average: ${generateResponse.data.averageMark}`);
    console.log();

    // ==================== TEST 3: GET REPORT CARD BY ID ====================
    console.log("🔍 TEST 3: GET /api/report-cards/[id] (Get single report card)...");

    const getResponse = await apiRequest(`/report-cards/${createdReportCardId}`);

    if (getResponse.status !== 200) {
      console.error(`   Status: ${getResponse.status}`);
      console.error(`   Response:`, JSON.stringify(getResponse.data, null, 2));
      throw new Error(`Failed to fetch report card by ID: ${getResponse.data.error || "Unknown error"}`);
    }

    console.log("✅ Report card retrieved successfully");
    console.log(`   Student: ${getResponse.data.student?.firstName} ${getResponse.data.student?.lastName}`);
    console.log(`   Average Mark: ${getResponse.data.averageMark}`);
    console.log(`   Position: ${getResponse.data.position || "Not calculated"}`);
    console.log();

    // ==================== TEST 4: LIST REPORT CARDS ====================
    console.log("📋 TEST 4: GET /api/report-cards (List report cards)...");

    const listResponse = await apiRequest("/report-cards?page=1&pageSize=10");

    if (listResponse.status !== 200) {
      throw new Error("Failed to list report cards");
    }

    console.log("✅ Report cards retrieved successfully");
    console.log(`   Total: ${listResponse.data.pagination.total}`);
    console.log(`   Retrieved: ${listResponse.data.data.length} report card(s)`);
    console.log();

    // ==================== TEST 5: FILTER BY STUDENT ====================
    console.log("🔍 TEST 5: GET /api/report-cards?studentId=... (Filter by student)...");

    const filterResponse = await apiRequest(`/report-cards?studentId=${testStudentId}`);

    if (filterResponse.status !== 200) {
      throw new Error("Failed to filter report cards");
    }

    console.log("✅ Filter working correctly");
    console.log(`   Found: ${filterResponse.data.data.length} report card(s) for student`);
    console.log();

    // ==================== TEST 6: UPDATE REPORT CARD ====================
    console.log("✏️  TEST 6: PATCH /api/report-cards/[id] (Update report card)...");

    const updateResponse = await apiRequest(`/report-cards/${createdReportCardId}`, {
      method: "PATCH",
      body: JSON.stringify({
        classTeacherRemarks: "Excellent performance. Keep up the good work!",
        promotionStatus: PromotionStatus.PROMOTED,
      }),
    });

    if (updateResponse.status !== 200) {
      throw new Error("Failed to update report card");
    }

    console.log("✅ Report card updated successfully");
    console.log(`   Class Teacher Remarks: ${updateResponse.data.classTeacherRemarks}`);
    console.log(`   Promotion Status: ${updateResponse.data.promotionStatus}`);
    console.log();

    // ==================== TEST 7: CALCULATE POSITIONS ====================
    console.log("📊 TEST 7: POST /api/report-cards/positions (Calculate positions)...");

    const positionsResponse = await apiRequest("/report-cards/positions", {
      method: "POST",
      body: JSON.stringify({
        classId: testClassId,
        termId: testTermId,
      }),
    });

    if (positionsResponse.status !== 200) {
      throw new Error("Failed to calculate positions");
    }

    console.log("✅ Positions calculated successfully");
    console.log(`   Total Students: ${positionsResponse.data.totalStudents}`);
    console.log(`   Updated: ${positionsResponse.data.updated} report card(s)`);
    console.log();

    // Verify position was updated
    const verifyResponse = await apiRequest(`/report-cards/${createdReportCardId}`);
    if (verifyResponse.data.position) {
      console.log(`   Student Position: ${verifyResponse.data.position} out of ${verifyResponse.data.outOf}`);
    }
    console.log();

    // ==================== TEST 8: VALIDATION - DUPLICATE REPORT CARD ====================
    console.log("🚫 TEST 8: Validation - Duplicate report card...");

    const duplicateResponse = await apiRequest("/report-cards", {
      method: "POST",
      body: JSON.stringify({
        studentId: testStudentId,
        classId: testClassId,
        termId: testTermId,
        classTeacherId: testTeacherId,
      }),
    });

    if (duplicateResponse.status === 400) {
      console.log("✅ Validation working correctly");
      console.log(`   Error: ${duplicateResponse.data.error}`);
    } else {
      throw new Error("Validation should prevent duplicate report cards");
    }
    console.log();

    // ==================== TEST 9: DELETE REPORT CARD ====================
    console.log("🗑️  TEST 9: DELETE /api/report-cards/[id] (Delete)...");

    const deleteResponse = await apiRequest(`/report-cards/${createdReportCardId}`, {
      method: "DELETE",
    });

    if (deleteResponse.status !== 200) {
      throw new Error("Failed to delete report card");
    }

    console.log("✅ Report card deleted successfully");
    console.log();

    // ==================== SUCCESS ====================
    console.log("=".repeat(60));
    console.log("✨ All Report Card API tests passed successfully!");
    console.log("=".repeat(60));
    console.log();
    console.log("Summary:");
    console.log("  ✓ Authentication");
    console.log("  ✓ Generate report card");
    console.log("  ✓ Get report card by ID");
    console.log("  ✓ List report cards");
    console.log("  ✓ Filter report cards");
    console.log("  ✓ Update report card");
    console.log("  ✓ Calculate positions");
    console.log("  ✓ Validation");
    console.log("  ✓ Delete report card");
    console.log();

  } catch (error: any) {
    console.log();
    console.log("=".repeat(60));
    console.log("❌ Report Card API Test Failed");
    console.log("=".repeat(60));
    console.log();
    console.log(`Error: ${error.message}`);
    console.log();
    console.log("Stack trace:");
    console.log(error.stack);
    console.log();

    // Cleanup on error
    if (createdReportCardId) {
      console.log("🧹 Attempting cleanup of test report card...");
      try {
        await apiRequest(`/report-cards/${createdReportCardId}`, {
          method: "DELETE",
        });
        console.log("✅ Cleanup successful");
      } catch (cleanupError) {
        console.log("⚠️  Cleanup failed (report card may need manual deletion)");
      }
    }

    process.exit(1);
  }
}

// Run the test
testReportCardAPI();
