import { NextResponse } from 'next/server';
import { listDocumentsCompat } from '@/lib/library/document-compat';

// GET /api/library - Public endpoint for library documents
//
// Trả về danh sách nhẹ, KHÔNG kèm `content`. Trước đây endpoint này gửi nguyên
// JSON nội dung của mọi tài liệu về trình duyệt để rồi trang chỉ hiện tiêu đề.
// Nội dung đầy đủ lấy qua /api/library/[id].
//
// Gồm mục thư viện (LibraryEntry) đọc được và tài liệu cũ chưa chuyển — xem
// lib/library/document-compat.ts.
export async function GET() {
  try {
    const documents = await listDocumentsCompat();

    return NextResponse.json({ data: documents });
  } catch (error) {
    console.error('Error fetching library documents:', error);
    return NextResponse.json(
      { error: 'Không thể tải dữ liệu thư viện' },
      { status: 500 }
    );
  }
}
