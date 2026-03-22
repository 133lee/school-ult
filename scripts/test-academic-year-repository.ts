/**
 * Academic Year Repository Validation Script
 *
 * Purpose: Validate CRUD operations on the AcademicYear table
 *
 * Architecture: Tests repository layer only (no services, no API, no validation)
 * Database: Uses real Prisma client with actual database
 *
 * Run with: npx tsx scripts/test-academic-year-repository.ts
 */

import { academicYearRepository } from "@/features/academic-years/academicYear.repository";
import prisma from "@/lib/db/prisma";

// Logging utilities
const log = {
  step: (msg: string) => console.log(`\n✓ ${msg}`),
  info: (msg: string) => console.log(`  ${msg}`),
  data: (label: string, data: any) => console.log(`  ${label}:`, JSON.stringify(data, null, 2)),
  error: (msg: string) => console.error(`\n✗ ERROR: ${msg}`),
  success: (msg: string) => console.log(`\n✅ ${msg}\n`),
};

async function validateAcademicYearRepository() {
  let createdYearId: string | null = null;

  try {
    log.step("Starting Academic Year Repository Validation");

    // ========================================
    // STEP 1: Create Academic Year
    // ========================================
    log.step("Creating new academic year (2027 for testing)");

    const testYear = 2027 + Math.floor(Math.random() * 100); // Random year to avoid conflicts
    const startDate = new Date(`${testYear}-01-13`);
    const endDate = new Date(`${testYear}-12-05`);

    const newYear = await academicYearRepository.create({
      year: testYear,
      startDate,
      endDate,
      isActive: false,
      isClosed: false,
    });

    createdYearId = newYear.id;

    log.data("Created Academic Year", {
      id: newYear.id,
      year: newYear.year,
      startDate: newYear.startDate,
      endDate: newYear.endDate,
      isActive: newYear.isActive,
      isClosed: newYear.isClosed,
    });

    // ========================================
    // STEP 2: Find All Academic Years
    // ========================================
    log.step("Fetching all academic years");

    const allYears = await academicYearRepository.findMany();

    log.info(`Total academic years in database: ${allYears.length}`);
    if (allYears.length > 0) {
      log.data("Sample Years", allYears.slice(0, 3).map(y => ({
        year: y.year,
        isActive: y.isActive,
        isClosed: y.isClosed,
      })));
    }

    // ========================================
    // STEP 3: Find by ID
    // ========================================
    log.step(`Fetching academic year by ID: ${createdYearId}`);

    const yearById = await academicYearRepository.findById(createdYearId);

    if (!yearById) {
      throw new Error("Failed to retrieve academic year by ID");
    }

    log.data("Retrieved Year", {
      id: yearById.id,
      year: yearById.year,
      isActive: yearById.isActive,
    });

    // ========================================
    // STEP 4: Find by Year Number
    // ========================================
    log.step(`Fetching academic year by year number (${testYear})`);

    const yearByNumber = await academicYearRepository.findByYear(testYear);

    if (!yearByNumber) {
      throw new Error("Failed to retrieve year by year number");
    }

    log.info(`Found year ${testYear}: ${yearByNumber.id}`);

    // ========================================
    // STEP 5: Find Active Year
    // ========================================
    log.step("Checking for active academic year");

    const activeYear = await academicYearRepository.findActive();

    if (activeYear) {
      log.data("Currently Active Year", {
        year: activeYear.year,
        id: activeYear.id,
      });
    } else {
      log.info("No active academic year found");
    }

    // ========================================
    // STEP 6: Set as Active
    // ========================================
    log.step(`Setting year ${testYear} as active`);

    const activatedYear = await academicYearRepository.setActive(createdYearId);

    log.data("Activated Year", {
      year: activatedYear.year,
      isActive: activatedYear.isActive,
    });

    // Verify it's now the active year
    const verifyActive = await academicYearRepository.findActive();
    if (!verifyActive || verifyActive.id !== createdYearId) {
      throw new Error("setActive did not properly set the year as active");
    }
    log.info("✓ Verified: Year is now active");

    // ========================================
    // STEP 7: Check isActiveAndOpen
    // ========================================
    log.step("Checking if year is active and open");

    const isActiveAndOpen = await academicYearRepository.isActiveAndOpen(createdYearId);

    log.info(`Is active and open: ${isActiveAndOpen ? 'Yes' : 'No'}`);

    if (!isActiveAndOpen) {
      throw new Error("Year should be active and open");
    }

    // ========================================
    // STEP 8: Find by Status
    // ========================================
    log.step("Finding years by status (active)");

    const activeYears = await academicYearRepository.findByStatus(true);

    log.info(`Active years found: ${activeYears.length}`);
    activeYears.forEach(y => {
      log.info(`  - ${y.year} (${y.isActive ? 'Active' : 'Inactive'})`);
    });

    // ========================================
    // STEP 9: Update Academic Year
    // ========================================
    log.step("Updating academic year");

    const newEndDate = new Date(`${testYear}-12-12`);
    const updatedYear = await academicYearRepository.update(createdYearId, {
      endDate: newEndDate, // Extended by 1 week
    });

    log.data("Updated Year", {
      year: updatedYear.year,
      previousEndDate: `${testYear}-12-05`,
      newEndDate: updatedYear.endDate,
    });

    // ========================================
    // STEP 10: Get Statistics
    // ========================================
    log.step("Fetching year statistics");

    const stats = await academicYearRepository.getStatistics(createdYearId);

    if (stats) {
      log.data("Year Statistics", {
        year: stats.year,
        enrollmentCount: stats._count.enrollments,
        termCount: stats._count.terms,
        classTeacherAssignments: stats._count.classTeacherAssignments,
        subjectTeacherAssignments: stats._count.subjectTeacherAssignments,
      });
    }

    // ========================================
    // STEP 11: Close Academic Year
    // ========================================
    log.step("Closing academic year");

    const closedYear = await academicYearRepository.close(createdYearId);

    log.data("Closed Year", {
      year: closedYear.year,
      isClosed: closedYear.isClosed,
      isActive: closedYear.isActive,
    });

    // Verify it's closed and not active
    const verifyClosedAndOpen = await academicYearRepository.isActiveAndOpen(createdYearId);
    if (verifyClosedAndOpen) {
      throw new Error("Closed year should not be active and open");
    }
    log.info("✓ Verified: Year is closed and not available for operations");

    // ========================================
    // STEP 12: Reopen Academic Year
    // ========================================
    log.step("Reopening academic year");

    const reopenedYear = await academicYearRepository.reopen(createdYearId);

    log.data("Reopened Year", {
      year: reopenedYear.year,
      isClosed: reopenedYear.isClosed,
    });

    if (reopenedYear.isClosed) {
      throw new Error("Year should be reopened (isClosed should be false)");
    }
    log.info("✓ Verified: Year is reopened");

    // ========================================
    // STEP 13: Count Years
    // ========================================
    log.step("Counting academic years");

    const totalCount = await academicYearRepository.count();
    const activeCount = await academicYearRepository.count({ isActive: true });
    const closedCount = await academicYearRepository.count({ isClosed: true });

    log.info(`Total years: ${totalCount}`);
    log.info(`Active years: ${activeCount}`);
    log.info(`Closed years: ${closedCount}`);

    // ========================================
    // STEP 14: Delete Academic Year
    // ========================================
    log.step("Deleting test academic year");

    await academicYearRepository.delete(createdYearId);

    log.info(`Successfully deleted year with ID: ${createdYearId}`);

    // Verify deletion
    const deletedYear = await academicYearRepository.findById(createdYearId);
    if (deletedYear) {
      throw new Error("Year was not properly deleted");
    }

    log.info("Verified: Year no longer exists in database");

    // ========================================
    // SUCCESS
    // ========================================
    log.success("✓ All repository operations validated successfully");
    log.info("Summary:");
    log.info("  - Create: ✓");
    log.info("  - Find All: ✓");
    log.info("  - Find by ID: ✓");
    log.info("  - Find by Year: ✓");
    log.info("  - Find Active: ✓");
    log.info("  - Find by Status: ✓");
    log.info("  - Set Active: ✓");
    log.info("  - Check Active & Open: ✓");
    log.info("  - Update: ✓");
    log.info("  - Get Statistics: ✓");
    log.info("  - Close: ✓");
    log.info("  - Reopen: ✓");
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
validateAcademicYearRepository();
