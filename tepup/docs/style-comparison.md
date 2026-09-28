# Style Comparison: Tepup vs MassEdu

> So sánh side-by-side và hướng dẫn migration/rollback.

---

## So sánh tổng quan

| Yếu tố | Tepup (hiện tại) | MassEdu | Đề xuất |
|---------|------------------|---------|---------|
| **Primary color** | Blue `#3B82F6` | Red `#EB3724` | **Giữ Tepup** — blue phù hợp education |
| **Background** | White `#ffffff` | Warm off-white `#FFFEF1` | **Dùng MassEdu** — ấm áp hơn |
| **Text color** | Gray `#171717` | Brown `#1A1816` | **Dùng MassEdu** — softer, warm tone |
| **Font headline** | Geist Sans | Lexend | **Dùng MassEdu** — đẹp hơn cho tiêu đề |
| **Font body** | Geist Sans | Lora (serif) | **Dùng MassEdu** — dễ đọc hơn cho nội dung dài |
| **Border radius** | rounded-2xl/3xl | 0 (sharp) | **Giữ Tepup** — friendly, modern |
| **Border width** | 1px (thin) | 2-4px (thick) | **Hybrid** — 2px cho callouts/emphasis |
| **Shadows** | Subtle (hover:shadow-lg) | Medium + 3D | **Giữ Tepup** — đơn giản, elegant |
| **Hover effects** | -translate-y-1 | rotateX(2deg) + 3D | **Giữ Tepup** — subtler |
| **Dark mode** | Không có | Có (data-theme) | **Thêm từ MassEdu** — cần thiết |
| **Logo** | CSS text "T" | PNG files | **Dùng MassEdu** — professional hơn |
| **Animations** | 4 keyframes | Tương tự | **Giữ Tepup** — đã đủ |
| **Icons** | Lucide React | N/A | **Giữ Tepup** |
| **Spacing** | Tailwind default | 8px grid | **Giữ Tepup** — Tailwind đã 4px grid |

---

## Chi tiết: Những gì nên thay đổi

### 1. Background Color
```css
/* Tepup hiện tại */
:root { --background: #ffffff; }

/* Chuyển sang MassEdu */
:root { --background: #FFFEF1; }

/* Rollback: đổi lại #ffffff */
```

### 2. Text Color
```css
/* Tepup hiện tại */
:root { --foreground: #171717; }

/* Chuyển sang MassEdu */
:root { --foreground: #1A1816; }
/* Secondary text: #4A4540 thay vì gray-600 */
/* Tertiary text: #9A9690 thay vì gray-400 */
```

### 3. Typography
```tsx
/* Tepup hiện tại (layout.tsx) */
import { Geist, Geist_Mono } from "next/font/google";

/* Chuyển sang MassEdu */
import { Lexend, Lora, Poppins } from "next/font/google";

const lexend = Lexend({ subsets: ["latin", "vietnamese"], variable: "--font-lexend" });
const lora = Lora({ subsets: ["latin", "vietnamese"], variable: "--font-lora" });
const poppins = Poppins({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin", "vietnamese"],
  variable: "--font-poppins"
});

/* globals.css */
@theme inline {
  --font-sans: var(--font-lexend);    /* headlines */
  --font-serif: var(--font-lora);     /* body text */
  --font-sub: var(--font-poppins);    /* subheadings */
}
```

### 4. Logo
```tsx
/* Tepup hiện tại (Header.tsx) */
<div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
  <span className="text-white font-bold text-lg">T</span>
</div>
<span className="text-xl font-bold text-gray-900">Tepup</span>

/* Chuyển sang MassEdu */
import Image from 'next/image';
<Image src="/Tepup-Color-Logo-0.png" alt="Tepup" width={32} height={32} />
<span className="text-xl font-bold text-gray-900">Tepup</span>

/* Cần: Download logo files từ MassEdu repo vào public/ */
```

### 5. Border Enhancement (Hybrid)
```css
/* Tepup hiện tại — callouts */
border-2 rounded-2xl

/* MassEdu style — thicker, no radius */
border-4 rounded-none

/* Hybrid đề xuất — thicker nhưng giữ rounded */
border-2 rounded-2xl  /* → Giữ nguyên, đã tốt */
/* Chỉ tăng lên border-3 cho callouts nếu cần nhấn mạnh */
```

### 6. Dark Mode (Thêm mới)
```css
/* Thêm vào globals.css */
[data-theme='dark'] {
  --background: #1A1816;
  --foreground: #F5F3ED;
}

/* Hoặc dùng Tailwind dark: prefix */
@media (prefers-color-scheme: dark) {
  :root {
    --background: #1A1816;
    --foreground: #F5F3ED;
  }
}
```

---

## Migration Checklist

Khi muốn chuyển sang style MassEdu:

- [ ] **Logo**: Download `Tepup-Color-Logo-0.png` và `Tepup-Color-Logo-1.png` vào `public/`
- [ ] **Logo**: Cập nhật `Header.tsx` — dùng `<Image>` thay vì CSS box
- [ ] **Fonts**: Cài Lexend, Lora, Poppins trong `layout.tsx`
- [ ] **Fonts**: Cập nhật CSS variables trong `globals.css`
- [ ] **Background**: Đổi `--background` sang `#FFFEF1`
- [ ] **Text**: Đổi `--foreground` sang `#1A1816`
- [ ] **Body text**: Thêm class `.prose` hoặc tương tự cho lesson content dùng font Lora
- [ ] **Dark mode**: Thêm dark theme CSS variables
- [ ] **Dark mode**: Thêm toggle button vào Header
- [ ] **Scrollbar**: Cập nhật colors cho warm tone

---

## Rollback Checklist

Khi muốn quay lại style Tepup gốc:

- [ ] **Logo**: Khôi phục CSS box logo trong `Header.tsx` (xem `style-backup-tepup-original.md` Section 10)
- [ ] **Fonts**: Đổi lại Geist Sans/Mono trong `layout.tsx`
- [ ] **Fonts**: Đổi CSS variables lại `--font-geist-sans`
- [ ] **Background**: Đổi `--background` lại `#ffffff`
- [ ] **Text**: Đổi `--foreground` lại `#171717`
- [ ] **Dark mode**: Xóa dark theme CSS (nếu không muốn giữ)
- [ ] **Scrollbar**: Đổi lại colors gốc (#f1f1f1, #c1c1c1)

---

## Quick Reference: CSS Variables Mapping

```css
/* ===== TEPUP ORIGINAL ===== */
:root {
  --background: #ffffff;
  --foreground: #171717;
  --font-sans: var(--font-geist-sans);
  --font-mono: var(--font-geist-mono);
}

/* ===== MASSEDU STYLE ===== */
:root {
  --background: #FFFEF1;
  --foreground: #1A1816;
  --font-sans: var(--font-lexend);
  --font-serif: var(--font-lora);
  --font-sub: var(--font-poppins);

  /* MassEdu extra tokens */
  --bg-secondary: #FFFFFF;
  --bg-tertiary: #F5F3ED;
  --text-secondary: #4A4540;
  --text-tertiary: #9A9690;
  --border-subtle: #E2DDD5;
  --border-default: #C9C5BE;
  --border-emphasis: #4A4540;
  --color-primary: #EB3724;
  --color-success: #00D68F;
  --color-warning: #FFE534;
}

/* ===== MASSEDU DARK MODE ===== */
[data-theme='dark'] {
  --background: #1A1816;
  --foreground: #F5F3ED;
  --bg-secondary: #2D2A26;
  --bg-tertiary: #3D3935;
  --text-secondary: #C9C5BE;
}
```

---

## Files liên quan

| File | Vai trò | Cần sửa khi migration |
|------|---------|----------------------|
| `app/globals.css` | CSS variables, animations | **Yes** — colors, fonts, dark mode |
| `app/layout.tsx` | Font imports, body class | **Yes** — font families |
| `components/Header.tsx` | Logo, navigation | **Yes** — logo component |
| `app/page.tsx` | Homepage design | Maybe — background colors |
| `public/` | Static assets | **Yes** — thêm logo files |

---

## Backup Files

- **Tepup original**: `docs/style-backup-tepup-original.md`
- **MassEdu reference**: `docs/style-reference-massedu.md`
- **This comparison**: `docs/style-comparison.md`
