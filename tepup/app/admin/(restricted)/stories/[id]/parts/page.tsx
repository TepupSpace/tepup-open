'use client';

import { useState, useEffect, use } from 'react';
import Link from '@/components/ui/AppLink';
import {
  ArrowLeft,
  Plus,
  Pencil,
  Trash2,
  ChevronDown,
  ChevronRight,
  BookOpen,
} from 'lucide-react';

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

export default function PartsPage({
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

  // Form states
  const [partName, setPartName] = useState('');
  const [chapterTitle, setChapterTitle] = useState('');
  const [chapterSlug, setChapterSlug] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchData();
  }, [storyId]);

  async function fetchData() {
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
  }

  function togglePart(partId: string) {
    const newExpanded = new Set(expandedParts);
    if (newExpanded.has(partId)) {
      newExpanded.delete(partId);
    } else {
      newExpanded.add(partId);
    }
    setExpandedParts(newExpanded);
  }

  // Part CRUD
  async function handleSavePart() {
    if (!partName.trim()) return;
    setSaving(true);

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
        setError(data.error || 'Không thể lưu phần');
        return;
      }

      await fetchData();
      setShowPartModal(false);
      setEditingPart(null);
      setPartName('');
    } catch (err) {
      console.error('Error saving part:', err);
      setError('Đã xảy ra lỗi');
    } finally {
      setSaving(false);
    }
  }

  async function handleDeletePart(partId: string) {
    try {
      const res = await fetch(
        `/api/admin/stories/${storyId}/parts/${partId}`,
        { method: 'DELETE' }
      );

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || 'Không thể xóa phần');
        return;
      }

      await fetchData();
      setDeleteConfirm(null);
    } catch (err) {
      console.error('Error deleting part:', err);
      setError('Đã xảy ra lỗi');
    }
  }

  // Chapter CRUD
  async function handleSaveChapter() {
    if (!chapterTitle.trim() || !editingChapter) return;
    setSaving(true);

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
        setError(data.error || 'Không thể lưu chương');
        return;
      }

      await fetchData();
      setShowChapterModal(false);
      setEditingChapter(null);
      setChapterTitle('');
      setChapterSlug('');
    } catch (err) {
      console.error('Error saving chapter:', err);
      setError('Đã xảy ra lỗi');
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteChapter(chapterId: string) {
    try {
      const res = await fetch(`/api/admin/chapters/${chapterId}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || 'Không thể xóa chương');
        return;
      }

      await fetchData();
      setDeleteConfirm(null);
    } catch (err) {
      console.error('Error deleting chapter:', err);
      setError('Đã xảy ra lỗi');
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Link
            href={`/admin/stories/${storyId}`}
            className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Quản lý Phần & Chương
            </h1>
            <p className="text-gray-600 mt-1">{story?.title}</p>
          </div>
        </div>
        <button
          onClick={() => {
            setEditingPart(null);
            setPartName('');
            setShowPartModal(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors"
        >
          <Plus className="w-5 h-5" />
          <span>Thêm Phần</span>
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600">
          {error}
          <button
            onClick={() => setError('')}
            className="ml-2 text-red-800 hover:underline"
          >
            Đóng
          </button>
        </div>
      )}

      {/* Parts List */}
      <div className="space-y-4">
        {parts.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
            <p className="text-gray-500">
              Chưa có phần nào. Hãy thêm phần đầu tiên!
            </p>
          </div>
        ) : (
          parts.map((part) => (
            <div
              key={part.id}
              className="bg-white rounded-2xl border border-gray-100 overflow-hidden"
            >
              {/* Part Header */}
              <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => togglePart(part.id)}
                    className="p-1 hover:bg-gray-200 rounded transition-colors"
                  >
                    {expandedParts.has(part.id) ? (
                      <ChevronDown className="w-5 h-5 text-gray-500" />
                    ) : (
                      <ChevronRight className="w-5 h-5 text-gray-500" />
                    )}
                  </button>
                  <span className="font-medium text-gray-900">{part.name}</span>
                  <span className="text-sm text-gray-500">
                    ({part.chapters.length} chương)
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setEditingChapter({ chapter: null, partId: part.id });
                      setChapterTitle('');
                      setShowChapterModal(true);
                    }}
                    className="p-2 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                    title="Thêm chương"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      setEditingPart(part);
                      setPartName(part.name);
                      setShowPartModal(true);
                    }}
                    className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Sửa phần"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() =>
                      setDeleteConfirm({ type: 'part', id: part.id })
                    }
                    className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Xóa phần"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Chapters */}
              {expandedParts.has(part.id) && (
                <div className="divide-y divide-gray-100">
                  {part.chapters.length === 0 ? (
                    <div className="px-6 py-8 text-center text-gray-500">
                      Chưa có chương nào trong phần này
                    </div>
                  ) : (
                    part.chapters.map((chapter) => (
                      <div
                        key={chapter.id}
                        className="flex items-center justify-between px-6 py-3 hover:bg-gray-50"
                      >
                        <div className="flex items-center gap-3">
                          <BookOpen className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-900">{chapter.title}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Link
                            href={`/admin/chapters/${chapter.id}/content`}
                            className="px-3 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          >
                            Nội dung
                          </Link>
                          <button
                            onClick={() => {
                              setEditingChapter({
                                chapter,
                                partId: part.id,
                              });
                              setChapterTitle(chapter.title);
                              setChapterSlug(chapter.slug);
                              setShowChapterModal(true);
                            }}
                            className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() =>
                              setDeleteConfirm({
                                type: 'chapter',
                                id: chapter.id,
                                partId: part.id,
                              })
                            }
                            className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Part Modal */}
      {showPartModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {editingPart ? 'Sửa Phần' : 'Thêm Phần mới'}
            </h3>
            <input
              type="text"
              value={partName}
              onChange={(e) => setPartName(e.target.value)}
              placeholder="Tên phần..."
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
              autoFocus
            />
            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowPartModal(false);
                  setEditingPart(null);
                  setPartName('');
                }}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
              >
                Hủy
              </button>
              <button
                onClick={handleSavePart}
                disabled={saving || !partName.trim()}
                className="px-4 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600 disabled:opacity-50 transition-colors"
              >
                {saving ? 'Đang lưu...' : 'Lưu'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Chapter Modal */}
      {showChapterModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {editingChapter?.chapter ? 'Sửa Chương' : 'Thêm Chương mới'}
            </h3>
            <input
              type="text"
              value={chapterTitle}
              onChange={(e) => setChapterTitle(e.target.value)}
              placeholder="Tiêu đề chương..."
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
              autoFocus
            />
            {editingChapter?.chapter && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Slug</label>
                <input
                  type="text"
                  value={chapterSlug}
                  onChange={(e) => setChapterSlug(e.target.value)}
                  placeholder="tu-dong-tao-tu-tieu-de"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Địa chỉ chương: /story/&lt;nhân vật&gt;/&lt;truyện&gt;/&lt;slug&gt;. Đổi slug sẽ làm link cũ ngừng hoạt động.
                </p>
              </div>
            )}
            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowChapterModal(false);
                  setEditingChapter(null);
                  setChapterTitle('');
                  setChapterSlug('');
                }}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
              >
                Hủy
              </button>
              <button
                onClick={handleSaveChapter}
                disabled={saving || !chapterTitle.trim()}
                className="px-4 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600 disabled:opacity-50 transition-colors"
              >
                {saving ? 'Đang lưu...' : 'Lưu'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Xác nhận xóa
            </h3>
            <p className="text-gray-600 mb-6">
              Bạn có chắc chắn muốn xóa{' '}
              {deleteConfirm.type === 'part' ? 'phần' : 'chương'} này?
              {deleteConfirm.type === 'part' && (
                <span className="block text-red-500 text-sm mt-1">
                  Tất cả các chương trong phần này cũng sẽ bị xóa.
                </span>
              )}
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
              >
                Hủy
              </button>
              <button
                onClick={() => {
                  if (deleteConfirm.type === 'part') {
                    handleDeletePart(deleteConfirm.id);
                  } else {
                    handleDeleteChapter(deleteConfirm.id);
                  }
                }}
                className="px-4 py-2 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors"
              >
                Xóa
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
