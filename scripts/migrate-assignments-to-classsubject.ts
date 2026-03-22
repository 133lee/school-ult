/**
 * Migration Script: Link SubjectTeacherAssignments to ClassSubjects
 *
 * This script migrates existing SubjectTeacherAssignment records to reference
 * the appropriate ClassSubject record, ensuring curriculum integrity.
 *
 * WHAT IT DOES:
 * 1. Finds all SubjectTeacherAssignment records without classSubjectId
 * 2. For each, looks up the matching ClassSubject (by subjectId + classId)
 * 3. If found, links the assignment to the ClassSubject
 * 4. If NOT found, either:
 *    a) Creates the ClassSubject (if --create-missing flag is used)
 *    b) Reports the orphan (default behavior)
 *
 * USAGE:
 *   npx ts-node scripts/migrate-assignments-to-classsubject.ts
 *   npx ts-node scripts/migrate-assignments-to-classsubject.ts --create-missing
 *   npx ts-node scripts/migrate-assignments-to-classsubject.ts --dry-run
 *
 * OPTIONS:
 *   --dry-run        Show what would be done without making changes
 *   --create-missing Create ClassSubject entries for orphan assignments
 *   --delete-orphans Delete assignments without matching ClassSubject (dangerous!)
 */

import { PrismaClient } from "../generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";

// Setup Prisma with the same adapter as the main app
const pool = new pg.Pool({
  host: "localhost",
  port: 5432,
  user: "postgres",
  password: "admin123",
  database: "rebuild_school_db",
});

const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

interface MigrationStats {
  total: number;
  alreadyLinked: number;
  migrated: number;
  orphans: number;
  created: number;
  deleted: number;
  errors: number;
}

interface OrphanAssignment {
  id: string;
  teacherId: string;
  subjectId: string;
  classId: string;
  academicYearId: string;
  teacherName?: string;
  subjectName?: string;
  className?: string;
}

async function migrateAssignments(options: {
  dryRun: boolean;
  createMissing: boolean;
  deleteOrphans: boolean;
}) {
  const { dryRun, createMissing, deleteOrphans } = options;

  console.log("\n========================================");
  console.log("SubjectTeacherAssignment -> ClassSubject Migration");
  console.log("========================================\n");

  if (dryRun) {
    console.log("🔍 DRY RUN MODE - No changes will be made\n");
  }

  const stats: MigrationStats = {
    total: 0,
    alreadyLinked: 0,
    migrated: 0,
    orphans: 0,
    created: 0,
    deleted: 0,
    errors: 0,
  };

  const orphanAssignments: OrphanAssignment[] = [];

  try {
    // Get all assignments
    const assignments = await prisma.subjectTeacherAssignment.findMany({
      include: {
        teacher: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
        subject: {
          select: {
            name: true,
          },
        },
        class: {
          select: {
            name: true,
            grade: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });

    stats.total = assignments.length;
    console.log(`Found ${stats.total} total assignments\n`);

    for (const assignment of assignments) {
      // Check if already linked
      if (assignment.classSubjectId) {
        stats.alreadyLinked++;
        continue;
      }

      // Try to find matching ClassSubject
      const classSubject = await prisma.classSubject.findUnique({
        where: {
          classId_subjectId: {
            classId: assignment.classId,
            subjectId: assignment.subjectId,
          },
        },
      });

      if (classSubject) {
        // Link the assignment to the ClassSubject
        if (!dryRun) {
          try {
            await prisma.subjectTeacherAssignment.update({
              where: { id: assignment.id },
              data: { classSubjectId: classSubject.id },
            });
            stats.migrated++;
            console.log(
              `✅ Linked: ${assignment.teacher.firstName} ${assignment.teacher.lastName} -> ${assignment.subject.name} (${assignment.class.grade.name} ${assignment.class.name})`
            );
          } catch (error) {
            stats.errors++;
            console.error(
              `❌ Error linking assignment ${assignment.id}:`,
              error
            );
          }
        } else {
          stats.migrated++;
          console.log(
            `[DRY] Would link: ${assignment.teacher.firstName} ${assignment.teacher.lastName} -> ${assignment.subject.name} (${assignment.class.grade.name} ${assignment.class.name})`
          );
        }
      } else {
        // No matching ClassSubject - this is an orphan
        orphanAssignments.push({
          id: assignment.id,
          teacherId: assignment.teacherId,
          subjectId: assignment.subjectId,
          classId: assignment.classId,
          academicYearId: assignment.academicYearId,
          teacherName: `${assignment.teacher.firstName} ${assignment.teacher.lastName}`,
          subjectName: assignment.subject.name,
          className: `${assignment.class.grade.name} ${assignment.class.name}`,
        });

        if (createMissing) {
          // Create the missing ClassSubject
          if (!dryRun) {
            try {
              const newClassSubject = await prisma.classSubject.create({
                data: {
                  classId: assignment.classId,
                  subjectId: assignment.subjectId,
                  isCore: true, // Default to core
                  periodsPerWeek: 4, // Default periods
                },
              });

              // Now link the assignment
              await prisma.subjectTeacherAssignment.update({
                where: { id: assignment.id },
                data: { classSubjectId: newClassSubject.id },
              });

              stats.created++;
              stats.migrated++;
              console.log(
                `🆕 Created ClassSubject & linked: ${assignment.subject.name} for ${assignment.class.grade.name} ${assignment.class.name}`
              );
            } catch (error) {
              stats.errors++;
              console.error(
                `❌ Error creating ClassSubject for assignment ${assignment.id}:`,
                error
              );
            }
          } else {
            stats.created++;
            stats.migrated++;
            console.log(
              `[DRY] Would create ClassSubject & link: ${assignment.subject.name} for ${assignment.class.grade.name} ${assignment.class.name}`
            );
          }
        } else if (deleteOrphans) {
          // Delete the orphan assignment
          if (!dryRun) {
            try {
              await prisma.subjectTeacherAssignment.delete({
                where: { id: assignment.id },
              });
              stats.deleted++;
              console.log(
                `🗑️  Deleted orphan: ${assignment.teacher.firstName} ${assignment.teacher.lastName} -> ${assignment.subject.name} (${assignment.class.grade.name} ${assignment.class.name})`
              );
            } catch (error) {
              stats.errors++;
              console.error(
                `❌ Error deleting orphan assignment ${assignment.id}:`,
                error
              );
            }
          } else {
            stats.deleted++;
            console.log(
              `[DRY] Would delete orphan: ${assignment.teacher.firstName} ${assignment.teacher.lastName} -> ${assignment.subject.name} (${assignment.class.grade.name} ${assignment.class.name})`
            );
          }
        } else {
          stats.orphans++;
        }
      }
    }

    // Print summary
    console.log("\n========================================");
    console.log("MIGRATION SUMMARY");
    console.log("========================================");
    console.log(`Total assignments:     ${stats.total}`);
    console.log(`Already linked:        ${stats.alreadyLinked}`);
    console.log(`Migrated (linked):     ${stats.migrated}`);
    console.log(`ClassSubjects created: ${stats.created}`);
    console.log(`Orphans deleted:       ${stats.deleted}`);
    console.log(`Orphans remaining:     ${stats.orphans}`);
    console.log(`Errors:                ${stats.errors}`);
    console.log("========================================\n");

    // Report orphans if any
    if (orphanAssignments.length > 0 && !createMissing && !deleteOrphans) {
      console.log("\n⚠️  ORPHAN ASSIGNMENTS (no matching ClassSubject):");
      console.log(
        "These assignments reference subject+class combos that don't exist in curriculum:\n"
      );

      for (const orphan of orphanAssignments) {
        console.log(
          `  - ${orphan.teacherName} teaches ${orphan.subjectName} to ${orphan.className}`
        );
        console.log(`    Assignment ID: ${orphan.id}`);
        console.log(`    Subject ID: ${orphan.subjectId}`);
        console.log(`    Class ID: ${orphan.classId}\n`);
      }

      console.log("\nTo fix orphans, run with one of these options:");
      console.log(
        "  --create-missing  Create ClassSubject entries for orphans"
      );
      console.log("  --delete-orphans  Delete orphan assignments (data loss!)");
    }

    return stats;
  } catch (error) {
    console.error("Migration failed:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Parse command line arguments
const args = process.argv.slice(2);
const options = {
  dryRun: args.includes("--dry-run"),
  createMissing: args.includes("--create-missing"),
  deleteOrphans: args.includes("--delete-orphans"),
};

// Validate options
if (options.createMissing && options.deleteOrphans) {
  console.error("Error: Cannot use both --create-missing and --delete-orphans");
  process.exit(1);
}

// Run migration
migrateAssignments(options)
  .then((stats) => {
    if (stats.errors > 0) {
      process.exit(1);
    }
    process.exit(0);
  })
  .catch((error) => {
    console.error("Migration failed:", error);
    process.exit(1);
  });
