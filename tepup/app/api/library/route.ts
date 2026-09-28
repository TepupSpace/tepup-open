import { NextResponse } from 'next/server';
import { getDocumentSummaries } from '@/lib/services/library-service';

// GET /api/library - Public endpoint for library documents
//
// Trả về danh sách nhẹ, KHÔNG kèm `content`. Trước đây endpoint này gửi nguyên
// JSON nội dung của mọi tài liệu về trình duyệt để rồi trang chỉ hiện tiêu đề.
// Nội dung đầy đủ lấy qua /api/library/[id].
export async function GET() {
  try {
    const documents = await getDocumentSummaries();

    return NextResponse.json({ data: documents });
  } catch (error) {
    console.error('Error fetching library documents:', error);
    return NextResponse.json(
      { error: 'Không thể tải dữ liệu thư viện' },
      { status: 500 }
    );
  }
}
