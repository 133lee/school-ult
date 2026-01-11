import { Prisma } from "@/generated/prisma/client";
import { Department, DepartmentStatus } from "@/types/prisma-enums";
import prisma from "@/lib/db/prisma";

/**
 * Department Repository - Data Access Layer
 *
 * Handles all database operations for departments.
 * This is a thin abstraction over Prisma with no business logic.
 */

export class DepartmentRepository {
  /**
   * Create a new department
   */
  async create(data: Prisma.DepartmentCreateInput): Promise<Department> {
    return await prisma.department.create({
      data,
    });
  }

  /**
   * Find all departments
   */
  async findAll(): Promise<Department[]> {
    return await prisma.department.findMany({
      orderBy: { name: "asc" },
    });
  }

  /**
   * Find department by ID
   */
  async findById(id: string): Promise<Department | null> {
    return await prisma.department.findUnique({
      where: { id },
    });
  }

  /**
   * Find department by ID with relations (subjects and teachers)
   */
  async findByIdWithRelations(id: string) {
    const department = await prisma.department.findUnique({
      where: { id },
      include: {
        hodTeacher: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            staffNumber: true,
            user: {
              select: {
                email: true,
              },
            },
          },
        },
        subjects: {
          include: {
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
          orderBy: { name: "asc" },
        },
        teachers: {
          include: {
            teacher: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                staffNumber: true,
                qualification: true,
              },
            },
          },
        },
      },
    });

    if (!department) {
      return null;
    }

    // Transform the data to flatten the teacher structure
    // Convert teachers: TeacherDepartment[] to teacherProfiles: TeacherProfile[]
    const { teachers, ...rest } = department;
    return {
      ...rest,
      teacherProfiles: teachers.map((td) => td.teacher),
    };
  }

  /**
   * Find department by code (case-insensitive)
   */
  async findByCode(code: string): Promise<Department | null> {
    return await prisma.department.findFirst({
      where: {
        code: {
          equals: code,
          mode: "insensitive",
        },
      },
    });
  }

  /**
   * Find department by name (case-insensitive)
   */
  async findByName(name: string): Promise<Department | null> {
    return await prisma.department.findFirst({
      where: {
        name: {
          equals: name,
          mode: "insensitive",
        },
      },
    });
  }

  /**
   * Find departments by status
   */
  async findByStatus(status: DepartmentStatus): Promise<Department[]> {
    return await prisma.department.findMany({
      where: { status },
      orderBy: { name: "asc" },
    });
  }

  /**
   * Find many departments with filters
   */
  async findMany(params: {
    skip?: number;
    take?: number;
    where?: Prisma.DepartmentWhereInput;
    orderBy?: Prisma.DepartmentOrderByWithRelationInput;
  }) {
    const { skip, take, where, orderBy } = params;
    const departments = await prisma.department.findMany({
      skip,
      take,
      where,
      orderBy: orderBy || { name: "asc" },
      include: {
        hodTeacher: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            user: {
              select: {
                email: true,
              },
            },
          },
        },
        _count: {
          select: {
            subjects: true,
            teachers: true,
          },
        },
      },
    });

    console.log("[REPOSITORY] findMany result - HOD data:", departments.map(d => ({
      departmentId: d.id,
      departmentName: d.name,
      hodTeacherId: d.hodTeacherId,
      hodTeacher: d.hodTeacher,
    })));

    return departments;
  }

  /**
   * Count departments with optional filters
   */
  async count(where?: Prisma.DepartmentWhereInput): Promise<number> {
    return await prisma.department.count({ where });
  }

  /**
   * Update a department
   */
  async update(
    id: string,
    data: Prisma.DepartmentUpdateInput
  ): Promise<Department> {
    return await prisma.department.update({
      where: { id },
      data,
    });
  }

  /**
   * Delete a department (hard delete)
   */
  async delete(id: string): Promise<Department> {
    return await prisma.department.delete({
      where: { id },
    });
  }

  /**
   * Check if department exists by code
   */
  async existsByCode(code: string): Promise<boolean> {
    const count = await prisma.department.count({
      where: {
        code: {
          equals: code,
          mode: "insensitive",
        },
      },
    });
    return count > 0;
  }

  /**
   * Check if department exists by name
   */
  async existsByName(name: string): Promise<boolean> {
    const count = await prisma.department.count({
      where: {
        name: {
          equals: name,
          mode: "insensitive",
        },
      },
    });
    return count > 0;
  }

  /**
   * Get subject count for a department
   */
  async getSubjectCount(departmentId: string): Promise<number> {
    return await prisma.subject.count({
      where: { departmentId },
    });
  }

  /**
   * Get teacher count for a department
   */
  async getTeacherCount(departmentId: string): Promise<number> {
    return await prisma.teacherDepartment.count({
      where: { departmentId },
    });
  }

  /**
   * Find teacher by ID (for HOD validation)
   */
  async findTeacherById(teacherId: string) {
    return await prisma.teacherProfile.findUnique({
      where: { id: teacherId },
      select: {
        id: true,
        status: true,
        firstName: true,
        lastName: true,
      },
    });
  }
}

export const departmentRepository = new DepartmentRepository();
