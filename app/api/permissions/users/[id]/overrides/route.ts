import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth/jwt";
import { AuthContext } from "@/lib/auth/authorization";
import { UnauthorizedError, NotFoundError, ValidationError } from "@/lib/errors";
import prisma from "@/lib/db/prisma";
import { Permission } from "@/types/prisma-enums";

/**
 * POST /api/permissions/users/[id]/overrides
 * Add a permission override for a user
 */
export async function POST(
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

    // Only ADMIN can manage permission overrides
    if (decoded.role !== "ADMIN") {
      return NextResponse.json(
        {
          success: false,
          error: "Unauthorized: Only administrators can manage permission overrides",
        },
        { status: 403 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { permission, expiresAt, reason } = body;

    // Validate permission
    if (!permission || !Object.values(Permission).includes(permission)) {
      return NextResponse.json(
        { success: false, error: "Invalid permission provided" },
        { status: 400 }
      );
    }

    // Validate reason
    if (!reason || reason.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: "Reason is required for audit purposes" },
        { status: 400 }
      );
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id },
      select: { id: true, email: true },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    // Get granter's teacher profile
    const granterProfile = await prisma.teacherProfile.findUnique({
      where: { userId: decoded.userId },
      select: { id: true },
    });

    // Create permission override
    const override = await prisma.userPermission.create({
      data: {
        userId: id,
        permission,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
        reason: reason.trim(),
        grantedById: granterProfile?.id || null,
      },
      include: {
        grantedBy: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    // TODO: Log this action in audit log
    console.log(
      `Permission override added: ${permission} for user ${user.email} by ${decoded.email}. Reason: ${reason}`
    );

    return NextResponse.json({
      success: true,
      data: override,
      message: "Permission override added successfully",
    });
  } catch (error) {
    console.error("POST /api/permissions/users/[id]/overrides error:", error);

    // Handle unique constraint violation
    if (
      error instanceof Error &&
      error.message.includes("Unique constraint")
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "This permission override already exists for this user",
        },
        { status: 400 }
      );
    }

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
