/**
 * Constraint Checker
 * Validates placements against hard and soft constraints
 */

import {
  Activity,
  Slot,
  TimetableState,
  HardConstraintResult,
  SoftConstraintResult,
  TeacherAvailability,
  TimeSlot,
  DayOfWeek,
  SolverConfig,
} from './types';

// ============================================
// HARD CONSTRAINTS (must never break)
// ============================================

/**
 * Check if a teacher is free at a given slot
 */
export function checkTeacherFree(
  activity: Activity,
  slot: Slot,
  state: TimetableState
): HardConstraintResult {
  const teacherDaySchedule = state.teacherSchedule
    .get(activity.teacherId)
    ?.get(slot.dayOfWeek);
  
  if (teacherDaySchedule?.has(slot.timeSlotId)) {
    const conflictingActivityId = teacherDaySchedule.get(slot.timeSlotId);
    return {
      satisfied: false,
      reason: `Teacher already has activity ${conflictingActivityId} at this slot`,
    };
  }
  
  return { satisfied: true };
}

/**
 * Check if a class is free at a given slot
 */
export function checkClassFree(
  activity: Activity,
  slot: Slot,
  state: TimetableState
): HardConstraintResult {
  const classDaySchedule = state.classSchedule
    .get(activity.classId)
    ?.get(slot.dayOfWeek);
  
  if (classDaySchedule?.has(slot.timeSlotId)) {
    const conflictingActivityId = classDaySchedule.get(slot.timeSlotId);
    return {
      satisfied: false,
      reason: `Class already has activity ${conflictingActivityId} at this slot`,
    };
  }
  
  return { satisfied: true };
}

/**
 * Check if teacher is available (based on TeacherAvailability records)
 */
export function checkTeacherAvailability(
  activity: Activity,
  slot: Slot,
  availabilities: Map<string, Map<DayOfWeek, Set<string>>> // teacherId -> day -> unavailable timeSlotIds
): HardConstraintResult {
  const teacherUnavailable = availabilities
    .get(activity.teacherId)
    ?.get(slot.dayOfWeek)
    ?.has(slot.timeSlotId);
  
  if (teacherUnavailable) {
    return {
      satisfied: false,
      reason: `Teacher is marked unavailable at this slot`,
    };
  }
  
  return { satisfied: true };
}

/**
 * Check max lessons per day for class
 */
export function checkClassMaxLessonsPerDay(
  activity: Activity,
  slot: Slot,
  state: TimetableState,
  config: SolverConfig
): HardConstraintResult {
  const currentCount = state.classLessonsPerDay
    .get(activity.classId)
    ?.get(slot.dayOfWeek) || 0;
  
  if (currentCount >= config.maxLessonsPerDayPerClass) {
    return {
      satisfied: false,
      reason: `Class has reached max ${config.maxLessonsPerDayPerClass} lessons for ${slot.dayOfWeek}`,
    };
  }
  
  return { satisfied: true };
}

/**
 * Check max lessons per day for teacher
 */
export function checkTeacherMaxLessonsPerDay(
  activity: Activity,
  slot: Slot,
  state: TimetableState,
  config: SolverConfig
): HardConstraintResult {
  const currentCount = state.teacherLessonsPerDay
    .get(activity.teacherId)
    ?.get(slot.dayOfWeek) || 0;
  
  if (currentCount >= config.maxLessonsPerDayPerTeacher) {
    return {
      satisfied: false,
      reason: `Teacher has reached max ${config.maxLessonsPerDayPerTeacher} lessons for ${slot.dayOfWeek}`,
    };
  }
  
  return { satisfied: true };
}

/**
 * Run all hard constraint checks
 */
export function checkAllHardConstraints(
  activity: Activity,
  slot: Slot,
  state: TimetableState,
  availabilities: Map<string, Map<DayOfWeek, Set<string>>>,
  config: SolverConfig
): HardConstraintResult {
  const checks = [
    checkTeacherFree(activity, slot, state),
    checkClassFree(activity, slot, state),
    checkTeacherAvailability(activity, slot, availabilities),
    checkClassMaxLessonsPerDay(activity, slot, state, config),
    checkTeacherMaxLessonsPerDay(activity, slot, state, config),
  ];
  
  for (const check of checks) {
    if (!check.satisfied) {
      return check;
    }
  }
  
  return { satisfied: true };
}

// ============================================
// SOFT CONSTRAINTS (minimize violations)
// ============================================

/**
 * Prefer spreading subjects across the week
 * Penalize if this subject already has a lesson on this day
 */
export function scoreSubjectSpread(
  activity: Activity,
  slot: Slot,
  state: TimetableState
): SoftConstraintResult {
  // Check if this subject already has a lesson on this day for this class
  const classSchedule = state.classSchedule.get(activity.classId);
  if (!classSchedule) {
    return { score: 100 };
  }
  
  const daySchedule = classSchedule.get(slot.dayOfWeek);
  if (!daySchedule) {
    return { score: 100 };
  }
  
  // Count how many times this subject appears on this day
  let subjectCountOnDay = 0;
  for (const [, placedActivityId] of daySchedule) {
    // We need the activity to check its subject
    const placement = state.placements.find(p => p.activityId === placedActivityId);
    if (placement && placement.activity.subjectId === activity.subjectId) {
      subjectCountOnDay++;
    }
  }
  
  if (subjectCountOnDay === 0) {
    return { score: 100, reason: 'No same subject on this day - good' };
  } else if (subjectCountOnDay === 1) {
    return { score: 50, reason: 'One same subject already on this day' };
  } else {
    return { score: 20, reason: `${subjectCountOnDay} same subject lessons already on this day` };
  }
}

/**
 * Prefer morning slots for core subjects
 */
export function scoreMorningPreference(
  activity: Activity,
  slot: Slot,
  config: SolverConfig
): SoftConstraintResult {
  if (!config.preferMorningForCore) {
    return { score: 100 };
  }
  
  const isCore = config.coreSubjectIds.includes(activity.subjectId);
  if (!isCore) {
    return { score: 100, reason: 'Not a core subject' };
  }
  
  // Lower order = earlier in day
  if (slot.timeSlotOrder <= 2) {
    return { score: 100, reason: 'Core subject in morning - excellent' };
  } else if (slot.timeSlotOrder <= 4) {
    return { score: 80, reason: 'Core subject in mid-morning' };
  } else if (slot.timeSlotOrder <= 6) {
    return { score: 60, reason: 'Core subject in afternoon' };
  } else {
    return { score: 40, reason: 'Core subject in late afternoon' };
  }
}

/**
 * Prefer balanced teacher workload across the week
 */
export function scoreTeacherBalance(
  activity: Activity,
  slot: Slot,
  state: TimetableState,
  config: SolverConfig
): SoftConstraintResult {
  const teacherDays = state.teacherLessonsPerDay.get(activity.teacherId);
  if (!teacherDays) {
    return { score: 100 };
  }
  
  // Calculate current variance
  const counts: number[] = [];
  for (const day of config.schoolDays) {
    counts.push(teacherDays.get(day) || 0);
  }
  
  const currentDayCount = teacherDays.get(slot.dayOfWeek) || 0;
  const avgCount = counts.reduce((a, b) => a + b, 0) / counts.length;
  
  // If this day is already above average, penalize
  if (currentDayCount > avgCount + 1) {
    return { score: 60, reason: 'Teacher already has many lessons this day' };
  } else if (currentDayCount > avgCount) {
    return { score: 80, reason: 'Teacher slightly busy this day' };
  }
  
  return { score: 100, reason: 'Good teacher balance' };
}

/**
 * Avoid consecutive days for same subject (if configured)
 */
export function scoreAvoidConsecutiveDays(
  activity: Activity,
  slot: Slot,
  state: TimetableState,
  config: SolverConfig
): SoftConstraintResult {
  if (!config.avoidConsecutiveDays) {
    return { score: 100 };
  }
  
  const dayOrder: DayOfWeek[] = [
    DayOfWeek.MONDAY,
    DayOfWeek.TUESDAY,
    DayOfWeek.WEDNESDAY,
    DayOfWeek.THURSDAY,
    DayOfWeek.FRIDAY,
  ];
  
  const currentDayIndex = dayOrder.indexOf(slot.dayOfWeek);
  const adjacentDays: DayOfWeek[] = [];
  
  if (currentDayIndex > 0) {
    adjacentDays.push(dayOrder[currentDayIndex - 1]);
  }
  if (currentDayIndex < dayOrder.length - 1) {
    adjacentDays.push(dayOrder[currentDayIndex + 1]);
  }
  
  // Check if this subject is on adjacent days for this class
  const classSchedule = state.classSchedule.get(activity.classId);
  if (!classSchedule) {
    return { score: 100 };
  }
  
  for (const adjDay of adjacentDays) {
    const daySchedule = classSchedule.get(adjDay);
    if (!daySchedule) continue;
    
    for (const [, placedActivityId] of daySchedule) {
      const placement = state.placements.find(p => p.activityId === placedActivityId);
      if (placement && placement.activity.subjectId === activity.subjectId) {
        return { score: 50, reason: `Same subject on adjacent day (${adjDay})` };
      }
    }
  }
  
  return { score: 100, reason: 'No consecutive days' };
}

/**
 * Calculate total soft constraint score for a slot
 */
export function calculateSoftScore(
  activity: Activity,
  slot: Slot,
  state: TimetableState,
  config: SolverConfig
): number {
  const scores = [
    scoreSubjectSpread(activity, slot, state),
    scoreMorningPreference(activity, slot, config),
    scoreTeacherBalance(activity, slot, state, config),
    scoreAvoidConsecutiveDays(activity, slot, state, config),
  ];
  
  // Average of all soft constraint scores
  const total = scores.reduce((sum, s) => sum + s.score, 0);
  return total / scores.length;
}

// ============================================
// AVAILABILITY PREPROCESSING
// ============================================

/**
 * Build lookup structure for teacher unavailabilities
 */
export function buildAvailabilityLookup(
  availabilities: TeacherAvailability[]
): Map<string, Map<DayOfWeek, Set<string>>> {
  const result = new Map<string, Map<DayOfWeek, Set<string>>>();
  
  for (const avail of availabilities) {
    if (avail.isAvailable) continue; // Only track unavailabilities
    
    if (!result.has(avail.teacherId)) {
      result.set(avail.teacherId, new Map());
    }
    
    const teacherMap = result.get(avail.teacherId)!;
    if (!teacherMap.has(avail.dayOfWeek)) {
      teacherMap.set(avail.dayOfWeek, new Set());
    }
    
    teacherMap.get(avail.dayOfWeek)!.add(avail.timeSlotId);
  }
  
  return result;
}
