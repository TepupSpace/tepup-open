/**
 * Library service for managing library documents
 */

import { prisma } from '../prisma';
import { unstable_cache } from 'next/cache';
import type { Prisma } from '@prisma/client';
import { LIBRARY_TAG } from '../cache';

// Cache duration in seconds.
// Giữ được 5 phút vì admin sửa tài liệu sẽ gọi `revalidateLibrary()` xoá tag ngay.
const CACHE_DURATION = 300; // 5 minutes

export interface LibraryDocumentData {
  id: string;
  slug: string;
  title: string;
  description: string;
  category?: string | null;
  icon?: string | null;
  content: {
    sections: {
      heading?: string;
      paragraphs: string[];
    }[];
    relatedConcepts?: string[];
    furtherReading?: string[];
  };
  sortOrder: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface LibraryDocumentCreateInput {
  slug: string;
  title: string;
  description: string;
  category?: string;
  icon?: string;
  content: {
    sections: {
      heading?: string;
      paragraphs: string[];
    }[];
    relatedConcepts?: string[];
    furtherReading?: string[];
  };
  sortOrder?: number;
  isActive?: boolean;
}

export interface LibraryDocumentUpdateInput {
  slug?: string;
  title?: string;
  description?: string;
  category?: string | null;
  icon?: string | null;
  content?: {
    sections: {
      heading?: string;
      paragraphs: string[];
    }[];
    relatedConcepts?: string[];
    furtherReading?: string[];
  };
  sortOrder?: number;
  isActive?: boolean;
}

// ============================================================
// Get Functions
// ============================================================

async function getDocumentsInternal(
  search?: string,
  category?: string
): Promise<LibraryDocumentData[]> {
  const where: Prisma.LibraryDocumentWhereInput = { isActive: true };

  if (search) {
    where.OR = [
      { title: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } },
    ];
  }

  if (category) {
    where.category = category;
  }

  const documents = await prisma.libraryDocument.findMany({
    where,
    orderBy: { sortOrder: 'asc' },
  });

  return documents.map((doc) => ({
    ...doc,
    content: doc.content as LibraryDocumentData['content'],
  }));
}

// Cached version
export const getDocuments = unstable_cache(
  async (search?: string, category?: string) => getDocumentsInternal(search, category),
  ['library-documents'],
  { revalidate: CACHE_DURATION, tags: [LIBRARY_TAG] }
);

/** Một tài liệu ở dạng đủ để dựng thẻ trong danh sách — không kèm `content`. */
export interface LibraryDocumentSummary {
  id: string;
  slug: string;
  title: string;
  description: string;
  category: string | null;
  icon: string | null;
  /** Tính sẵn ở server để `content` không phải đi theo xuống trình duyệt. */
  readMinutes: number;
}

const WORDS_PER_MINUTE = 200;

function estimateReadMinutes(content: LibraryDocumentData['content'] | null): number {
  const sections = content?.sections ?? [];
  const words = sections.reduce(
    (total, section) =>
      total + section.paragraphs.reduce((sum, para) => sum + para.split(' ').length, 0),
    0
  );
  return Math.max(1, Math.ceil(words / WORDS_PER_MINUTE));
}

async function getDocumentSummariesInternal(): Promise<LibraryDocumentSummary[]> {
  const documents = await prisma.libraryDocument.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: 'asc' },
    take: 500,
    select: {
      id: true,
      slug: true,
      title: true,
      description: true,
      category: true,
      icon: true,
      // `content` chỉ dùng để đếm chữ rồi bỏ. Nó KHÔNG đi kèm giá trị trả về —
      // trước đây trang thư viện tải nguyên JSON của mọi tài liệu về trình duyệt
      // chỉ để hiện tiêu đề và một dòng mô tả.
      content: true,
    },
  });

  return documents.map((doc) => ({
    id: doc.id,
    slug: doc.slug,
    title: doc.title,
    description: doc.description,
    category: doc.category,
    icon: doc.icon,
    readMinutes: estimateReadMinutes(doc.content as LibraryDocumentData['content'] | null),
  }));
}

/** Danh sách nhẹ cho trang thư viện. Cached. */
export const getDocumentSummaries = unstable_cache(
  getDocumentSummariesInternal,
  ['library-document-summaries'],
  { revalidate: CACHE_DURATION, tags: [LIBRARY_TAG] }
);

async function getDocumentByIdInternal(id: string): Promise<LibraryDocumentData | null> {
  const document = await prisma.libraryDocument.findUnique({
    where: { id },
  });

  if (!document) return null;

  return {
    ...document,
    content: document.content as LibraryDocumentData['content'],
  };
}

// Cached version
export const getDocumentById = unstable_cache(
  async (id: string) => getDocumentByIdInternal(id),
  ['library-document-by-id'],
  { revalidate: CACHE_DURATION, tags: [LIBRARY_TAG] }
);

async function getDocumentBySlugInternal(slug: string): Promise<LibraryDocumentData | null> {
  const document = await prisma.libraryDocument.findUnique({
    where: { slug },
  });

  if (!document) return null;

  return {
    ...document,
    content: document.content as LibraryDocumentData['content'],
  };
}

// Cached version
export const getDocumentBySlug = unstable_cache(
  async (slug: string) => getDocumentBySlugInternal(slug),
  ['library-document-by-slug'],
  { revalidate: CACHE_DURATION, tags: [LIBRARY_TAG] }
);

// Get unique categories (for filter dropdown)
async function getCategoriesInternal(): Promise<string[]> {
  const documents = await prisma.libraryDocument.findMany({
    where: {
      isActive: true,
      category: { not: null },
    },
    select: { category: true },
    distinct: ['category'],
  });

  return documents
    .map((doc) => doc.category)
    .filter((cat): cat is string => cat !== null)
    .sort();
}

/** Cached — trước đây đây là reader duy nhất trong file không được cache. */
export const getCategories = unstable_cache(
  getCategoriesInternal,
  ['library-categories'],
  { revalidate: CACHE_DURATION, tags: [LIBRARY_TAG] }
);

// ============================================================
// Mutation Functions (No caching)
// ============================================================

export async function createDocument(
  data: LibraryDocumentCreateInput
): Promise<LibraryDocumentData> {
  const document = await prisma.libraryDocument.create({
    data: {
      slug: data.slug,
      title: data.title,
      description: data.description,
      category: data.category,
      icon: data.icon,
      content: data.content as Prisma.InputJsonValue,
      sortOrder: data.sortOrder ?? 0,
      isActive: data.isActive ?? true,
    },
  });

  return {
    ...document,
    content: document.content as LibraryDocumentData['content'],
  };
}

export async function updateDocument(
  id: string,
  data: LibraryDocumentUpdateInput
): Promise<LibraryDocumentData> {
  const updateData: Prisma.LibraryDocumentUpdateInput = {};

  if (data.slug !== undefined) updateData.slug = data.slug;
  if (data.title !== undefined) updateData.title = data.title;
  if (data.description !== undefined) updateData.description = data.description;
  if (data.category !== undefined) updateData.category = data.category;
  if (data.icon !== undefined) updateData.icon = data.icon;
  if (data.content !== undefined) updateData.content = data.content;
  if (data.sortOrder !== undefined) updateData.sortOrder = data.sortOrder;
  if (data.isActive !== undefined) updateData.isActive = data.isActive;

  const document = await prisma.libraryDocument.update({
    where: { id },
    data: updateData,
  });

  return {
    ...document,
    content: document.content as LibraryDocumentData['content'],
  };
}

export async function deleteDocument(id: string): Promise<void> {
  await prisma.libraryDocument.delete({
    where: { id },
  });
}
