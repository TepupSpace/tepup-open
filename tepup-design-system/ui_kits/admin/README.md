# Tepup Admin UI Kit

High-fidelity recreation of Tepup's **admin / contributor dashboard** — the side rail, top header, dashboard with stat cards, content review queue, and CRUD list views.

## Run
Open `index.html`. Reuses `../web/icons.jsx` so the icon set stays in sync with the learner UI kit.

## Files
| File | Purpose |
|---|---|
| `index.html` | App shell + minimal sidebar router |
| `data.js` | Fake stats, review queue rows, course list |
| `components.jsx` | `AdminSidebar`, `AdminHeader`, `AdminLayout`, `StatCard`, `QuickAction`, `StatusPill`, `AdminButton`, `SearchBar` |
| `screens.jsx` | `DashboardScreen` (stat grid + quick actions + pending reviews), `ReviewsScreen` (queue table), `CoursesScreen` (CRUD list), `PlaceholderScreen` (catch-all for unimplemented routes) |

## What's there
- **Sidebar with 10 items**: Dashboard, Duyệt nội dung, Danh mục, Khóa học, Bài học, Thư viện, Nhân vật, Câu chuyện, Người dùng, Yêu cầu tính năng — collapsible to 80px width. Settings pinned to the bottom.
- **AdminHeader** with the user-name + email block and a logout button.
- **5 stat cards** on the dashboard (Danh mục / Khóa học / Bài học / Nhân vật / Câu chuyện) — colored `bg-{color}-500` tiles with white icons.
- **Quick actions panel** — four tinted action chips (`bg-{color}-50` + `text-{color}-700`).
- **Status pills**: "Chờ duyệt" (yellow), "Đã duyệt" (green), "Cần sửa" (red), "Đã xuất bản" (blue), "Bản nháp" (grey). These map directly to the lifecycle the real app uses for AI-drafted content (see `docs/PLAN.md` Phase 3).
- **Tables** for reviews + courses: grey uppercased headers, 14px body rows, slug shown in monospace under the title.

## Caveats — what this kit intentionally skips
- The full CRUD pages (`categories/[id]`, `courses/[id]/levels`, `library/[id]`, `stories/[id]/parts`, `users`, `feature-requests`) — they collapse to `PlaceholderScreen`. The shape is similar across them: list table + Add button + edit detail page; build out from `CoursesScreen` as the template.
- The 14+ block editors in `tepup/components/admin/editor/` (BlockEditor, BiasDetectorBlockEditor, BudgetAllocatorBlockEditor, etc.) — the lesson-content editor is its own surface.
- Role-based filtering of sidebar items (USER / REVIEWER / ADMIN gates from `lib/role-utils.ts`).
- Modal forms, toast notifications, image upload widgets.

## Source of truth
- `components/admin/AdminSidebar.tsx` → `AdminSidebar`
- `components/admin/AdminHeader.tsx` → `AdminHeader`
- `app/admin/page.tsx` → `DashboardScreen`
- `app/admin/reviews/page.tsx` → `ReviewsScreen`
- `app/admin/(restricted)/courses/page.tsx` → `CoursesScreen`

Mapped from the TepUp app repository (`tepup/`).
