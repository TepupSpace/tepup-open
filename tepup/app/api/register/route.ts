import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { clientIp, rateLimit, refundRateLimit, retryAfterMinutes } from '@/lib/security/rate-limit';
import { PASSWORD_MAX_LENGTH, PASSWORD_MIN_LENGTH } from '@/lib/security/password-policy';

// Usernames are stored lowercase, so "Tester_Hanoi" and "tester_hanoi" are one account.
// Users may type capitals; they're folded before validation and storage.
const USERNAME_REGEX = /^[a-z0-9_]{3,20}$/;

const SIGNUP_WINDOW_MS = 60 * 60_000;

function tooMany(retryAfterSeconds: number, error: string) {
  return NextResponse.json(
    { error },
    { status: 429, headers: { 'Retry-After': String(retryAfterSeconds) } }
  );
}

export async function POST(req: NextRequest) {
  const ip = clientIp(req.headers);

  // Slow down bot account farms: 5 accounts per IP per hour. Only accounts actually created
  // count (rejected attempts are refunded below), so a typo doesn't use up the quota.
  // A looser cap on all attempts limits username probing ("đã được sử dụng") and DB load.
  const attempts = rateLimit('register-attempt', ip, 30, SIGNUP_WINDOW_MS);
  if (!attempts.ok) {
    return tooMany(
      attempts.retryAfterSeconds,
      `Quá nhiều lượt thử đăng ký. Vui lòng thử lại sau ${retryAfterMinutes(attempts.retryAfterSeconds)} phút.`
    );
  }
  const created = rateLimit('register', ip, 5, SIGNUP_WINDOW_MS);
  if (!created.ok) {
    refundRateLimit('register', ip);
    return tooMany(
      created.retryAfterSeconds,
      `Đã có nhiều tài khoản được tạo từ mạng này trong một giờ qua. Vui lòng thử lại sau ${retryAfterMinutes(created.retryAfterSeconds)} phút.`
    );
  }

  // Any response other than "account created" gives the quota slot back.
  const reject = (error: string, status = 400) => {
    refundRateLimit('register', ip);
    return NextResponse.json({ error }, { status });
  };

  try {
    let body: Record<string, unknown>;
    try {
      body = await req.json();
    } catch {
      return reject('Dữ liệu không hợp lệ');
    }
    const { password, username: rawUsername, mode } = body;

    // Only allow contributor registration
    if (mode !== 'contributor') {
      return reject('Chỉ hỗ trợ đăng ký bằng tài khoản contributor', 403);
    }

    // Validate password
    if (typeof password !== 'string' || password.length < PASSWORD_MIN_LENGTH || password.length > PASSWORD_MAX_LENGTH) {
      return reject(`Mật khẩu phải có từ ${PASSWORD_MIN_LENGTH} đến ${PASSWORD_MAX_LENGTH} ký tự`);
    }

    if (typeof rawUsername !== 'string' || !rawUsername.trim()) {
      return reject('Tên tài khoản là bắt buộc');
    }

    const username = rawUsername.trim().toLowerCase();
    if (!USERNAME_REGEX.test(username)) {
      return reject('Tên tài khoản chỉ chứa chữ cái, số và dấu gạch dưới (3-20 ký tự)');
    }

    // Case-insensitive, so it also catches mixed-case accounts created before usernames were folded.
    const existingUsername = await prisma.user.findFirst({
      where: { username: { equals: username, mode: 'insensitive' } },
      select: { id: true },
    });

    if (existingUsername) {
      return reject('Tên tài khoản này đã được sử dụng');
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: {
        username,
        name: username,
        password: hashedPassword,
        role: 'CONTRIBUTOR',
      },
    });

    return NextResponse.json(
      {
        message: 'Tạo tài khoản thành công',
        user: { id: user.id, username: user.username },
      },
      { status: 201 }
    );
  } catch (error) {
    // Two sign-ups for the same name at once: the unique index catches the second.
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      return reject('Tên tài khoản này đã được sử dụng');
    }
    console.error('Registration error:', error);
    return reject('Đã xảy ra lỗi khi tạo tài khoản', 500);
  }
}
