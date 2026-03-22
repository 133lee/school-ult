/**
 * Test script for student performance API
 *
 * This script tests the /api/teacher/students/[studentId]/performance endpoint
 *
 * Usage:
 *   npm run test:performance:api
 */

interface TestConfig {
  baseUrl: string;
  authToken: string;
  studentId: string;
  termId: string;
  assessmentTypes: ("CAT" | "MID" | "EOT")[];
}

interface PerformanceResponse {
  studentId: string;
  assessmentType: string;
  termId: string;
  radarChartData: Array<{ subject: string; score: number }>;
  classRankings: Array<{
    subject: string;
    score: number;
    rank: number;
    total: number;
    trend: "up" | "down" | "same";
    isTeacherSubject: boolean;
  }>;
  classPosition: number;
  classTotal: number;
  bestSix: number;
  trend: "up" | "down" | "same";
}

const config: TestConfig = {
  baseUrl: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000",
  authToken: process.env.TEST_AUTH_TOKEN || "",
  studentId: process.env.TEST_STUDENT_ID || "",
  termId: process.env.TEST_TERM_ID || "",
  assessmentTypes: ["CAT", "MID", "EOT"],
};

async function testPerformanceAPI() {
  console.log("🧪 Testing Student Performance API\n");
  console.log("=" .repeat(60));

  // Validate configuration
  if (!config.authToken) {
    console.error("❌ TEST_AUTH_TOKEN environment variable not set");
    console.log("\nTo run this test:");
    console.log("1. Login as a teacher and get your auth token from localStorage");
    console.log("2. Set TEST_AUTH_TOKEN=your_token_here");
    console.log("3. Set TEST_STUDENT_ID=student_id");
    console.log("4. Set TEST_TERM_ID=term_id (optional - will fetch active term)");
    process.exit(1);
  }

  if (!config.studentId) {
    console.error("❌ TEST_STUDENT_ID environment variable not set");
    process.exit(1);
  }

  let activeTermId = config.termId;

  // If termId not provided, fetch active term
  if (!activeTermId) {
    console.log("📅 Fetching active term...");
    try {
      const termResponse = await fetch(`${config.baseUrl}/api/terms/active`, {
        headers: {
          Authorization: `Bearer ${config.authToken}`,
        },
      });

      if (!termResponse.ok) {
        const errorData = await termResponse.json();
        console.error("❌ Failed to fetch active term:", errorData.error);
        process.exit(1);
      }

      const termData = await termResponse.json();
      activeTermId = termData.id;
      console.log(`✅ Active term: ${termData.termType} ${termData.academicYear}`);
      console.log(`   Term ID: ${activeTermId}\n`);
    } catch (error) {
      console.error("❌ Error fetching active term:", error);
      process.exit(1);
    }
  }

  // Test each assessment type
  for (const assessmentType of config.assessmentTypes) {
    console.log(`\n${"=".repeat(60)}`);
    console.log(`📊 Testing ${assessmentType} Assessment`);
    console.log("=".repeat(60));

    try {
      const url = `${config.baseUrl}/api/teacher/students/${config.studentId}/performance?assessmentType=${assessmentType}&termId=${activeTermId}`;

      console.log(`\n🔗 URL: ${url}`);
      console.log(`🔑 Using auth token: ${config.authToken.substring(0, 20)}...`);

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${config.authToken}`,
        },
      });

      console.log(`\n📡 Response Status: ${response.status} ${response.statusText}`);

      if (!response.ok) {
        const errorData = await response.json();
        console.error(`❌ API Error:`, errorData);
        continue;
      }

      const data: PerformanceResponse = await response.json();

      // Validate response structure
      console.log("\n✅ Response received successfully");
      console.log("\n📋 Data Summary:");
      console.log(`   Student ID: ${data.studentId}`);
      console.log(`   Assessment Type: ${data.assessmentType}`);
      console.log(`   Term ID: ${data.termId}`);
      console.log(`   Class Position: ${data.classPosition}/${data.classTotal}`);
      console.log(`   Best Six Average: ${data.bestSix}%`);
      console.log(`   Overall Trend: ${data.trend}`);

      console.log(`\n📊 Radar Chart Data (${data.radarChartData.length} subjects):`);
      if (data.radarChartData.length > 0) {
        data.radarChartData.forEach((item) => {
          console.log(`   - ${item.subject}: ${item.score}%`);
        });
      } else {
        console.log("   ⚠️  No subject data available");
      }

      console.log(`\n🏆 Class Rankings (${data.classRankings.length} subjects):`);
      if (data.classRankings.length > 0) {
        data.classRankings.forEach((ranking) => {
          const trendIcon =
            ranking.trend === "up" ? "📈" : ranking.trend === "down" ? "📉" : "➡️";
          const teacherSubject = ranking.isTeacherSubject ? "👨‍🏫" : "";
          console.log(
            `   ${trendIcon} ${ranking.subject}: ${ranking.score}% (Rank ${ranking.rank}/${ranking.total}) ${teacherSubject}`
          );
        });
      } else {
        console.log("   ⚠️  No ranking data available");
      }

      // Validate data integrity
      console.log("\n🔍 Data Integrity Checks:");

      const checks = [
        {
          name: "Student ID matches",
          pass: data.studentId === config.studentId,
          message: `Expected: ${config.studentId}, Got: ${data.studentId}`,
        },
        {
          name: "Assessment type matches",
          pass: data.assessmentType === assessmentType,
          message: `Expected: ${assessmentType}, Got: ${data.assessmentType}`,
        },
        {
          name: "Term ID matches",
          pass: data.termId === activeTermId,
          message: `Expected: ${activeTermId}, Got: ${data.termId}`,
        },
        {
          name: "Class position is valid",
          pass: data.classPosition > 0 && data.classPosition <= data.classTotal,
          message: `Position ${data.classPosition} should be between 1 and ${data.classTotal}`,
        },
        {
          name: "Best six is valid",
          pass: data.bestSix >= 0 && data.bestSix <= 100,
          message: `Best six ${data.bestSix}% should be between 0 and 100`,
        },
        {
          name: "Trend is valid",
          pass: ["up", "down", "same"].includes(data.trend),
          message: `Trend "${data.trend}" should be up, down, or same`,
        },
        {
          name: "Radar data matches rankings count",
          pass: data.radarChartData.length === data.classRankings.length,
          message: `Radar: ${data.radarChartData.length}, Rankings: ${data.classRankings.length}`,
        },
      ];

      checks.forEach((check) => {
        if (check.pass) {
          console.log(`   ✅ ${check.name}`);
        } else {
          console.log(`   ❌ ${check.name}: ${check.message}`);
        }
      });

    } catch (error) {
      console.error(`\n❌ Error testing ${assessmentType}:`, error);
    }
  }

  console.log(`\n${"=".repeat(60)}`);
  console.log("✅ Performance API tests completed");
  console.log("=".repeat(60));
}

// Run tests
testPerformanceAPI().catch((error) => {
  console.error("❌ Test script failed:", error);
  process.exit(1);
});
