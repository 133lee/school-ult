/**
 * Database Writer
 * Converts solver output to Prisma-compatible records
 */

import {
  Placement,
  SolverOutput,
  ClassTimetableEntry,
  SecondaryTimetableEntry,
  SchoolLevel,
  DayOfWeek,
} from './types';

// ============================================
// OUTPUT CONVERSION
// ============================================

/**
 * Convert solver placements to ClassTimetable entries (Primary school)
 */
export function toClassTimetableEntries(
  placements: Placement[],
  termId: string,
  classLevels: Map<string, SchoolLevel> // classId -> level
): ClassTimetableEntry[] {
  return placements
    .filter(p => classLevels.get(p.activity.classId) === SchoolLevel.PRIMARY)
    .map(p => ({
      classId: p.activity.classId,
      subjectId: p.activity.subjectId,
      teacherId: p.activity.teacherId,
      timeSlotId: p.timeSlotId,
      termId,
      dayOfWeek: p.dayOfWeek,
    }));
}

/**
 * Convert solver placements to SecondaryTimetable entries (Secondary school)
 */
export function toSecondaryTimetableEntries(
  placements: Placement[],
  termId: string,
  classLevels: Map<string, SchoolLevel>
): SecondaryTimetableEntry[] {
  return placements
    .filter(p => classLevels.get(p.activity.classId) === SchoolLevel.SECONDARY)
    .map(p => ({
      classId: p.activity.classId,
      subjectId: p.activity.subjectId,
      teacherId: p.activity.teacherId,
      timeSlotId: p.timeSlotId,
      termId,
      dayOfWeek: p.dayOfWeek,
    }));
}

/**
 * Generate Prisma createMany data for ClassTimetable
 */
export function generateClassTimetableCreateData(
  entries: ClassTimetableEntry[]
): {
  data: {
    classId: string;
    subjectId: string;
    teacherId: string;
    timeSlotId: string;
    termId: string;
    dayOfWeek: DayOfWeek;
  }[];
} {
  return {
    data: entries.map(e => ({
      classId: e.classId,
      subjectId: e.subjectId,
      teacherId: e.teacherId,
      timeSlotId: e.timeSlotId,
      termId: e.termId,
      dayOfWeek: e.dayOfWeek,
    })),
  };
}

/**
 * Generate Prisma createMany data for SecondaryTimetable
 */
export function generateSecondaryTimetableCreateData(
  entries: SecondaryTimetableEntry[]
): {
  data: {
    classId: string;
    subjectId: string;
    teacherId: string;
    timeSlotId: string;
    termId: string;
    dayOfWeek: DayOfWeek;
  }[];
} {
  return {
    data: entries.map(e => ({
      classId: e.classId,
      subjectId: e.subjectId,
      teacherId: e.teacherId,
      timeSlotId: e.timeSlotId,
      termId: e.termId,
      dayOfWeek: e.dayOfWeek,
    })),
  };
}

// ============================================
// PRISMA INTEGRATION EXAMPLE
// ============================================

/**
 * Example function showing how to save results with Prisma
 * You would import this pattern into your Next.js API route
 */
export function generatePrismaOperations(
  output: SolverOutput,
  termId: string,
  classLevels: Map<string, SchoolLevel>
): string {
  const primaryEntries = toClassTimetableEntries(output.placements, termId, classLevels);
  const secondaryEntries = toSecondaryTimetableEntries(output.placements, termId, classLevels);
  
  return `
// Generated Prisma operations for timetable
// Copy this to your API route or server action

import { prisma } from '@/lib/prisma';

export async function saveTimetable() {
  // Clear existing timetable for this term
  await prisma.$transaction([
    prisma.classTimetable.deleteMany({
      where: { termId: '${termId}' }
    }),
    prisma.secondaryTimetable.deleteMany({
      where: { termId: '${termId}' }
    }),
  ]);
  
  // Insert new timetable entries
  await prisma.$transaction([
    prisma.classTimetable.createMany({
      data: ${JSON.stringify(primaryEntries, null, 2)}
    }),
    prisma.secondaryTimetable.createMany({
      data: ${JSON.stringify(secondaryEntries, null, 2)}
    }),
  ]);
  
  return {
    primary: ${primaryEntries.length},
    secondary: ${secondaryEntries.length},
    total: ${output.placements.length}
  };
}
`;
}

// ============================================
// REPORT GENERATION
// ============================================

/**
 * Generate a summary report of the timetable
 */
export function generateReport(output: SolverOutput): string {
  const lines: string[] = [
    '═══════════════════════════════════════════════════════════════',
    '                    TIMETABLE GENERATION REPORT                 ',
    '═══════════════════════════════════════════════════════════════',
    '',
    `Status: ${output.success ? '✓ SUCCESS' : '✗ INCOMPLETE'}`,
    '',
    '─── Statistics ───────────────────────────────────────────────',
    `Total activities:    ${output.stats.totalActivities}`,
    `Placed activities:   ${output.stats.placedActivities}`,
    `Unplaced activities: ${output.stats.unplacedActivities}`,
    `Attempts:            ${output.stats.attempts}`,
    `Backtracks:          ${output.stats.backtrackCount}`,
    `Duration:            ${output.stats.duration}ms`,
    '',
  ];
  
  if (output.errors.length > 0) {
    lines.push('─── Errors ───────────────────────────────────────────────────');
    for (const error of output.errors) {
      lines.push(`  ✗ ${error}`);
    }
    lines.push('');
  }
  
  if (output.warnings.length > 0) {
    lines.push('─── Warnings ─────────────────────────────────────────────────');
    for (const warning of output.warnings) {
      lines.push(`  ⚠ ${warning}`);
    }
    lines.push('');
  }
  
  if (output.unplacedActivities.length > 0) {
    lines.push('─── Unplaced Activities ──────────────────────────────────────');
    for (const activity of output.unplacedActivities) {
      lines.push(`  • ${activity.label}`);
    }
    lines.push('');
  }
  
  // Group placements by class
  const byClass = new Map<string, Placement[]>();
  for (const placement of output.placements) {
    const list = byClass.get(placement.activity.classId) || [];
    list.push(placement);
    byClass.set(placement.activity.classId, list);
  }
  
  lines.push('─── Placements by Class ──────────────────────────────────────');
  for (const [classId, placements] of byClass) {
    lines.push(`  ${classId}: ${placements.length} lessons`);
  }
  lines.push('');
  
  lines.push('═══════════════════════════════════════════════════════════════');
  
  return lines.join('\n');
}

/**
 * Generate a visual timetable grid for a single class
 */
export function generateClassGrid(
  classId: string,
  placements: Placement[],
  timeSlots: { id: string; name: string; order: number }[],
  days: DayOfWeek[]
): string {
  const classplacements = placements.filter(p => p.activity.classId === classId);
  const sortedSlots = [...timeSlots].sort((a, b) => a.order - b.order);
  
  // Build grid
  const grid: Map<string, Map<DayOfWeek, string>> = new Map();
  for (const slot of sortedSlots) {
    grid.set(slot.id, new Map());
  }
  
  for (const p of classplacements) {
    const slotRow = grid.get(p.timeSlotId);
    if (slotRow) {
      slotRow.set(p.dayOfWeek, p.activity.label);
    }
  }
  
  // Generate output
  const lines: string[] = [];
  const colWidth = 15;
  
  // Header
  let header = 'Time'.padEnd(10);
  for (const day of days) {
    header += day.substring(0, 3).padEnd(colWidth);
  }
  lines.push(header);
  lines.push('─'.repeat(header.length));
  
  // Rows
  for (const slot of sortedSlots) {
    let row = slot.name.substring(0, 9).padEnd(10);
    const slotRow = grid.get(slot.id)!;
    for (const day of days) {
      const activity = slotRow.get(day) || '-';
      row += activity.substring(0, colWidth - 1).padEnd(colWidth);
    }
    lines.push(row);
  }
  
  return lines.join('\n');
}
