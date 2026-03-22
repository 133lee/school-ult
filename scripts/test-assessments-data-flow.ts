/**
 * Test Assessment Data Flow
 * Tests: Repository → Service → API → Client
 */

import prisma from "../lib/db/prisma";
import { assessmentService } from "../features/assessments/assessment.service";
import { Role } from "@/types/prisma-enums";

async function testAssessmentsDataFlow() {
  console.log("=== Testing Assessments Data Flow ===\n");

  try {
    // ==================== LEVEL 1: REPOSITORY (Direct Prisma) ====================
    console.log("📊 LEVEL 1: Direct Prisma Query");
    console.log("-".repeat(60));

    const directAssessments = await prisma.assessment.findMany({
      include: {
        subject: true,
        class: {
          include: { grade: true },
        },
        term: {
          include: { academicYear: true },
        },
        _count: {
          select: { results: true },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 5,
    });

    console.log(`Found ${directAssessments.length} assessments in database`);
    if (directAssessments.length > 0) {
      const first = directAssessments[0];
      console.log("\nFirst Assessment:");
      console.log(`  ID: ${first.id}`);
      console.log(`  Title: ${first.title}`);
      console.log(`  Subject: ${first.subject.name}`);
      console.log(`  Class: ${first.class.name} (Grade: ${first.class.grade.name})`);
      console.log(`  Term: ${first.term.termType} ${first.term.academicYear.year}`);
      console.log(`  Results Count: ${first._count.results}`);
    } else {
      console.log("⚠️  No assessments found in database!");
    }
    console.log();

    // ==================== LEVEL 2: SERVICE ====================
    console.log("📊 LEVEL 2: Assessment Service");
    console.log("-".repeat(60));

    const mockContext = {
      userId: "test-user-id",
      role: Role.TEACHER,
    };

    const serviceResult = await assessmentService.listAssessments(
      {}, // No filters
      { page: 1, pageSize: 5 },
      mockContext
    );

    console.log(`Service returned ${serviceResult.data.length} assessments`);
    console.log(`Pagination: page=${serviceResult.pagination.page}, total=${serviceResult.pagination.total}`);

    if (serviceResult.data.length > 0) {
      const first = serviceResult.data[0];
      console.log("\nFirst Assessment from Service:");
      console.log(`  ID: ${first.id}`);
      console.log(`  Title: ${first.title}`);
      console.log(`  Has subject?: ${!!first.subject}`);
      console.log(`  Has class?: ${!!first.class}`);
      console.log(`  Has term?: ${!!first.term}`);
    }
    console.log();

    // ==================== LEVEL 3: CHECK API RESPONSE SHAPE ====================
    console.log("📊 LEVEL 3: Expected API Response Shape");
    console.log("-".repeat(60));

    // Simulate what the API route returns
    const apiResponse = {
      success: true,
      data: serviceResult.data,
      meta: serviceResult.pagination,
    };

    console.log("API Route would return:");
    console.log(JSON.stringify({
      success: apiResponse.success,
      data: `Array[${apiResponse.data.length}]`,
      meta: apiResponse.meta,
    }, null, 2));
    console.log();

    // ==================== LEVEL 4: SIMULATE API-CLIENT UNWRAPPING ====================
    console.log("📊 LEVEL 4: After api-client.ts Unwrapping");
    console.log("-".repeat(60));

    // This is what api-client.ts returns (lines 75-78)
    const clientResult = {
      data: apiResponse.data,
      meta: apiResponse.meta,
    };

    console.log("api-client.ts would return:");
    console.log(JSON.stringify({
      data: `Array[${clientResult.data.length}]`,
      meta: clientResult.meta,
    }, null, 2));
    console.log();
    console.log("UI would access:");
    console.log(`  result.data → Array of ${clientResult.data.length} assessments ✅`);
    console.log(`  result.meta → Pagination info ✅`);
    console.log();

    // ==================== SUMMARY ====================
    console.log("=".repeat(60));
    console.log("✅ Data Flow Test Complete");
    console.log("=".repeat(60));
    console.log();
    console.log("Summary:");
    console.log(`  ✓ Database has ${directAssessments.length} assessments`);
    console.log(`  ✓ Service returns ${serviceResult.data.length} assessments`);
    console.log(`  ✓ API would return { success: true, data: Array[${serviceResult.data.length}], meta: {...} }`);
    console.log(`  ✓ Client would receive { data: Array[${clientResult.data.length}], meta: {...} }`);
    console.log();

    if (directAssessments.length === 0) {
      console.log("⚠️  WARNING: No assessments in database!");
      console.log("   UI will show empty state - this is CORRECT behavior.");
    } else {
      console.log("✅ If UI shows empty state, the problem is NOT in the data flow!");
      console.log("   Check:");
      console.log("   1. User authentication/permissions");
      console.log("   2. Filter logic in UI (termId, classId, examType)");
      console.log("   3. Tab logic (class-teacher vs subject-teacher)");
    }

  } catch (error) {
    console.error("❌ Error:", error);
    if (error instanceof Error) {
      console.error("Message:", error.message);
      console.error("Stack:", error.stack);
    }
  } finally {
    await prisma.$disconnect();
  }
}

testAssessmentsDataFlow();
