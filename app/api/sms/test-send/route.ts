// app/api/sms/test-send/route.ts
// TEMPORARY FOR TESTING ONLY - DELETE AFTER SUCCESSFUL TEST

import { NextResponse } from 'next/server';
import { smsService } from '@/features/sms/sms.service'; // Fixed: correct path
import { Role } from '@/types/prisma-enums';
import { logger } from '@/lib/logger/logger';

const TEST_ADMIN_CONTEXT = {
  userId: 'cmk9u2bre0001rsx9zo0r0chb', // your admin user ID from logs
  role: Role.ADMIN,
};

const TEST_GUARDIAN_ID = 'cmk9vij8u000bykx9hqxy5kys'; // Misheck Nyirenda's guardian ID (phone: +260974441006)

export async function GET() {
  try {
    logger.info('Starting temporary test SMS send', {
      guardianId: TEST_GUARDIAN_ID,
      context: TEST_ADMIN_CONTEXT,
    });

    const result = await smsService.sendSMS(
      {
        guardianId: TEST_GUARDIAN_ID,
        message: 'Hello Misheck! This is a QUICK TEST SMS from Kambombo School app (sandbox mode). Sent at ' + new Date().toISOString(),
        provider: 'AFRICAS_TALKING',
      },
      TEST_ADMIN_CONTEXT
    );

    logger.info('Test SMS send completed', { result });

    return NextResponse.json({
      success: true,
      message: 'Test SMS queued/sent successfully',
      result,
    }, { status: 200 });

  } catch (error: any) {
    logger.error('Test SMS send failed', {
      error: error.message,
      stack: error.stack,
    });

    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to send test SMS',
      details: error,
    }, { status: error.statusCode || 500 });
  }
}
