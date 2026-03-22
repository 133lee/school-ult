// TEMPORARY: Get guardian IDs for SMS testing
import { NextResponse } from 'next/server';
import prisma from '@/lib/db/prisma';

export async function GET() {
  try {
    const guardians = await prisma.guardian.findMany({
      take: 10,
      select: {
        id: true,
        firstName: true,
        lastName: true,
        phone: true,
        email: true,
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    if (guardians.length === 0) {
      return NextResponse.json({
        message: "No guardians found. Create one at: http://localhost:3000/admin/parents",
        guardians: []
      });
    }

    return NextResponse.json({
      message: "Copy one of these IDs to use in your test-send route",
      count: guardians.length,
      guardians: guardians.map(g => ({
        id: g.id,
        name: `${g.firstName} ${g.lastName}`,
        phone: g.phone,
        email: g.email || 'N/A'
      }))
    });

  } catch (error: any) {
    return NextResponse.json({
      error: error.message
    }, { status: 500 });
  }
}
