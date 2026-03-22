/**
 * Activity Generator
 * Converts SubjectTeacherAssignments + SubjectPeriodRequirements into Activities
 */

import {
  Activity,
  SubjectTeacherAssignment,
  SubjectPeriodRequirement,
  TeacherAvailability,
  TimeSlot,
  DayOfWeek,
  SolverConfig,
} from './types';

/**
 * Generate activities from assignments and period requirements
 * 
 * For each assignment (Teacher X teaches Subject Y to Class Z):
 *   - Look up how many periods per week are required
 *   - Create that many Activity instances
 *   - Calculate constraint score for ordering
 */
export function generateActivities(
  assignments: SubjectTeacherAssignment[],
  periodRequirements: SubjectPeriodRequirement[],
  teacherAvailabilities: TeacherAvailability[],
  timeSlots: TimeSlot[],
  config: SolverConfig
): Activity[] {
  const activities: Activity[] = [];
  
  // Build lookup: gradeId + subjectId -> periodsPerWeek
  const periodLookup = new Map<string, number>();
  for (const req of periodRequirements) {
    const key = `${req.gradeId}:${req.subjectId}`;
    periodLookup.set(key, req.periodsPerWeek);
  }
  
  // Build lookup: teacherId -> available slot count
  const teacherAvailableSlots = calculateTeacherAvailableSlots(
    teacherAvailabilities,
    timeSlots,
    config
  );
  
  // Count how many classes each teacher has
  const teacherClassCount = new Map<string, number>();
  for (const assignment of assignments) {
    const count = teacherClassCount.get(assignment.teacherId) || 0;
    teacherClassCount.set(assignment.teacherId, count + 1);
  }
  
  // Generate activities for each assignment
  for (const assignment of assignments) {
    // Get grade from class (you'd need to join this in the query)
    const gradeId = assignment.class.gradeId;
    const lookupKey = `${gradeId}:${assignment.subjectId}`;
    const periodsPerWeek = periodLookup.get(lookupKey);
    
    if (!periodsPerWeek) {
      console.warn(
        `No period requirement found for ${assignment.subject.name} in grade ${gradeId}`
      );
      continue;
    }
    
    // Calculate constraint score
    // Higher score = more constrained = should be placed first
    const constraintScore = calculateConstraintScore(
      assignment,
      periodsPerWeek,
      teacherAvailableSlots.get(assignment.teacherId) || 0,
      teacherClassCount.get(assignment.teacherId) || 0
    );
    
    // Create one activity for each required period
    for (let i = 1; i <= periodsPerWeek; i++) {
      const activity: Activity = {
        id: `${assignment.id}-${i}`,
        assignmentId: assignment.id,
        subjectId: assignment.subjectId,
        teacherId: assignment.teacherId,
        classId: assignment.classId,
        gradeId: gradeId,
        termId: assignment.termId,
        instanceNumber: i,
        constraintScore,
        label: `${assignment.class.name}-${assignment.subject.code}-${i}`,
      };
      
      activities.push(activity);
    }
  }
  
  // Sort by constraint score (most constrained first)
  activities.sort((a, b) => b.constraintScore - a.constraintScore);
  
  return activities;
}

/**
 * Calculate how many slots each teacher is available for
 */
function calculateTeacherAvailableSlots(
  availabilities: TeacherAvailability[],
  timeSlots: TimeSlot[],
  config: SolverConfig
): Map<string, number> {
  const result = new Map<string, number>();
  
  // Get non-break slots
  const teachingSlots = timeSlots.filter(s => !s.isBreak);
  const totalPossibleSlots = teachingSlots.length * config.schoolDays.length;
  
  // Group availabilities by teacher
  const byTeacher = new Map<string, TeacherAvailability[]>();
  for (const avail of availabilities) {
    const list = byTeacher.get(avail.teacherId) || [];
    list.push(avail);
    byTeacher.set(avail.teacherId, list);
  }
  
  // Calculate available slots per teacher
  for (const [teacherId, teacherAvails] of byTeacher) {
    // Count unavailable slots
    const unavailableCount = teacherAvails.filter(a => !a.isAvailable).length;
    result.set(teacherId, totalPossibleSlots - unavailableCount);
  }
  
  return result;
}

/**
 * Calculate constraint score for an assignment
 * Higher score = more constrained = place first
 * 
 * This is the key heuristic that makes FET-style solvers efficient:
 * - Place the hardest activities first
 * - Reduces backtracking significantly
 */
function calculateConstraintScore(
  assignment: SubjectTeacherAssignment,
  periodsPerWeek: number,
  teacherAvailableSlots: number,
  teacherClassCount: number
): number {
  let score = 0;
  
  // More periods = more constrained
  score += periodsPerWeek * 10;
  
  // Fewer available slots = more constrained
  if (teacherAvailableSlots > 0) {
    score += Math.max(0, 50 - teacherAvailableSlots);
  } else {
    // Teacher has no availability info - assume fully available
    score += 0;
  }
  
  // Teacher with more classes = more constrained
  score += teacherClassCount * 5;
  
  return score;
}

/**
 * Group activities by class for easier processing
 */
export function groupActivitiesByClass(
  activities: Activity[]
): Map<string, Activity[]> {
  const result = new Map<string, Activity[]>();
  
  for (const activity of activities) {
    const list = result.get(activity.classId) || [];
    list.push(activity);
    result.set(activity.classId, list);
  }
  
  return result;
}

/**
 * Group activities by teacher for constraint checking
 */
export function groupActivitiesByTeacher(
  activities: Activity[]
): Map<string, Activity[]> {
  const result = new Map<string, Activity[]>();
  
  for (const activity of activities) {
    const list = result.get(activity.teacherId) || [];
    list.push(activity);
    result.set(activity.teacherId, list);
  }
  
  return result;
}

/**
 * Validate that all activities can theoretically be placed
 * (pre-flight check before solving)
 */
export function validateActivities(
  activities: Activity[],
  timeSlots: TimeSlot[],
  config: SolverConfig
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  const teachingSlots = timeSlots.filter(s => !s.isBreak);
  const slotsPerWeek = teachingSlots.length * config.schoolDays.length;
  
  // Check class totals
  const byClass = groupActivitiesByClass(activities);
  for (const [classId, classActivities] of byClass) {
    if (classActivities.length > slotsPerWeek) {
      errors.push(
        `Class ${classId} has ${classActivities.length} activities but only ${slotsPerWeek} slots available`
      );
    }
    
    // Check per-day limits
    const perDayNeeded = Math.ceil(classActivities.length / config.schoolDays.length);
    if (perDayNeeded > config.maxLessonsPerDayPerClass) {
      errors.push(
        `Class ${classId} needs ~${perDayNeeded} lessons/day but max is ${config.maxLessonsPerDayPerClass}`
      );
    }
  }
  
  // Check teacher totals
  const byTeacher = groupActivitiesByTeacher(activities);
  for (const [teacherId, teacherActivities] of byTeacher) {
    if (teacherActivities.length > slotsPerWeek) {
      errors.push(
        `Teacher ${teacherId} has ${teacherActivities.length} activities but only ${slotsPerWeek} slots available`
      );
    }
  }
  
  return {
    valid: errors.length === 0,
    errors,
  };
}
