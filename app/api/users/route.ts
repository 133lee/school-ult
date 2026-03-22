import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/lib/http/with-auth";
import { ApiResponse } from "@/lib/http/api-response";
import { handleApiError } from "@/lib/http/error-handler";
import prisma from "@/lib/db/prisma";
import { logger } from "@/lib/logger/logger";
import { Role } from "@/generated/prisma/client";

/**
 * GET /api/users
 *
 * Get users with optional role filter
 * Query params:
 * - role: Filter by user role (optional)
 *
 * SECURITY: Only ADMIN role can access this endpoint
 */
export const GET = withAuth(async (request: NextRequest, user) => {
  try {
    logger.logRequest("GET", "/api/users", user.userId);

    // Authorization check: Only admins can list users
    if (user.role !== "ADMIN") {
      logger.warn("Unauthorized role attempting to list users", {
        userId: user.userId,
        role: user.role,
      });
      return ApiResponse.forbidden("Only administrators can access this endpoint");
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const roleFilter = searchParams.get("role");

    // Validate role parameter if provided
    if (roleFilter && !Object.values(Role).includes(roleFilter as Role)) {
      return ApiResponse.badRequest(`Invalid role: ${roleFilter}. Valid roles are: ${Object.values(Role).join(", ")}`);
    }

    // Build where clause
    const where: any = {
      isActive: true, // Only return active users
    };

    if (roleFilter) {
      where.role = roleFilter as Role;
    }

    // Fetch users with their profile (TeacherProfile relation)
    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        email: true,
        role: true,
        createdAt: true,
        lastLogin: true,
        profile: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Transform data to include full name if profile exists
    const transformedUsers = users.map((u) => ({
      id: u.id,
      email: u.email,
      role: u.role,
      createdAt: u.createdAt,
      lastLogin: u.lastLogin,
      profile: u.profile
        ? {
            firstName: u.profile.firstName,
            lastName: u.profile.lastName,
          }
        : null,
    }));

    logger.info("Users fetched successfully", {
      userId: user.userId,
      count: transformedUsers.length,
      roleFilter,
    });

    return ApiResponse.success(transformedUsers);
  } catch (error) {
    return handleApiError(error, {
      userId: user.userId,
      endpoint: "/api/users",
    });
  }
});
