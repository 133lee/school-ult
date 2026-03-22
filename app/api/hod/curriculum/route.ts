import { NextRequest } from "next/server";
import { withHODAccess } from "@/lib/http/with-auth";
import { getHODDepartment } from "@/lib/auth/position-helpers";
import { ApiResponse } from "@/lib/http/api-response";
import { handleApiError } from "@/lib/http/error-handler";
import { logger } from "@/lib/logger/logger";
import prisma from "@/lib/db/prisma";

/**
 * GET /api/hod/curriculum
 *
 * Fetches ClassSubjects (curriculum items) for the HOD's department.
 * This is the SOURCE OF TRUTH for what subjects a class offers.
 *
 * Returns curriculum items that can be used for teacher assignments.
 * Only returns subjects in the HOD's department and secondary grades (8-12).
 *
 * Query Parameters:
 * - academicYearId: Filter by academic year (optional, uses active year if not provided)
 * - classId: Filter by specific class (optional)
 * - unassignedOnly: If "true", only return curriculum items without teacher assignments
 * - includeAssignments: If "true", include current teacher assignments
 */
export const GET = withHODAccess(async (request: NextRequest, user) => {
  try {
    logger.logRequest("GET", "/api/hod/curriculum", user.userId);

    // Get HOD's department
    const hodDept = await getHODDepartment(user.userId);
    if (!hodDept) {
      return ApiResponse.forbidden("Not assigned as HOD of any department");
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const classId = searchParams.get("classId") || undefined;
    const unassignedOnly = searchParams.get("unassignedOnly") === "true";
    const includeAssignments =
      searchParams.get("includeAssignments") === "true";
    let academicYearId = searchParams.get("academicYearId") || undefined;

    // If no academic year specified, get the active one
    if (!academicYearId) {
      const activeYear = await prisma.academicYear.findFirst({
        where: { isActive: true },
        select: { id: true },
      });
      academicYearId = activeYear?.id;
    }

    if (!academicYearId) {
      return ApiResponse.badRequest("No active academic year found");
    }

    // Secondary grades that HOD manages
    const SECONDARY_GRADES = [
      "GRADE_8",
      "GRADE_9",
      "GRADE_10",
      "GRADE_11",
      "GRADE_12",
    ];

    // Build the where clause for ClassSubject
    const whereClause: any = {
      // Subject must be in HOD's department
      subject: {
        departmentId: hodDept.id,
        deletedAt: null,
      },
      // Class must be in secondary grades
      class: {
        status: "ACTIVE",
        grade: {
          level: {
            in: SECONDARY_GRADES,
          },
        },
      },
    };

    // Filter by specific class if provided
    if (classId) {
      whereClause.classId = classId;
    }

    // Filter to unassigned only if requested
    if (unassignedOnly) {
      whereClause.subjectTeacherAssignments = {
        none: {
          academicYearId,
        },
      };
    }

    // Fetch curriculum items (ClassSubjects)
    const curriculumItems = await prisma.classSubject.findMany({
      where: whereClause,
      include: {
        subject: {
          select: {
            id: true,
            code: true,
            name: true,
            description: true,
            departmentId: true,
          },
        },
        class: {
          select: {
            id: true,
            name: true,
            grade: {
              select: {
                id: true,
                name: true,
                level: true,
                sequence: true,
              },
            },
          },
        },
        // Optionally include current assignments
        ...(includeAssignments && {
          subjectTeacherAssignments: {
            where: {
              academicYearId,
            },
            include: {
              teacher: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  staffNumber: true,
                },
              },
            },
          },
        }),
      },
      orderBy: [
        { class: { grade: { sequence: "asc" } } },
        { class: { name: "asc" } },
        { subject: { name: "asc" } },
      ],
    });

    // Transform the response for easier consumption
    const curriculum = curriculumItems.map((item) => ({
      classSubjectId: item.id,
      isCore: item.isCore,
      periodsPerWeek: item.periodsPerWeek,
      subject: {
        id: item.subject.id,
        code: item.subject.code,
        name: item.subject.name,
      },
      class: {
        id: item.class.id,
        name: item.class.name,
        grade: {
          id: item.class.grade.id,
          name: item.class.grade.name,
          level: item.class.grade.level,
        },
      },
      // Include assignments if requested
      ...(includeAssignments && {
        currentAssignment: (item as any).subjectTeacherAssignments?.[0]
          ? {
              id: (item as any).subjectTeacherAssignments[0].id,
              teacher: {
                id: (item as any).subjectTeacherAssignments[0].teacher.id,
                name: `${
                  (item as any).subjectTeacherAssignments[0].teacher.firstName
                } ${(item as any).subjectTeacherAssignments[0].teacher.lastName}`,
                staffNumber: (item as any).subjectTeacherAssignments[0].teacher
                  .staffNumber,
              },
            }
          : null,
      }),
    }));

    // Calculate summary stats
    const stats = {
      total: curriculum.length,
      assigned: includeAssignments
        ? curriculum.filter((c) => c.currentAssignment).length
        : undefined,
      unassigned: includeAssignments
        ? curriculum.filter((c) => !c.currentAssignment).length
        : undefined,
      totalPeriodsPerWeek: curriculum.reduce(
        (sum, c) => sum + c.periodsPerWeek,
        0
      ),
    };

    // Fetch teachers in the department with their workload
    // Teachers are linked to departments through TeacherDepartment join table
    const teachersInDept = await prisma.teacherProfile.findMany({
      where: {
        departments: {
          some: {
            departmentId: hodDept.id,
          },
        },
        status: "ACTIVE",
        user: {
          isActive: true,
        },
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        staffNumber: true,
        phone: true,
        user: {
          select: {
            email: true,
          },
        },
        // Get current assignments to calculate workload
        subjectTeacherAssignments: {
          where: {
            academicYearId,
          },
          include: {
            classSubject: {
              select: {
                periodsPerWeek: true,
              },
            },
          },
        },
      },
      orderBy: [{ firstName: "asc" }, { lastName: "asc" }],
    });

    // Calculate workload for each teacher
    const teachers = teachersInDept.map((t: any) => {
      // Sum up periods from all assignments (use classSubject.periodsPerWeek if available)
      const periodsPerWeek = t.subjectTeacherAssignments.reduce(
        (sum: number, a: any) => {
          return sum + (a.classSubject?.periodsPerWeek || 5); // Default 5 if not linked
        },
        0
      );

      return {
        id: t.id,
        firstName: t.firstName,
        lastName: t.lastName,
        staffNumber: t.staffNumber || "",
        email: t.user?.email || "",
        phone: t.phone || "",
        departmentId: hodDept.id,
        periodsPerWeek,
        maxPeriodsPerWeek: 30, // Default max periods
        qualifiedSubjectIds: [], // Could be populated if we track teacher qualifications
      };
    });

    return ApiResponse.success({
      curriculum,
      teachers,
      stats,
      academicYearId,
      departmentId: hodDept.id,
      departmentName: hodDept.name,
    });
  } catch (error) {
    return handleApiError(error, {
      userId: user.userId,
      endpoint: "/api/hod/curriculum",
    });
  }
});
