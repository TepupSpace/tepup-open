// Custom Block Type System — Sandpack-based
// Admin creates new block types via AI prompt → React component (JSX) → stored in DB
// A CustomBlock component uses Sandpack to run the generated component in a sandbox

export const CUSTOM_BLOCK_VERSION = 2 as const;

// ─── Editor Schema ────────────────────────────────────────────────────────────
// Fields admin fills when placing this block in a lesson.
// Values are injected into the Sandpack sandbox as window.__BLOCK_FIELDS.

export type EditorField =
  | { key: string; label: string; type: 'text'; defaultValue?: string }
  | { key: string; label: string; type: 'textarea'; defaultValue?: string }
  | { key: string; label: string; type: 'number'; defaultValue?: number; min?: number; max?: number; step?: number }
  | { key: string; label: string; type: 'boolean'; defaultValue?: boolean }
  | { key: string; label: string; type: 'select'; options: { label: string; value: string }[]; defaultValue?: string };

// ─── Block Type Config (stored in CustomBlockType.config) ─────────────────────

export interface CustomBlockTypeConfig {
  version: typeof CUSTOM_BLOCK_VERSION;
  name: string;
  description?: string;
  icon?: string; // lucide icon name
  accentColor?: 'cyan' | 'blue' | 'emerald' | 'amber' | 'rose' | 'violet' | 'orange';
  // Sandpack files — at minimum must contain '/App.jsx'
  // AI-generated React component reads window.__BLOCK_FIELDS for admin-provided data
  // and calls window.parent.postMessage({ type: 'tepup:complete' }, '*') when learner finishes
  files: Record<string, string>;
  // Fields admin fills per lesson — injected as window.__BLOCK_FIELDS at runtime
  editorSchema: EditorField[];
}

// ─── Block Instance (stored in LessonContent.blocks JSON array) ───────────────

export interface CustomBlockInstance {
  type: 'custom';
  customBlockTypeId: string;
  // Values filled by admin per lesson — passed to component via window.__BLOCK_FIELDS
  fields: Record<string, unknown>;
  // Snapshot of config at time of authoring — avoids DB join on learner path
  configSnapshot?: CustomBlockTypeConfig;
}

// ─── Block Type Summary (for list page) ──────────────────────────────────────

export interface CustomBlockTypeSummary {
  id: string;
  slug: string;
  name: string;
  description?: string;
  icon: string;
  accentColor: string;
  usageCount: number;
  isActive: boolean;
  createdAt: string;
  createdBy: { id: string; name?: string | null };
}

// ─── Block Type Full (includes config — for builder studio) ──────────────────

export interface CustomBlockTypeFull extends CustomBlockTypeSummary {
  config: CustomBlockTypeConfig;
  updatedAt: string;
}
