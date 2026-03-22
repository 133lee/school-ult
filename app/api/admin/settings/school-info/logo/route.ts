import { NextRequest, NextResponse } from "next/server";
import { writeFile, unlink } from "fs/promises";
import { join } from "path";
import jwt from "jsonwebtoken";
import { settingsService } from "@/features/settings/settings.service";
import { clearSchoolInfoCache } from "@/lib/settings/school-info-helper";
import {
  ValidationError,
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

  // Only admins can upload logo
  if (decoded.role !== "ADMIN") {
    throw new UnauthorizedError("Only admins can upload school logo");
  }

  return {
    userId: decoded.userId,
    role: decoded.role as any,
  };
}

/**
 * POST /api/admin/settings/school-info/logo
 * Upload school logo
 */
export async function POST(request: NextRequest) {
  try {
    const context = getAuthContext(request);

    // Get form data
    const formData = await request.formData();
    const file = formData.get("logo") as File | null;

    if (!file) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      );
    }

    // Validate file type (images only)
    const allowedTypes = ["image/png", "image/jpeg", "image/jpg", "image/svg+xml"];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Invalid file type. Only PNG, JPG, and SVG are allowed." },
        { status: 400 }
      );
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: "File too large. Maximum size is 5MB." },
        { status: 400 }
      );
    }

    // Get file extension
    const extension = file.name.split(".").pop()?.toLowerCase() || "png";
    const filename = `school-logo.${extension}`;

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Save to public folder
    const publicPath = join(process.cwd(), "public", filename);

    // Delete old logo files (all extensions) to avoid clutter
    const oldExtensions = ["png", "jpg", "jpeg", "svg"];
    for (const ext of oldExtensions) {
      try {
        const oldPath = join(process.cwd(), "public", `school-logo.${ext}`);
        await unlink(oldPath);
      } catch {
        // Ignore if file doesn't exist
      }
    }

    // Write new logo
    await writeFile(publicPath, buffer);

    // Update settings with new filename
    await settingsService.setSetting(
      {
        key: "logoFilename",
        value: filename,
        category: "school_info",
      },
      context
    );

    // Clear cache so next request gets updated logo
    clearSchoolInfoCache();

    return NextResponse.json({
      success: true,
      filename,
      url: `/${filename}`,
    });
  } catch (error: any) {
    console.error("Error uploading logo:", error);

    if (error instanceof UnauthorizedError) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }

    if (error instanceof ValidationError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(
      { error: error.message || "Failed to upload logo" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/settings/school-info/logo
 * Delete school logo and revert to default
 */
export async function DELETE(request: NextRequest) {
  try {
    const context = getAuthContext(request);

    // Get current logo filename from settings
    const setting = await settingsService.getSetting("logoFilename", context);
    const currentFilename = setting?.value as string || "school-logo.png";

    // Delete file from public folder
    try {
      const logoPath = join(process.cwd(), "public", currentFilename);
      await unlink(logoPath);
    } catch (error: any) {
      // Ignore if file doesn't exist
      console.warn("Could not delete logo file:", error.message);
    }

    // Update settings to default
    await settingsService.setSetting(
      {
        key: "logoFilename",
        value: "school-logo.png",
        category: "school_info",
      },
      context
    );

    // Clear cache
    clearSchoolInfoCache();

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error deleting logo:", error);

    if (error instanceof UnauthorizedError) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }

    return NextResponse.json(
      { error: error.message || "Failed to delete logo" },
      { status: 500 }
    );
  }
}
