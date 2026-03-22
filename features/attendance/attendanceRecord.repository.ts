import prisma from "@/lib/db/prisma";
import { Prisma } from "@/generated/prisma/client";
import { AttendanceRecord, AttendanceStatus } from "@/types/prisma-enums";

/**
 * AttendanceRecord Repository - Data Access Layer
 *
 * Manages student attendance records.
 * No business logic - pure data access.
 */
export class AttendanceRecordRepository {
  /**
   * Create a new attendance record
   */
  async create(data: Prisma.AttendanceRecordCreateInput): Promise<AttendanceRecord> {
    try {
      return await prisma.attendanceRecord.create({ data });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === "P2002") {
          throw new Error("Attendance record already exists for this student and date");
        }
        if (error.code === "P2003") {
          throw new Error("Referenced student, class, term, or teacher not found");
        }
      }
      throw error;
    }
  }

  /**
   * Create attendance record within transaction
   */
  async createInTransaction(
    tx: Prisma.TransactionClient,
    data: Prisma.AttendanceRecordCreateInput
  ): Promise<AttendanceRecord> {
    return tx.attendanceRecord.create({ data });
  }

  /**
   * Find attendance record by ID
   */
  async findById(id: string): Promise<AttendanceRecord | null> {
    return prisma.attendanceRecord.findUnique({
      where: { id },
    });
  }

  /**
   * Find attendance record by ID with relations
   */
  async findByIdWithRelations(id: string) {
    return prisma.attendanceRecord.findUnique({
      where: { id },
      include: {
        student: true,
        class: {
          include: {
            grade: true,
          },
        },
        term: {
          include: {
            academicYear: true,
          },
        },
        markedBy: true,
      },
    });
  }

  /**
   * Find all attendance records
   */
  async findAll(): Promise<AttendanceRecord[]> {
    return prisma.attendanceRecord.findMany({
      orderBy: { date: "desc" },
      include: {
        student: {
          select: {
            studentNumber: true,
            firstName: true,
            lastName: true,
          },
        },
        class: {
          select: {
            name: true,
          },
        },
      },
    });
  }

  /**
   * Find attendance records by student
   */
  async findByStudent(studentId: string): Promise<AttendanceRecord[]> {
    return prisma.attendanceRecord.findMany({
      where: { studentId },
      orderBy: { date: "desc" },
      include: {
        class: true,
        term: true,
      },
    });
  }

  /**
   * Find attendance records by class
   */
  async findByClass(classId: string): Promise<AttendanceRecord[]> {
    return prisma.attendanceRecord.findMany({
      where: { classId },
      orderBy: { date: "desc" },
      include: {
        student: true,
      },
    });
  }

  /**
   * Find attendance records by term
   */
  async findByTerm(termId: string): Promise<AttendanceRecord[]> {
    return prisma.attendanceRecord.findMany({
      where: { termId },
      orderBy: { date: "desc" },
      include: {
        student: true,
        class: true,
      },
    });
  }

  /**
   * Find attendance records by student and term
   */
  async findByStudentAndTerm(
    studentId: string,
    termId: string
  ): Promise<AttendanceRecord[]> {
    return prisma.attendanceRecord.findMany({
      where: {
        studentId,
        termId,
      },
      orderBy: { date: "asc" },
    });
  }

  /**
   * Find attendance records by class and date
   */
  async findByClassAndDate(
    classId: string,
    date: Date
  ): Promise<AttendanceRecord[]> {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    return prisma.attendanceRecord.findMany({
      where: {
        classId,
        date: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
      include: {
        student: true,
      },
    });
  }

  /**
   * Find attendance record by student, class and date
   * Uses the unique constraint: @@unique([studentId, classId, date])
   */
  async findByStudentClassAndDate(
    studentId: string,
    classId: string,
    date: Date
  ): Promise<AttendanceRecord | null> {
    // Use the actual unique constraint from schema: studentId_classId_date
    return prisma.attendanceRecord.findUnique({
      where: {
        studentId_classId_date: {
          studentId,
          classId,
          date,
        },
      },
    });
  }

  /**
   * Find attendance records by status
   */
  async findByStatus(status: AttendanceStatus): Promise<AttendanceRecord[]> {
    return prisma.attendanceRecord.findMany({
      where: { status },
      orderBy: { date: "desc" },
      include: {
        student: true,
        class: true,
      },
    });
  }

  /**
   * Find attendance records by date range
   */
  async findByDateRange(
    startDate: Date,
    endDate: Date
  ): Promise<AttendanceRecord[]> {
    return prisma.attendanceRecord.findMany({
      where: {
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      orderBy: { date: "asc" },
      include: {
        student: true,
        class: true,
      },
    });
  }

  /**
   * Get attendance statistics for a student in a term
   */
  async getStudentTermStats(studentId: string, termId: string) {
    const records = await this.findByStudentAndTerm(studentId, termId);

    const stats = {
      total: records.length,
      present: 0,
      absent: 0,
      late: 0,
      excused: 0,
    };

    records.forEach(record => {
      switch (record.status) {
        case "PRESENT":
          stats.present++;
          break;
        case "ABSENT":
          stats.absent++;
          break;
        case "LATE":
          stats.late++;
          break;
        case "EXCUSED":
          stats.excused++;
          break;
      }
    });

    return stats;
  }

  /**
   * Get attendance statistics for a class on a specific date
   */
  async getClassDateStats(classId: string, date: Date) {
    const records = await this.findByClassAndDate(classId, date);

    const stats = {
      total: records.length,
      present: 0,
      absent: 0,
      late: 0,
      excused: 0,
    };

    records.forEach(record => {
      switch (record.status) {
        case "PRESENT":
          stats.present++;
          break;
        case "ABSENT":
          stats.absent++;
          break;
        case "LATE":
          stats.late++;
          break;
        case "EXCUSED":
          stats.excused++;
          break;
      }
    });

    return stats;
  }

  /**
   * Find many with filters
   */
  async findMany(params: {
    skip?: number;
    take?: number;
    where?: Prisma.AttendanceRecordWhereInput;
    orderBy?: Prisma.AttendanceRecordOrderByWithRelationInput;
    include?: Prisma.AttendanceRecordInclude;
  }) {
    const { skip = 0, take = 50, where, orderBy, include } = params;

    return prisma.attendanceRecord.findMany({
      skip,
      take: Math.min(take, 100),
      where,
      orderBy: orderBy || { date: "desc" },
      include: include || {
        student: true,
        class: true,
      },
    });
  }

  /**
   * Count attendance records
   */
  async count(where?: Prisma.AttendanceRecordWhereInput): Promise<number> {
    return prisma.attendanceRecord.count({ where });
  }

  /**
   * Update attendance record
   */
  async update(
    id: string,
    data: Prisma.AttendanceRecordUpdateInput
  ): Promise<AttendanceRecord> {
    try {
      return await prisma.attendanceRecord.update({
        where: { id },
        data,
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === "P2025") {
          throw new Error("Attendance record not found");
        }
      }
      throw error;
    }
  }

  /**
   * Update status
   */
  async updateStatus(
    id: string,
    status: AttendanceStatus
  ): Promise<AttendanceRecord> {
    return this.update(id, { status });
  }

  /**
   * Delete attendance record
   */
  async delete(id: string): Promise<AttendanceRecord> {
    try {
      return await prisma.attendanceRecord.delete({
        where: { id },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === "P2025") {
          throw new Error("Attendance record not found");
        }
      }
      throw error;
    }
  }

  /**
   * Bulk create attendance records
   */
  async bulkCreate(
    data: Prisma.AttendanceRecordCreateManyInput[]
  ): Promise<Prisma.BatchPayload> {
    return prisma.attendanceRecord.createMany({
      data,
      skipDuplicates: true,
    });
  }

  /**
   * Delete attendance records by class and date
   */
  async deleteByClassAndDate(
    classId: string,
    date: Date
  ): Promise<Prisma.BatchPayload> {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    return prisma.attendanceRecord.deleteMany({
      where: {
        classId,
        date: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
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
export const attendanceRecordRepository = new AttendanceRecordRepository();
