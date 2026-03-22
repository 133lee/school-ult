/**
 * Test script for teacher subjects API
 *
 * This script tests the /api/teacher/profile/subjects endpoint
 *
 * Usage:
 *   npm run test:teacher:subjects
 */

interface TestConfig {
  baseUrl: string;
  authToken: string;
}

interface TeacherSubjectsResponse {
  subjects: Array<{
    id: string;
    name: string;
    code: string;
  }>;
}

const config: TestConfig = {
  baseUrl: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000",
  authToken: process.env.TEST_AUTH_TOKEN || "",
};

async function testTeacherSubjectsAPI() {
  console.log("🧪 Testing Teacher Subjects API\n");
  console.log("=" .repeat(60));

  // Validate configuration
  if (!config.authToken) {
    console.error("❌ TEST_AUTH_TOKEN environment variable not set");
    console.log("\nTo run this test:");
    console.log("1. Login as a teacher and get your auth token from localStorage");
    console.log("2. Run: TEST_AUTH_TOKEN=your_token_here npm run test:teacher:subjects");
    process.exit(1);
  }

  try {
    const url = `${config.baseUrl}/api/teacher/profile/subjects`;

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

    const data: TeacherSubjectsResponse = await response.json();

    console.log("✅ Response received successfully\n");
    console.log(`📚 Teacher's Subjects (${data.subjects.length} total):\n`);

    if (data.subjects.length > 0) {
      data.subjects.forEach((subject, index) => {
        console.log(`   ${index + 1}. ${subject.name} (${subject.code})`);
        console.log(`      ID: ${subject.id}`);
      });
    } else {
      console.log("   ⚠️  No subjects assigned to this teacher");
    }

    // Validate data integrity
    console.log("\n🔍 Data Integrity Checks:");

    const checks = [
      {
        name: "Response has subjects array",
        pass: Array.isArray(data.subjects),
        message: "subjects should be an array",
      },
      {
        name: "All subjects have required fields",
        pass: data.subjects.every(
          (s) => s.id && s.name && s.code
        ),
        message: "Each subject should have id, name, and code",
      },
      {
        name: "Subject IDs are unique",
        pass: new Set(data.subjects.map((s) => s.id)).size === data.subjects.length,
        message: "All subject IDs should be unique",
      },
      {
        name: "Subject codes are unique",
        pass: new Set(data.subjects.map((s) => s.code)).size === data.subjects.length,
        message: "All subject codes should be unique",
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
    console.log("✅ Teacher Subjects API test completed");
    console.log("=".repeat(60));

  } catch (error) {
    console.error("\n❌ Test failed:", error);
    process.exit(1);
  }
}

// Run tests
testTeacherSubjectsAPI().catch((error) => {
  console.error("❌ Test script failed:", error);
  process.exit(1);
});
