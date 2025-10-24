import { Prisma } from '@prisma/client'

// =============================================
// EXTENDED PRISMA TYPES WITH RELATIONS
// =============================================

// Student with common relations
export type StudentWithDetails = Prisma.StudentGetPayload<{
  include: {
    gradeLevel: true
    enrollments: {
      include: {
        class: true
        subject: true
        term: true
      }
    }
    parentRelations: {
      include: {
        parent: true
      }
    }
  }
}>

// User with role-specific data
export type UserWithProfile = Prisma.UserGetPayload<{
  include: {
    teacherClassAssignments: {
      include: {
        class: true
      }
    }
    teacherSubjectAssignments: {
      include: {
        subject: true
      }
    }
    parentRelations: {
      include: {
        student: true
      }
    }
  }
}>

// Class with full details
export type ClassWithDetails = Prisma.ClassGetPayload<{
  include: {
    gradeLevel: true
    academicYear: true
    subject: true
    enrollments: {
      include: {
        student: true
      }
    }
    teacherAssignments: {
      include: {
        teacher: true
      }
    }
  }
}>

// Assessment with grades
export type AssessmentWithGrades = Prisma.AssessmentGetPayload<{
  include: {
    assessmentType: true
    subject: true
    class: true
    gradeLevel: true
    term: true
    grades: {
      include: {
        student: true
        enteredBy: true
      }
    }
  }
}>

// Report card with all data
export type ReportCardWithDetails = Prisma.ReportCardGetPayload<{
  include: {
    student: {
      include: {
        gradeLevel: true
      }
    }
    academicYear: true
    term: true
  }
}>

// Attendance with student info
export type AttendanceWithDetails = Prisma.AttendanceGetPayload<{
  include: {
    student: {
      include: {
        gradeLevel: true
      }
    }
    class: true
    term: true
    markedBy: true
  }
}>

// Grade with full context
export type GradeWithContext = Prisma.GradeGetPayload<{
  include: {
    student: {
      include: {
        gradeLevel: true
      }
    }
    assessment: {
      include: {
        assessmentType: true
        subject: true
      }
    }
    subject: true
    enteredBy: true
  }
}>

// =============================================
// INPUT TYPES FOR FORMS
// =============================================

// Student creation input
export type StudentCreateInput = Omit<
  Prisma.StudentCreateInput,
  'gradeLevel' | 'enrollments' | 'grades' | 'reportCards' | 'parentRelations' | 'attendance' | 'disciplinaryRecords'
> & {
  gradeLevelId: string
}

// User creation input
export type UserCreateInput = Omit<
  Prisma.UserCreateInput,
  | 'sessions'
  | 'teacherClassAssignments'
  | 'teacherSubjectAssignments'
  | 'gradesEntered'
  | 'parentRelations'
  | 'subjectsCreated'
  | 'subjectsUpdated'
  | 'auditLogs'
  | 'notifications'
  | 'attendanceMarked'
  | 'disciplinaryReports'
  | 'fileUploads'
  | 'timetableSlots'
>

// Assessment creation input
export type AssessmentCreateInput = {
  title: string
  description?: string
  maxScore: number
  passingScore: number
  academicYearId: string
  termId: string
  gradeLevelId: string
  assessmentTypeId: string
  subjectId: string
  classId: string
  scheduledDate?: Date
  dueDate?: Date
}

// Grade creation input
export type GradeCreateInput = {
  studentId: string
  assessmentId: string
  subjectId: string
  score?: number
  maxScore: number
  percentage?: number
  letterGrade?: string
  points?: number
  isAbsent?: boolean
  isExcused?: boolean
  remarks?: string
  enteredById: string
}

// =============================================
// FILTER AND QUERY TYPES
// =============================================

// Student filters
export interface StudentFilters {
  gradeLevelId?: string
  isActive?: boolean
  search?: string
  gender?: string
  feeStatus?: string
}

// User filters
export interface UserFilters {
  role?: string[]
  isActive?: boolean
  isVerified?: boolean
  search?: string
}

// Class filters
export interface ClassFilters {
  gradeLevelId?: string
  academicYearId?: string
  isActive?: boolean
  search?: string
}

// Assessment filters
export interface AssessmentFilters {
  academicYearId?: string
  termId?: string
  gradeLevelId?: string
  subjectId?: string
  classId?: string
  assessmentTypeId?: string
  isPublished?: boolean
}

// Attendance filters
export interface AttendanceFilters {
  studentId?: string
  classId?: string
  termId?: string
  startDate?: Date
  endDate?: Date
  status?: string
}

// =============================================
// PAGINATION TYPES
// =============================================

export interface PaginationParams {
  page?: number
  limit?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    total: number
    page: number
    limit: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  }
}

// =============================================
// HELPER TYPES
// =============================================

// Soft delete support
export type WithDeleted<T> = T & {
  deletedAt: Date | null
  deletedBy: string | null
}

// Audit fields
export type WithAudit<T> = T & {
  createdAt: Date
  updatedAt: Date
  createdBy?: string | null
  updatedBy?: string | null
  version: number
}

// API Response
export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: {
    code: string
    message: string
    details?: any
  }
  meta?: {
    timestamp: Date
    requestId?: string
  }
}

// =============================================
// STATISTICAL TYPES
// =============================================

export interface StudentStatistics {
  totalStudents: number
  activeStudents: number
  byGradeLevel: Record<string, number>
  byGender: Record<string, number>
  attendanceRate: number
}

export interface AcademicStatistics {
  averageGrade: number
  passingRate: number
  topPerformers: Array<{
    studentId: string
    studentName: string
    average: number
  }>
  subjectPerformance: Record<
    string,
    {
      average: number
      passingRate: number
    }
  >
}

export interface AttendanceStatistics {
  totalDays: number
  presentDays: number
  absentDays: number
  lateDays: number
  attendanceRate: number
}

// =============================================
// REPORT TYPES
// =============================================

export interface StudentReportData {
  student: StudentWithDetails
  term: {
    id: string
    name: string
    number: number
  }
  academicYear: {
    id: string
    name: string
  }
  grades: Array<{
    subject: {
      name: string
      code: string
    }
    assessments: Array<{
      type: string
      score: number
      maxScore: number
      percentage: number
    }>
    average: number
    letterGrade: string
    points: number
  }>
  overallAverage: number
  overallGrade: string
  totalPoints: number
  rank?: number
  totalStudents?: number
  attendance: AttendanceStatistics
  remarks?: string
}

// =============================================
// ZAMBIAN EDUCATION SYSTEM TYPES
// =============================================

export type EducationLevel = 'PRIMARY' | 'JUNIOR' | 'SENIOR'

export interface ZambianGradeLevel {
  code: string
  name: string
  numericLevel: number
  category: EducationLevel
  isNationalExamYear: boolean // Grade 7, 9, 12
}

// National exam years in Zambia
export const NATIONAL_EXAM_YEARS = [7, 9, 12] as const

// Grade level categories
export const GRADE_CATEGORIES = {
  PRIMARY: [1, 2, 3, 4, 5, 6, 7],
  JUNIOR: [8, 9],
  SENIOR: [10, 11, 12],
} as const
