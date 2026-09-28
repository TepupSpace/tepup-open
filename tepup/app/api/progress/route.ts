import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET /api/progress - Lấy tiến độ học tập của user
export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Bạn cần đăng nhập để xem tiến độ' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const contentType = searchParams.get('type'); // "lesson" or "chapter"
    const contentId = searchParams.get('id');

    // Get specific progress item
    if (contentType && contentId) {
      const progress = await prisma.userProgress.findUnique({
        where: {
          userId_contentType_contentId: {
            userId: session.user.id,
            contentType,
            contentId,
          },
        },
      });

      return NextResponse.json({ progress });
    }

    // Get all progress for user.
    // Trần phòng hờ: bảng này chỉ phình ra theo thời gian, mà client chỉ cần
    // phần gần đây để dựng trạng thái hoàn thành.
    const allProgress = await prisma.userProgress.findMany({
      where: { userId: session.user.id },
      orderBy: { updatedAt: 'desc' },
      take: 1000,
    });

    return NextResponse.json({ progress: allProgress });
  } catch (error) {
    console.error('Get progress error:', error);
    return NextResponse.json(
      { error: 'Đã xảy ra lỗi khi lấy tiến độ' },
      { status: 500 }
    );
  }
}

// POST /api/progress - Đánh dấu hoàn thành bài học/chapter
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Bạn cần đăng nhập để lưu tiến độ' },
        { status: 401 }
      );
    }

    const { contentType, contentId, completed, score } = await req.json();

    // Validate input
    if (!contentType || !contentId) {
      return NextResponse.json(
        { error: 'contentType và contentId là bắt buộc' },
        { status: 400 }
      );
    }

    if (!['lesson', 'chapter'].includes(contentType)) {
      return NextResponse.json(
        { error: 'contentType phải là "lesson" hoặc "chapter"' },
        { status: 400 }
      );
    }

    // Upsert progress
    const progress = await prisma.userProgress.upsert({
      where: {
        userId_contentType_contentId: {
          userId: session.user.id,
          contentType,
          contentId,
        },
      },
      update: {
        completed: completed ?? true,
        score: score ?? undefined,
        completedAt: completed ? new Date() : null,
      },
      create: {
        userId: session.user.id,
        contentType,
        contentId,
        completed: completed ?? true,
        score: score ?? null,
        completedAt: completed ? new Date() : null,
      },
    });

    return NextResponse.json({ 
      message: 'Đã cập nhật tiến độ',
      progress,
    });
  } catch (error) {
    console.error('Update progress error:', error);
    return NextResponse.json(
      { error: 'Đã xảy ra lỗi khi cập nhật tiến độ' },
      { status: 500 }
    );
  }
}
