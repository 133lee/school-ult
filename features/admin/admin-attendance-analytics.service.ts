import prisma from "@/lib/db/prisma";
import { logger } from "@/lib/logger/logger";
import { NotFoundError, BadRequestError } from "@/lib/http/errors";

/**
 * Admin Attendance Analytics Service
 *
 * Business logic for admin viewing attendance analytics and trends.
 * Supports grade-level aggregation and per-class breakdown.
 */
export class AdminAttendanceAnalyticsService {
  /**
   * Get attendance trend data for a date range
   *
   * @param startDate - Start date for the range
   * @param endDate - End date for the range
   * @param gradeId - Optional grade ID for filtering
   * @param classId - Optional class ID for filtering
   * @returns Daily attendance data with male/female breakdown
   */
  async getAttendanceTrend(
    startDate: Date,
    endDate: Date,
    gradeId?: string,
    classId?: string
  ): Promise<{
    dailyData: Array<{
      date: string;
      male: number;
      female: number;
      total: number;
      malePresent: number;
      femalePresent: number;
      totalPresent: number;
      maleAbsent: number;
      femaleAbsent: number;
      totalAbsent: number;
      attendanceRate: number;
    }>;
    summary: {
      totalDays: number;
      averageAttendanceRate: number;
      totalStudents: number;
      maleStudents: number;
      femaleStudents: number;
    };
  }> {
    logger.info("Fetching attendance trend", {
      startDate,
      endDate,
      gradeId,
      classId,
    });

    // Build where clause for class filtering
    let classWhere: any = { status: "ACTIVE" };

    if (classId) {
      // Specific class
      classWhere.id = classId;
    } else if (gradeId) {
      // All classes in grade
      classWhere.gradeId = gradeId;
    }

    // Get classes based on filter
    const classes = await prisma.class.findMany({
      where: classWhere,
      select: {
        id: true,
        name: true,
        grade: {
          select: {
            name: true,
          },
        },
      },
    });

    const classIds = classes.map((c) => c.id);

    if (classIds.length === 0) {
      return {
        dailyData: [],
        summary: {
          totalDays: 0,
          averageAttendanceRate: 0,
          totalStudents: 0,
          maleStudents: 0,
          femaleStudents: 0,
        },
      };
    }

    // Get active academic year
    const academicYear = await prisma.academicYear.findFirst({
      where: { isActive: true },
    });

    if (!academicYear) {
      throw new NotFoundError("No active academic year found");
    }

    // Get all enrolled students in these classes
    const enrollments = await prisma.studentClassEnrollment.findMany({
      where: {
        classId: {
          in: classIds,
        },
        academicYearId: academicYear.id,
        status: "ACTIVE",
      },
      include: {
        student: {
          select: {
            id: true,
            gender: true,
          },
        },
      },
    });

    const students = enrollments.map((e) => e.student);
    const studentIds = students.map((s) => s.id);
    const maleStudents = students.filter((s) => s.gender === "MALE").length;
    const femaleStudents = students.filter((s) => s.gender === "FEMALE").length;

    // Get attendance records for date range
    const attendanceRecords = await prisma.attendanceRecord.findMany({
      where: {
        classId: {
          in: classIds,
        },
        studentId: {
          in: studentIds,
        },
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: {
        student: {
          select: {
            gender: true,
          },
        },
      },
      orderBy: {
        date: "asc",
      },
    });

    // Group by date
    const dailyDataMap = new Map<
      string,
      {
        malePresent: number;
        femalePresent: number;
        maleAbsent: number;
        femaleAbsent: number;
      }
    >();

    // Initialize all dates in range
    const currentDate = new Date(startDate);
    while (currentDate <= endDate) {
      const dateStr = currentDate.toISOString().split("T")[0];
      dailyDataMap.set(dateStr, {
        malePresent: 0,
        femalePresent: 0,
        maleAbsent: 0,
        femaleAbsent: 0,
      });
      currentDate.setDate(currentDate.getDate() + 1);
    }

    // Aggregate attendance by date and gender
    attendanceRecords.forEach((record) => {
      const dateStr = record.date.toISOString().split("T")[0];
      const data = dailyDataMap.get(dateStr);

      if (data) {
        const isMale = record.student.gender === "MALE";
        const isPresent = record.status === "PRESENT" || record.status === "LATE";

        if (isPresent) {
          if (isMale) data.malePresent++;
          else data.femalePresent++;
        } else {
          if (isMale) data.maleAbsent++;
          else data.femaleAbsent++;
        }
      }
    });

    // Convert to array format
    const dailyData = Array.from(dailyDataMap.entries()).map(([date, data]) => {
      const totalPresent = data.malePresent + data.femalePresent;
      const totalAbsent = data.maleAbsent + data.femaleAbsent;
      const total = totalPresent + totalAbsent;
      const attendanceRate = total > 0 ? (totalPresent / total) * 100 : 0;

      return {
        date,
        male: maleStudents,
        female: femaleStudents,
        total: maleStudents + femaleStudents,
        malePresent: data.malePresent,
        femalePresent: data.femalePresent,
        totalPresent,
        maleAbsent: data.maleAbsent,
        femaleAbsent: data.femaleAbsent,
        totalAbsent,
        attendanceRate: parseFloat(attendanceRate.toFixed(1)),
      };
    });

    // Calculate summary
    const totalDays = dailyData.length;
    const averageAttendanceRate =
      dailyData.reduce((sum, day) => sum + day.attendanceRate, 0) / (totalDays || 1);

    logger.info("Attendance trend calculated", {
      totalDays,
      averageAttendanceRate: averageAttendanceRate.toFixed(1),
      totalStudents: students.length,
    });

    return {
      dailyData,
      summary: {
        totalDays,
        averageAttendanceRate: parseFloat(averageAttendanceRate.toFixed(1)),
        totalStudents: students.length,
        maleStudents,
        femaleStudents,
      },
    };
  }

  /**
   * Get per-class attendance summary for a date range
   *
   * @param startDate - Start date
   * @param endDate - End date
   * @param gradeId - Grade ID
   * @returns Per-class attendance breakdown
   */
  async getPerClassAttendanceSummary(
    startDate: Date,
    endDate: Date,
    gradeId: string
  ) {
    logger.info("Fetching per-class attendance summary", {
      startDate,
      endDate,
      gradeId,
    });

    // Get all classes for this grade
    const classes = await prisma.class.findMany({
      where: {
        gradeId,
        status: "ACTIVE",
      },
      select: {
        id: true,
        name: true,
      },
      orderBy: {
        name: "asc",
      },
    });

    // Get active academic year
    const academicYear = await prisma.academicYear.findFirst({
      where: { isActive: true },
    });

    if (!academicYear) {
      throw new NotFoundError("No active academic year found");
    }

    // For each class, get attendance stats
    const classStats = await Promise.all(
      classes.map(async (classItem) => {
        // Get enrolled students
        const enrollments = await prisma.studentClassEnrollment.findMany({
          where: {
            classId: classItem.id,
            academicYearId: academicYear.id,
            status: "ACTIVE",
          },
          include: {
            student: {
              select: {
                id: true,
                gender: true,
              },
            },
          },
        });

        const students = enrollments.map((e) => e.student);
        const maleCount = students.filter((s) => s.gender === "MALE").length;
        const femaleCount = students.filter((s) => s.gender === "FEMALE").length;
        const totalStudents = students.length;

        // Get attendance records
        const attendanceRecords = await prisma.attendanceRecord.findMany({
          where: {
            classId: classItem.id,
            studentId: {
              in: students.map((s) => s.id),
            },
            date: {
              gte: startDate,
              lte: endDate,
            },
          },
          select: {
            status: true,
            student: {
              select: {
                gender: true,
              },
            },
          },
        });

        // Calculate present/absent
        let malePresent = 0;
        let femalePresent = 0;
        let maleAbsent = 0;
        let femaleAbsent = 0;

        attendanceRecords.forEach((record) => {
          const isPresent =
            record.status === "PRESENT" || record.status === "LATE";
          const isMale = record.student.gender === "MALE";

          if (isPresent) {
            if (isMale) malePresent++;
            else femalePresent++;
          } else {
            if (isMale) maleAbsent++;
            else femaleAbsent++;
          }
        });

        const totalPresent = malePresent + femalePresent;
        const totalAbsent = maleAbsent + femaleAbsent;
        const totalRecords = totalPresent + totalAbsent;
        const attendanceRate =
          totalRecords > 0 ? (totalPresent / totalRecords) * 100 : 0;

        return {
          className: classItem.name,
          totalStudents,
          maleCount,
          femaleCount,
          malePresent,
          femalePresent,
          maleAbsent,
          femaleAbsent,
          totalPresent,
          totalAbsent,
          attendanceRate: parseFloat(attendanceRate.toFixed(1)),
        };
      })
    );

    return classStats;
  }
}

// Export singleton instance
export const adminAttendanceAnalyticsService =
  new AdminAttendanceAnalyticsService();
