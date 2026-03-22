import { NextRequest, NextResponse } from "next/server";
import { verifyAuthToken } from "@/lib/auth/middleware";
import { authService } from "@/features/auth/auth.service";

/**
 * GET /api/auth/me
 * Get current authenticated user's data
 */
export async function GET(request: NextRequest) {
  try {
    // Verify JWT token
    const user = verifyAuthToken(request);

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: "Unauthorized. Please login.",
        },
        { status: 401 }
      );
    }

    // Get fresh user data from database
    const userData = await authService.getCurrentUser(user.userId);

    if (!userData) {
      return NextResponse.json(
        {
          success: false,
          error: "User not found or inactive.",
        },
        { status: 404 }
      );
    }

    // Return user data (excluding password hash)
    return NextResponse.json(
      {
        success: true,
        data: {
          id: userData.id,
          email: userData.email,
          role: userData.role,
          isActive: userData.isActive,
          lastLogin: userData.lastLogin,
          profile: userData.profile
            ? {
                id: userData.profile.id,
                staffNumber: userData.profile.staffNumber,
                firstName: userData.profile.firstName,
                middleName: userData.profile.middleName,
                lastName: userData.profile.lastName,
                phone: userData.profile.phone,
                status: userData.profile.status,
              }
            : null,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Get current user error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "An unexpected error occurred.",
      },
      { status: 500 }
    );
  }
}
