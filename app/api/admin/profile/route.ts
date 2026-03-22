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
 * GET /api/admin/profile
 * Get current user's profile
 */
export async function GET(request: NextRequest) {
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

    const profile = await adminProfileService.getProfile({
      userId: decoded.userId,
      role: decoded.role,
    });

    return NextResponse.json({ data: profile });
  } catch (error: any) {
    console.error("Error fetching profile:", error);

    if (error instanceof NotFoundError) {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }

    return NextResponse.json(
      { error: "Failed to fetch profile" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/admin/profile
 * Update current user's profile
 */
export async function PATCH(request: NextRequest) {
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
    const { firstName, middleName, lastName, phone, address } = body;

    const updatedProfile = await adminProfileService.updateProfile(
      { userId: decoded.userId, role: decoded.role },
      { firstName, middleName, lastName, phone, address }
    );

    return NextResponse.json({ data: updatedProfile });
  } catch (error: any) {
    console.error("Error updating profile:", error);

    if (error instanceof ValidationError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    if (error instanceof NotFoundError) {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }

    return NextResponse.json(
      { error: "Failed to update profile" },
      { status: 500 }
    );
  }
}
