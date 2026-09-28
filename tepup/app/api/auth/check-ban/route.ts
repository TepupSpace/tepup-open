import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const { identifier } = await req.json();

    if (!identifier) {
      return NextResponse.json({ isBanned: false });
    }

    const user = await prisma.user.findUnique({
      where: { username: identifier },
      select: { isBanned: true },
    });

    // Only return banned status if user exists and is banned
    // Don't reveal user existence for non-banned users
    if (user?.isBanned) {
      return NextResponse.json({ isBanned: true });
    }

    return NextResponse.json({ isBanned: false });
  } catch {
    return NextResponse.json({ isBanned: false });
  }
}
