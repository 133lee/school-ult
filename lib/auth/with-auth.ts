import { NextRequest, NextResponse } from "next/server";

/**
 * Minimal auth wrapper to prevent build errors.
 * You can plug real auth logic later without changing API handlers.
 */
export interface AuthenticatedRequest extends NextRequest {
  user?: {
    id: string;
    role?: string;
  };
}

export function withAuth(
  handler: (
    req: AuthenticatedRequest,
    ctx: { params: Promise<any> }
  ) => Promise<NextResponse>
) {
  return async (req: NextRequest, ctx: { params: Promise<any> }) => {
    // 🔒 Placeholder for future auth checks
    return handler(req as AuthenticatedRequest, ctx);
  };
}
