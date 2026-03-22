import { Prisma } from "@/generated/prisma/client";
import { AttendanceRecord, AttendanceStatus, Role } from "@/types/prisma-enums";
import { attendanceRecordRepository } from "./attendanceRecord.repository";
import { classRepository } from "../classes/class.repository";
import { termRepository } from "../terms/term.repository";
import { studentRepository } from "../students/student.repository";
import { UnauthorizedError, NotFoundError, ValidationError } from "@/lib/errors";
import { requireMinimumRole, AuthContext } from "@/lib/auth/authorization";
import {
  normalizeToUtcMidnight,
  normalizeToUtcEndOfDay,
  getTodayUtcMidnight,
} from "@/lib/utils/date-utils";

/**
 * AttendanceRecord Service - Business Logic Layer
 *
 * Manages student attendance tracking.
 * Handles marking attendance, statistics, and reports.
 */

// Service context for authorization (use centralized type)
export type ServiceContext = AuthContext & {
  teacherProfileId?: string; // For tracking who marked attendance
};

// Input DTOs
export interface MarkAttendanceInput {
  studentId: string;
  classId: string;
  termId: string;
  date: Date;
  status: AttendanceStatus;
  remarks?: string;
}

export interface BulkMarkAttendanceInput {
  classId: string;
  termId: string;
  date: Date;
  records: Array<{
    studentId: string;
    status: AttendanceStatus;
    remarks?: string;
  }>;
}

export interface AttendanceFilters {
  studentId?: string;
  classId?: string;
  termId?: string;
  status?: AttendanceStatus;
  dateFrom?: Date;
  dateTo?: Date;
}

export interface PaginationParams {
  page: number;
  pageSize: number;
}

export class AttendanceRecordService {
  // ==================== PERMISSION CHECKS ====================
  // With role hierarchy, these checks are now much simpler
  // Teachers and above can mark attendance
  // HEAD_TEACHER and above can delete attendance

  // ==================== VALIDATION ====================

  /**
   * Validate that date is within term dates
   */
  private async validateDateInTerm(date: Date, termId: string): Promise<void> {
    const term = await termRepository.findById(termId);
    if (!term) {
      throw new NotFoundError("Term not found");
    }

    // Normalize all dates to UTC midnight for consistent comparison
    const dateOnly = normalizeToUtcMidnight(date);
    const termStart = normalizeToUtcMidnight(term.startDate);
    const termEnd = normalizeToUtcEndOfDay(term.endDate);

    if (dateOnly < termStart || dateOnly > termEnd) {
      throw new ValidationError("Attendance date must be within term dates");
    }
  }

  /**
   * Validate that date is not in the future
   */
  private validateDateNotFuture(date: Date): void {
    const today = getTodayUtcMidnight();
    const dateOnly = normalizeToUtcMidnight(date);

    if (dateOnly > today) {
      throw new ValidationError("Cannot mark attendance for future dates");
    }
  }

  // ==================== BUSINESS LOGIC ====================

  /**
   * Mark attendance for a single student
   */
  async markAttendance(
    data: MarkAttendanceInput,
    context: ServiceContext
  ): Promise<AttendanceRecord> {
    // Authorization: Teachers and above can mark attendance
    requireMinimumRole(
      context,
      Role.TEACHER,
      "You do not have permission to mark attendance"
    );

    // Validate date
    this.validateDateNotFuture(data.date);
    await this.validateDateInTerm(data.date, data.termId);

    // Validate references exist
    const [student, classEntity, term] = await Promise.all([
      studentRepository.findById(data.studentId),
      classRepository.findById(data.classId),
      termRepository.findByIdWithRelations(data.termId),
    ]);

    if (!student) {
      throw new NotFoundError("Student not found");
    }

    if (!classEntity) {
      throw new NotFoundError("Class not found");
    }

    if (!term) {
      throw new NotFoundError("Term not found");
    }

    // Business rule: Cannot mark attendance in closed academic year
    if (term.academicYear.isClosed) {
      throw new ValidationError(
        "Cannot mark attendance in a closed academic year"
      );
    }

    // Normalize date to UTC midnight for consistency across timezones
    const dateOnly = normalizeToUtcMidnight(data.date);

    // Check if attendance already exists
    const existing = await attendanceRecordRepository.findByStudentClassAndDate(
      data.studentId,
      data.classId,
      dateOnly
    );

    if (existing) {
      // Update existing record
      return attendanceRecordRepository.update(existing.id, {
        status: data.status,
        remarks: data.remarks,
        ...(context.teacherProfileId && {
          markedBy: { connect: { id: context.teacherProfileId } },
        }),
      });
    } else {
      // Create new record
      return attendanceRecordRepository.create({
        student: { connect: { id: data.studentId } },
        class: { connect: { id: data.classId } },
        term: { connect: { id: data.termId } },
        date: dateOnly,
        status: data.status,
        remarks: data.remarks,
        ...(context.teacherProfileId && {
          markedBy: { connect: { id: context.teacherProfileId } },
        }),
      });
    }
  }

  /**
   * Bulk mark attendance for a class
   */
  async bulkMarkAttendance(
    data: BulkMarkAttendanceInput,
    context: ServiceContext
  ) {
    // Authorization: Teachers and above can mark attendance
    requireMinimumRole(
      context,
      Role.TEACHER,
      "You do not have permission to mark attendance"
    );

    const successful: AttendanceRecord[] = [];
    const failed: Array<{ studentId: string; error: string }> = [];

    for (const record of data.records) {
      try {
        const result = await this.markAttendance(
          {
            studentId: record.studentId,
            classId: data.classId,
            termId: data.termId,
            date: data.date,
            status: record.status,
            remarks: record.remarks,
          },
          context
        );
        successful.push(result);
      } catch (error: any) {
        failed.push({
          studentId: record.studentId,
          error: error.message || "Unknown error",
        });
      }
    }

    return {
      successful: successful.length,
      failed,
    };
  }

  /**
   * Get attendance record by ID
   */
  async getAttendanceById(
    id: string,
    context: ServiceContext
  ): Promise<AttendanceRecord> {
    // Everyone can read attendance
    const record = await attendanceRecordRepository.findById(id);

    if (!record) {
      throw new NotFoundError("Attendance record not found");
    }

    return record;
  }

  /**
   * Get attendance with relations
   */
  async getAttendanceWithRelations(id: string, context: ServiceContext) {
    // Everyone can read attendance
    const record = await attendanceRecordRepository.findByIdWithRelations(id);

    if (!record) {
      throw new NotFoundError("Attendance record not found");
    }

    return record;
  }

  /**
   * Get attendance for a class on a specific date
   */
  async getClassAttendance(
    classId: string,
    date: Date,
    context: ServiceContext
  ) {
    // Everyone can read attendance
    return attendanceRecordRepository.findByClassAndDate(classId, date);
  }

  /**
   * Get attendance for a student
   */
  async getStudentAttendance(
    studentId: string,
    termId: string | undefined,
    context: ServiceContext
  ) {
    // Everyone can read attendance
    if (termId) {
      return attendanceRecordRepository.findByStudentAndTerm(studentId, termId);
    }
    return attendanceRecordRepository.findByStudent(studentId);
  }

  /**
   * List attendance with filters
   */
  async listAttendance(
    filters: AttendanceFilters,
    pagination: PaginationParams,
    context: ServiceContext
  ) {
    // Everyone can list attendance

    const { page, pageSize } = pagination;
    const skip = (page - 1) * pageSize;

    // Build where clause
    const where: Prisma.AttendanceRecordWhereInput = {};

    if (filters.studentId) {
      where.studentId = filters.studentId;
    }

    if (filters.classId) {
      where.classId = filters.classId;
    }

    if (filters.termId) {
      where.termId = filters.termId;
    }

    if (filters.status) {
      where.status = filters.status;
    }

    if (filters.dateFrom || filters.dateTo) {
      where.date = {};
      if (filters.dateFrom) {
        where.date.gte = filters.dateFrom;
      }
      if (filters.dateTo) {
        where.date.lte = filters.dateTo;
      }
    }

    // Fetch data
    const [records, total] = await Promise.all([
      attendanceRecordRepository.findMany({
        skip,
        take: pageSize,
        where,
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
          markedBy: {
            include: {
              user: true,
            },
          },
        },
        orderBy: { date: "desc" },
      }),
      attendanceRecordRepository.count(where),
    ]);

    return {
      data: records,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    };
  }

  /**
   * Update attendance record
   */
  async updateAttendance(
    id: string,
    data: { status?: AttendanceStatus; remarks?: string },
    context: ServiceContext
  ): Promise<AttendanceRecord> {
    // Authorization: Teachers and above can update attendance
    requireMinimumRole(
      context,
      Role.TEACHER,
      "You do not have permission to update attendance"
    );

    // Check if record exists
    const existingRecord =
      await attendanceRecordRepository.findByIdWithRelations(id);
    if (!existingRecord) {
      throw new NotFoundError("Attendance record not found");
    }

    // Business rule: Cannot update in closed year
    if (existingRecord.term.academicYear.isClosed) {
      throw new ValidationError(
        "Cannot update attendance in a closed academic year"
      );
    }

    // Update
    const updatedRecord = await attendanceRecordRepository.update(id, {
      ...(data.status && { status: data.status }),
      ...(data.remarks !== undefined && { remarks: data.remarks }),
      ...(context.teacherProfileId && {
        markedBy: { connect: { id: context.teacherProfileId } },
      }),
    });

    return updatedRecord;
  }

  /**
   * Delete attendance record
   */
  async deleteAttendance(
    id: string,
    context: ServiceContext
  ): Promise<void> {
    // Authorization: Only HEAD_TEACHER and above can delete attendance
    requireMinimumRole(
      context,
      Role.HEAD_TEACHER,
      "You do not have permission to delete attendance"
    );

    // Check if record exists
    const record = await attendanceRecordRepository.findByIdWithRelations(id);
    if (!record) {
      throw new NotFoundError("Attendance record not found");
    }

    // Business rule: Cannot delete from closed year
    if (record.term.academicYear.isClosed) {
      throw new ValidationError(
        "Cannot delete attendance from a closed academic year"
      );
    }

    // Delete
    await attendanceRecordRepository.delete(id);
  }

  /**
   * Get student attendance statistics for a term
   */
  async getStudentTermStatistics(
    studentId: string,
    termId: string,
    context: ServiceContext
  ) {
    // Everyone can view statistics
    const stats = await attendanceRecordRepository.getStudentTermStats(
      studentId,
      termId
    );

    // Calculate percentages
    const total = stats.total;
    const attendanceRate =
      total > 0 ? ((stats.present + stats.late) / total) * 100 : 0;
    const absenteeRate = total > 0 ? (stats.absent / total) * 100 : 0;

    return {
      ...stats,
      attendanceRate: Math.round(attendanceRate * 100) / 100,
      absenteeRate: Math.round(absenteeRate * 100) / 100,
    };
  }

  /**
   * Get class attendance statistics for a date
   */
  async getClassDateStatistics(
    classId: string,
    date: Date,
    context: ServiceContext
  ) {
    // Everyone can view statistics
    return attendanceRecordRepository.getClassDateStats(classId, date);
  }

  /**
   * Get class attendance summary for a date range
   */
  async getClassAttendanceSummary(
    classId: string,
    startDate: Date,
    endDate: Date,
    context: ServiceContext
  ) {
    // Everyone can view summary
    const records = await attendanceRecordRepository.findMany({
      where: {
        classId,
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
    });

    const stats = {
      totalRecords: records.length,
      present: 0,
      absent: 0,
      late: 0,
      excused: 0,
    };

    records.forEach((record) => {
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

    const attendanceRate =
      stats.totalRecords > 0
        ? ((stats.present + stats.late) / stats.totalRecords) * 100
        : 0;

    return {
      ...stats,
      attendanceRate: Math.round(attendanceRate * 100) / 100,
      dateRange: {
        start: startDate,
        end: endDate,
      },
    };
  }
}

// Singleton instance
export const attendanceRecordService = new AttendanceRecordService();
