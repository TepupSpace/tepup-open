import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { FolderTree, BookOpen, GraduationCap, Users, BookMarked, Hourglass } from 'lucide-react';
import Link from '@/components/ui/AppLink';
import { getCoursesForContributions } from '@/lib/services/contribution-service';
import type { UserRole } from '@prisma/client';
import { AlertTriangle, Bell, ClipboardCheck, ShieldCheck } from 'lucide-react';
import WaitingForYou, { type WaitingItem } from '@/components/contributor/dashboard/WaitingForYou';
import { getReviewQueue } from '@/lib/services/review-queue-service';
import { countVisibleUnread, UNREAD_SCAN_LIMIT } from '@/lib/services/notification-render';
import { pendingRequestsForReviewer } from '@/lib/services/review-request-service';

export const metadata = { title: 'Bảng điều khiển' };

/**
 * Courses created by approved contributions that are still hidden (`isActive: false`).
 * Approval never makes a course public; an admin activates it, so list them here.
 */
async function getCoursesAwaitingActivation() {
  try {
    const approved = await prisma.contribution.findMany({
      where: { type: 'NEW_COURSE', status: 'APPROVED' },
      orderBy: { resolvedAt: 'desc' },
      take: 200,
      select: {
        id: true,
        type: true,
        status: true,
        targetId: true,
        contributorId: true,
        data: true,
        resolvedAt: true,
        contributor: { select: { username: true, name: true } },
      },
    });
    const courses = await getCoursesForContributions(approved);
    return approved.flatMap((c) => {
      const course = courses.get(c.id);
      if (!course || course.isActive) return [];
      return [{ course, resolvedAt: c.resolvedAt, by: c.contributor.username || c.contributor.name || 'Ẩn danh' }];
    });
  } catch (error) {
    console.error('Failed to fetch courses awaiting activation:', error);
    return [];
  }
}

async function getStats() {
  try {
    const [categories, courses, lessons, characters, stories] = await Promise.all([
      prisma.category.count(),
      prisma.course.count(),
      prisma.lesson.count(),
      prisma.character.count(),
      prisma.story.count(),
    ]);

    return { categories, courses, lessons, characters, stories };
  } catch (error) {
    console.error('Failed to fetch stats:', error);
    return { categories: 0, courses: 0, lessons: 0, characters: 0, stories: 0 };
  }
}

export default async function AdminDashboard() {
  const [stats, session] = await Promise.all([getStats(), auth()]);
  const isAdmin = session?.user?.role === 'ADMIN';
  const awaiting = isAdmin ? await getCoursesAwaitingActivation() : [];

  // "Việc chờ bạn": the same sources (and so the same counts) as the linked admin pages.
  const viewer = session?.user ? { id: session.user.id, role: session.user.role as UserRole } : null;
  const [queue, unread, asked, answered] = viewer
    ? await Promise.all([
        getReviewQueue(viewer),
        countVisibleUnread(viewer),
        pendingRequestsForReviewer(viewer.id, viewer.role, 5),
        // Admin's own open "Gửi người duyệt" requests that already have opinions to read.
        isAdmin
          ? prisma.reviewRequest.findMany({
              where: { requestedById: viewer.id, status: 'OPEN', opinions: { some: {} } },
              orderBy: { createdAt: 'desc' },
              take: 20,
              select: { id: true, lessonId: true, _count: { select: { opinions: true } } },
            })
          : Promise.resolve([]),
      ])
    : [null, 0, { count: 0, items: [] }, []];
  const others = queue ? queue.items.filter((i) => !i.own) : [];
  const escalated = isAdmin ? others.filter((i) => i.escalatedAt) : [];
  const lessonNames = new Map(
    (answered.length
      ? await prisma.lesson.findMany({ where: { id: { in: answered.map((r) => r.lessonId) } }, select: { id: true, name: true } })
      : []
    ).map((l) => [l.id, l.name])
  );
  const toItem = (i: (typeof others)[number]) => ({
    id: i.id,
    href: `/admin/reviews/${i.id}`,
    text: `${i.typeLabel}: ${i.title}`,
    context: i.courseName && i.courseName !== i.title ? i.courseName : null,
  });
  const waiting: WaitingItem[] = [
    {
      key: 'escalated',
      Icon: AlertTriangle,
      count: escalated.length,
      label: 'đề xuất được chuyển cho quản trị viên quyết định',
      href: '/admin/reviews',
      action: 'Mở hàng duyệt',
      details: escalated.slice(0, 5).map(toItem),
    },
    {
      key: 'reviews',
      Icon: ShieldCheck,
      count: others.length - escalated.length,
      label: 'đề xuất chờ duyệt',
      href: '/admin/reviews',
      action: 'Mở hàng duyệt',
      details: others.filter((i) => !i.escalatedAt).slice(0, 5).map(toItem),
    },
    {
      key: 'opinions',
      Icon: ClipboardCheck,
      count: answered.length,
      label: 'yêu cầu duyệt bạn gửi đã có ý kiến',
      href: '/admin/review-requests',
      action: 'Xem yêu cầu duyệt',
      details: answered.slice(0, 5).map((r) => ({
        id: r.id,
        href: `/admin/review-requests/${r.id}`,
        text: lessonNames.get(r.lessonId) ?? 'Bài học',
        context: `${r._count.opinions} ý kiến`,
      })),
    },
    {
      key: 'asked',
      Icon: ClipboardCheck,
      count: asked.count,
      label: 'yêu cầu duyệt chờ ý kiến của bạn',
      href: '/admin/review-requests',
      action: 'Mở yêu cầu duyệt',
      details: asked.items.map((r) => ({ id: r.id, href: `/admin/review-requests/${r.id}`, text: r.lessonName, context: r.courseName || null })),
    },
    {
      key: 'notifications',
      Icon: Bell,
      count: unread,
      label: unread >= UNREAD_SCAN_LIMIT ? 'thông báo chưa đọc trở lên' : 'thông báo chưa đọc',
      href: '/admin/notifications',
      action: 'Mở thông báo',
    },
  ];

  const statCards = [
    {
      title: 'Danh mục',
      count: stats.categories,
      icon: FolderTree,
      href: '/admin/categories',
      color: 'bg-purple-500',
    },
    {
      title: 'Khóa học',
      count: stats.courses,
      icon: BookOpen,
      href: '/admin/courses',
      color: 'bg-blue-500',
    },
    {
      title: 'Bài học',
      count: stats.lessons,
      icon: GraduationCap,
      href: '/admin/courses',
      color: 'bg-green-500',
    },
    {
      title: 'Nhân vật',
      count: stats.characters,
      icon: Users,
      href: '/admin/characters',
      color: 'bg-orange-500',
    },
    {
      title: 'Câu chuyện',
      count: stats.stories,
      icon: BookMarked,
      href: '/admin/stories',
      color: 'bg-pink-500',
    },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Bảng điều khiển</h1>
        <p className="text-gray-600 mt-1">
          Chào mừng đến với trang quản trị Tepup
        </p>
      </div>

      <WaitingForYou items={waiting} accent="blue" emptyText="Hiện không có việc gì chờ bạn." />

      {awaiting.length > 0 && (
        <div className="mb-8 rounded-2xl border border-amber-200 bg-amber-50 p-6" data-testid="awaiting-activation">
          <h2 className="flex items-center gap-2 text-lg font-semibold text-amber-900">
            <Hourglass className="w-5 h-5" />
            {awaiting.length} khóa học đã duyệt đang chờ kích hoạt
          </h2>
          <p className="mt-1 text-sm text-amber-800">
            Duyệt đóng góp chỉ tạo khóa học ở trạng thái ẩn. Kiểm tra lần cuối, rồi đánh dấu &ldquo;Hiển thị khóa học&rdquo; trong
            trang khóa học để người học thấy. Người đóng góp thấy trạng thái &ldquo;chờ kích hoạt&rdquo; cho tới lúc đó.
          </p>
          <ul className="mt-3 space-y-1.5">
            {awaiting.map(({ course, resolvedAt, by }) => (
              <li key={course.id} className="text-sm text-amber-900">
                <Link href={`/admin/courses/${course.id}`} className="font-medium underline underline-offset-2 hover:text-amber-700">
                  {course.name}
                </Link>
                <span className="text-amber-800">
                  {' '}— của {by}
                  {resolvedAt ? `, duyệt ngày ${resolvedAt.toLocaleDateString('vi-VN')}` : ''}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 mb-8">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <Link
              key={card.title}
              href={card.href}
              className="bg-white rounded-2xl p-6 border border-gray-100 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center gap-4">
                <div
                  className={`w-12 h-12 ${card.color} rounded-xl flex items-center justify-center`}
                >
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{card.count}</p>
                  <p className="text-sm text-gray-500">{card.title}</p>
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Quick Actions - admin only */}
      {isAdmin && (
        <div className="bg-white rounded-2xl p-6 border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Thao tác nhanh
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link
              href="/admin/categories/new"
              className="flex items-center gap-3 p-4 bg-purple-50 text-purple-700 rounded-xl hover:bg-purple-100 transition-colors"
            >
              <FolderTree className="w-5 h-5" />
              <span className="font-medium">Thêm danh mục</span>
            </Link>
            <Link
              href="/admin/courses/new"
              className="flex items-center gap-3 p-4 bg-blue-50 text-blue-700 rounded-xl hover:bg-blue-100 transition-colors"
            >
              <BookOpen className="w-5 h-5" />
              <span className="font-medium">Thêm khóa học</span>
            </Link>
            <Link
              href="/admin/characters/new"
              className="flex items-center gap-3 p-4 bg-orange-50 text-orange-700 rounded-xl hover:bg-orange-100 transition-colors"
            >
              <Users className="w-5 h-5" />
              <span className="font-medium">Thêm nhân vật</span>
            </Link>
            <Link
              href="/admin/stories/new"
              className="flex items-center gap-3 p-4 bg-pink-50 text-pink-700 rounded-xl hover:bg-pink-100 transition-colors"
            >
              <BookMarked className="w-5 h-5" />
              <span className="font-medium">Thêm câu chuyện</span>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
