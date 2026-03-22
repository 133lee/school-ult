import { ExamType, AssessmentStatus } from "@prisma/client";

/**
 * Test script for Assessment API Routes
 *
 * Prerequisites:
 * - Dev server must be running: npm run dev
 * - Database must be seeded with at least one admin/teacher user
 *
 * Run with: npm run test:assessment:api
 */

const API_BASE_URL = "http://localhost:3000/api";

const TEST_CREDENTIALS = {
  email: "admin@school.zm",
  password: "Admin123!",
};

let authToken: string | null = null;
let createdAssessmentId: string | null = null;
let testSubjectId: string | null = null;
let testClassId: string | null = null;
let testTermId: string | null = null;
let testStudentId: string | null = null;
let testAssessmentDate: string | null = null;

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

async function testAssessmentAPI() {
  console.log("=".repeat(60));
  console.log("Assessment API Routes Validation Test");
  console.log("=".repeat(60));
  console.log();

  try {
    // ==================== TEST 1: LOGIN ====================
    console.log("🔐 TEST 1: Authenticating with API...");

    const loginResponse = await apiRequest("/auth/login", {
      method: "POST",
      body: JSON.stringify(TEST_CREDENTIALS),
    });

    if (loginResponse.status !== 200) {
      throw new Error(
        `Login failed: ${loginResponse.data.error || "Unknown error"}`
      );
    }

    authToken = loginResponse.data.data?.token || loginResponse.data.token;

    console.log("✅ Authentication successful");
    console.log(`   User: ${loginResponse.data.data?.user?.email || loginResponse.data.user?.email}`);
    console.log();

    // ==================== SETUP: GET TEST DATA IDS ====================
    console.log("🔧 SETUP: Getting test data IDs...");

    // Get a subject
    const subjectsResponse = await apiRequest("/subjects?pageSize=1");
    if (subjectsResponse.status === 200 && subjectsResponse.data.data?.length > 0) {
      testSubjectId = subjectsResponse.data.data[0].id;
      console.log(`   ✓ Subject ID: ${testSubjectId}`);
    } else {
      throw new Error("No subjects found. Please seed subjects first.");
    }

    // Get a class
    const classesResponse = await apiRequest("/classes?pageSize=1");
    if (classesResponse.status === 200 && classesResponse.data.data?.length > 0) {
      testClassId = classesResponse.data.data[0].id;
      console.log(`   ✓ Class ID: ${testClassId}`);
    } else {
      throw new Error("No classes found. Please seed classes first.");
    }

    // Get active term
    const termsResponse = await apiRequest("/terms");
    if (termsResponse.status === 200 && termsResponse.data.data?.length > 0) {
      const activeTerm = termsResponse.data.data.find((t: any) => t.isActive);
      const selectedTerm = activeTerm || termsResponse.data.data[0];
      testTermId = selectedTerm.id;

      // Use a date within the term dates
      const termStartDate = new Date(selectedTerm.startDate);
      const termEndDate = new Date(selectedTerm.endDate);
      const midDate = new Date(termStartDate.getTime() + (termEndDate.getTime() - termStartDate.getTime()) / 2);
      testAssessmentDate = midDate.toISOString().split('T')[0];

      console.log(`   ✓ Term ID: ${testTermId}`);
      console.log(`   ✓ Term dates: ${termStartDate.toISOString().split('T')[0]} to ${termEndDate.toISOString().split('T')[0]}`);
    } else {
      throw new Error("No terms found. Please seed terms first.");
    }

    // Get a student
    const studentsResponse = await apiRequest("/students?pageSize=1");
    if (studentsResponse.status === 200 && studentsResponse.data.data?.length > 0) {
      testStudentId = studentsResponse.data.data[0].id;
      console.log(`   ✓ Student ID: ${testStudentId}`);
    }

    console.log();

    // ==================== TEST 2: CREATE ASSESSMENT ====================
    console.log("📝 TEST 2: POST /api/assessments (Create assessment)...");

    const createResponse = await apiRequest("/assessments", {
      method: "POST",
      body: JSON.stringify({
        title: "API Test - Mid-Term Math",
        description: "Testing assessment creation via API",
        subjectId: testSubjectId,
        classId: testClassId,
        termId: testTermId,
        examType: ExamType.MID,
        totalMarks: 100,
        passMark: 50,
        weight: 1.0,
        assessmentDate: testAssessmentDate,
      }),
    });

    if (createResponse.status !== 201) {
      console.error(`   Status: ${createResponse.status}`);
      console.error(`   Response:`, JSON.stringify(createResponse.data, null, 2));
      throw new Error(
        `Failed to create assessment: ${createResponse.data.error || "Unknown error"}`
      );
    }

    createdAssessmentId = createResponse.data.id;

    console.log("✅ Assessment created successfully");
    console.log(`   ID: ${createResponse.data.id}`);
    console.log(`   Title: ${createResponse.data.title}`);
    console.log(`   Status: ${createResponse.data.status}`);
    console.log();

    // ==================== TEST 3: GET ASSESSMENT BY ID ====================
    console.log("🔍 TEST 3: GET /api/assessments/[id] (Get single assessment)...");

    const getResponse = await apiRequest(`/assessments/${createdAssessmentId}`);

    if (getResponse.status !== 200) {
      console.error(`   Status: ${getResponse.status}`);
      console.error(`   Response:`, JSON.stringify(getResponse.data, null, 2));
      throw new Error(`Failed to fetch assessment by ID: ${getResponse.data.error || "Unknown error"}`);
    }

    console.log("✅ Assessment retrieved successfully");
    console.log(`   Title: ${getResponse.data.title}`);
    console.log(`   Total Marks: ${getResponse.data.totalMarks}`);
    console.log(`   Pass Mark: ${getResponse.data.passMark}`);
    console.log();

    // ==================== TEST 4: LIST ASSESSMENTS ====================
    console.log("📋 TEST 4: GET /api/assessments (List assessments)...");

    const listResponse = await apiRequest("/assessments?page=1&pageSize=10");

    if (listResponse.status !== 200) {
      throw new Error("Failed to list assessments");
    }

    console.log("✅ Assessments retrieved successfully");
    console.log(`   Total: ${listResponse.data.pagination.total}`);
    console.log(`   Retrieved: ${listResponse.data.data.length} assessment(s)`);
    console.log();

    // ==================== TEST 5: FILTER BY TERM ====================
    console.log("🔍 TEST 5: GET /api/assessments?termId=... (Filter by term)...");

    const filterResponse = await apiRequest(
      `/assessments?termId=${testTermId}&page=1&pageSize=10`
    );

    if (filterResponse.status !== 200) {
      throw new Error("Failed to filter assessments");
    }

    console.log("✅ Filter working correctly");
    console.log(`   Found: ${filterResponse.data.data.length} assessment(s) for term`);
    console.log();

    // ==================== TEST 6: UPDATE ASSESSMENT ====================
    console.log("✏️  TEST 6: PATCH /api/assessments/[id] (Update assessment)...");

    const updateResponse = await apiRequest(`/assessments/${createdAssessmentId}`, {
      method: "PATCH",
      body: JSON.stringify({
        title: "API Test - Updated Math Test",
        totalMarks: 80,
      }),
    });

    if (updateResponse.status !== 200) {
      throw new Error("Failed to update assessment");
    }

    console.log("✅ Assessment updated successfully");
    console.log(`   Updated Title: ${updateResponse.data.title}`);
    console.log(`   Updated Total Marks: ${updateResponse.data.totalMarks}`);
    console.log();

    // ==================== TEST 7: PUBLISH ASSESSMENT ====================
    console.log("📢 TEST 7: POST /api/assessments/[id]/publish (Publish assessment)...");

    const publishResponse = await apiRequest(
      `/assessments/${createdAssessmentId}/publish`,
      { method: "POST" }
    );

    if (publishResponse.status !== 200) {
      throw new Error("Failed to publish assessment");
    }

    console.log("✅ Assessment published successfully");
    console.log(`   Status: ${publishResponse.data.status}`);
    console.log();

    // ==================== TEST 8: ENTER RESULT (if student exists) ====================
    if (testStudentId) {
      console.log("📊 TEST 8: POST /api/assessments/[id]/results (Enter result)...");

      const resultResponse = await apiRequest(
        `/assessments/${createdAssessmentId}/results`,
        {
          method: "POST",
          body: JSON.stringify({
            studentId: testStudentId,
            marksObtained: 75,
            remarks: "Good performance",
          }),
        }
      );

      if (resultResponse.status !== 201) {
        throw new Error("Failed to enter result");
      }

      console.log("✅ Result entered successfully");
      console.log(`   Marks: ${resultResponse.data.marksObtained}`);
      console.log(`   Grade: ${resultResponse.data.grade}`);
      console.log();
    } else {
      console.log("⏭️  TEST 8: Skipped (no students available)");
      console.log();
    }

    // ==================== TEST 9: GET RESULTS ====================
    console.log("📋 TEST 9: GET /api/assessments/[id]/results (Get all results)...");

    const resultsResponse = await apiRequest(
      `/assessments/${createdAssessmentId}/results`
    );

    if (resultsResponse.status !== 200) {
      throw new Error("Failed to get results");
    }

    console.log("✅ Results retrieved successfully");
    console.log(`   Number of results: ${resultsResponse.data.length}`);
    console.log();

    // ==================== TEST 10: GET STATISTICS ====================
    console.log("📈 TEST 10: GET /api/assessments/[id]/stats (Get statistics)...");

    const statsResponse = await apiRequest(
      `/assessments/${createdAssessmentId}/stats`
    );

    if (statsResponse.status !== 200) {
      throw new Error("Failed to get statistics");
    }

    console.log("✅ Statistics retrieved successfully");
    console.log(`   Total Students: ${statsResponse.data.totalStudents}`);
    console.log(`   Graded Students: ${statsResponse.data.gradedStudents}`);
    console.log(`   Average: ${statsResponse.data.average}`);
    console.log(`   Pass Rate: ${statsResponse.data.passRate}%`);
    console.log();

    // ==================== TEST 11: COMPLETE ASSESSMENT ====================
    console.log("✔️  TEST 11: POST /api/assessments/[id]/complete (Complete assessment)...");

    const completeResponse = await apiRequest(
      `/assessments/${createdAssessmentId}/complete`,
      { method: "POST" }
    );

    if (completeResponse.status !== 200) {
      throw new Error("Failed to complete assessment");
    }

    console.log("✅ Assessment completed successfully");
    console.log(`   Status: ${completeResponse.data.status}`);
    console.log();

    // ==================== TEST 12: VALIDATION - INVALID MARKS ====================
    console.log("🚫 TEST 12: Validation - Invalid total marks...");

    const invalidMarksResponse = await apiRequest("/assessments", {
      method: "POST",
      body: JSON.stringify({
        title: "Invalid Test",
        subjectId: testSubjectId,
        classId: testClassId,
        termId: testTermId,
        examType: ExamType.CAT,
        totalMarks: 2000, // Invalid: > 1000
        passMark: 50,
      }),
    });

    if (invalidMarksResponse.status === 400) {
      console.log("✅ Validation working correctly");
      console.log(`   Error: ${invalidMarksResponse.data.error}`);
    } else {
      throw new Error("Should have rejected invalid marks");
    }
    console.log();

    // ==================== TEST 13: DELETE ASSESSMENT ====================
    console.log("🗑️  TEST 13: DELETE /api/assessments/[id] (Delete)...");

    const deleteResponse = await apiRequest(`/assessments/${createdAssessmentId}`, {
      method: "DELETE",
    });

    if (deleteResponse.status !== 200) {
      throw new Error("Failed to delete assessment");
    }

    console.log("✅ Assessment deleted successfully");
    console.log();

    // ==================== SUCCESS ====================
    console.log("=".repeat(60));
    console.log("✨ All Assessment API tests passed successfully!");
    console.log("=".repeat(60));
    console.log();
    console.log("Summary:");
    console.log("  ✓ Authentication");
    console.log("  ✓ Create assessment");
    console.log("  ✓ Get assessment by ID");
    console.log("  ✓ List assessments");
    console.log("  ✓ Filter assessments");
    console.log("  ✓ Update assessment");
    console.log("  ✓ Publish assessment");
    console.log("  ✓ Enter results");
    console.log("  ✓ Get results");
    console.log("  ✓ Get statistics");
    console.log("  ✓ Complete assessment");
    console.log("  ✓ Validation");
    console.log("  ✓ Delete assessment");
    console.log();
  } catch (error) {
    console.error();
    console.error("=".repeat(60));
    console.error("❌ Assessment API Test Failed");
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

    // Cleanup
    if (createdAssessmentId && authToken) {
      try {
        console.log("🧹 Attempting cleanup of test assessment...");
        await apiRequest(`/assessments/${createdAssessmentId}`, {
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

testAssessmentAPI();
