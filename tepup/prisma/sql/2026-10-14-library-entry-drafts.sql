-- Drafts for library entries ("Lưu nháp" in Quản trị › Thư viện), in the existing
-- ContentDraft table (prisma/sql/2026-10-02-content-drafts.sql). Learners never see drafts.
-- Apply with psql as `postgres`, staging first, then production. Idempotent; additive.
alter type "ContentDraftTarget" add value if not exists 'LIBRARY_ENTRY';

select unnest(enum_range(null::"ContentDraftTarget")) as draft_targets;
