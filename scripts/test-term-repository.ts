/**
 * Term Repository Validation Script
 *
 * Purpose: Validate CRUD operations on the Term table
 *
 * Architecture: Tests repository layer only (no services, no API, no validation)
 * Database: Uses real Prisma client with actual database
 *
 * Run with: npx tsx scripts/test-term-repository.ts
 */

import { termRepository } from "@/features/terms/term.repository";
import { academicYearRepository } from "@/features/academic-years/academicYear.repository";
import prisma from "@/lib/db/prisma";

// Logging utilities
const log = {
  step: (msg: string) => console.log(`\n✓ ${msg}`),
  info: (msg: string) => console.log(`  ${msg}`),
  data: (label: string, data: any) =>
    console.log(`  ${label}:`, JSON.stringify(data, null, 2)),
  error: (msg: string) => console.error(`\n✗ ERROR: ${msg}`),
  success: (msg: string) => console.log(`\n✅ ${msg}\n`),
};

async function validateTermRepository() {
  let createdTermId: string | null = null;
  let testAcademicYearId: string | null = null;
  let createdAcademicYearForTest: boolean = false;

  try {
    log.step("Starting Term Repository Validation");

    // ========================================
    // STEP 0: Get or Create Academic Year
    // ========================================
    log.step("Finding or creating academic year for testing");

    let academicYear = await academicYearRepository.findActive();

    if (!academicYear) {
      // Create a test academic year
      academicYear = await academicYearRepository.create({
        year: 2026,
        startDate: new Date("2026-01-12"),
        endDate: new Date("2026-12-04"),
        isActive: true,
        isClosed: false,
      });
      createdAcademicYearForTest = true;
      log.info("Created test academic year 2026");
    }

    testAcademicYearId = academicYear.id;
    log.info(`Using academic year: ${academicYear.year} (${academicYear.id})`);

    // ========================================
    // STEP 1: Create Term
    // ========================================
    log.step("Creating new term (TERM_1)");

    const newTerm = await termRepository.create({
      academicYear: {
        connect: { id: testAcademicYearId },
      },
      termType: "TERM_1",
      startDate: new Date("2026-01-12"),
      endDate: new Date("2026-04-10"),
      isActive: false,
    });

    createdTermId = newTerm.id;

    log.data("Created Term", {
      id: newTerm.id,
      termType: newTerm.termType,
      startDate: newTerm.startDate,
      endDate: newTerm.endDate,
      isActive: newTerm.isActive,
    });

    // ========================================
    // STEP 2: Find All Terms
    // ========================================
    log.step("Fetching all terms");

    const allTerms = await termRepository.findMany();

    log.info(`Total terms in database: ${allTerms.length}`);
    if (allTerms.length > 0) {
      log.data(
        "Sample Terms",
        allTerms.slice(0, 3).map((t) => ({
          termType: t.termType,
          startDate: t.startDate,
          endDate: t.endDate,
          isActive: t.isActive,
        }))
      );
    }

    // ========================================
    // STEP 3: Find by ID
    // ========================================
    log.step(`Fetching term by ID: ${createdTermId}`);

    const termById = await termRepository.findById(createdTermId);

    if (!termById) {
      throw new Error("Failed to retrieve term by ID");
    }

    log.data("Retrieved Term", {
      id: termById.id,
      termType: termById.termType,
      isActive: termById.isActive,
    });

    // ========================================
    // STEP 4: Find by Academic Year
    // ========================================
    log.step(`Fetching terms for academic year ${academicYear.year}`);

    const yearTerms = await termRepository.findByAcademicYear(
      testAcademicYearId
    );

    log.info(`Terms for year ${academicYear.year}: ${yearTerms.length}`);
    yearTerms.forEach((t) => {
      log.info(
        `  - ${t.termType}: ${t.startDate.toISOString().split("T")[0]} to ${
          t.endDate.toISOString().split("T")[0]
        }`
      );
    });

    // ========================================
    // STEP 5: Find by Year and Type
    // ========================================
    log.step("Finding term by academic year and type (TERM_1)");

    const term1 = await termRepository.findByYearAndType(
      testAcademicYearId,
      "TERM_1"
    );

    if (!term1) {
      throw new Error("Failed to find TERM_1");
    }

    log.data("Found TERM_1", {
      id: term1.id,
      termType: term1.termType,
      academicYear: term1.academicYear.year,
    });

    // ========================================
    // STEP 6: Find Active Term
    // ========================================
    log.step("Checking for active term");

    const activeTerm = await termRepository.findActive();

    if (activeTerm) {
      log.data("Currently Active Term", {
        termType: activeTerm.termType,
        year: activeTerm.academicYear.year,
      });
    } else {
      log.info("No active term found");
    }

    // ========================================
    // STEP 7: Set as Active
    // ========================================
    log.step("Setting TERM_1 as active");

    const activatedTerm = await termRepository.setActive(createdTermId);

    log.data("Activated Term", {
      termType: activatedTerm.termType,
      isActive: activatedTerm.isActive,
    });

    // Verify it's now active
    const verifyActive = await termRepository.findActive();
    if (!verifyActive || verifyActive.id !== createdTermId) {
      throw new Error("setActive did not properly set the term as active");
    }
    log.info("✓ Verified: Term is now active");

    // ========================================
    // STEP 8: Find by Type
    // ========================================
    log.step("Finding all TERM_1 terms across all years");

    const allTerm1s = await termRepository.findByType("TERM_1");

    log.info(`Total TERM_1 terms found: ${allTerm1s.length}`);
    allTerm1s.slice(0, 3).forEach((t) => {
      log.info(
        `  - Year ${t.academicYear.year}: ${
          t.startDate.toISOString().split("T")[0]
        }`
      );
    });

    // ========================================
    // STEP 9: Check Overlap
    // ========================================
    log.step("Checking for date overlap");

    const hasOverlap = await termRepository.checkOverlap(
      testAcademicYearId,
      new Date("2026-02-01"),
      new Date("2026-03-01")
    );

    log.info(`Overlap detected: ${hasOverlap ? "Yes" : "No"}`);

    if (!hasOverlap) {
      throw new Error("Should have detected overlap with TERM_1");
    }
    log.info("✓ Verified: Overlap detection working");

    // Test no overlap
    const noOverlap = await termRepository.checkOverlap(
      testAcademicYearId,
      new Date("2026-05-01"),
      new Date("2026-06-01")
    );

    log.info(
      `Overlap for May-June dates: ${
        noOverlap ? "Yes (unexpected)" : "No (expected)"
      }`
    );

    if (noOverlap) {
      throw new Error("Should not have detected overlap for May-June");
    }

    // ========================================
    // STEP 10: Update Term
    // ========================================
    log.step("Updating term (extending end date)");

    const updatedTerm = await termRepository.update(createdTermId, {
      endDate: new Date("2026-04-17"), // Extended by 1 week
    });

    log.data("Updated Term", {
      termType: updatedTerm.termType,
      previousEndDate: "2026-04-10",
      newEndDate: updatedTerm.endDate,
    });

    // ========================================
    // STEP 11: Get Statistics
    // ========================================
    log.step("Fetching term statistics");

    const stats = await termRepository.getStatistics(createdTermId);

    if (stats) {
      log.data("Term Statistics", {
        termType: stats.termType,
        academicYear: stats.academicYear.year,
        assessmentCount: stats._count.assessments,
        attendanceRecordCount: stats._count.attendanceRecords,
        reportCardCount: stats._count.reportCards,
      });
    }

    // ========================================
    // STEP 12: Get Progress
    // ========================================
    log.step("Calculating term progress");

    const progress = await termRepository.getProgress(createdTermId);

    if (progress !== null) {
      log.info(`Term progress: ${progress.toFixed(2)}%`);
    }

    // ========================================
    // STEP 13: Deactivate Term
    // ========================================
    log.step("Deactivating term");

    const deactivatedTerm = await termRepository.deactivate(createdTermId);

    log.data("Deactivated Term", {
      termType: deactivatedTerm.termType,
      isActive: deactivatedTerm.isActive,
    });

    if (deactivatedTerm.isActive) {
      throw new Error("Term should be deactivated");
    }
    log.info("✓ Verified: Term is deactivated");

    // ========================================
    // STEP 14: Count Terms
    // ========================================
    log.step("Counting terms");

    const totalCount = await termRepository.count();
    const activeCount = await termRepository.count({ isActive: true });
    const term1Count = await termRepository.count({ termType: "TERM_1" });

    log.info(`Total terms: ${totalCount}`);
    log.info(`Active terms: ${activeCount}`);
    log.info(`TERM_1 terms: ${term1Count}`);

    // ========================================
    // STEP 15: Delete Term
    // ========================================
    log.step("Deleting test term");

    await termRepository.delete(createdTermId);

    log.info(`Successfully deleted term with ID: ${createdTermId}`);

    // Verify deletion
    const deletedTerm = await termRepository.findById(createdTermId);
    if (deletedTerm) {
      throw new Error("Term was not properly deleted");
    }

    log.info("Verified: Term no longer exists in database");

    // ========================================
    // CLEANUP: Delete test academic year if created
    // ========================================
    if (createdAcademicYearForTest && testAcademicYearId) {
      log.step("Cleaning up test academic year");
      await academicYearRepository.delete(testAcademicYearId);
      log.info("Test academic year deleted");
    }

    // ========================================
    // SUCCESS
    // ========================================
    log.success("✓ All repository operations validated successfully");
    log.info("Summary:");
    log.info("  - Create: ✓");
    log.info("  - Find All: ✓");
    log.info("  - Find by ID: ✓");
    log.info("  - Find by Academic Year: ✓");
    log.info("  - Find by Year and Type: ✓");
    log.info("  - Find Active: ✓");
    log.info("  - Find by Type: ✓");
    log.info("  - Set Active: ✓");
    log.info("  - Check Overlap: ✓");
    log.info("  - Update: ✓");
    log.info("  - Get Statistics: ✓");
    log.info("  - Get Progress: ✓");
    log.info("  - Deactivate: ✓");
    log.info("  - Count: ✓");
    log.info("  - Delete: ✓");
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
validateTermRepository();
