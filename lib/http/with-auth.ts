import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth/jwt";
import { ApiResponse } from "@/lib/http/api-response";
import { logger } from "@/lib/logger/logger";
import prisma from "@/lib/db/prisma";

/**
 * Authenticated User Context
 * Passed to route handlers after successful authentication
 */
export interface AuthUser {
  userId: string;
  email: string;
  role: string;
  permissions: string[];
}

/**
 * Route Handler Type (with authenticated user)
 */
export type AuthenticatedRouteHandler = (
  request: NextRequest,
  user: AuthUser
) => Promise<NextResponse>;

/**
 * Higher-order function that wraps route handlers with authentication
 *
 * Usage:
 * export const GET = withAuth(async (request, user) => {
 *   // user is guaranteed to be authenticated
 *   return ApiResponse.success({ data: "protected data" });
 * });
 *
 * @param handler - The route handler function
 * @returns Wrapped handler with authentication
 */
export function withAuth(handler: any) {
  return async (request: NextRequest, context?: any): Promise<NextResponse> => {
    try {
      // Extract Authorization header
      const authHeader = request.headers.get("authorization");

      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        logger.warn("Missing or invalid Authorization header", {
          path: request.nextUrl.pathname,
          hasHeader: !!authHeader,
        });
        return ApiResponse.unauthorized("Missing or invalid authorization token");
      }

      // Extract token
      const token = authHeader.substring(7);

      // Verify JWT
      const decoded = verifyToken(token);

      if (!decoded) {
        return ApiResponse.unauthorized("Invalid or expired token");
      }

      // Build user context
      const user: AuthUser = {
        userId: decoded.userId,
        email: decoded.email,
        role: decoded.role,
        permissions: decoded.permissions || [],
      };

      logger.logAuth("Request authenticated", user.userId, true, {
        path: request.nextUrl.pathname,
        role: user.role,
      });

      // Call the actual handler with authenticated user and context
      // Ensure context is always an object to prevent destructuring errors
      return await handler(request, user, context || {});
    } catch (error) {
      logger.error("Authentication failed", error as Error, {
        path: request.nextUrl.pathname,
      });

      if (error instanceof Error && error.message.includes("expired")) {
        return ApiResponse.unauthorized("Token expired");
      }

      if (error instanceof Error && error.message.includes("invalid")) {
        return ApiResponse.unauthorized("Invalid token");
      }

      return ApiResponse.unauthorized("Authentication failed");
    }
  };
}

/**
 * Higher-order function that requires specific permissions
 *
 * Usage:
 * export const POST = withPermission("CREATE_STUDENT", async (request, user) => {
 *   // user is authenticated and has CREATE_STUDENT permission
 *   return ApiResponse.success({ data: "created" });
 * });
 *
 * @param requiredPermission - The permission required to access the route
 * @param handler - The route handler function
 * @returns Wrapped handler with permission check
 */
export function withPermission(
  requiredPermission: string | string[],
  handler: any
) {
  return withAuth(async (request: NextRequest, user: AuthUser, context?: any) => {
    const permissions = Array.isArray(requiredPermission)
      ? requiredPermission
      : [requiredPermission];

    const hasPermission = permissions.some((perm) =>
      user.permissions.includes(perm)
    );

    logger.logPermission(user.userId, permissions.join(", "), hasPermission, {
      path: request.nextUrl.pathname,
      role: user.role,
    });

    if (!hasPermission) {
      return ApiResponse.forbidden(
        `Missing required permission: ${permissions.join(" or ")}`
      );
    }

    return await handler(request, user, context);
  });
}

/**
 * Higher-order function that requires specific role
 *
 * Usage:
 * export const DELETE = withRole("ADMIN", async (request, user) => {
 *   // user is authenticated and has ADMIN role
 *   return ApiResponse.noContent();
 * });
 *
 * @param requiredRole - The role(s) required to access the route
 * @param handler - The route handler function
 * @returns Wrapped handler with role check
 */
export function withRole(
  requiredRole: string | string[],
  handler: any
) {
  return withAuth(async (request: NextRequest, user: AuthUser, context?: any) => {
    const roles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
    const hasRole = roles.includes(user.role);

    logger.debug(`Role check: ${user.role} in [${roles.join(", ")}]`, {
      userId: user.userId,
      path: request.nextUrl.pathname,
      granted: hasRole,
    });

    if (!hasRole) {
      return ApiResponse.forbidden(
        `Requires role: ${roles.join(" or ")}`
      );
    }

    return await handler(request, user, context);
  });
}

/**
 * Higher-order function that requires HOD access
 * Checks if the user is a teacher assigned as HOD of a department
 *
 * Usage:
 * export const GET = withHODAccess(async (request, user) => {
 *   // user is authenticated and is an HOD
 *   return ApiResponse.success({ data: "hod data" });
 * });
 *
 * @param handler - The route handler function
 * @returns Wrapped handler with HOD access check
 */
export function withHODAccess(handler: any) {
  return withAuth(async (request: NextRequest, user: AuthUser, context?: any) => {
    try {
      // Check if user has a teacher profile
      const teacherProfile = await prisma.teacherProfile.findUnique({
        where: { userId: user.userId },
        select: { id: true },
      });

      if (!teacherProfile) {
        logger.debug("HOD access denied: No teacher profile found", {
          userId: user.userId,
          path: request.nextUrl.pathname,
        });
        return ApiResponse.forbidden("Teacher profile not found");
      }

      // Check if teacher is HOD of any department
      const hodDepartment = await prisma.department.findFirst({
        where: {
          hodTeacherId: teacherProfile.id,
          status: "ACTIVE",
        },
        select: { id: true, name: true },
      });

      if (!hodDepartment) {
        logger.debug("HOD access denied: Not assigned as HOD", {
          userId: user.userId,
          teacherId: teacherProfile.id,
          path: request.nextUrl.pathname,
        });
        return ApiResponse.forbidden("Access denied: Head of Department role required");
      }

      logger.debug("HOD access granted", {
        userId: user.userId,
        teacherId: teacherProfile.id,
        department: hodDepartment.name,
        path: request.nextUrl.pathname,
      });

      return await handler(request, user, context);
    } catch (error) {
      logger.error("HOD access check failed", error as Error, {
        userId: user.userId,
        path: request.nextUrl.pathname,
      });
      return ApiResponse.internalError("Failed to verify HOD access");
    }
  });
}
