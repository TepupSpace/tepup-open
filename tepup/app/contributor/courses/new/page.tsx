import Link from '@/components/ui/AppLink';
import { Bot } from 'lucide-react';
import NewCourseClient from './NewCourseClient';

export const metadata = { title: 'Tạo khóa học mới' };

export default function NewCourseDraftPage() {
  return (
    <>
      <NewCourseClient />
      <p className="mt-4 max-w-2xl text-sm text-gray-600">
        <Bot className="mr-1 inline h-4 w-4 align-text-bottom" aria-hidden="true" />
        Muốn nhờ AI soạn nháp?{' '}
        <Link href="/contributor/ai-guide" className="font-medium text-teal-800 underline underline-offset-2">
          Xem cách dùng AI của bạn
        </Link>
      </p>
    </>
  );
}
