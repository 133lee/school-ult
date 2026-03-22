import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth/jwt";
import { AuthContext } from "@/lib/auth/authorization";
import { UnauthorizedError, NotFoundError, ValidationError } from "@/lib/errors";
import prisma from "@/lib/db/prisma";
import { Role } from "@/types/prisma-enums";

/**
 * PATCH /api/permissions/users/[id]/role
 * Update a user's role
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Extract and verify JWT token
    const authHeader = request.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json(
        { success: false, error: "Missing or invalid authorization header" },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json(
        { success: false, error: "Invalid or expired token" },
        { status: 401 }
      );
    }

    // Only ADMIN can change roles
    if (decoded.role !== "ADMIN") {
      return NextResponse.json(
        { success: false, error: "Unauthorized: Only administrators can change roles" },
        { status: 403 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { role } = body;

    // Validate role
    if (!role || !Object.values(Role).includes(role)) {
      return NextResponse.json(
        { success: false, error: "Invalid role provided" },
        { status: 400 }
      );
    }

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id },
      select: { id: true, role: true, email: true },
    });

    if (!existingUser) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    // Prevent changing own role
    if (existingUser.id === decoded.userId) {
      return NextResponse.json(
        { success: false, error: "Cannot change your own role" },
        { status: 400 }
      );
    }

    // Count existing admins
    const adminCount = await prisma.user.count({
      where: { role: "ADMIN", isActive: true },
    });

    // Prevent removing the last admin
    if (
      existingUser.role === "ADMIN" &&
      role !== "ADMIN" &&
      adminCount <= 1
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "Cannot change the role of the last active administrator",
        },
        { status: 400 }
      );
    }

    // Update role
    const updatedUser = await prisma.user.update({
      where: { id },
      data: { role },
      include: {
        profile: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            staffNumber: true,
          },
        },
      },
    });

    // TODO: Log this action in audit log
    console.log(
      `Role changed: User ${existingUser.email} role changed from ${existingUser.role} to ${role} by ${decoded.email}`
    );

    return NextResponse.json({
      success: true,
      data: updatedUser,
      message: "User role updated successfully",
    });
  } catch (error) {
    console.error("PATCH /api/permissions/users/[id]/role error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
