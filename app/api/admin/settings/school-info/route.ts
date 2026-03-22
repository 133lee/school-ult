import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { settingsService } from "@/features/settings/settings.service";
import { getSchoolLogoBase64 } from "@/lib/settings/school-info-helper";
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

// GET - Get school information settings
export async function GET(request: NextRequest) {
  try {
    const context = getAuthContext(request);

    const settings = await settingsService.getSettingsByCategory(
      "school_info",
      context
    );

    // Convert array to object
    const settingsObject: Record<string, any> = {};
    settings.forEach((setting) => {
      settingsObject[setting.key] = setting.value;
    });

    // Get logo as base64
    const logoBase64 = await getSchoolLogoBase64();

    // Merge with defaults if settings are empty
    if (Object.keys(settingsObject).length === 0) {
      const defaults = settingsService.getDefaultSettings("school_info");
      return NextResponse.json({
        settings: defaults,
        logoBase64: logoBase64 || undefined,
      });
    }

    return NextResponse.json({
      settings: settingsObject,
      logoBase64: logoBase64 || undefined,
    });
  } catch (error: any) {
    console.error("Error fetching school information:", error);

    if (error instanceof UnauthorizedError) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }

    return NextResponse.json(
      { error: error.message || "Failed to fetch school information" },
      { status: 500 }
    );
  }
}

// POST - Update school information settings
export async function POST(request: NextRequest) {
  try {
    const context = getAuthContext(request);
    const body = await request.json();

    await settingsService.setSettingsBatch(
      {
        category: "school_info",
        settings: body,
      },
      context
    );

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error saving school information:", error);

    if (error instanceof UnauthorizedError) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }

    if (error instanceof ValidationError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(
      { error: error.message || "Failed to save school information" },
      { status: 500 }
    );
  }
}
