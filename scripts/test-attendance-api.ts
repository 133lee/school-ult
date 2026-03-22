import { AttendanceStatus } from "@prisma/client";

/**
 * Test script for Attendance API Routes
 *
 * Prerequisites:
 * - Dev server must be running: npm run dev
 * - Database must be seeded with at least one admin/teacher user
 *
 * Run with: npm run test:attendance:api
 */

const API_BASE_URL = "http://localhost:3000/api";

const TEST_CREDENTIALS = {
  email: "admin@school.zm",
  password: "Admin123!",
};

let authToken: string | null = null;
let createdAttendanceId: string | null = null;
let testClassId: string | null = null;
let testTermId: string | null = null;
let testStudentId: string | null = null;
let testDate: string = new Date().toISOString().split('T')[0];

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

async function testAttendanceAPI() {
  console.log("=".repeat(60));
  console.log("Attendance API Routes Validation Test");
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
      testDate = midDate.toISOString().split('T')[0];

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
    } else {
      throw new Error("No students found. Please seed students first.");
    }

    console.log();

    // ==================== TEST 2: MARK SINGLE ATTENDANCE ====================
    console.log("📝 TEST 2: POST /api/attendance (Mark single attendance)...");

    const markResponse = await apiRequest("/attendance", {
      method: "POST",
      body: JSON.stringify({
        studentId: testStudentId,
        classId: testClassId,
        termId: testTermId,
        date: testDate,
        status: AttendanceStatus.PRESENT,
        remarks: "API Test - Present",
      }),
    });

    if (markResponse.status !== 201) {
      console.error(`   Status: ${markResponse.status}`);
      console.error(`   Response:`, JSON.stringify(markResponse.data, null, 2));
      throw new Error(
        `Failed to mark attendance: ${markResponse.data.error || "Unknown error"}`
      );
    }

    createdAttendanceId = markResponse.data.id;

    console.log("✅ Attendance marked successfully");
    console.log(`   ID: ${markResponse.data.id}`);
    console.log(`   Status: ${markResponse.data.status}`);
    console.log();

    // ==================== TEST 3: GET ATTENDANCE BY ID ====================
    console.log("🔍 TEST 3: GET /api/attendance/[id] (Get single attendance)...");

    const getResponse = await apiRequest(`/attendance/${createdAttendanceId}`);

    if (getResponse.status !== 200) {
      throw new Error("Failed to fetch attendance by ID");
    }

    console.log("✅ Attendance retrieved successfully");
    console.log(`   Status: ${getResponse.data.status}`);
    console.log(`   Date: ${getResponse.data.date}`);
    console.log();

    // ==================== TEST 4: UPDATE ATTENDANCE ====================
    console.log("✏️  TEST 4: PATCH /api/attendance/[id] (Update attendance)...");

    const updateResponse = await apiRequest(`/attendance/${createdAttendanceId}`, {
      method: "PATCH",
      body: JSON.stringify({
        status: AttendanceStatus.LATE,
        remarks: "API Test - Updated to Late",
      }),
    });

    if (updateResponse.status !== 200) {
      throw new Error("Failed to update attendance");
    }

    console.log("✅ Attendance updated successfully");
    console.log(`   Updated Status: ${updateResponse.data.status}`);
    console.log(`   Updated Remarks: ${updateResponse.data.remarks}`);
    console.log();

    // ==================== TEST 5: GET CLASS ATTENDANCE FOR DATE ====================
    console.log("📋 TEST 5: GET /api/attendance/class/[classId]?date=... (Class attendance)...");

    const classAttendanceResponse = await apiRequest(
      `/attendance/class/${testClassId}?date=${testDate}`
    );

    if (classAttendanceResponse.status !== 200) {
      throw new Error("Failed to get class attendance");
    }

    console.log("✅ Class attendance retrieved successfully");
    console.log(`   Records found: ${classAttendanceResponse.data.length}`);
    console.log();

    // ==================== TEST 6: GET STUDENT ATTENDANCE HISTORY ====================
    console.log("📚 TEST 6: GET /api/attendance/student/[studentId] (Student history)...");

    const studentHistoryResponse = await apiRequest(
      `/attendance/student/${testStudentId}?termId=${testTermId}`
    );

    if (studentHistoryResponse.status !== 200) {
      throw new Error("Failed to get student attendance history");
    }

    console.log("✅ Student attendance history retrieved successfully");
    console.log(`   Records found: ${studentHistoryResponse.data.length}`);
    console.log();

    // ==================== TEST 7: GET STUDENT STATISTICS ====================
    console.log("📈 TEST 7: GET /api/attendance/student/[studentId]/stats (Statistics)...");

    const statsResponse = await apiRequest(
      `/attendance/student/${testStudentId}/stats?termId=${testTermId}`
    );

    if (statsResponse.status !== 200) {
      throw new Error("Failed to get statistics");
    }

    console.log("✅ Statistics retrieved successfully");
    console.log(`   Total: ${statsResponse.data.total}`);
    console.log(`   Present: ${statsResponse.data.present}`);
    console.log(`   Absent: ${statsResponse.data.absent}`);
    console.log(`   Late: ${statsResponse.data.late}`);
    console.log(`   Attendance Rate: ${statsResponse.data.attendanceRate}%`);
    console.log();

    // ==================== TEST 8: BULK MARK ATTENDANCE ====================
    console.log("📦 TEST 8: POST /api/attendance (Bulk mark attendance)...");

    // Get all students in class
    const classStudentsResponse = await apiRequest(`/classes/${testClassId}/students`);
    const students = classStudentsResponse.data || [];

    if (students.length > 0) {
      const bulkDate = new Date();
      bulkDate.setDate(bulkDate.getDate() - 1); // Yesterday
      const bulkDateStr = bulkDate.toISOString().split('T')[0];

      const bulkRecords = students.slice(0, 3).map((student: any) => ({
        studentId: student.id,
        status: AttendanceStatus.PRESENT,
      }));

      const bulkResponse = await apiRequest("/attendance", {
        method: "POST",
        body: JSON.stringify({
          classId: testClassId,
          termId: testTermId,
          date: bulkDateStr,
          records: bulkRecords,
        }),
      });

      if (bulkResponse.status !== 201) {
        throw new Error("Failed to bulk mark attendance");
      }

      console.log("✅ Bulk attendance marked successfully");
      console.log(`   Successful: ${bulkResponse.data.successful}`);
      console.log(`   Failed: ${bulkResponse.data.failed.length}`);
    } else {
      console.log("⏭️  Skipped (no students in class)");
    }
    console.log();

    // ==================== TEST 9: GET ATTENDANCE REPORT ====================
    console.log("📊 TEST 9: GET /api/attendance/reports (Get class report)...");

    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - 7); // Last 7 days

    const reportResponse = await apiRequest(
      `/attendance/reports?classId=${testClassId}&startDate=${startDate.toISOString().split('T')[0]}&endDate=${endDate.toISOString().split('T')[0]}`
    );

    if (reportResponse.status !== 200) {
      throw new Error("Failed to get attendance report");
    }

    console.log("✅ Attendance report retrieved successfully");
    console.log(`   Total Records: ${reportResponse.data.totalRecords}`);
    console.log(`   Present: ${reportResponse.data.present}`);
    console.log(`   Absent: ${reportResponse.data.absent}`);
    console.log(`   Attendance Rate: ${reportResponse.data.attendanceRate}%`);
    console.log();

    // ==================== TEST 10: LIST ATTENDANCE WITH FILTERS ====================
    console.log("🔍 TEST 10: GET /api/attendance?filters (List with filters)...");

    const listResponse = await apiRequest(
      `/attendance?classId=${testClassId}&status=${AttendanceStatus.LATE}&page=1&pageSize=10`
    );

    if (listResponse.status !== 200) {
      throw new Error("Failed to list attendance");
    }

    console.log("✅ Attendance list retrieved successfully");
    console.log(`   Total: ${listResponse.data.pagination.total}`);
    console.log(`   Retrieved: ${listResponse.data.data.length} record(s)`);
    console.log();

    // ==================== TEST 11: VALIDATION - FUTURE DATE ====================
    console.log("🚫 TEST 11: Validation - Future date...");

    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 5);

    const futureDateResponse = await apiRequest("/attendance", {
      method: "POST",
      body: JSON.stringify({
        studentId: testStudentId,
        classId: testClassId,
        termId: testTermId,
        date: futureDate.toISOString().split('T')[0],
        status: AttendanceStatus.PRESENT,
      }),
    });

    if (futureDateResponse.status === 400) {
      console.log("✅ Validation working correctly");
      console.log(`   Error: ${futureDateResponse.data.error}`);
    } else {
      throw new Error("Should have rejected future date");
    }
    console.log();

    // ==================== TEST 12: DELETE ATTENDANCE ====================
    console.log("🗑️  TEST 12: DELETE /api/attendance/[id] (Delete)...");

    const deleteResponse = await apiRequest(`/attendance/${createdAttendanceId}`, {
      method: "DELETE",
    });

    if (deleteResponse.status !== 200) {
      throw new Error("Failed to delete attendance");
    }

    console.log("✅ Attendance deleted successfully");
    console.log();

    // ==================== SUCCESS ====================
    console.log("=".repeat(60));
    console.log("✨ All Attendance API tests passed successfully!");
    console.log("=".repeat(60));
    console.log();
    console.log("Summary:");
    console.log("  ✓ Authentication");
    console.log("  ✓ Mark single attendance");
    console.log("  ✓ Get attendance by ID");
    console.log("  ✓ Update attendance");
    console.log("  ✓ Get class attendance for date");
    console.log("  ✓ Get student attendance history");
    console.log("  ✓ Get student statistics");
    console.log("  ✓ Bulk mark attendance");
    console.log("  ✓ Get attendance report");
    console.log("  ✓ List attendance with filters");
    console.log("  ✓ Future date validation");
    console.log("  ✓ Delete attendance");
    console.log();
  } catch (error) {
    console.error();
    console.error("=".repeat(60));
    console.error("❌ Attendance API Test Failed");
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
    if (createdAttendanceId && authToken) {
      try {
        console.log("🧹 Attempting cleanup of test attendance...");
        await apiRequest(`/attendance/${createdAttendanceId}`, {
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

testAttendanceAPI();
