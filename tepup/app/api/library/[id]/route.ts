import { NextResponse } from 'next/server';
import { getDocumentById, getDocumentBySlug } from '@/lib/services/library-service';

// GET /api/library/[id] - Public endpoint for single library document
//
// Nhận cả id lẫn slug. Block library-document trong bài học có thể mang một trong
// hai dạng: nội dung soạn ở file tĩnh dùng documentSlug và lẽ ra được đổi sang
// documentId lúc migrate, nhưng chỗ nào sót thì vẫn phải đọc được thay vì biến mất.
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const document = (await getDocumentById(id)) ?? (await getDocumentBySlug(id));

    if (!document || !document.isActive) {
      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ data: document });
  } catch (error) {
    console.error('Error fetching library document:', error);
    return NextResponse.json(
      { error: 'Không thể tải tài liệu' },
      { status: 500 }
    );
  }
}
