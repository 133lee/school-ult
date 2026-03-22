import { NextRequest } from "next/server";
import { withAuth } from "@/lib/http/with-auth";
import { ApiResponse } from "@/lib/http/api-response";
import { handleApiError } from "@/lib/http/error-handler";
import { smsService } from "@/features/sms/sms.service";
import { logger } from "@/lib/logger/logger";

/**
 * GET /api/sms/test
 *
 * Test SMS connection (Admin only)
 */
export async function GET(request: NextRequest) {
  return withAuth(async (req, user) => {
    try {
      logger.logRequest("GET", "/api/sms/test", user.userId);

      const result = await smsService.testConnection({
        userId: user.userId,
        role: user.role,
      });

      return ApiResponse.success(result);
    } catch (error) {
      return handleApiError(error, {
        userId: user.userId,
        endpoint: "/api/sms/test",
      });
    }
  })(request, {} as any);
}
