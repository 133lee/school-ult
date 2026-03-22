import { NextRequest } from "next/server";
import { authService } from "@/features/auth/auth.service";
import { JWTPayload } from "@/features/auth/auth.service";

export interface AuthenticatedRequest extends NextRequest {
  user?: JWTPayload;
}

/**
 * Extract token from Authorization header
 */
export function extractToken(request: NextRequest): string | null {
  const authHeader = request.headers.get("authorization");

  if (!authHeader) {
    return null;
  }

  // Expected format: "Bearer <token>"
  const parts = authHeader.split(" ");

  if (parts.length !== 2 || parts[0] !== "Bearer") {
    return null;
  }

  return parts[1];
}

/**
 * Verify JWT token and attach user to request
 * Returns null if token is invalid, otherwise returns JWT payload
 */
export function verifyAuthToken(request: NextRequest): JWTPayload | null {
  const token = extractToken(request);

  if (!token) {
    console.error("[Auth Middleware] No token found in request");
    return null;
  }

  const result = authService.verifyToken(token);

  if (!result.valid || !result.payload) {
    console.error("[Auth Middleware] Token verification failed:", result.error || "Unknown error");
    return null;
  }

  return result.payload;
}

/**
 * Check if user has required permission
 */
export function hasPermission(user: JWTPayload, requiredPermission: string): boolean {
  return user.permissions.includes(requiredPermission);
}

/**
 * Check if user has any of the required permissions
 */
export function hasAnyPermission(user: JWTPayload, requiredPermissions: string[]): boolean {
  return requiredPermissions.some((permission) => user.permissions.includes(permission));
}

/**
 * Check if user has all required permissions
 */
export function hasAllPermissions(user: JWTPayload, requiredPermissions: string[]): boolean {
  return requiredPermissions.every((permission) => user.permissions.includes(permission));
}
