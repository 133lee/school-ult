import { NextRequest } from "next/server";
import { withAuth } from "@/lib/http/with-auth";
import { ApiResponse } from "@/lib/http/api-response";
import { handleApiError } from "@/lib/http/error-handler";
import { smsService } from "@/features/sms/sms.service";
import { logger } from "@/lib/logger/logger";

/**
 * GET /api/sms/balance
 *
 * Check SMS balance (Africa's Talking)
 */
export async function GET(request: NextRequest) {
  return withAuth(async (req, user) => {
    try {
      logger.logRequest("GET", "/api/sms/balance", user.userId);

      const balance = await smsService.checkBalance({
        userId: user.userId,
        role: user.role,
      });

      return ApiResponse.success(balance);
    } catch (error) {
      return handleApiError(error, {
        userId: user.userId,
        endpoint: "/api/sms/balance",
      });
    }
  })(request, {} as any);
}
