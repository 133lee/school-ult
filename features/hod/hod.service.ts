import prisma from "@/lib/db/prisma";
import { StaffStatus, Gender, QualificationLevel, ClassStatus } from "@/generated/prisma/client";

/**
 * HOD Service
 *
 * Provides department-scoped data access for HOD users.
 * All methods filter data based on the HOD's department.
 */

interface TeacherFilters {
  status?: StaffStatus;
  gender?: Gender;
  qualification?: QualificationLevel;
  search?: string;
}

interface PaginationParams {
  page: number;
  pageSize: number;
}

export class HodService {
  /**
   * Get HOD's department ID
   *
   * Lookup path: User → TeacherProfile → Department (where hodTeacherId = teacherProfile.id)
   * HOD is a derived role, not a User relation
   */
  private async getHodDepartmentId(userId: string): Promise<string> {
    // First, get the teacher profile
    const teacher = await prisma.teacherProfile.findUnique({
      where: { userId },
      select: { id: true },
    });

    if (!teacher) {
      throw new Error("Teacher profile not found");
    }

    // Then, find the department where this teacher is the HOD
    const department = await prisma.department.findFirst({
      where: {
        hodTeacherId: teacher.id,
        status: "ACTIVE",
      },
      select: { id: true },
    });

    if (!department) {
      throw new Error("User is not an HOD of any active department");
    }

    return department.id;
  }

  /**
   * Get all teachers in HOD's department without pagination (for dropdowns/selectors)
   * Includes the HOD themselves
   */
  async getAllTeachers(
    userId: string,
    filters?: TeacherFilters
  ) {
    const departmentId = await this.getHodDepartmentId(userId);

    // Get HOD's teacher profile ID to include them in results
    const hodTeacher = await prisma.teacherProfile.findUnique({
      where: { userId },
      select: { id: true },
    });

    // Build where clause (same as getTeachers)
    const where: any = {
      deletedAt: null,
      OR: [
        {
          departments: {
            some: {
              departmentId: departmentId,
            },
          },
        },
        ...(hodTeacher ? [{ id: hodTeacher.id }] : []),
      ],
    };

    if (filters?.status) {
      where.status = filters.status;
    }

    if (filters?.gender) {
      where.gender = filters.gender;
    }

    if (filters?.qualification) {
      where.qualification = filters.qualification;
    }

    if (filters?.search) {
      where.OR = [
        { firstName: { contains: filters.search, mode: "insensitive" } },
        { lastName: { contains: filters.search, mode: "insensitive" } },
        { staffNumber: { contains: filters.search, mode: "insensitive" } },
      ];
    }

    return await prisma.teacherProfile.findMany({
      where,
      include: {
        user: {
          select: {
            email: true,
            isActive: true,
          },
        },
        departments: {
          include: {
            department: true,
          },
        },
        subjects: {
          include: {
            subject: true,
          },
        },
      },
      orderBy: [{ lastName: "asc" }, { firstName: "asc" }],
    });
  }

  /**
   * Get teachers in HOD's department
   * Includes the HOD themselves
   */
  async getTeachers(
    userId: string,
    filters?: TeacherFilters,
    pagination?: PaginationParams
  ) {
    const departmentId = await this.getHodDepartmentId(userId);

    // Get HOD's teacher profile ID to include them in results
    const hodTeacher = await prisma.teacherProfile.findUnique({
      where: { userId },
      select: { id: true },
    });

    const page = pagination?.page || 1;
    const pageSize = pagination?.pageSize || 10;
    const skip = (page - 1) * pageSize;

    // Build where clause for teachers in this department
    // Include teachers who are either:
    // 1. Members of the department (via TeacherDepartment), OR
    // 2. The HOD themselves
    const where: any = {
      deletedAt: null,
      OR: [
        {
          departments: {
            some: {
              departmentId: departmentId,
            },
          },
        },
        ...(hodTeacher ? [{ id: hodTeacher.id }] : []),
      ],
    };

    if (filters?.status) {
      where.status = filters.status;
    }

    if (filters?.gender) {
      where.gender = filters.gender;
    }

    if (filters?.qualification) {
      where.qualification = filters.qualification;
    }

    if (filters?.search) {
      where.OR = [
        { firstName: { contains: filters.search, mode: "insensitive" } },
        { lastName: { contains: filters.search, mode: "insensitive" } },
        { staffNumber: { contains: filters.search, mode: "insensitive" } },
      ];
    }

    // Get total count
    const total = await prisma.teacherProfile.count({ where });

    // Get teachers with their assigned subjects
    const teachers = await prisma.teacherProfile.findMany({
      where,
      include: {
        user: {
          select: {
            email: true,
            isActive: true,
          },
        },
        departments: {
          where: {
            departmentId: departmentId,
          },
          include: {
            department: {
              select: {
                name: true,
                code: true,
              },
            },
          },
        },
        subjects: {
          include: {
            subject: {
              select: {
                id: true,
                name: true,
                code: true,
              },
            },
          },
        },
      },
      orderBy: [
        { lastName: "asc" },
        { firstName: "asc" },
      ],
      skip,
      take: pageSize,
    });

    return {
      data: teachers,
      meta: {
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
      },
    };
  }

  /**
   * Get all subjects in HOD's department without pagination (for dropdowns/selectors)
   */
  async getAllSubjects(
    userId: string,
    search?: string
  ) {
    const departmentId = await this.getHodDepartmentId(userId);

    const where: any = {
      departmentId,
      deletedAt: null,
    };

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { code: { contains: search, mode: "insensitive" } },
      ];
    }

    return await prisma.subject.findMany({
      where,
      include: {
        department: {
          select: {
            id: true,
            name: true,
          },
        },
        teacherSubjects: {
          include: {
            teacher: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
              },
            },
          },
        },
      },
      orderBy: {
        name: "asc",
      },
    });
  }

  /**
   * Get subjects in HOD's department
   */
  async getSubjects(
    userId: string,
    search?: string,
    pagination?: PaginationParams
  ) {
    const departmentId = await this.getHodDepartmentId(userId);

    const page = pagination?.page || 1;
    const pageSize = pagination?.pageSize || 10;
    const skip = (page - 1) * pageSize;

    const where: any = {
      departmentId,
      deletedAt: null,
    };

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { code: { contains: search, mode: "insensitive" } },
      ];
    }

    // Get total count
    const total = await prisma.subject.count({ where });

    // Get subjects with department and assigned teachers
    const subjects = await prisma.subject.findMany({
      where,
      include: {
        department: {
          select: {
            id: true,
            name: true,
          },
        },
        teacherSubjects: {
          include: {
            teacher: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
              },
            },
          },
        },
      },
      orderBy: {
        name: "asc",
      },
      skip,
      take: pageSize,
    });

    return {
      data: subjects,
      meta: {
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
      },
    };
  }

  /**
   * Get classes filtered to secondary grades (8-12) only
   *
   * Note: Classes are NOT department-scoped. HOD sees all secondary classes
   * because they assign their department's subjects to teachers for these classes.
   * The department scoping happens at the assignment level, not the class level.
   */
  async getClasses(
    userId: string,
    filters?: {
      status?: ClassStatus;
      gradeId?: string;
      search?: string;
    },
    pagination?: PaginationParams
  ) {
    // Verify user is an HOD (throws if not)
    await this.getHodDepartmentId(userId);

    const page = pagination?.page || 1;
    const pageSize = pagination?.pageSize || 10;
    const skip = (page - 1) * pageSize;

    // Build where clause - filter to SECONDARY school level
    const where: any = {
      grade: {
        schoolLevel: "SECONDARY",
      },
    };

    if (filters?.status) {
      where.status = filters.status;
    }

    if (filters?.gradeId) {
      where.gradeId = filters.gradeId;
    }

    if (filters?.search) {
      where.OR = [
        { name: { contains: filters.search, mode: "insensitive" } },
        { grade: { name: { contains: filters.search, mode: "insensitive" } } },
      ];
    }

    // Get total count
    const total = await prisma.class.count({ where });

    // Get classes with grade, class teacher, and enrollment count
    const classes = await prisma.class.findMany({
      where,
      include: {
        grade: {
          select: {
            id: true,
            name: true,
            level: true,
            schoolLevel: true,
            sequence: true,
          },
        },
        classTeacherAssignments: {
          include: {
            teacher: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
              },
            },
          },
          take: 1, // Only need current class teacher
        },
        _count: {
          select: {
            enrollments: true,
          },
        },
      },
      orderBy: [
        { grade: { sequence: "asc" } },
        { name: "asc" },
      ],
      skip,
      take: pageSize,
    });

    // Transform to include currentEnrolled
    const data = classes.map((classItem) => ({
      ...classItem,
      currentEnrolled: classItem._count?.enrollments || 0,
    }));

    return {
      data,
      meta: {
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
      },
    };
  }
}

export const hodService = new HodService();
