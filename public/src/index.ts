/**
 * Timetable Solver
 * FET-style constraint-based timetable generation for Zambian schools
 * 
 * @author Lee (Kambombo Day Secondary School)
 * @version 1.0.0
 */

// Export types
export * from './types';

// Export activity generator
export {
  generateActivities,
  groupActivitiesByClass,
  groupActivitiesByTeacher,
  validateActivities,
} from './activity-generator';

// Export constraint checker
export {
  checkTeacherFree,
  checkClassFree,
  checkTeacherAvailability,
  checkClassMaxLessonsPerDay,
  checkTeacherMaxLessonsPerDay,
  checkAllHardConstraints,
  scoreSubjectSpread,
  scoreMorningPreference,
  scoreTeacherBalance,
  scoreAvoidConsecutiveDays,
  calculateSoftScore,
  buildAvailabilityLookup,
} from './constraint-checker';

// Export solver
export { solve, solveQuick } from './solver';

// Export database writer
export {
  toClassTimetableEntries,
  toSecondaryTimetableEntries,
  generateClassTimetableCreateData,
  generateSecondaryTimetableCreateData,
  generatePrismaOperations,
  generateReport,
  generateClassGrid,
} from './database-writer';
