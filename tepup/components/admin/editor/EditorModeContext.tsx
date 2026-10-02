'use client';

import { createContext, useContext } from 'react';

/**
 * Who is using the shared block editor (NotionBlockEditor and the block forms in its
 * drawer).
 *
 * - `admin` (default): uploads go to `/api/admin/upload-image`, custom block types and
 *   the library come from `/api/admin/**`.
 * - `contributor`: those admin endpoints answer 401, so the editor never calls them.
 *   Image upload is admin-only (a product decision), so contributors add images by URL
 *   from the allowed hosts, or leave a note for the reviewer. The library picker reads
 *   the public `/api/library` instead.
 */
export type EditorMode = 'admin' | 'contributor';

export const EditorModeContext = createContext<EditorMode>('admin');

export function useEditorMode(): EditorMode {
  return useContext(EditorModeContext);
}

/** Shown wherever an admin would see an upload control. */
export const CONTRIBUTOR_NO_UPLOAD_MESSAGE =
  'Người đóng góp chưa tải ảnh từ máy lên được. Bạn có thể dán URL ảnh trên Wikimedia Commons ' +
  '(bắt đầu bằng https://upload.wikimedia.org/wikipedia/…) hoặc ảnh đã có trong kho của Tépup, ' +
  'hoặc ghi rõ cần ảnh gì ở đâu để người duyệt thêm giúp. URL từ trang khác sẽ bị chặn khi lưu.';
