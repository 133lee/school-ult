import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { settingsService } from "@/features/settings/settings.service";
import {
  ValidationError,
  NotFoundError,
  UnauthorizedError,
} from "@/lib/errors";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

// Helper to get auth context from request
function getAuthContext(request: NextRequest) {
  const token = request.headers
    .get("Authorization")
    ?.replace("Bearer ", "");

  if (!token) {
    throw new UnauthorizedError("No authorization token provided");
  }

  const decoded = jwt.verify(token, JWT_SECRET) as {
    userId: string;
    role: string;
  };

  return {
    userId: decoded.userId,
    role: decoded.role as any,
  };
}

// GET - Get security settings
export async function GET(request: NextRequest) {
  try {
    const context = getAuthContext(request);

    const settings = await settingsService.getSettingsByCategory(
      "security",
      context
    );

    // Convert array to object
    const settingsObject: Record<string, any> = {};
    settings.forEach((setting) => {
      settingsObject[setting.key] = setting.value;
    });

    // Merge with defaults if settings are empty
    if (Object.keys(settingsObject).length === 0) {
      const defaults = settingsService.getDefaultSettings("security");
      return NextResponse.json({ settings: defaults });
    }

    return NextResponse.json({ settings: settingsObject });
  } catch (error: any) {
    console.error("Error fetching security settings:", error);

    if (error instanceof UnauthorizedError) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }

    return NextResponse.json(
      { error: error.message || "Failed to fetch security settings" },
      { status: 500 }
    );
  }
}

// POST - Update security settings
export async function POST(request: NextRequest) {
  try {
    const context = getAuthContext(request);
    const body = await request.json();

    await settingsService.setSettingsBatch(
      {
        category: "security",
        settings: body,
      },
      context
    );

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error saving security settings:", error);

    if (error instanceof UnauthorizedError) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }

    if (error instanceof ValidationError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(
      { error: error.message || "Failed to save security settings" },
      { status: 500 }
    );
  }
}
