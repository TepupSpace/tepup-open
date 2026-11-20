'use client';

import { useState, useEffect, useRef } from 'react';
import Link from '@/components/ui/AppLink';
import { Plus, Pencil, Trash2, GripVertical, ArrowUp, ArrowDown } from 'lucide-react';
import { getIcon } from '@/components/admin/IconPicker';
import Spinner from '@/components/ui/Spinner';
import { useAnnouncer } from '@/components/blocks/useAnnouncer';
import ConfirmDialog from '../../_components/ConfirmDialog';
import { resolveCategoryColor } from '@/lib/paper/category-colors';

interface Category {
  id: string;
  name: string;
  description: string | null;
  icon: string;
  color?: string;
  sortOrder: number;
  isActive: boolean;
  _count: {
    courses: number;
  };
}

/** Đưa `fromId` tới trước/sau `toId`. Trả lại đúng mảng cũ nếu không đổi gì. */
function moveCategory(list: Category[], fromId: string, toId: string, before: boolean): Category[] {
  if (fromId === toId) return list;
  const moving = list.find((c) => c.id === fromId);
  if (!moving) return list;
  const rest = list.filter((c) => c.id !== fromId);
  const at = rest.findIndex((c) => c.id === toId);
  if (at === -1) return list;
  const next = [...rest.slice(0, before ? at : at + 1), moving, ...rest.slice(before ? at : at + 1)];
  return next.every((c, i) => c.id === list[i].id) ? list : next;
}

export default function CategoriesClient() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');
  const [message, announce] = useAnnouncer();
  const headingRef = useRef<HTMLHeadingElement>(null);

  // Kéo thả đổi thứ tự. `armedId`: chỉ hàng đang được nắm ở tay cầm mới `draggable`,
  // để link/nút trong hàng không tự khởi động kéo (cùng cách LevelsClient).
  const [armedId, setArmedId] = useState<string | null>(null);
  const [dragId, setDragId] = useState<string | null>(null);
  const [dropHint, setDropHint] = useState<{ id: string; before: boolean } | null>(null);
  const [orderError, setOrderError] = useState('');
  const [savingOrder, setSavingOrder] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  async function fetchCategories() {
    try {
      const res = await fetch('/api/admin/categories');
      const data = await res.json();
      if (data.data) {
        setCategories(data.data);
      }
    } catch (err) {
      console.error('Error fetching categories:', err);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string) {
    const name = categories.find((c) => c.id === id)?.name ?? '';
    setDeleting(true);
    setDeleteError('');
    try {
      const res = await fetch(`/api/admin/categories/${id}`, {
        method: 'DELETE',
      });
      const data = await res.json();

      if (!res.ok) {
        setDeleteError(data.error || 'Không thể xóa danh mục');
        return;
      }

      setCategories(categories.filter((c) => c.id !== id));
      setDeleteId(null);
      announce(`Đã xóa danh mục ${name}.`);
    } catch (err) {
      console.error('Error deleting category:', err);
      setDeleteError('Đã xảy ra lỗi khi xóa');
    } finally {
      setDeleting(false);
    }
  }

  /** Áp thứ tự mới ngay, rồi lưu; lỗi thì trả về thứ tự cũ. */
  async function commitOrder(next: Category[]): Promise<boolean> {
    if (next === categories) return false;
    const previous = categories;
    setCategories(next);
    setOrderError('');
    setSavingOrder(true);
    try {
      const res = await fetch('/api/admin/categories/reorder', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: next.map((c) => c.id) }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Không lưu được thứ tự');
      }
      return true;
    } catch (err) {
      setCategories(previous);
      const msg = err instanceof Error ? err.message : 'Không lưu được thứ tự';
      setOrderError(msg);
      announce(msg);
      return false;
    } finally {
      setSavingOrder(false);
    }
  }

  function announceMoved(list: Category[], id: string) {
    const pos = list.findIndex((c) => c.id === id);
    if (pos !== -1) announce(`Đã chuyển ${list[pos].name} tới vị trí ${pos + 1} trên ${list.length}.`);
  }

  /** Nút lên/xuống: thay thế kéo thả cho bàn phím và trình đọc màn hình. */
  async function moveBy(id: string, dir: -1 | 1) {
    if (savingOrder) return; // aria-disabled không chặn được phím Enter/Space
    const idx = categories.findIndex((c) => c.id === id);
    const neighbour = categories[idx + dir];
    if (idx === -1 || !neighbour) return;
    const next = moveCategory(categories, id, neighbour.id, dir === -1);
    // Hàng đổi chỗ thì nút vừa bấm bị gắn lại: đưa focus về nó (hoặc nút còn lại ở mép).
    requestAnimationFrame(() => {
      const atEdge = (dir === -1 && idx + dir === 0) || (dir === 1 && idx + dir === categories.length - 1);
      const target = atEdge ? (dir === -1 ? 'down' : 'up') : dir === -1 ? 'up' : 'down';
      document.getElementById(`cat-move-${id}-${target}`)?.focus();
    });
    if (await commitOrder(next)) announceMoved(next, id);
  }

  function isTopHalf(e: React.DragEvent) {
    const r = (e.currentTarget as HTMLElement).getBoundingClientRect();
    return e.clientY < r.top + r.height / 2;
  }

  function onDragOver(e: React.DragEvent, id: string) {
    if (!dragId) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    const before = isTopHalf(e);
    setDropHint((prev) => (prev && prev.id === id && prev.before === before ? prev : { id, before }));
  }

  function endDrag() {
    setDragId(null);
    setDropHint(null);
    setArmedId(null);
  }

  async function onDrop(e: React.DragEvent) {
    e.preventDefault();
    const from = dragId;
    const hint = dropHint;
    endDrag();
    if (!from || !hint) return;
    const next = moveCategory(categories, from, hint.id, hint.before);
    if (await commitOrder(next)) announceMoved(next, from);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner size="lg" label="Đang tải danh mục…" />
      </div>
    );
  }

  const toDelete = categories.find((c) => c.id === deleteId);

  return (
    <div>
      <p className="sr-only" aria-live="polite">
        {message}
      </p>

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 ref={headingRef} tabIndex={-1} className="text-2xl font-bold text-gray-900">
            Danh mục
          </h1>
          <p className="text-gray-600 mt-1">Quản lý các danh mục khóa học</p>
        </div>
        <Link
          href="/admin/categories/new"
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          <span>Thêm danh mục</span>
        </Link>
      </div>

      <p className="text-sm text-gray-600 mb-3">
        Thứ tự ở đây là thứ tự các kệ trên trang Khoá học. Đổi thứ tự: kéo biểu tượng{' '}
        <GripVertical className="inline w-4 h-4 align-text-bottom" aria-hidden="true" /> hoặc dùng nút mũi tên.
        {savingOrder && <span className="ml-2 text-gray-500">Đang lưu…</span>}
      </p>
      {orderError && (
        <p className="mb-3 rounded-xl bg-red-50 px-4 py-2 text-sm text-red-700" role="alert">
          {orderError}
        </p>
      )}

      {/* Categories Table */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <table className="w-full">
          <caption className="sr-only">Danh sách danh mục</caption>
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th scope="col" className="w-24 pl-4 pr-0 py-4 text-left text-sm font-medium text-gray-600">
                Thứ tự
              </th>
              <th scope="col" className="text-left px-6 py-4 text-sm font-medium text-gray-600">
                Danh mục
              </th>
              <th scope="col" className="text-left px-6 py-4 text-sm font-medium text-gray-600">
                Mô tả
              </th>
              <th scope="col" className="text-center px-6 py-4 text-sm font-medium text-gray-600">
                Khóa học
              </th>
              <th scope="col" className="text-center px-6 py-4 text-sm font-medium text-gray-600">
                Trạng thái
              </th>
              <th scope="col" className="text-right px-6 py-4 text-sm font-medium text-gray-600">
                Thao tác
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {categories.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                  Chưa có danh mục nào. Hãy tạo danh mục đầu tiên!
                </td>
              </tr>
            ) : (
              categories.map((category, index) => {
                const Icon = getIcon(category.icon);
                const tone = resolveCategoryColor(category.color);
                const hint = dropHint?.id === category.id && dragId !== category.id ? dropHint : null;
                return (
                  <tr
                    key={category.id}
                    draggable={armedId === category.id}
                    onDragStart={(e) => {
                      setDragId(category.id);
                      e.dataTransfer.effectAllowed = 'move';
                      // Firefox chỉ cho kéo khi có dữ liệu kèm theo.
                      e.dataTransfer.setData('text/plain', category.id);
                    }}
                    onDragEnd={endDrag}
                    onDragOver={(e) => onDragOver(e, category.id)}
                    onDrop={onDrop}
                    className={`hover:bg-gray-50 ${dragId === category.id ? 'opacity-40' : ''} ${
                      hint ? (hint.before ? 'shadow-[inset_0_2px_0_var(--color-blue-600)]' : 'shadow-[inset_0_-2px_0_var(--color-blue-600)]') : ''
                    }`}
                  >
                    <td className="pl-4 pr-0 py-4">
                      <div className="flex items-center gap-1">
                        <span
                          className="cursor-grab rounded-lg p-1.5 text-gray-500 hover:bg-gray-100 hover:text-gray-700 active:cursor-grabbing"
                          title="Kéo để đổi thứ tự"
                          aria-hidden="true"
                          onPointerDown={() => setArmedId(category.id)}
                          onPointerUp={() => setArmedId(null)}
                        >
                          <GripVertical className="w-5 h-5" />
                        </span>
                        <span className="flex flex-col">
                          <button
                            type="button"
                            id={`cat-move-${category.id}-up`}
                            onClick={() => moveBy(category.id, -1)}
                            aria-disabled={index === 0 || savingOrder}
                            className="rounded p-0.5 text-gray-500 hover:bg-gray-100 hover:text-gray-800 aria-disabled:pointer-events-none aria-disabled:opacity-30"
                            aria-label={`Đưa ${category.name} lên một bậc`}
                            title="Lên"
                          >
                            <ArrowUp className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            id={`cat-move-${category.id}-down`}
                            onClick={() => moveBy(category.id, 1)}
                            aria-disabled={index === categories.length - 1 || savingOrder}
                            className="rounded p-0.5 text-gray-500 hover:bg-gray-100 hover:text-gray-800 aria-disabled:pointer-events-none aria-disabled:opacity-30"
                            aria-label={`Đưa ${category.name} xuống một bậc`}
                            title="Xuống"
                          >
                            <ArrowDown className="w-3.5 h-3.5" />
                          </button>
                        </span>
                      </div>
                    </td>
                    <th scope="row" className="px-6 py-4 text-left font-normal">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                          <Icon className="w-5 h-5 text-blue-600" />
                        </div>
                        <span className="flex flex-col">
                          <span className="font-medium text-gray-900">
                            {category.name}
                          </span>
                          <span className="flex items-center gap-1.5 text-xs text-gray-600">
                            <span
                              className="w-2.5 h-2.5 rounded-full border border-gray-300"
                              style={{ background: tone.base }}
                              aria-hidden="true"
                            />
                            Màu: {tone.label}
                          </span>
                        </span>
                      </div>
                    </th>
                    <td className="px-6 py-4 text-gray-600 max-w-xs truncate">
                      {category.description || '-'}
                    </td>
                    <td className="px-6 py-4 text-center text-gray-600">
                      {category._count.courses}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                          category.isActive
                            ? 'bg-green-100 text-green-700'
                            : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {category.isActive ? 'Hoạt động' : 'Ẩn'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/admin/categories/${category.id}`}
                          className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Chỉnh sửa"
                          aria-label={`Chỉnh sửa danh mục ${category.name}`}
                        >
                          <Pencil className="w-4 h-4" />
                        </Link>
                        <button
                          type="button"
                          onClick={() => {
                            setDeleteError('');
                            setDeleteId(category.id);
                          }}
                          className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Xóa"
                          aria-label={`Xóa danh mục ${category.name}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteId && (
        <ConfirmDialog
          onCancel={() => setDeleteId(null)}
          onConfirm={() => handleDelete(deleteId)}
          busy={deleting}
          error={deleteError}
          fallbackFocus={() => headingRef.current}
        >
          Bạn có chắc chắn muốn xóa danh mục{toDelete ? ` “${toDelete.name}”` : ' này'}? Hành động này không thể hoàn tác.
        </ConfirmDialog>
      )}
    </div>
  );
}
