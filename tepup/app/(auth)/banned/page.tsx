import Link from '@/components/ui/AppLink';
import { ShieldOff } from 'lucide-react';

export const metadata = { title: 'Tài khoản đã bị khóa | Tepup' };

export default function BannedPage() {
  return (
    <main id="main-content" className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-2xl mb-4">
          <ShieldOff className="w-8 h-8 text-red-600" aria-hidden="true" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Tài khoản đã bị khóa</h1>
        <p className="text-gray-600 mb-6">
          Tài khoản của bạn đã bị khóa do vi phạm quy định. Nếu bạn cho rằng đây là nhầm lẫn, vui lòng liên hệ quản trị viên.
        </p>
        <Link
          href="/"
          className="inline-flex items-center px-4 py-2 bg-gray-200 text-gray-800 rounded-xl hover:bg-gray-300 transition-colors font-medium text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-700 focus-visible:ring-offset-2"
        >
          Về trang chủ
        </Link>
      </div>
    </main>
  );
}
