import Link from '@/components/ui/AppLink';
import { Compass } from 'lucide-react';

/**
 * Mọi lời gọi `notFound()` trong các route nội dung trước đây rơi vào trang 404
 * mặc định của Next — tiếng Anh và không có lối đi tiếp.
 */
export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-white">
      <div className="text-center max-w-md">
        <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center mx-auto mb-5">
          <Compass className="w-7 h-7 text-blue-500" aria-hidden="true" />
        </div>
        <h1 className="text-xl font-semibold text-gray-900 mb-2">Không tìm thấy trang</h1>
        <p className="text-gray-500 mb-6">
          Nội dung này có thể đã được đổi tên hoặc gỡ đi.
        </p>
        <Link
          href="/courses"
          className="inline-block px-5 py-3 rounded-xl bg-gray-900 text-white font-semibold hover:bg-gray-800 transition-colors"
        >
          Về trang khoá học
        </Link>
      </div>
    </div>
  );
}
