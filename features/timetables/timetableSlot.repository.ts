import prisma from "@/lib/db/prisma";
import { Prisma } from "@/generated/prisma/client";
import { TimetableSlot, DayOfWeek } from "@/types/prisma-enums";

/**
 * TimetableSlot Repository - Data Access Layer
 *
 * Manages class timetables/schedules.
 * No business logic - pure data access.
 */
export class TimetableSlotRepository {
  /**
   * Create a new timetable slot
   */
  async create(data: Prisma.TimetableSlotCreateInput): Promise<TimetableSlot> {
    try {
      return await prisma.timetableSlot.create({ data });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === "P2002") {
          throw new Error("A slot already exists for this class, day, and period");
        }
        if (error.code === "P2003") {
          throw new Error("Referenced class, subject, teacher, or academic year not found");
        }
      }
      throw error;
    }
  }

  /**
   * Create timetable slot within transaction
   */
  async createInTransaction(
    tx: Prisma.TransactionClient,
    data: Prisma.TimetableSlotCreateInput
  ): Promise<TimetableSlot> {
    return tx.timetableSlot.create({ data });
  }

  /**
   * Find timetable slot by ID
   */
  async findById(id: string): Promise<TimetableSlot | null> {
    return prisma.timetableSlot.findUnique({
      where: { id },
    });
  }

  /**
   * Find timetable slot by ID with relations
   */
  async findByIdWithRelations(id: string) {
    return prisma.timetableSlot.findUnique({
      where: { id },
      include: {
        class: {
          include: {
            grade: true,
          },
        },
        subject: true,
        teacher: true,
        academicYear: true,
      },
    });
  }

  /**
   * Find all timetable slots
   */
  async findAll(): Promise<TimetableSlot[]> {
    return prisma.timetableSlot.findMany({
      orderBy: [
        { dayOfWeek: "asc" },
        { periodNumber: "asc" },
      ],
      include: {
        class: {
          select: {
            name: true,
            grade: {
              select: {
                name: true,
              },
            },
          },
        },
        subject: {
          select: {
            name: true,
            code: true,
          },
        },
        teacher: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
      },
    });
  }

  /**
   * Find timetable slots by class
   */
  async findByClass(classId: string): Promise<TimetableSlot[]> {
    return prisma.timetableSlot.findMany({
      where: { classId },
      orderBy: [
        { dayOfWeek: "asc" },
        { periodNumber: "asc" },
      ],
      include: {
        subject: true,
        teacher: true,
      },
    });
  }

  /**
   * Find timetable slots by teacher
   */
  async findByTeacher(teacherId: string): Promise<TimetableSlot[]> {
    return prisma.timetableSlot.findMany({
      where: { teacherId },
      orderBy: [
        { dayOfWeek: "asc" },
        { periodNumber: "asc" },
      ],
      include: {
        class: {
          include: {
            grade: true,
          },
        },
        subject: true,
      },
    });
  }

  /**
   * Find timetable slots by subject
   */
  async findBySubject(subjectId: string): Promise<TimetableSlot[]> {
    return prisma.timetableSlot.findMany({
      where: { subjectId },
      orderBy: [
        { dayOfWeek: "asc" },
        { periodNumber: "asc" },
      ],
      include: {
        class: {
          include: {
            grade: true,
          },
        },
        teacher: true,
      },
    });
  }

  /**
   * Find timetable slots by academic year
   */
  async findByAcademicYear(academicYearId: string): Promise<TimetableSlot[]> {
    return prisma.timetableSlot.findMany({
      where: { academicYearId },
      orderBy: [
        { dayOfWeek: "asc" },
        { periodNumber: "asc" },
      ],
      include: {
        class: {
          include: {
            grade: true,
          },
        },
        subject: true,
        teacher: true,
      },
    });
  }

  /**
   * Find timetable slots by class and academic year
   */
  async findByClassAndYear(
    classId: string,
    academicYearId: string
  ): Promise<TimetableSlot[]> {
    return prisma.timetableSlot.findMany({
      where: {
        classId,
        academicYearId,
      },
      orderBy: [
        { dayOfWeek: "asc" },
        { periodNumber: "asc" },
      ],
      include: {
        subject: true,
        teacher: true,
      },
    });
  }

  /**
   * Find timetable slots by day of week
   */
  async findByDay(dayOfWeek: DayOfWeek): Promise<TimetableSlot[]> {
    return prisma.timetableSlot.findMany({
      where: { dayOfWeek },
      orderBy: { periodNumber: "asc" },
      include: {
        class: {
          include: {
            grade: true,
          },
        },
        subject: true,
        teacher: true,
      },
    });
  }

  /**
   * Find timetable slots by class and day
   */
  async findByClassAndDay(
    classId: string,
    dayOfWeek: DayOfWeek
  ): Promise<TimetableSlot[]> {
    return prisma.timetableSlot.findMany({
      where: {
        classId,
        dayOfWeek,
      },
      orderBy: { periodNumber: "asc" },
      include: {
        subject: true,
        teacher: true,
      },
    });
  }

  /**
   * Find timetable slot by unique constraint
   */
  async findByClassDayPeriod(
    classId: string,
    dayOfWeek: DayOfWeek,
    periodNumber: number,
    academicYearId: string
  ): Promise<TimetableSlot | null> {
    return prisma.timetableSlot.findUnique({
      where: {
        classId_dayOfWeek_periodNumber_academicYearId: {
          classId,
          dayOfWeek,
          periodNumber,
          academicYearId,
        },
      },
    });
  }

  /**
   * Check if teacher has conflict at specific time
   */
  async checkTeacherConflict(
    teacherId: string,
    dayOfWeek: DayOfWeek,
    periodNumber: number,
    academicYearId: string,
    excludeSlotId?: string
  ): Promise<boolean> {
    const conflict = await prisma.timetableSlot.findFirst({
      where: {
        teacherId,
        dayOfWeek,
        periodNumber,
        academicYearId,
        ...(excludeSlotId ? { id: { not: excludeSlotId } } : {}),
      },
    });
    return conflict !== null;
  }

  /**
   * Find many with filters
   */
  async findMany(params: {
    skip?: number;
    take?: number;
    where?: Prisma.TimetableSlotWhereInput;
    orderBy?: Prisma.TimetableSlotOrderByWithRelationInput;
    include?: Prisma.TimetableSlotInclude;
  }) {
    const { skip = 0, take = 50, where, orderBy, include } = params;

    return prisma.timetableSlot.findMany({
      skip,
      take: Math.min(take, 100),
      where,
      orderBy: orderBy || [
        { dayOfWeek: "asc" },
        { periodNumber: "asc" },
      ],
      include: include || {
        class: {
          include: {
            grade: true,
          },
        },
        subject: true,
        teacher: true,
      },
    });
  }

  /**
   * Count timetable slots
   */
  async count(where?: Prisma.TimetableSlotWhereInput): Promise<number> {
    return prisma.timetableSlot.count({ where });
  }

  /**
   * Update timetable slot
   */
  async update(
    id: string,
    data: Prisma.TimetableSlotUpdateInput
  ): Promise<TimetableSlot> {
    try {
      return await prisma.timetableSlot.update({
        where: { id },
        data,
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === "P2025") {
          throw new Error("Timetable slot not found");
        }
        if (error.code === "P2002") {
          throw new Error("A slot already exists for this class, day, and period");
        }
      }
      throw error;
    }
  }

  /**
   * Delete timetable slot
   */
  async delete(id: string): Promise<TimetableSlot> {
    try {
      return await prisma.timetableSlot.delete({
        where: { id },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === "P2025") {
          throw new Error("Timetable slot not found");
        }
      }
      throw error;
    }
  }

  /**
   * Delete all slots for a class and academic year
   */
  async deleteByClassAndYear(
    classId: string,
    academicYearId: string
  ): Promise<Prisma.BatchPayload> {
    return prisma.timetableSlot.deleteMany({
      where: {
        classId,
        academicYearId,
      },
    });
  }

  /**
   * Bulk create timetable slots
   */
  async bulkCreate(
    data: Prisma.TimetableSlotCreateManyInput[]
  ): Promise<Prisma.BatchPayload> {
    return prisma.timetableSlot.createMany({
      data,
      skipDuplicates: true,
    });
  }

  /**
   * Transaction wrapper
   */
  async withTransaction<T>(
    fn: (tx: Prisma.TransactionClient) => Promise<T>
  ): Promise<T> {
    return prisma.$transaction(fn);
  }
}

// Singleton instance
export const timetableSlotRepository = new TimetableSlotRepository();
