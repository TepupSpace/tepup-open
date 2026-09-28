'use client';

import { useState, useEffect, use } from 'react';
import Link from '@/components/ui/AppLink';
import { ArrowLeft, Save } from 'lucide-react';
import NotionBlockEditor from '@/components/admin/editor/NotionBlockEditor';
import LessonMetaPanel, { type LessonMeta } from '@/components/admin/editor/LessonMetaPanel';
import type { ContentBlock } from '@/lib/types/content';

interface LessonInfo {
  id: string;
  name: string;
  course: { id: string; name: string };
  level: { id: string; name: string };
}

export default function LessonContentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: lessonId } = use(params);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [lesson, setLesson] = useState<LessonInfo | null>(null);
  const [meta, setMeta] = useState<LessonMeta>({ title: '', slug: '', isActive: true, sortOrder: 0 });
  const [blocks, setBlocks] = useState<ContentBlock[]>([]);

  useEffect(() => {
    async function fetchContent() {
      try {
        const res = await fetch(`/api/admin/lessons/${lessonId}/content`);
        const data = await res.json();
        if (!res.ok) {
          setError('Không thể tải nội dung');
          return;
        }
        const l = data.data.lesson;
        setLesson(l);
        setMeta({
          title: data.data.content.title ?? l.name,
          slug: l.slug ?? '',
          isActive: l.isActive ?? true,
          sortOrder: l.sortOrder ?? 0,
        });
        setBlocks(data.data.content.blocks || []);
      } catch (err) {
        console.error('Error fetching content:', err);
        setError('Đã xảy ra lỗi');
      } finally {
        setLoading(false);
      }
    }
    fetchContent();
  }, [lessonId]);

  async function handleSave() {
    setSaving(true);
    setError('');
    try {
      const res = await fetch(`/api/admin/lessons/${lessonId}/content`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: meta.title,
          blocks,
          meta: { slug: meta.slug, isActive: meta.isActive, sortOrder: meta.sortOrder },
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        const details: string[] = Array.isArray(data.details) ? data.details : [];
        setError([data.error || 'Không thể lưu nội dung', ...details].join('\n'));
        return;
      }
      alert('Đã lưu nội dung!');
    } catch (err) {
      console.error('Error saving content:', err);
      setError('Đã xảy ra lỗi khi lưu');
    } finally {
      setSaving(false);
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
    <div className="max-w-6xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Link
            href={`/admin/courses/${lesson?.course.id}/levels`}
            className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Nội dung bài học</h1>
            <p className="text-gray-600 mt-1">
              {lesson?.course.name} &gt; {lesson?.level.name} &gt; {lesson?.name}
            </p>
          </div>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600 disabled:opacity-50 transition-colors"
        >
          <Save className="w-4 h-4" />
          <span>{saving ? 'Đang lưu...' : 'Lưu'}</span>
        </button>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 whitespace-pre-line text-sm">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Notion-style editor */}
        <div className="lg:col-span-2">
          <NotionBlockEditor blocks={blocks} onChange={setBlocks} />
        </div>
        {/* Metadata */}
        <div className="lg:col-span-1">
          <LessonMetaPanel meta={meta} onChange={setMeta} />
        </div>
      </div>
    </div>
  );
}
