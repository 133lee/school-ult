/**
 * Timetable Solver Types
 * FET-style constraint-based timetable generation for Zambian schools
 */

// ============================================
// ENUMS (matching your Prisma schema)
// ============================================

export enum DayOfWeek {
  MONDAY = 'MONDAY',
  TUESDAY = 'TUESDAY',
  WEDNESDAY = 'WEDNESDAY',
  THURSDAY = 'THURSDAY',
  FRIDAY = 'FRIDAY',
  SATURDAY = 'SATURDAY',
  SUNDAY = 'SUNDAY',
}

export enum SchoolLevel {
  PRIMARY = 'PRIMARY',
  SECONDARY = 'SECONDARY',
}

// ============================================
// INPUT DATA TYPES (from your database)
// ============================================

export interface TimeSlot {
  id: string;
  name: string;
  startTime: string; // "07:30"
  endTime: string;   // "08:10"
  order: number;
  isBreak: boolean;
}

export interface Subject {
  id: string;
  name: string;
  code: string;
}

export interface TeacherProfile {
  id: string;
  employeeId: string;
  firstName: string;
  lastName: string;
}

export interface Class {
  id: string;
  name: string;        // "10A"
  gradeId: string;
  schoolLevel: SchoolLevel;
}

export interface Grade {
  id: string;
  name: string;        // "Grade 10"
  level: number;       // 10
  schoolLevel: SchoolLevel;
}

export interface SubjectTeacherAssignment {
  id: string;
  subjectId: string;
  teacherId: string;
  classId: string;
  termId: string;
  subject: Subject;
  teacher: TeacherProfile;
  class: Class;
}

export interface SubjectPeriodRequirement {
  id: string;
  subjectId: string;
  gradeId: string;
  periodsPerWeek: number;
  termId: string;
  subject: Subject;
  grade: Grade;
}

export interface TeacherAvailability {
  id: string;
  teacherId: string;
  termId: string;
  dayOfWeek: DayOfWeek;
  timeSlotId: string;
  isAvailable: boolean;
}

// ============================================
// SOLVER INTERNAL TYPES
// ============================================

/**
 * An Activity represents a single lesson that needs to be placed
 * e.g., "Grade 10A Math with Mr. Phiri" - one of 5 weekly instances
 */
export interface Activity {
  id: string;
  assignmentId: string;     // SubjectTeacherAssignment ID
  subjectId: string;
  teacherId: string;
  classId: string;
  gradeId: string;
  termId: string;
  instanceNumber: number;   // 1, 2, 3... for multiple periods per week
  
  // Computed constraint score (higher = more constrained = place first)
  constraintScore: number;
  
  // Metadata for debugging
  label: string;            // "10A-MATH-1"
}

/**
 * A Slot represents an available position in the timetable
 */
export interface Slot {
  dayOfWeek: DayOfWeek;
  timeSlotId: string;
  timeSlotOrder: number;
}

/**
 * A Placement is an Activity assigned to a Slot
 */
export interface Placement {
  activityId: string;
  activity: Activity;
  dayOfWeek: DayOfWeek;
  timeSlotId: string;
}

/**
 * Tracks what's already placed (for constraint checking)
 */
export interface TimetableState {
  // teacher -> day -> timeSlotId -> activityId
  teacherSchedule: Map<string, Map<DayOfWeek, Map<string, string>>>;
  
  // class -> day -> timeSlotId -> activityId
  classSchedule: Map<string, Map<DayOfWeek, Map<string, string>>>;
  
  // class -> subjectId -> count of placed activities
  subjectCount: Map<string, Map<string, number>>;
  
  // class -> day -> count of lessons
  classLessonsPerDay: Map<string, Map<DayOfWeek, number>>;
  
  // teacher -> day -> count of lessons
  teacherLessonsPerDay: Map<string, Map<DayOfWeek, number>>;
  
  // All placements
  placements: Placement[];
}

// ============================================
// CONSTRAINT TYPES
// ============================================

export interface HardConstraintResult {
  satisfied: boolean;
  reason?: string;
}

export interface SoftConstraintResult {
  score: number;        // 0-100, higher is better
  reason?: string;
}

// ============================================
// SOLVER CONFIGURATION
// ============================================

export interface SolverConfig {
  // Which days are school days
  schoolDays: DayOfWeek[];
  
  // Maximum lessons per day per class
  maxLessonsPerDayPerClass: number;
  
  // Maximum lessons per day per teacher
  maxLessonsPerDayPerTeacher: number;
  
  // Prefer spreading subjects across the week
  spreadSubjectsAcrossWeek: boolean;
  
  // Avoid placing same subject on consecutive days
  avoidConsecutiveDays: boolean;
  
  // Prefer morning slots for core subjects
  preferMorningForCore: boolean;
  
  // Core subject IDs (for morning preference)
  coreSubjectIds: string[];
  
  // Maximum attempts before giving up
  maxAttempts: number;
  
  // Enable backtracking
  enableBacktracking: boolean;
  
  // Maximum backtrack depth
  maxBacktrackDepth: number;
}

export const DEFAULT_CONFIG: SolverConfig = {
  schoolDays: [
    DayOfWeek.MONDAY,
    DayOfWeek.TUESDAY,
    DayOfWeek.WEDNESDAY,
    DayOfWeek.THURSDAY,
    DayOfWeek.FRIDAY,
  ],
  maxLessonsPerDayPerClass: 8,
  maxLessonsPerDayPerTeacher: 6,
  spreadSubjectsAcrossWeek: true,
  avoidConsecutiveDays: false,
  preferMorningForCore: true,
  coreSubjectIds: [],
  maxAttempts: 1000,
  enableBacktracking: true,
  maxBacktrackDepth: 50,
};

// ============================================
// SOLVER INPUT/OUTPUT
// ============================================

export interface SolverInput {
  termId: string;
  academicYearId: string;
  timeSlots: TimeSlot[];
  assignments: SubjectTeacherAssignment[];
  periodRequirements: SubjectPeriodRequirement[];
  teacherAvailabilities: TeacherAvailability[];
  config?: Partial<SolverConfig>;
}

export interface SolverOutput {
  success: boolean;
  placements: Placement[];
  unplacedActivities: Activity[];
  stats: {
    totalActivities: number;
    placedActivities: number;
    unplacedActivities: number;
    attempts: number;
    backtrackCount: number;
    duration: number; // ms
  };
  errors: string[];
  warnings: string[];
}

// ============================================
// DATABASE OUTPUT TYPES (for writing results)
// ============================================

export interface ClassTimetableEntry {
  classId: string;
  subjectId: string;
  teacherId: string;
  timeSlotId: string;
  termId: string;
  dayOfWeek: DayOfWeek;
}

export interface SecondaryTimetableEntry {
  classId: string;
  subjectId: string;
  teacherId: string;
  timeSlotId: string;
  termId: string;
  dayOfWeek: DayOfWeek;
}
