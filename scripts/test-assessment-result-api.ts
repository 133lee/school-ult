/**
 * Grade API Route Validation Script
 *
 * Purpose: Validate all API endpoints for grade operations
 *
 * Architecture: Tests API routes layer (routes call services, services call repository)
 * Server: Requires Next.js dev server running on http://localhost:3000
 *
 * Run with: npx tsx scripts/test-grade-api.ts
 *
 * Prerequisites:
 * 1. Start dev server: npm run dev
 * 2. Database must be seeded with students, assessments, subjects
 */

import prisma from "@/lib/db/prisma";

const API_BASE_URL = process.env.API_BASE_URL || "http://localhost:3000/api";

// Logging utilities
const log = {
  step: (msg: string) => console.log(`\n✓ ${msg}`),
  info: (msg: string) => console.log(`  ${msg}`),
  data: (label: string, data: any) => console.log(`  ${label}:`, JSON.stringify(data, null, 2)),
  error: (msg: string) => console.error(`\n✗ ERROR: ${msg}`),
  success: (msg: string) => console.log(`\n✅ ${msg}\n`),
};

// Helper function to make API calls
async function apiCall(method: string, endpoint: string, body?: any) {
  const url = `${API_BASE_URL}${endpoint}`;
  const options: RequestInit = {
    method,
    headers: {
      "Content-Type": "application/json",
    },
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  const response = await fetch(url, options);
  const data = await response.json();

  return { response, data };
}

async function validateGradeAPI() {
  let createdGradeId: string | null = null;
  let testStudentId: string | null = null;
  let testAssessmentId: string | null = null;
  let testSubjectId: string | null = null;

  try {
    log.step("Starting Grade API Validation");
    log.info("Testing against: " + API_BASE_URL);

    // Check if dev server is running
    try {
      const response = await fetch(`${API_BASE_URL}/grades`);
      if (!response.ok && response.status !== 404) {
        throw new Error("Server not responding");
      }
    } catch (error) {
      if (error instanceof Error && error.message.includes("fetch")) {
        throw new Error(
          "Next.js dev server is not running. Please start it with: npm run dev"
        );
      }
      throw error;
    }

    // ========================================
    // STEP 0: Fetch Test Data Dependencies
    // ========================================
    log.step("Fetching test data (Student, Assessment, Subject)");

    const student = await prisma.student.findFirst({
      where: { status: "ACTIVE" },
    });

    if (!student) {
      throw new Error("No active student found in database. Please seed the database first.");
    }

    testStudentId = student.id;
    log.info(`Found student: ${student.firstName} ${student.lastName} (${student.studentNumber})`);

    const assessment = await prisma.assessment.findFirst({
      where: { status: "PUBLISHED" },
    });

    if (!assessment) {
      throw new Error("No published assessment found. Please create an assessment first.");
    }

    testAssessmentId = assessment.id;
    log.info(`Found assessment: ${assessment.title} (${assessment.examType})`);

    const subject = await prisma.subject.findFirst();

    if (!subject) {
      throw new Error("No subject found. Please create a subject first.");
    }

    testSubjectId = subject.id;
    log.info(`Found subject: ${subject.name} (${subject.code})`);

    // ========================================
    // STEP 1: POST /api/grades - Create Grade
    // ========================================
    log.step("POST /api/grades - Creating new grade");

    const createPayload = {
      studentId: testStudentId,
      assessmentId: testAssessmentId,
      subjectId: testSubjectId,
      marksObtained: 85.5,
      grade: "GRADE_2",
      remarks: "API test - excellent performance",
    };

    const { response: createResponse, data: createData } = await apiCall(
      "POST",
      "/grades",
      createPayload
    );

    if (createResponse.status !== 201) {
      throw new Error(`Expected status 201, got ${createResponse.status}`);
    }

    if (!createData.success || !createData.data) {
      throw new Error("Create response missing success or data");
    }

    createdGradeId = createData.data.id;

    log.data("Created Grade", {
      id: createData.data.id,
      student: `${createData.data.student.firstName} ${createData.data.student.lastName}`,
      subject: createData.data.subject.name,
      assessment: createData.data.assessment.title,
      marksObtained: createData.data.marksObtained,
      grade: createData.data.grade,
    });

    // ========================================
    // STEP 2: POST with duplicate - Should fail
    // ========================================
    log.step("POST /api/grades - Testing duplicate prevention");

    const { response: duplicateResponse, data: duplicateData } = await apiCall(
      "POST",
      "/grades",
      createPayload
    );

    if (duplicateResponse.status !== 409) {
      throw new Error(`Expected status 409 for duplicate, got ${duplicateResponse.status}`);
    }

    if (duplicateData.success !== false) {
      throw new Error("Duplicate should return success: false");
    }

    log.info("✓ Duplicate prevention working (status 409)");

    // ========================================
    // STEP 3: POST with invalid marks - Should fail
    // ========================================
    log.step("POST /api/grades - Testing marks validation");

    const { response: invalidResponse, data: invalidData } = await apiCall(
      "POST",
      "/grades",
      {
        ...createPayload,
        marksObtained: 150, // Invalid: > 100
        studentId: testStudentId + "_different", // Different student to avoid duplicate error
      }
    );

    if (invalidResponse.status !== 400) {
      throw new Error(`Expected status 400 for invalid marks, got ${invalidResponse.status}`);
    }

    log.info("✓ Marks validation working (status 400)");

    // ========================================
    // STEP 4: GET /api/grades - Fetch all grades
    // ========================================
    log.step("GET /api/grades - Fetching all grades");

    const { response: getAllResponse, data: getAllData } = await apiCall("GET", "/grades");

    if (getAllResponse.status !== 200) {
      throw new Error(`Expected status 200, got ${getAllResponse.status}`);
    }

    if (!getAllData.success || !Array.isArray(getAllData.data)) {
      throw new Error("Get all response should return success and data array");
    }

    log.info(`Total grades in database: ${getAllData.count}`);

    // ========================================
    // STEP 5: GET /api/grades?studentId=... - Filter by student
    // ========================================
    log.step("GET /api/grades?studentId=... - Filtering by student");

    const { response: getStudentResponse, data: getStudentData } = await apiCall(
      "GET",
      `/grades?studentId=${testStudentId}`
    );

    if (getStudentResponse.status !== 200) {
      throw new Error(`Expected status 200, got ${getStudentResponse.status}`);
    }

    log.info(`Grades for this student: ${getStudentData.count}`);

    // ========================================
    // STEP 6: GET /api/grades?assessmentId=... - Filter by assessment
    // ========================================
    log.step("GET /api/grades?assessmentId=... - Filtering by assessment");

    const { response: getAssessmentResponse, data: getAssessmentData } = await apiCall(
      "GET",
      `/grades?assessmentId=${testAssessmentId}`
    );

    if (getAssessmentResponse.status !== 200) {
      throw new Error(`Expected status 200, got ${getAssessmentResponse.status}`);
    }

    log.info(`Grades for this assessment: ${getAssessmentData.count}`);

    // ========================================
    // STEP 7: GET /api/grades/[id] - Fetch single grade
    // ========================================
    log.step(`GET /api/grades/${createdGradeId} - Fetching single grade`);

    const { response: getByIdResponse, data: getByIdData } = await apiCall(
      "GET",
      `/grades/${createdGradeId}`
    );

    if (getByIdResponse.status !== 200) {
      throw new Error(`Expected status 200, got ${getByIdResponse.status}`);
    }

    if (!getByIdData.success || !getByIdData.data) {
      throw new Error("Get by ID should return success and data");
    }

    log.data("Retrieved Grade", {
      id: getByIdData.data.id,
      marks: getByIdData.data.marksObtained,
      grade: getByIdData.data.grade,
    });

    // ========================================
    // STEP 8: PUT /api/grades/[id] - Update grade
    // ========================================
    log.step(`PUT /api/grades/${createdGradeId} - Updating grade`);

    const updatePayload = {
      marksObtained: 95.0,
      grade: "GRADE_1",
      remarks: "API test - updated to distinction",
    };

    const { response: updateResponse, data: updateData } = await apiCall(
      "PUT",
      `/grades/${createdGradeId}`,
      updatePayload
    );

    if (updateResponse.status !== 200) {
      throw new Error(`Expected status 200, got ${updateResponse.status}`);
    }

    if (!updateData.success || !updateData.data) {
      throw new Error("Update should return success and data");
    }

    log.data("Updated Grade", {
      id: updateData.data.id,
      previousMarks: 85.5,
      newMarks: updateData.data.marksObtained,
      previousGrade: "GRADE_2",
      newGrade: updateData.data.grade,
    });

    // ========================================
    // STEP 9: PUT with invalid marks - Should fail
    // ========================================
    log.step("PUT /api/grades/[id] - Testing marks validation");

    const { response: updateInvalidResponse } = await apiCall(
      "PUT",
      `/grades/${createdGradeId}`,
      { marksObtained: -10 } // Invalid: < 0
    );

    if (updateInvalidResponse.status !== 400) {
      throw new Error(`Expected status 400 for invalid marks, got ${updateInvalidResponse.status}`);
    }

    log.info("✓ Update marks validation working (status 400)");

    // ========================================
    // STEP 10: GET non-existent grade - Should return 404
    // ========================================
    log.step("GET /api/grades/[invalid-id] - Testing 404 handling");

    const { response: get404Response } = await apiCall("GET", "/grades/invalid-grade-id-12345");

    if (get404Response.status !== 404) {
      throw new Error(`Expected status 404, got ${get404Response.status}`);
    }

    log.info("✓ 404 handling working");

    // ========================================
    // STEP 11: DELETE /api/grades/[id] - Delete grade
    // ========================================
    log.step(`DELETE /api/grades/${createdGradeId} - Deleting grade`);

    const { response: deleteResponse, data: deleteData } = await apiCall(
      "DELETE",
      `/grades/${createdGradeId}`
    );

    if (deleteResponse.status !== 200) {
      throw new Error(`Expected status 200, got ${deleteResponse.status}`);
    }

    if (!deleteData.success) {
      throw new Error("Delete should return success: true");
    }

    log.info(`Successfully deleted grade with ID: ${createdGradeId}`);

    // Verify deletion
    const { response: verifyDeleteResponse } = await apiCall(
      "GET",
      `/grades/${createdGradeId}`
    );

    if (verifyDeleteResponse.status !== 404) {
      throw new Error("Grade should return 404 after deletion");
    }

    log.info("Verified: Grade no longer exists");

    // ========================================
    // STEP 12: DELETE non-existent grade - Should return 404
    // ========================================
    log.step("DELETE /api/grades/[invalid-id] - Testing 404 handling");

    const { response: delete404Response } = await apiCall(
      "DELETE",
      "/grades/invalid-grade-id-12345"
    );

    if (delete404Response.status !== 404) {
      throw new Error(`Expected status 404, got ${delete404Response.status}`);
    }

    log.info("✓ Delete 404 handling working");

    // ========================================
    // SUCCESS
    // ========================================
    log.success("✓ All API endpoints validated successfully");
    log.info("Summary:");
    log.info("  - POST /api/grades (create): ✓");
    log.info("  - POST duplicate prevention: ✓");
    log.info("  - POST marks validation: ✓");
    log.info("  - GET /api/grades (all): ✓");
    log.info("  - GET /api/grades?studentId: ✓");
    log.info("  - GET /api/grades?assessmentId: ✓");
    log.info("  - GET /api/grades/[id]: ✓");
    log.info("  - GET /api/grades/[id] 404: ✓");
    log.info("  - PUT /api/grades/[id] (update): ✓");
    log.info("  - PUT marks validation: ✓");
    log.info("  - DELETE /api/grades/[id]: ✓");
    log.info("  - DELETE 404 handling: ✓");

  } catch (error) {
    log.error("Validation failed");
    if (error instanceof Error) {
      log.error(error.message);
      if (error.stack) {
        console.error(error.stack);
      }
    }
    process.exit(1);
  } finally {
    // ========================================
    // CLEANUP: Close Prisma Connection
    // ========================================
    await prisma.$disconnect();
    log.info("\n→ Prisma connection closed");
  }
}

// Execute validation
validateGradeAPI();
