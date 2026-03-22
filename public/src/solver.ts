/**
 * Timetable Solver Engine
 * FET-style constraint-based placement with backtracking
 */

import {
  Activity,
  Slot,
  Placement,
  TimetableState,
  TimeSlot,
  DayOfWeek,
  SolverConfig,
  SolverInput,
  SolverOutput,
  DEFAULT_CONFIG,
  TeacherAvailability,
} from './types';

import { generateActivities, validateActivities } from './activity-generator';
import {
  checkAllHardConstraints,
  calculateSoftScore,
  buildAvailabilityLookup,
} from './constraint-checker';

// ============================================
// STATE MANAGEMENT
// ============================================

/**
 * Create empty timetable state
 */
function createEmptyState(): TimetableState {
  return {
    teacherSchedule: new Map(),
    classSchedule: new Map(),
    subjectCount: new Map(),
    classLessonsPerDay: new Map(),
    teacherLessonsPerDay: new Map(),
    placements: [],
  };
}

/**
 * Clone state for backtracking
 */
function cloneState(state: TimetableState): TimetableState {
  return {
    teacherSchedule: deepCloneNestedMap(state.teacherSchedule),
    classSchedule: deepCloneNestedMap(state.classSchedule),
    subjectCount: deepCloneNestedMap2<string>(state.subjectCount),
    classLessonsPerDay: deepCloneNestedMap2<DayOfWeek>(state.classLessonsPerDay),
    teacherLessonsPerDay: deepCloneNestedMap2<DayOfWeek>(state.teacherLessonsPerDay),
    placements: [...state.placements],
  };
}

function deepCloneNestedMap(
  map: Map<string, Map<DayOfWeek, Map<string, string>>>
): Map<string, Map<DayOfWeek, Map<string, string>>> {
  const result = new Map<string, Map<DayOfWeek, Map<string, string>>>();
  for (const [k1, v1] of map) {
    const inner = new Map<DayOfWeek, Map<string, string>>();
    for (const [k2, v2] of v1) {
      inner.set(k2, new Map(v2));
    }
    result.set(k1, inner);
  }
  return result;
}

function deepCloneNestedMap2<K>(
  map: Map<string, Map<K, number>>
): Map<string, Map<K, number>> {
  const result = new Map<string, Map<K, number>>();
  for (const [k1, v1] of map) {
    result.set(k1, new Map(v1));
  }
  return result;
}

/**
 * Add a placement to state
 */
function addPlacement(
  state: TimetableState,
  activity: Activity,
  slot: Slot
): void {
  const placement: Placement = {
    activityId: activity.id,
    activity,
    dayOfWeek: slot.dayOfWeek,
    timeSlotId: slot.timeSlotId,
  };
  
  state.placements.push(placement);
  
  // Update teacher schedule
  if (!state.teacherSchedule.has(activity.teacherId)) {
    state.teacherSchedule.set(activity.teacherId, new Map());
  }
  const teacherDays = state.teacherSchedule.get(activity.teacherId)!;
  if (!teacherDays.has(slot.dayOfWeek)) {
    teacherDays.set(slot.dayOfWeek, new Map());
  }
  teacherDays.get(slot.dayOfWeek)!.set(slot.timeSlotId, activity.id);
  
  // Update class schedule
  if (!state.classSchedule.has(activity.classId)) {
    state.classSchedule.set(activity.classId, new Map());
  }
  const classDays = state.classSchedule.get(activity.classId)!;
  if (!classDays.has(slot.dayOfWeek)) {
    classDays.set(slot.dayOfWeek, new Map());
  }
  classDays.get(slot.dayOfWeek)!.set(slot.timeSlotId, activity.id);
  
  // Update subject count
  if (!state.subjectCount.has(activity.classId)) {
    state.subjectCount.set(activity.classId, new Map());
  }
  const classSubjects = state.subjectCount.get(activity.classId)!;
  const currentCount = classSubjects.get(activity.subjectId) || 0;
  classSubjects.set(activity.subjectId, currentCount + 1);
  
  // Update class lessons per day
  if (!state.classLessonsPerDay.has(activity.classId)) {
    state.classLessonsPerDay.set(activity.classId, new Map());
  }
  const classLessons = state.classLessonsPerDay.get(activity.classId)!;
  const classCount = classLessons.get(slot.dayOfWeek) || 0;
  classLessons.set(slot.dayOfWeek, classCount + 1);
  
  // Update teacher lessons per day
  if (!state.teacherLessonsPerDay.has(activity.teacherId)) {
    state.teacherLessonsPerDay.set(activity.teacherId, new Map());
  }
  const teacherLessons = state.teacherLessonsPerDay.get(activity.teacherId)!;
  const teacherCount = teacherLessons.get(slot.dayOfWeek) || 0;
  teacherLessons.set(slot.dayOfWeek, teacherCount + 1);
}

// ============================================
// SLOT GENERATION
// ============================================

/**
 * Generate all available slots
 */
function generateSlots(
  timeSlots: TimeSlot[],
  config: SolverConfig
): Slot[] {
  const slots: Slot[] = [];
  
  // Filter out break times
  const teachingSlots = timeSlots
    .filter(s => !s.isBreak)
    .sort((a, b) => a.order - b.order);
  
  for (const day of config.schoolDays) {
    for (const timeSlot of teachingSlots) {
      slots.push({
        dayOfWeek: day,
        timeSlotId: timeSlot.id,
        timeSlotOrder: timeSlot.order,
      });
    }
  }
  
  return slots;
}

/**
 * Find valid slots for an activity
 */
function findValidSlots(
  activity: Activity,
  allSlots: Slot[],
  state: TimetableState,
  availabilities: Map<string, Map<DayOfWeek, Set<string>>>,
  config: SolverConfig
): { slot: Slot; softScore: number }[] {
  const validSlots: { slot: Slot; softScore: number }[] = [];
  
  for (const slot of allSlots) {
    const hardResult = checkAllHardConstraints(
      activity,
      slot,
      state,
      availabilities,
      config
    );
    
    if (hardResult.satisfied) {
      const softScore = calculateSoftScore(activity, slot, state, config);
      validSlots.push({ slot, softScore });
    }
  }
  
  // Sort by soft score (highest first)
  validSlots.sort((a, b) => b.softScore - a.softScore);
  
  return validSlots;
}

// ============================================
// SOLVER ENGINE
// ============================================

interface SolveContext {
  activities: Activity[];
  slots: Slot[];
  availabilities: Map<string, Map<DayOfWeek, Set<string>>>;
  config: SolverConfig;
  stats: {
    attempts: number;
    backtrackCount: number;
  };
}

/**
 * Recursive solver with backtracking
 */
function solveRecursive(
  activityIndex: number,
  state: TimetableState,
  ctx: SolveContext,
  depth: number
): TimetableState | null {
  // Check if we've placed all activities
  if (activityIndex >= ctx.activities.length) {
    return state; // Success!
  }
  
  // Check depth limit
  if (depth > ctx.config.maxBacktrackDepth) {
    return null;
  }
  
  // Check attempt limit
  if (ctx.stats.attempts > ctx.config.maxAttempts) {
    return null;
  }
  
  ctx.stats.attempts++;
  
  const activity = ctx.activities[activityIndex];
  const validSlots = findValidSlots(
    activity,
    ctx.slots,
    state,
    ctx.availabilities,
    ctx.config
  );
  
  if (validSlots.length === 0) {
    // No valid slots - need to backtrack
    ctx.stats.backtrackCount++;
    return null;
  }
  
  // Try each valid slot
  for (const { slot } of validSlots) {
    const newState = ctx.config.enableBacktracking
      ? cloneState(state)
      : state;
    
    addPlacement(newState, activity, slot);
    
    const result = solveRecursive(
      activityIndex + 1,
      newState,
      ctx,
      depth + 1
    );
    
    if (result !== null) {
      return result;
    }
    
    // If backtracking is disabled, we can't try other slots
    if (!ctx.config.enableBacktracking) {
      break;
    }
  }
  
  return null;
}

/**
 * Greedy solver (no backtracking, faster)
 */
function solveGreedy(
  activities: Activity[],
  slots: Slot[],
  availabilities: Map<string, Map<DayOfWeek, Set<string>>>,
  config: SolverConfig
): { state: TimetableState; unplaced: Activity[] } {
  const state = createEmptyState();
  const unplaced: Activity[] = [];
  
  for (const activity of activities) {
    const validSlots = findValidSlots(
      activity,
      slots,
      state,
      availabilities,
      config
    );
    
    if (validSlots.length > 0) {
      // Take the best slot
      addPlacement(state, activity, validSlots[0].slot);
    } else {
      unplaced.push(activity);
    }
  }
  
  return { state, unplaced };
}

// ============================================
// MAIN SOLVER FUNCTION
// ============================================

/**
 * Main entry point for timetable generation
 */
export function solve(input: SolverInput): SolverOutput {
  const startTime = Date.now();
  const config = { ...DEFAULT_CONFIG, ...input.config };
  const errors: string[] = [];
  const warnings: string[] = [];
  
  // Generate activities
  const activities = generateActivities(
    input.assignments,
    input.periodRequirements,
    input.teacherAvailabilities,
    input.timeSlots,
    config
  );
  
  if (activities.length === 0) {
    return {
      success: false,
      placements: [],
      unplacedActivities: [],
      stats: {
        totalActivities: 0,
        placedActivities: 0,
        unplacedActivities: 0,
        attempts: 0,
        backtrackCount: 0,
        duration: Date.now() - startTime,
      },
      errors: ['No activities generated - check assignments and period requirements'],
      warnings,
    };
  }
  
  // Validate activities
  const validation = validateActivities(activities, input.timeSlots, config);
  if (!validation.valid) {
    errors.push(...validation.errors);
    // Continue anyway - we'll do our best
    warnings.push('Validation failed but attempting to generate timetable anyway');
  }
  
  // Generate slots
  const slots = generateSlots(input.timeSlots, config);
  
  // Build availability lookup
  const availabilities = buildAvailabilityLookup(input.teacherAvailabilities);
  
  let finalState: TimetableState;
  let unplacedActivities: Activity[] = [];
  let attempts = 0;
  let backtrackCount = 0;
  
  if (config.enableBacktracking) {
    // Try recursive solver with backtracking
    const ctx: SolveContext = {
      activities,
      slots,
      availabilities,
      config,
      stats: { attempts: 0, backtrackCount: 0 },
    };
    
    const result = solveRecursive(0, createEmptyState(), ctx, 0);
    attempts = ctx.stats.attempts;
    backtrackCount = ctx.stats.backtrackCount;
    
    if (result !== null) {
      finalState = result;
    } else {
      // Fall back to greedy
      warnings.push('Backtracking solver failed, using greedy placement');
      const greedy = solveGreedy(activities, slots, availabilities, config);
      finalState = greedy.state;
      unplacedActivities = greedy.unplaced;
    }
  } else {
    // Use greedy solver
    const greedy = solveGreedy(activities, slots, availabilities, config);
    finalState = greedy.state;
    unplacedActivities = greedy.unplaced;
  }
  
  const duration = Date.now() - startTime;
  
  return {
    success: unplacedActivities.length === 0,
    placements: finalState.placements,
    unplacedActivities,
    stats: {
      totalActivities: activities.length,
      placedActivities: finalState.placements.length,
      unplacedActivities: unplacedActivities.length,
      attempts,
      backtrackCount,
      duration,
    },
    errors,
    warnings,
  };
}

/**
 * Quick solve with greedy algorithm only
 * Faster but may not find optimal solution
 */
export function solveQuick(input: SolverInput): SolverOutput {
  return solve({
    ...input,
    config: {
      ...input.config,
      enableBacktracking: false,
    },
  });
}
