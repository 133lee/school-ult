import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth/jwt";
import { adminProfileService } from "@/features/admin/adminProfile.service";
import {
  UnauthorizedError,
  ValidationError,
  NotFoundError,
  ConflictError,
} from "@/lib/errors";

/**
 * POST /api/admin/profile/email
 * Update email address
 */
export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const decoded = verifyToken(token);

    if (!decoded) {
      return NextResponse.json(
        { error: "Invalid or expired token" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { newEmail, password } = body;

    if (!newEmail || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    const updatedProfile = await adminProfileService.updateEmail(
      { userId: decoded.userId, role: decoded.role },
      { newEmail, password }
    );

    return NextResponse.json({
      message: "Email updated successfully",
      data: updatedProfile,
    });
  } catch (error: any) {
    console.error("Error updating email:", error);

    if (error instanceof UnauthorizedError) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }

    if (error instanceof ValidationError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    if (error instanceof NotFoundError) {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }

    if (error instanceof ConflictError) {
      return NextResponse.json({ error: error.message }, { status: 409 });
    }

    return NextResponse.json(
      { error: "Failed to update email" },
      { status: 500 }
    );
  }
}
