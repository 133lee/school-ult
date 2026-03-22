/**
 * Report Card Components Export
 */

export { SeniorReportCard } from './SeniorReportCard';
export type { SeniorReportCardData } from './SeniorReportCard';

export { JuniorReportCard } from './JuniorReportCard';
export type { JuniorReportCardData } from './JuniorReportCard';

export { Form1ReportCard } from './Form1ReportCard';
export type { Form1ReportCardData } from './Form1ReportCard';

// Report card type selector based on grade level
export type ReportCardType = 'JUNIOR' | 'SENIOR' | 'FORM1';

export function getReportCardType(gradeLevel: string): ReportCardType {
  // Junior: Grades 8-9
  if (gradeLevel === 'GRADE_8' || gradeLevel === 'GRADE_9') {
    return 'JUNIOR';
  }

  // Senior: Grades 10-12
  if (
    gradeLevel === 'GRADE_10' ||
    gradeLevel === 'GRADE_11' ||
    gradeLevel === 'GRADE_12'
  ) {
    return 'SENIOR';
  }

  // Form 1-4 (if you're using Form naming)
  // Typically Form 1 = Grade 10 equivalent in some systems
  // Adjust based on your school's system
  if (gradeLevel.startsWith('FORM')) {
    return 'FORM1';
  }

  // Default to Senior
  return 'SENIOR';
}
