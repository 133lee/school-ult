import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth/jwt";
import { AuthContext } from "@/lib/auth/authorization";
import { UnauthorizedError, NotFoundError, ValidationError } from "@/lib/errors";
import prisma from "@/lib/db/prisma";

/**
 * DELETE /api/permissions/users/[id]/overrides/[permission]
 * Remove a permission override from a user
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; permission: string }> }
) {
  try {
    const { id, permission } = await params;

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

    // Find and delete the permission override
    const override = await prisma.userPermission.findUnique({
      where: {
        userId_permission: {
          userId: id,
          permission: permission as any,
        },
      },
    });

    if (!override) {
      return NextResponse.json(
        { success: false, error: "Permission override not found" },
        { status: 404 }
      );
    }

    await prisma.userPermission.delete({
      where: {
        userId_permission: {
          userId: id,
          permission: permission as any,
        },
      },
    });

    // TODO: Log this action in audit log
    console.log(
      `Permission override removed: ${permission} from user ${user.email} by ${decoded.email}`
    );

    return NextResponse.json({
      success: true,
      message: "Permission override removed successfully",
    });
  } catch (error) {
    console.error(
      "DELETE /api/permissions/users/[id]/overrides/[permission] error:",
      error
    );
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
