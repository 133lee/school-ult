/**
 * Test script for active term API
 *
 * This script tests the /api/terms/active endpoint
 *
 * Usage:
 *   npm run test:active:term
 */

interface TestConfig {
  baseUrl: string;
  authToken: string;
}

interface ActiveTermResponse {
  id: string;
  termType: string;
  startDate: string;
  endDate: string;
  academicYear: string;
}

const config: TestConfig = {
  baseUrl: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000",
  authToken: process.env.TEST_AUTH_TOKEN || "",
};

async function testActiveTermAPI() {
  console.log("🧪 Testing Active Term API\n");
  console.log("=" .repeat(60));

  // Validate configuration
  if (!config.authToken) {
    console.error("❌ TEST_AUTH_TOKEN environment variable not set");
    console.log("\nTo run this test:");
    console.log("1. Login as a teacher and get your auth token from localStorage");
    console.log("2. Run: TEST_AUTH_TOKEN=your_token_here npm run test:active:term");
    process.exit(1);
  }

  try {
    const url = `${config.baseUrl}/api/terms/active`;

    console.log(`🔗 URL: ${url}`);
    console.log(`🔑 Using auth token: ${config.authToken.substring(0, 20)}...\n`);

    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${config.authToken}`,
      },
    });

    console.log(`📡 Response Status: ${response.status} ${response.statusText}\n`);

    if (!response.ok) {
      const errorData = await response.json();
      console.error("❌ API Error:", errorData);
      process.exit(1);
    }

    const data: ActiveTermResponse = await response.json();

    console.log("✅ Response received successfully\n");
    console.log("📅 Active Term Details:\n");
    console.log(`   Term ID: ${data.id}`);
    console.log(`   Term Type: ${data.termType}`);
    console.log(`   Academic Year: ${data.academicYear}`);
    console.log(`   Start Date: ${new Date(data.startDate).toLocaleDateString()}`);
    console.log(`   End Date: ${new Date(data.endDate).toLocaleDateString()}`);

    // Calculate term duration
    const startDate = new Date(data.startDate);
    const endDate = new Date(data.endDate);
    const durationDays = Math.ceil(
      (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
    );
    console.log(`   Duration: ${durationDays} days`);

    // Check if term is currently active
    const now = new Date();
    const isCurrentlyActive = now >= startDate && now <= endDate;
    console.log(`   Currently Active: ${isCurrentlyActive ? "Yes ✅" : "No ⚠️"}`);

    // Validate data integrity
    console.log("\n🔍 Data Integrity Checks:");

    const checks = [
      {
        name: "Term ID exists",
        pass: !!data.id && data.id.length > 0,
        message: "Term ID should not be empty",
      },
      {
        name: "Term type is valid",
        pass: !!data.termType,
        message: "Term type should be set",
      },
      {
        name: "Academic year exists",
        pass: !!data.academicYear,
        message: "Academic year should be set",
      },
      {
        name: "Start date is valid",
        pass: !isNaN(startDate.getTime()),
        message: "Start date should be a valid date",
      },
      {
        name: "End date is valid",
        pass: !isNaN(endDate.getTime()),
        message: "End date should be a valid date",
      },
      {
        name: "End date is after start date",
        pass: endDate > startDate,
        message: `End date (${endDate.toISOString()}) should be after start date (${startDate.toISOString()})`,
      },
      {
        name: "Term duration is reasonable",
        pass: durationDays > 0 && durationDays <= 365,
        message: `Duration of ${durationDays} days should be between 1 and 365`,
      },
    ];

    checks.forEach((check) => {
      if (check.pass) {
        console.log(`   ✅ ${check.name}`);
      } else {
        console.log(`   ❌ ${check.name}: ${check.message}`);
      }
    });

    console.log(`\n${"=".repeat(60)}`);
    console.log("✅ Active Term API test completed");
    console.log("=".repeat(60));

  } catch (error) {
    console.error("\n❌ Test failed:", error);
    process.exit(1);
  }
}

// Run tests
testActiveTermAPI().catch((error) => {
  console.error("❌ Test script failed:", error);
  process.exit(1);
});
