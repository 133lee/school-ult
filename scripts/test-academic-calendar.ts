/**
 * Test Script: Academic Calendar CRUD Operations
 *
 * This script tests all CRUD operations for Academic Years and Terms
 * Run with: npx tsx scripts/test-academic-calendar.ts
 */

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
const TEST_TOKEN = process.argv[2] || process.env.TEST_AUTH_TOKEN || "";

interface TestResult {
  test: string;
  status: "PASS" | "FAIL";
  message: string;
  data?: any;
}

const results: TestResult[] = [];

// Test data
let createdYearId: string = "";
let createdYearData: any = null; // Store full academic year data
let createdTermId: string = "";

async function makeRequest(
  endpoint: string,
  method: string = "GET",
  body?: any
) {
  const options: RequestInit = {
    method,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${TEST_TOKEN}`,
    },
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  const response = await fetch(`${BASE_URL}${endpoint}`, options);
  const data = await response.json();
  return { response, data };
}

// Test 1: List Academic Years (GET)
async function testListAcademicYears() {
  try {
    const { response, data } = await makeRequest("/api/academic-years");

    if (response.ok && Array.isArray(data.data)) {
      results.push({
        test: "List Academic Years (GET /api/academic-years)",
        status: "PASS",
        message: `Found ${data.data.length} academic years`,
        data: data.data.length,
      });
    } else {
      results.push({
        test: "List Academic Years (GET /api/academic-years)",
        status: "FAIL",
        message: `Status: ${response.status}, Response: ${JSON.stringify(data)}`,
      });
    }
  } catch (error: any) {
    results.push({
      test: "List Academic Years (GET /api/academic-years)",
      status: "FAIL",
      message: error.message,
    });
  }
}

// Test 2: Create Academic Year (POST)
async function testCreateAcademicYear() {
  try {
    const yearOffset = 10 + Math.floor(Math.random() * 50); // Random year between +10 and +59 (2036-2085)
    const testYear = {
      year: new Date().getFullYear() + yearOffset,
      startDate: new Date(new Date().getFullYear() + yearOffset, 0, 1).toISOString(),
      endDate: new Date(new Date().getFullYear() + yearOffset, 11, 31).toISOString(),
    };

    const { response, data } = await makeRequest(
      "/api/academic-years",
      "POST",
      testYear
    );

    if (response.ok && data.id) {
      createdYearId = data.id;
      createdYearData = data; // Store full year data for term creation
      results.push({
        test: "Create Academic Year (POST /api/academic-years)",
        status: "PASS",
        message: `Created year ${data.year} with ID: ${data.id}`,
        data: data,
      });
    } else {
      results.push({
        test: "Create Academic Year (POST /api/academic-years)",
        status: "FAIL",
        message: `Status: ${response.status}, Response: ${JSON.stringify(data)}`,
      });
    }
  } catch (error: any) {
    results.push({
      test: "Create Academic Year (POST /api/academic-years)",
      status: "FAIL",
      message: error.message,
    });
  }
}

// Test 3: Get Academic Year by ID (GET)
async function testGetAcademicYear() {
  if (!createdYearId) {
    results.push({
      test: "Get Academic Year (GET /api/academic-years/[id])",
      status: "FAIL",
      message: "No year ID available (previous test failed)",
    });
    return;
  }

  try {
    const { response, data } = await makeRequest(
      `/api/academic-years/${createdYearId}`
    );

    if (response.ok && data.id === createdYearId) {
      results.push({
        test: "Get Academic Year (GET /api/academic-years/[id])",
        status: "PASS",
        message: `Retrieved year ${data.year}`,
        data: data,
      });
    } else {
      results.push({
        test: "Get Academic Year (GET /api/academic-years/[id])",
        status: "FAIL",
        message: `Status: ${response.status}, Response: ${JSON.stringify(data)}`,
      });
    }
  } catch (error: any) {
    results.push({
      test: "Get Academic Year (GET /api/academic-years/[id])",
      status: "FAIL",
      message: error.message,
    });
  }
}

// Test 4: Update Academic Year (PATCH)
async function testUpdateAcademicYear() {
  if (!createdYearId) {
    results.push({
      test: "Update Academic Year (PATCH /api/academic-years/[id])",
      status: "FAIL",
      message: "No year ID available (previous test failed)",
    });
    return;
  }

  try {
    const updateData = {
      year: new Date().getFullYear() + 60, // Change to different year (2086)
    };

    const { response, data } = await makeRequest(
      `/api/academic-years/${createdYearId}`,
      "PATCH",
      updateData
    );

    if (response.ok && data.year === updateData.year) {
      createdYearData = data; // Update stored year data
      results.push({
        test: "Update Academic Year (PATCH /api/academic-years/[id])",
        status: "PASS",
        message: `Updated year to ${data.year}`,
        data: data,
      });
    } else {
      results.push({
        test: "Update Academic Year (PATCH /api/academic-years/[id])",
        status: "FAIL",
        message: `Status: ${response.status}, Response: ${JSON.stringify(data)}`,
      });
    }
  } catch (error: any) {
    results.push({
      test: "Update Academic Year (PATCH /api/academic-years/[id])",
      status: "FAIL",
      message: error.message,
    });
  }
}

// Test 5: Activate Academic Year (POST)
async function testActivateAcademicYear() {
  if (!createdYearId) {
    results.push({
      test: "Activate Academic Year (POST /api/academic-years/[id]/activate)",
      status: "FAIL",
      message: "No year ID available (previous test failed)",
    });
    return;
  }

  try {
    const { response, data } = await makeRequest(
      `/api/academic-years/${createdYearId}/activate`,
      "POST"
    );

    if (response.ok && data.isActive === true) {
      results.push({
        test: "Activate Academic Year (POST /api/academic-years/[id]/activate)",
        status: "PASS",
        message: `Activated year ${data.year}`,
        data: data,
      });
    } else {
      results.push({
        test: "Activate Academic Year (POST /api/academic-years/[id]/activate)",
        status: "FAIL",
        message: `Status: ${response.status}, Response: ${JSON.stringify(data)}`,
      });
    }
  } catch (error: any) {
    results.push({
      test: "Activate Academic Year (POST /api/academic-years/[id]/activate)",
      status: "FAIL",
      message: error.message,
    });
  }
}

// Test 6: Close Academic Year (POST)
async function testCloseAcademicYear() {
  if (!createdYearId) {
    results.push({
      test: "Close Academic Year (POST /api/academic-years/[id]/close)",
      status: "FAIL",
      message: "No year ID available (previous test failed)",
    });
    return;
  }

  try {
    const { response, data } = await makeRequest(
      `/api/academic-years/${createdYearId}/close`,
      "POST"
    );

    if (response.ok && data.isClosed === true) {
      results.push({
        test: "Close Academic Year (POST /api/academic-years/[id]/close)",
        status: "PASS",
        message: `Closed year ${data.year}`,
        data: data,
      });
    } else {
      results.push({
        test: "Close Academic Year (POST /api/academic-years/[id]/close)",
        status: "FAIL",
        message: `Status: ${response.status}, Response: ${JSON.stringify(data)}`,
      });
    }
  } catch (error: any) {
    results.push({
      test: "Close Academic Year (POST /api/academic-years/[id]/close)",
      status: "FAIL",
      message: error.message,
    });
  }
}

// Test 7: Create Term (POST)
async function testCreateTerm() {
  if (!createdYearId) {
    results.push({
      test: "Create Term (POST /api/terms)",
      status: "FAIL",
      message: "No year ID available (previous test failed)",
    });
    return;
  }

  try {
    // Use the actual academic year dates
    const yearStartDate = new Date(createdYearData.startDate);
    const yearEndDate = new Date(createdYearData.endDate);

    // Term 1: First 4 months of the academic year
    const termStartDate = new Date(yearStartDate);
    const termEndDate = new Date(yearStartDate);
    termEndDate.setMonth(termStartDate.getMonth() + 4);

    const testTerm = {
      academicYearId: createdYearId,
      termType: "TERM_1",
      startDate: termStartDate.toISOString(),
      endDate: termEndDate.toISOString(),
    };

    const { response, data } = await makeRequest("/api/terms", "POST", testTerm);

    if (response.ok && data.id) {
      createdTermId = data.id;
      results.push({
        test: "Create Term (POST /api/terms)",
        status: "PASS",
        message: `Created ${data.termType} with ID: ${data.id}`,
        data: data,
      });
    } else {
      results.push({
        test: "Create Term (POST /api/terms)",
        status: "FAIL",
        message: `Status: ${response.status}, Response: ${JSON.stringify(data)}`,
      });
    }
  } catch (error: any) {
    results.push({
      test: "Create Term (POST /api/terms)",
      status: "FAIL",
      message: error.message,
    });
  }
}

// Test 8: List Terms (GET)
async function testListTerms() {
  try {
    const { response, data } = await makeRequest(
      `/api/terms?academicYearId=${createdYearId}`
    );

    if (response.ok && Array.isArray(data.data)) {
      results.push({
        test: "List Terms (GET /api/terms)",
        status: "PASS",
        message: `Found ${data.data.length} terms for the academic year`,
        data: data.data.length,
      });
    } else {
      results.push({
        test: "List Terms (GET /api/terms)",
        status: "FAIL",
        message: `Status: ${response.status}, Response: ${JSON.stringify(data)}`,
      });
    }
  } catch (error: any) {
    results.push({
      test: "List Terms (GET /api/terms)",
      status: "FAIL",
      message: error.message,
    });
  }
}

// Test 9: Get Term by ID (GET)
async function testGetTerm() {
  if (!createdTermId) {
    results.push({
      test: "Get Term (GET /api/terms/[id])",
      status: "FAIL",
      message: "No term ID available (previous test failed)",
    });
    return;
  }

  try {
    const { response, data } = await makeRequest(`/api/terms/${createdTermId}`);

    if (response.ok && data.id === createdTermId) {
      results.push({
        test: "Get Term (GET /api/terms/[id])",
        status: "PASS",
        message: `Retrieved ${data.termType}`,
        data: data,
      });
    } else {
      results.push({
        test: "Get Term (GET /api/terms/[id])",
        status: "FAIL",
        message: `Status: ${response.status}, Response: ${JSON.stringify(data)}`,
      });
    }
  } catch (error: any) {
    results.push({
      test: "Get Term (GET /api/terms/[id])",
      status: "FAIL",
      message: error.message,
    });
  }
}

// Test 10: Update Term (PATCH)
async function testUpdateTerm() {
  if (!createdTermId) {
    results.push({
      test: "Update Term (PATCH /api/terms/[id])",
      status: "FAIL",
      message: "No term ID available (previous test failed)",
    });
    return;
  }

  try {
    const updateData = {
      termType: "TERM_2", // Change term type
    };

    const { response, data } = await makeRequest(
      `/api/terms/${createdTermId}`,
      "PATCH",
      updateData
    );

    if (response.ok && data.termType === updateData.termType) {
      results.push({
        test: "Update Term (PATCH /api/terms/[id])",
        status: "PASS",
        message: `Updated term to ${data.termType}`,
        data: data,
      });
    } else {
      results.push({
        test: "Update Term (PATCH /api/terms/[id])",
        status: "FAIL",
        message: `Status: ${response.status}, Response: ${JSON.stringify(data)}`,
      });
    }
  } catch (error: any) {
    results.push({
      test: "Update Term (PATCH /api/terms/[id])",
      status: "FAIL",
      message: error.message,
    });
  }
}

// Test 11: Activate Term (POST)
async function testActivateTerm() {
  if (!createdTermId) {
    results.push({
      test: "Activate Term (POST /api/terms/[id]/activate)",
      status: "FAIL",
      message: "No term ID available (previous test failed)",
    });
    return;
  }

  try {
    const { response, data } = await makeRequest(
      `/api/terms/${createdTermId}/activate`,
      "POST"
    );

    if (response.ok && data.isActive === true) {
      results.push({
        test: "Activate Term (POST /api/terms/[id]/activate)",
        status: "PASS",
        message: `Activated ${data.termType}`,
        data: data,
      });
    } else {
      results.push({
        test: "Activate Term (POST /api/terms/[id]/activate)",
        status: "FAIL",
        message: `Status: ${response.status}, Response: ${JSON.stringify(data)}`,
      });
    }
  } catch (error: any) {
    results.push({
      test: "Activate Term (POST /api/terms/[id]/activate)",
      status: "FAIL",
      message: error.message,
    });
  }
}

// Test 12: Deactivate Term (POST)
async function testDeactivateTerm() {
  if (!createdTermId) {
    results.push({
      test: "Deactivate Term (POST /api/terms/[id]/deactivate)",
      status: "FAIL",
      message: "No term ID available (previous test failed)",
    });
    return;
  }

  try {
    const { response, data } = await makeRequest(
      `/api/terms/${createdTermId}/deactivate`,
      "POST"
    );

    if (response.ok && data.isActive === false) {
      results.push({
        test: "Deactivate Term (POST /api/terms/[id]/deactivate)",
        status: "PASS",
        message: `Deactivated ${data.termType}`,
        data: data,
      });
    } else {
      results.push({
        test: "Deactivate Term (POST /api/terms/[id]/deactivate)",
        status: "FAIL",
        message: `Status: ${response.status}, Response: ${JSON.stringify(data)}`,
      });
    }
  } catch (error: any) {
    results.push({
      test: "Deactivate Term (POST /api/terms/[id]/deactivate)",
      status: "FAIL",
      message: error.message,
    });
  }
}

// Test 13: Delete Term (DELETE)
async function testDeleteTerm() {
  if (!createdTermId) {
    results.push({
      test: "Delete Term (DELETE /api/terms/[id])",
      status: "FAIL",
      message: "No term ID available (previous test failed)",
    });
    return;
  }

  try {
    const { response, data } = await makeRequest(
      `/api/terms/${createdTermId}`,
      "DELETE"
    );

    if (response.ok) {
      results.push({
        test: "Delete Term (DELETE /api/terms/[id])",
        status: "PASS",
        message: `Deleted term ${createdTermId}`,
      });
    } else {
      results.push({
        test: "Delete Term (DELETE /api/terms/[id])",
        status: "FAIL",
        message: `Status: ${response.status}, Response: ${JSON.stringify(data)}`,
      });
    }
  } catch (error: any) {
    results.push({
      test: "Delete Term (DELETE /api/terms/[id])",
      status: "FAIL",
      message: error.message,
    });
  }
}

// Test 14: Delete Academic Year (DELETE)
async function testDeleteAcademicYear() {
  if (!createdYearId) {
    results.push({
      test: "Delete Academic Year (DELETE /api/academic-years/[id])",
      status: "FAIL",
      message: "No year ID available (previous test failed)",
    });
    return;
  }

  try {
    const { response, data } = await makeRequest(
      `/api/academic-years/${createdYearId}`,
      "DELETE"
    );

    if (response.ok) {
      results.push({
        test: "Delete Academic Year (DELETE /api/academic-years/[id])",
        status: "PASS",
        message: `Deleted year ${createdYearId}`,
      });
    } else {
      results.push({
        test: "Delete Academic Year (DELETE /api/academic-years/[id])",
        status: "FAIL",
        message: `Status: ${response.status}, Response: ${JSON.stringify(data)}`,
      });
    }
  } catch (error: any) {
    results.push({
      test: "Delete Academic Year (DELETE /api/academic-years/[id])",
      status: "FAIL",
      message: error.message,
    });
  }
}

// Run all tests
async function runTests() {
  console.log("🧪 Starting Academic Calendar CRUD Tests...\n");
  console.log(`Base URL: ${BASE_URL}`);
  console.log(`Auth Token: ${TEST_TOKEN ? "✅ Provided" : "❌ Missing"}\n`);

  if (!TEST_TOKEN) {
    console.log("❌ ERROR: No auth token provided!");
    console.log("Please set TEST_AUTH_TOKEN environment variable");
    console.log("Example: TEST_AUTH_TOKEN=your_jwt_token npx tsx scripts/test-academic-calendar.ts\n");
    process.exit(1);
  }

  // Academic Years Tests
  await testListAcademicYears();
  await testCreateAcademicYear();
  await testGetAcademicYear();
  await testUpdateAcademicYear();
  await testActivateAcademicYear();

  // Terms Tests (before closing year)
  await testCreateTerm();
  await testListTerms();
  await testGetTerm();
  await testUpdateTerm();
  await testActivateTerm();
  await testDeactivateTerm();
  await testDeleteTerm();

  // Close year after term tests
  await testCloseAcademicYear();

  // Cleanup
  await testDeleteAcademicYear();

  // Print results
  console.log("\n" + "=".repeat(80));
  console.log("TEST RESULTS");
  console.log("=".repeat(80) + "\n");

  const passCount = results.filter((r) => r.status === "PASS").length;
  const failCount = results.filter((r) => r.status === "FAIL").length;

  results.forEach((result, index) => {
    const icon = result.status === "PASS" ? "✅" : "❌";
    console.log(`${index + 1}. ${icon} ${result.test}`);
    console.log(`   ${result.message}`);
    if (result.status === "FAIL") {
      console.log("");
    }
  });

  console.log("\n" + "=".repeat(80));
  console.log(`SUMMARY: ${passCount} PASSED, ${failCount} FAILED`);
  console.log("=".repeat(80) + "\n");

  // Exit with error code if any test failed
  if (failCount > 0) {
    process.exit(1);
  }
}

// Run the tests
runTests();
