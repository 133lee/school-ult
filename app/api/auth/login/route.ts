// ISOLATION TEST - Step 4: Add authService (with Prisma)
export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { authService } from "@/features/auth/auth.service";
import { loginSchema } from "@/features/auth/auth.validation";
import { ZodError } from "zod";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = loginSchema.parse(body);

    // THIS IS THE CRITICAL LINE - calls Prisma
    const result = await authService.login(validatedData);

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: result.message,
        },
        { status: 401 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: {
          token: result.token,
          user: result.user,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: "Validation failed",
          details: error.errors.map((err) => ({
            field: err.path.join("."),
            message: err.message,
          })),
        },
        { status: 400 }
      );
    }

    console.error("Login error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "An unexpected error occurred. Please try again.",
      },
      { status: 500 }
    );
  }
}
