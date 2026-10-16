'use client';

import { use, useCallback, useEffect, useRef, useState } from 'react';
import Link from '@/components/ui/AppLink';
import {
  Plus,
  Pencil,
  Trash2,
  ChevronDown,
  ChevronRight,
  BookOpen,
} from 'lucide-react';
import Spinner from '@/components/ui/Spinner';
import { useAnnouncer } from '@/components/blocks/useAnnouncer';
import AdminDialog from '../../../../_components/AdminDialog';
import ConfirmDialog from '../../../../_components/ConfirmDialog';
import { BackLink, FormError } from '../../../../_components/form';

interface Chapter {
  id: string;
  title: string;
  slug: string;
  sortOrder: number;
}

interface Part {
  id: string;
  name: string;
  sortOrder: number;
  chapters: Chapter[];
}

interface Story {
  id: string;
  title: string;
  slug: string;
}

const dialogInputClass =
  'w-full px-4 py-3 border border-gray-500 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600';

export default function PartsClient({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: storyId } = use(params);
  const [story, setStory] = useState<Story | null>(null);
  const [parts, setParts] = useState<Part[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedParts, setExpandedParts] = useState<Set<string>>(new Set());
  const [message, announce] = useAnnouncer();
  const headingRef = useRef<HTMLHeadingElement>(null);

  // Modal states
  const [showPartModal, setShowPartModal] = useState(false);
  const [showChapterModal, setShowChapterModal] = useState(false);
  const [editingPart, setEditingPart] = useState<Part | null>(null);
  const [editingChapter, setEditingChapter] = useState<{
    chapter: Chapter | null;
    partId: string;
  } | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{
    type: 'part' | 'chapter';
    id: string;
    partId?: string;
  } | null>(null);
  // Lỗi hiện ngay trong hộp thoại đang mở (hộp thoại che mất vùng lỗi của trang).
  const [dialogError, setDialogError] = useState('');
  const [deleting, setDeleting] = useState(false);

  // Form states
  const [partName, setPartName] = useState('');
  const [chapterTitle, setChapterTitle] = useState('');
  const [chapterSlug, setChapterSlug] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      // Fetch story info
      const storyRes = await fetch(`/api/admin/stories/${storyId}`);
      const storyData = await storyRes.json();
      if (storyData.data) {
        setStory({
          id: storyData.data.id,
          title: storyData.data.title,
          slug: storyData.data.slug,
        });
        setParts(storyData.data.parts || []);
        // Expand all parts by default
        setExpandedParts(new Set((storyData.data.parts || []).map((p: Part) => p.id)));
      }
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Không thể tải dữ liệu');
    } finally {
      setLoading(false);
    }
  }, [storyId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  function togglePart(partId: string) {
    const newExpanded = new Set(expandedParts);
    if (newExpanded.has(partId)) {
      newExpanded.delete(partId);
    } else {
      newExpanded.add(partId);
    }
    setExpandedParts(newExpanded);
  }

  function closePartModal() {
    setShowPartModal(false);
    setEditingPart(null);
    setPartName('');
    setDialogError('');
  }

  function closeChapterModal() {
    setShowChapterModal(false);
    setEditingChapter(null);
    setChapterTitle('');
    setChapterSlug('');
    setDialogError('');
  }

  // Part CRUD
  async function handleSavePart() {
    if (saving) return;
    if (!partName.trim()) {
      setDialogError('Nhập tên phần.');
      return;
    }
    setSaving(true);
    setDialogError('');

    try {
      const url = editingPart
        ? `/api/admin/stories/${storyId}/parts/${editingPart.id}`
        : `/api/admin/stories/${storyId}/parts`;

      const res = await fetch(url, {
        method: editingPart ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: partName }),
      });

      if (!res.ok) {
        const data = await res.json();
        setDialogError(data.error || 'Không thể lưu phần');
        return;
      }

      await fetchData();
      announce(editingPart ? `Đã lưu phần ${partName}.` : `Đã thêm phần ${partName}.`);
      closePartModal();
    } catch (err) {
      console.error('Error saving part:', err);
      setDialogError('Đã xảy ra lỗi');
    } finally {
      setSaving(false);
    }
  }

  async function handleDeletePart(partId: string) {
    const name = parts.find((p) => p.id === partId)?.name ?? '';
    setDeleting(true);
    setDialogError('');
    try {
      const res = await fetch(
        `/api/admin/stories/${storyId}/parts/${partId}`,
        { method: 'DELETE' }
      );

      if (!res.ok) {
        const data = await res.json();
        setDialogError(data.error || 'Không thể xóa phần');
        return;
      }

      await fetchData();
      setDeleteConfirm(null);
      announce(`Đã xóa phần ${name}.`);
    } catch (err) {
      console.error('Error deleting part:', err);
      setDialogError('Đã xảy ra lỗi');
    } finally {
      setDeleting(false);
    }
  }

  // Chapter CRUD
  async function handleSaveChapter() {
    if (saving || !editingChapter) return;
    if (!chapterTitle.trim()) {
      setDialogError('Nhập tiêu đề chương.');
      return;
    }
    setSaving(true);
    setDialogError('');

    try {
      const url = editingChapter.chapter
        ? `/api/admin/chapters/${editingChapter.chapter.id}`
        : `/api/admin/parts/${editingChapter.partId}/chapters`;

      const res = await fetch(url, {
        method: editingChapter.chapter ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: chapterTitle, slug: chapterSlug }),
      });

      if (!res.ok) {
        const data = await res.json();
        setDialogError(data.error || 'Không thể lưu chương');
        return;
      }

      await fetchData();
      announce(editingChapter.chapter ? `Đã lưu chương ${chapterTitle}.` : `Đã thêm chương ${chapterTitle}.`);
      closeChapterModal();
    } catch (err) {
      console.error('Error saving chapter:', err);
      setDialogError('Đã xảy ra lỗi');
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteChapter(chapterId: string) {
    setDeleting(true);
    setDialogError('');
    const title = parts.flatMap((p) => p.chapters).find((c) => c.id === chapterId)?.title ?? '';
    try {
      const res = await fetch(`/api/admin/chapters/${chapterId}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        const data = await res.json();
        setDialogError(data.error || 'Không thể xóa chương');
        return;
      }

      await fetchData();
      setDeleteConfirm(null);
      announce(`Đã xóa chương ${title}.`);
    } catch (err) {
      console.error('Error deleting chapter:', err);
      setDialogError('Đã xảy ra lỗi');
    } finally {
      setDeleting(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner size="lg" label="Đang tải phần và chương…" />
      </div>
    );
  }

  const deleteName =
    deleteConfirm?.type === 'part'
      ? parts.find((p) => p.id === deleteConfirm.id)?.name
      : parts.flatMap((p) => p.chapters).find((c) => c.id === deleteConfirm?.id)?.title;

  return (
    <div>
      <p className="sr-only" aria-live="polite">
        {message}
      </p>

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <BackLink href={`/admin/stories/${storyId}`} label="Quay lại câu chuyện" />
          <div>
            <h1 ref={headingRef} tabIndex={-1} className="text-2xl font-bold text-gray-900">
              Quản lý phần và chương
            </h1>
            <p className="text-gray-600 mt-1">{story?.title}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => {
            setEditingPart(null);
            setPartName('');
            setDialogError('');
            setShowPartModal(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          <span>Thêm phần</span>
        </button>
      </div>

      {/* Error */}
      <div role="alert" className="empty:hidden mb-4">
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700">
            {error}
            <button
              type="button"
              onClick={() => {
                setError('');
                headingRef.current?.focus();
              }}
              className="ml-2 text-red-800 underline hover:no-underline"
            >
              Đóng
            </button>
          </div>
        )}
      </div>

      {/* Parts List */}
      <div className="space-y-4">
        {parts.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
            <p className="text-gray-500">
              Chưa có phần nào. Hãy thêm phần đầu tiên!
            </p>
          </div>
        ) : (
          parts.map((part) => {
            const expanded = expandedParts.has(part.id);
            const listId = `part-${part.id}-chapters`;
            return (
              <section
                key={part.id}
                aria-labelledby={`part-${part.id}-name`}
                className="bg-white rounded-2xl border border-gray-100 overflow-hidden"
              >
                {/* Part Header */}
                <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-b border-gray-100">
                  <h2 className="flex items-center gap-3">
                    {/* Tên phần nằm trong nút mở/thu gọn (disclosure). */}
                    <button
                      type="button"
                      onClick={() => togglePart(part.id)}
                      aria-expanded={expanded}
                      aria-controls={listId}
                      className="flex items-center gap-2 p-1 hover:bg-gray-200 rounded transition-colors"
                    >
                      {expanded ? (
                        <ChevronDown className="w-5 h-5 text-gray-600" />
                      ) : (
                        <ChevronRight className="w-5 h-5 text-gray-600" />
                      )}
                      <span id={`part-${part.id}-name`} className="font-medium text-gray-900">
                        {part.name}
                      </span>
                    </button>
                    <span className="text-sm font-normal text-gray-600">
                      ({part.chapters.length} chương)
                    </span>
                  </h2>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setEditingChapter({ chapter: null, partId: part.id });
                        setChapterTitle('');
                        setDialogError('');
                        setShowChapterModal(true);
                      }}
                      className="p-2 text-gray-600 hover:text-green-700 hover:bg-green-50 rounded-lg transition-colors"
                      title="Thêm chương"
                      aria-label={`Thêm chương vào ${part.name}`}
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setEditingPart(part);
                        setPartName(part.name);
                        setDialogError('');
                        setShowPartModal(true);
                      }}
                      className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Sửa phần"
                      aria-label={`Sửa phần ${part.name}`}
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setDialogError('');
                        setDeleteConfirm({ type: 'part', id: part.id });
                      }}
                      className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Xóa phần"
                      aria-label={`Xóa phần ${part.name}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Chapters */}
                {expanded && (
                  <div id={listId}>
                    {part.chapters.length === 0 ? (
                      <p className="px-6 py-8 text-center text-gray-500">
                        Chưa có chương nào trong phần này
                      </p>
                    ) : (
                      <ul className="divide-y divide-gray-100">
                        {part.chapters.map((chapter) => (
                          <li
                            key={chapter.id}
                            className="flex items-center justify-between px-6 py-3 hover:bg-gray-50"
                          >
                            <div className="flex items-center gap-3">
                              <BookOpen className="w-4 h-4 text-gray-500" />
                              <span className="text-gray-900">{chapter.title}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Link
                                href={`/admin/chapters/${chapter.id}/content`}
                                className="px-3 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              >
                                Nội dung<span className="sr-only"> chương {chapter.title}</span>
                              </Link>
                              <button
                                type="button"
                                onClick={() => {
                                  setEditingChapter({
                                    chapter,
                                    partId: part.id,
                                  });
                                  setChapterTitle(chapter.title);
                                  setChapterSlug(chapter.slug);
                                  setDialogError('');
                                  setShowChapterModal(true);
                                }}
                                className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                title="Sửa chương"
                                aria-label={`Sửa chương ${chapter.title}`}
                              >
                                <Pencil className="w-4 h-4" />
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setDialogError('');
                                  setDeleteConfirm({
                                    type: 'chapter',
                                    id: chapter.id,
                                    partId: part.id,
                                  });
                                }}
                                className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                title="Xóa chương"
                                aria-label={`Xóa chương ${chapter.title}`}
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}
              </section>
            );
          })
        )}
      </div>

      {/* Part Modal */}
      {showPartModal && (
        <AdminDialog
          title={editingPart ? 'Sửa phần' : 'Thêm phần mới'}
          onClose={closePartModal}
          busy={saving}
          // Focus vào ô tên ngay khi mở: hộp thoại chỉ có một ô để điền.
          initialFocus="#part-name"
          fallbackFocus={() => headingRef.current}
        >
          <form
            noValidate
            onSubmit={(e) => {
              e.preventDefault();
              void handleSavePart();
            }}
          >
            <label htmlFor="part-name" className="block text-sm font-medium text-gray-700 mb-1">
              Tên phần
            </label>
            <input
              id="part-name"
              type="text"
              value={partName}
              onChange={(e) => setPartName(e.target.value)}
              placeholder="Tên phần..."
              required
              aria-invalid={!!dialogError || undefined}
              aria-describedby={dialogError ? 'part-dialog-error' : undefined}
              className={`${dialogInputClass} mb-4`}
            />
            <FormError id="part-dialog-error" message={dialogError} />
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={closePartModal}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
              >
                Hủy
              </button>
              <button
                type="submit"
                aria-disabled={saving || undefined}
                className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 aria-disabled:opacity-70 aria-disabled:cursor-wait transition-colors"
              >
                {saving ? 'Đang lưu...' : 'Lưu'}
              </button>
            </div>
          </form>
        </AdminDialog>
      )}

      {/* Chapter Modal */}
      {showChapterModal && (
        <AdminDialog
          title={editingChapter?.chapter ? 'Sửa chương' : 'Thêm chương mới'}
          onClose={closeChapterModal}
          busy={saving}
          // Focus vào ô tiêu đề ngay khi mở: đó là việc chính của hộp thoại.
          initialFocus="#chapter-title"
          fallbackFocus={() => headingRef.current}
        >
          <form
            noValidate
            onSubmit={(e) => {
              e.preventDefault();
              void handleSaveChapter();
            }}
          >
            <label htmlFor="chapter-title" className="block text-sm font-medium text-gray-700 mb-1">
              Tiêu đề chương
            </label>
            <input
              id="chapter-title"
              type="text"
              value={chapterTitle}
              onChange={(e) => setChapterTitle(e.target.value)}
              placeholder="Tiêu đề chương..."
              required
              aria-invalid={!!dialogError || undefined}
              aria-describedby={dialogError ? 'chapter-dialog-error' : undefined}
              className={`${dialogInputClass} mb-4`}
            />
            {editingChapter?.chapter && (
              <div className="mb-4">
                <label htmlFor="chapter-slug" className="block text-sm font-medium text-gray-700 mb-1">
                  Đường dẫn (slug)
                </label>
                <input
                  id="chapter-slug"
                  type="text"
                  value={chapterSlug}
                  onChange={(e) => setChapterSlug(e.target.value)}
                  placeholder="tu-dong-tao-tu-tieu-de"
                  aria-describedby="chapter-slug-hint"
                  className={`${dialogInputClass} font-mono text-sm`}
                />
                <p id="chapter-slug-hint" className="mt-1 text-xs text-gray-500">
                  Địa chỉ chương: /story/&lt;nhân vật&gt;/&lt;truyện&gt;/&lt;slug&gt;. Đổi slug sẽ làm link cũ ngừng hoạt động.
                </p>
              </div>
            )}
            <FormError id="chapter-dialog-error" message={dialogError} />
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={closeChapterModal}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
              >
                Hủy
              </button>
              <button
                type="submit"
                aria-disabled={saving || undefined}
                className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 aria-disabled:opacity-70 aria-disabled:cursor-wait transition-colors"
              >
                {saving ? 'Đang lưu...' : 'Lưu'}
              </button>
            </div>
          </form>
        </AdminDialog>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <ConfirmDialog
          onCancel={() => {
            setDeleteConfirm(null);
            setDialogError('');
          }}
          onConfirm={() => {
            if (deleteConfirm.type === 'part') {
              handleDeletePart(deleteConfirm.id);
            } else {
              handleDeleteChapter(deleteConfirm.id);
            }
          }}
          busy={deleting}
          error={dialogError}
          fallbackFocus={() => headingRef.current}
        >
          <p>
            Bạn có chắc chắn muốn xóa {deleteConfirm.type === 'part' ? 'phần' : 'chương'}
            {deleteName ? ` “${deleteName}”` : ' này'}?
          </p>
          {deleteConfirm.type === 'part' && (
            <p className="text-red-700 text-sm mt-1">
              Tất cả các chương trong phần này cũng sẽ bị xóa.
            </p>
          )}
        </ConfirmDialog>
      )}
    </div>
  );
}
