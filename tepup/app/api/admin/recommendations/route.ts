import { NextResponse } from 'next/server';
import { revalidateContent } from '@/lib/cache';
import { prisma } from '@/lib/prisma';
import { getAdminSession } from '@/lib/admin-auth';

// GET /api/admin/recommendations - Get all recommendations
export async function GET() {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const recommendations = await prisma.courseStoryRecommendation.findMany({
      include: {
        course: {
          select: { id: true, name: true, slug: true },
        },
        story: {
          select: { id: true, title: true, slug: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ data: recommendations });
  } catch (error) {
    console.error('Error fetching recommendations:', error);
    return NextResponse.json(
      { error: 'Failed to fetch recommendations' },
      { status: 500 }
    );
  }
}

// POST /api/admin/recommendations - Create/Update recommendations for a story or course
export async function POST(request: Request) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { storyId, courseId, courseIds, storyIds } = body;

    // Case 1: Update recommendations for a story (providing courseIds)
    if (storyId && Array.isArray(courseIds)) {
      // Delete existing recommendations for this story
      await prisma.courseStoryRecommendation.deleteMany({
        where: { storyId },
      });

      // Create new recommendations
      if (courseIds.length > 0) {
        await prisma.courseStoryRecommendation.createMany({
          data: courseIds.map((cId: string, index: number) => ({
            storyId,
            courseId: cId,
            sortOrder: index,
          })),
        });
      }

      // Fetch updated recommendations
      const recommendations = await prisma.courseStoryRecommendation.findMany({
        where: { storyId },
        include: {
          course: {
            select: { id: true, name: true, slug: true },
          },
        },
        orderBy: { sortOrder: 'asc' },
      });

      revalidateContent();
      return NextResponse.json({ data: recommendations });
    }

    // Case 2: Update recommendations for a course (providing storyIds)
    if (courseId && Array.isArray(storyIds)) {
      // Delete existing recommendations for this course
      await prisma.courseStoryRecommendation.deleteMany({
        where: { courseId },
      });

      // Create new recommendations
      if (storyIds.length > 0) {
        await prisma.courseStoryRecommendation.createMany({
          data: storyIds.map((sId: string, index: number) => ({
            courseId,
            storyId: sId,
            sortOrder: index,
          })),
        });
      }

      // Fetch updated recommendations
      const recommendations = await prisma.courseStoryRecommendation.findMany({
        where: { courseId },
        include: {
          story: {
            select: { id: true, title: true, slug: true },
          },
        },
        orderBy: { sortOrder: 'asc' },
      });

      revalidateContent();
      return NextResponse.json({ data: recommendations });
    }

    return NextResponse.json(
      { error: 'Invalid request. Provide storyId with courseIds, or courseId with storyIds.' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error updating recommendations:', error);
    return NextResponse.json(
      { error: 'Failed to update recommendations' },
      { status: 500 }
    );
  }
}
