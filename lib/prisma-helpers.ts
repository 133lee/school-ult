import { prisma } from './prisma'
import { Prisma } from '@prisma/client'
import type { PaginationParams, PaginatedResponse } from './prisma-types'

// =============================================
// PAGINATION HELPER
// =============================================

export async function paginate<T, K extends Prisma.ModelName>(
  model: K,
  params: {
    where?: any
    include?: any
    orderBy?: any
    pagination: PaginationParams
  }
): Promise<PaginatedResponse<T>> {
  const { where = {}, include, orderBy, pagination } = params
  const { page = 1, limit = 10, sortBy, sortOrder = 'desc' } = pagination

  const skip = (page - 1) * limit
  const take = limit

  // Build orderBy
  const order = sortBy ? { [sortBy]: sortOrder } : { createdAt: sortOrder }

  // Get the model delegate
  const modelDelegate = (prisma as any)[model.toLowerCase()]

  // Execute queries in parallel
  const [data, total] = await Promise.all([
    modelDelegate.findMany({
      where,
      include,
      orderBy: order,
      skip,
      take,
    }),
    modelDelegate.count({ where }),
  ])

  const totalPages = Math.ceil(total / limit)

  return {
    data,
    pagination: {
      total,
      page,
      limit,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    },
  }
}

// =============================================
// SOFT DELETE HELPERS
// =============================================

export async function softDelete<T extends { deletedAt?: Date | null }>(
  model: any,
  id: string,
  deletedBy?: string
): Promise<T> {
  return await model.update({
    where: { id },
    data: {
      deletedAt: new Date(),
      deletedBy,
    },
  })
}

export async function restore<T>(model: any, id: string): Promise<T> {
  return await model.update({
    where: { id },
    data: {
      deletedAt: null,
      deletedBy: null,
    },
  })
}

export function excludeDeleted<T extends { deletedAt?: Date | null }>(
  where: any = {}
): any {
  return {
    ...where,
    deletedAt: null,
  }
}

// =============================================
// AUDIT HELPERS
// =============================================

export async function createAuditLog(params: {
  userId?: string
  sessionId?: string
  action: string
  entity: string
  entityId?: string
  oldData?: any
  newData?: any
  ipAddress?: string
  userAgent?: string
  requestId?: string
  endpoint?: string
  method?: string
  success?: boolean
  errorMessage?: string
  duration?: number
}) {
  return await prisma.auditLog.create({
    data: {
      ...params,
      oldData: params.oldData ? JSON.parse(JSON.stringify(params.oldData)) : undefined,
      newData: params.newData ? JSON.parse(JSON.stringify(params.newData)) : undefined,
    },
  })
}

// =============================================
// TRANSACTION HELPERS
// =============================================

export async function executeInTransaction<T>(
  callback: (tx: Prisma.TransactionClient) => Promise<T>
): Promise<T> {
  return await prisma.$transaction(callback)
}

// =============================================
// SEARCH HELPERS
// =============================================

export function buildSearchFilter(
  fields: string[],
  searchTerm?: string
): any | undefined {
  if (!searchTerm) return undefined

  return {
    OR: fields.map((field) => ({
      [field]: {
        contains: searchTerm,
        mode: 'insensitive' as Prisma.QueryMode,
      },
    })),
  }
}

// =============================================
// STUDENT HELPERS
// =============================================

export async function getStudentWithFullDetails(studentId: string) {
  return await prisma.student.findUnique({
    where: { id: studentId },
    include: {
      gradeLevel: true,
      enrollments: {
        where: { isActive: true },
        include: {
          class: true,
          subject: true,
          term: true,
          academicYear: true,
        },
      },
      parentRelations: {
        where: { deletedAt: null },
        include: {
          parent: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              phone: true,
              alternativePhone: true,
              occupation: true,
              workPhone: true,
            },
          },
        },
      },
      grades: {
        include: {
          assessment: {
            include: {
              assessmentType: true,
              subject: true,
            },
          },
          subject: true,
        },
      },
      attendance: {
        orderBy: { date: 'desc' },
        take: 30, // Last 30 days
        include: {
          class: true,
        },
      },
      disciplinaryRecords: {
        where: { deletedAt: null },
        orderBy: { dateOccurred: 'desc' },
      },
      reportCards: {
        orderBy: { createdAt: 'desc' },
      },
    },
  })
}

export async function getActiveStudents(filters?: {
  gradeLevelId?: string
  search?: string
}) {
  const where: Prisma.StudentWhereInput = {
    isActive: true,
    deletedAt: null,
    ...(filters?.gradeLevelId && { gradeLevelId: filters.gradeLevelId }),
    ...(filters?.search && {
      OR: [
        { firstName: { contains: filters.search, mode: 'insensitive' } },
        { lastName: { contains: filters.search, mode: 'insensitive' } },
        { studentNumber: { contains: filters.search, mode: 'insensitive' } },
      ],
    }),
  }

  return await prisma.student.findMany({
    where,
    include: {
      gradeLevel: true,
    },
    orderBy: [{ lastName: 'asc' }, { firstName: 'asc' }],
  })
}

// =============================================
// GRADE/ASSESSMENT HELPERS
// =============================================

export async function calculateStudentAverage(
  studentId: string,
  termId: string,
  subjectId?: string
) {
  const where: Prisma.GradeWhereInput = {
    studentId,
    assessment: {
      termId,
      ...(subjectId && { subjectId }),
    },
    isPublished: true,
    deletedAt: null,
  }

  const grades = await prisma.grade.findMany({
    where,
    include: {
      assessment: {
        include: {
          assessmentType: true,
        },
      },
    },
  })

  if (grades.length === 0) return null

  // Calculate weighted average based on assessment type weights
  let totalWeightedScore = 0
  let totalWeight = 0

  for (const grade of grades) {
    if (grade.percentage !== null) {
      const weight = grade.assessment.assessmentType.weight
      totalWeightedScore += grade.percentage * weight
      totalWeight += weight
    }
  }

  return totalWeight > 0 ? totalWeightedScore / totalWeight : null
}

export async function getClassAverages(
  classId: string,
  termId: string,
  subjectId?: string
) {
  const enrollments = await prisma.enrollment.findMany({
    where: {
      classId,
      termId,
      isActive: true,
      ...(subjectId && { subjectId }),
    },
    include: {
      student: true,
    },
  })

  const averages = await Promise.all(
    enrollments.map(async (enrollment) => {
      const average = await calculateStudentAverage(
        enrollment.student.id,
        termId,
        subjectId
      )
      return {
        student: enrollment.student,
        average,
      }
    })
  )

  return averages.filter((a) => a.average !== null)
}

// =============================================
// ATTENDANCE HELPERS
// =============================================

export async function calculateAttendanceRate(
  studentId: string,
  startDate: Date,
  endDate: Date
) {
  const attendance = await prisma.attendance.findMany({
    where: {
      studentId,
      date: {
        gte: startDate,
        lte: endDate,
      },
      deletedAt: null,
    },
  })

  const total = attendance.length
  if (total === 0) return 0

  const present = attendance.filter(
    (a) => a.status === 'PRESENT' || a.status === 'LATE'
  ).length

  return (present / total) * 100
}

export async function getClassAttendanceForDate(classId: string, date: Date) {
  return await prisma.attendance.findMany({
    where: {
      classId,
      date: {
        gte: new Date(date.setHours(0, 0, 0, 0)),
        lte: new Date(date.setHours(23, 59, 59, 999)),
      },
      deletedAt: null,
    },
    include: {
      student: {
        include: {
          gradeLevel: true,
        },
      },
      markedBy: {
        select: {
          firstName: true,
          lastName: true,
        },
      },
    },
  })
}

// =============================================
// ACADEMIC YEAR/TERM HELPERS
// =============================================

export async function getCurrentAcademicYear() {
  return await prisma.academicYear.findFirst({
    where: {
      isCurrent: true,
      isActive: true,
      deletedAt: null,
    },
    include: {
      terms: {
        where: {
          isActive: true,
          deletedAt: null,
        },
        orderBy: {
          number: 'asc',
        },
      },
    },
  })
}

export async function getCurrentTerm() {
  return await prisma.term.findFirst({
    where: {
      isCurrent: true,
      isActive: true,
      deletedAt: null,
    },
    include: {
      academicYear: true,
    },
  })
}

// =============================================
// NOTIFICATION HELPERS
// =============================================

export async function createNotification(params: {
  userId: string
  title: string
  message: string
  type: any // NotificationType
  data?: any
  priority?: any // NotificationPriority
  deliveryMethod?: string[]
}) {
  return await prisma.notification.create({
    data: {
      userId: params.userId,
      title: params.title,
      message: params.message,
      type: params.type,
      data: params.data,
      priority: params.priority || 'NORMAL',
      deliveryMethod: params.deliveryMethod || ['IN_APP'],
    },
  })
}

export async function markNotificationAsRead(notificationId: string) {
  return await prisma.notification.update({
    where: { id: notificationId },
    data: {
      isRead: true,
      readAt: new Date(),
    },
  })
}

// =============================================
// SCHOOL SETTINGS HELPERS
// =============================================

export async function getSchoolSettings() {
  const settings = await prisma.schoolSettings.findFirst()
  if (!settings) {
    throw new Error('School settings not configured')
  }
  return settings
}

export async function updateSchoolSettings(data: Partial<Prisma.SchoolSettingsUpdateInput>) {
  const settings = await getSchoolSettings()
  return await prisma.schoolSettings.update({
    where: { id: settings.id },
    data,
  })
}
