# Tepup Original Style Backup

> File này lưu lại toàn bộ design tokens & patterns gốc của Tepup.
> Dùng để rollback nếu cần quay lại style cũ sau khi áp dụng style MassEdu.

---

## 1. CSS Variables (globals.css)

```css
:root {
  --background: #ffffff;
  --foreground: #171717;
}

@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --font-sans: var(--font-geist-sans);
  --font-mono: var(--font-geist-mono);
}
```

---

## 2. Typography

### Fonts (layout.tsx)
```tsx
import { Geist, Geist_Mono } from "next/font/google";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});
```

### Font Sizes Used
| Token | Usage |
|-------|-------|
| `text-7xl` | Homepage hero title |
| `text-6xl` | Hero section |
| `text-5xl` | Homepage hero main |
| `text-3xl` | Section titles |
| `text-2xl` | Content headings |
| `text-xl` | Subsection titles, logo text |
| `text-lg` | Smaller headers, descriptions |
| `text-base` | Regular text |
| `text-sm` | Metadata, secondary |
| `text-xs` | Badges, small UI |

### Font Weights
- `font-bold` — Headings, logo
- `font-semibold` — Section headers, buttons, card titles
- `font-medium` — Labels, active nav

---

## 3. Color Palette

### Core
| Name | Hex | Usage |
|------|-----|-------|
| Background | `#ffffff` | Page background |
| Foreground | `#171717` | Primary text |

### Brand Colors (Homepage hero)
| Color | Tailwind | Usage |
|-------|----------|-------|
| Teal | `text-teal-500` | "Tép riu" |
| Blue | `text-blue-500` | "stép up", primary CTA |
| Orange | `text-orange-500` | "stép out" |

### UI Colors
| Category | Background | Text | Border |
|----------|-----------|------|--------|
| Blue (Primary) | `bg-blue-50/100/500` | `text-blue-500/600` | `border-blue-200/300` |
| Teal (Secondary) | `bg-teal-50/100` | `text-teal-500/600` | `border-teal-200/300` |
| Green (Success) | `bg-green-50/100/500` | `text-green-500/600` | `border-green-200` |
| Orange (Accent) | `bg-orange-50/100` | `text-orange-500/600` | `border-orange-200/300` |
| Purple (Accent) | `bg-purple-50/100` | `text-purple-500/600` | `border-purple-200/300` |
| Cyan (Secondary) | `bg-cyan-50/100` | `text-cyan-500/600` | `border-cyan-200` |
| Yellow (Warning) | `bg-yellow-50` | `text-yellow-500/700` | `border-yellow-200` |
| Red (Error) | `bg-red-50` | `text-red-600` | `border-red-500` |
| Gray (Neutral) | `bg-gray-50/100/200` | `text-gray-600/900` | `border-gray-100/200` |

---

## 4. Spacing

### Container
```
max-w-7xl mx-auto px-4 sm:px-6 lg:px-8
```

### Section Padding
```
py-16 sm:py-20 lg:py-32
```

### Component Gaps
- Cards: `gap-6`, `gap-8`
- Items: `gap-2`, `gap-3`, `gap-4`
- Sections: `mb-4`, `mb-6`, `mb-8`, `mb-12`

### Card Padding
- Standard: `p-6`, `p-8`
- Compact: `p-4`, `p-5`

---

## 5. Border Radius

| Token | Usage |
|-------|-------|
| `rounded-full` | Badges, avatars, node circles |
| `rounded-3xl` | Category containers |
| `rounded-2xl` | Cards, buttons, callouts, modals |
| `rounded-xl` | Question options, inputs |
| `rounded-lg` | Header items, logo icon, small elements |

---

## 6. Shadows

| Pattern | Usage |
|---------|-------|
| `hover:shadow-lg` | Card hover |
| `shadow-2xl` | Chat panel, modals |
| `shadow-lg shadow-blue-200` | Current lesson node |
| `shadow-sm` | Subtle card depth |

---

## 7. Border Styling

| Pattern | Usage |
|---------|-------|
| `border border-gray-100` | Standard cards, header |
| `border border-gray-200` | Lesson cards |
| `border-2` | Emphasis (callouts, question options) |
| `border-4 border-blue-500` | Current lesson node |

---

## 8. Buttons

### Primary CTA
```
px-8 py-4 bg-blue-500 text-white font-semibold rounded-2xl
hover:bg-blue-600 transition-colors text-lg
```

### Secondary
```
px-8 py-4 text-gray-600 font-semibold rounded-2xl
hover:bg-gray-50 transition-colors
```

### Icon Button
```
p-1.5 hover:bg-gray-100 rounded-lg transition-colors
```

### Disabled
```
disabled:bg-gray-300 disabled:cursor-not-allowed
```

---

## 9. Cards

### Standard Card
```
bg-white rounded-2xl border border-gray-100 p-6
transition-all duration-200 hover:shadow-lg hover:border-gray-300 hover:-translate-y-1
```

### Character Card
```
rounded-2xl border-2 {color.border} {color.bg} p-5
transition-all duration-300 hover:shadow-lg hover:-translate-y-1
```

### Category Container
```
bg-gray-50 rounded-3xl p-6
```

---

## 10. Header / Navigation

### Header
```
sticky top-0 z-50 bg-white border-b border-gray-100
height: h-16
```

### Logo
```html
<div class="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
  <span class="text-white font-bold text-lg">T</span>
</div>
<span class="text-xl font-bold text-gray-900">Tepup</span>
```

### Nav Active
```
text-gray-900 font-medium border-b-2 border-gray-900
```

### Nav Inactive
```
text-gray-600 hover:text-gray-900 hover:bg-gray-50
```

---

## 11. Callout Blocks

| Variant | Background | Border |
|---------|-----------|--------|
| Info | `bg-blue-50` | `border-blue-200` |
| Warning | `bg-yellow-50` | `border-yellow-200` |
| Success | `bg-green-50` | `border-green-200` |

Pattern: `{bg} {border} border-2 rounded-2xl p-5`

---

## 12. Learning Path Nodes

| State | Style |
|-------|-------|
| Current | `bg-white border-4 border-blue-500 shadow-lg shadow-blue-200` |
| Completed | `bg-green-500 text-white` |
| Future | `bg-gray-100 text-gray-400 hover:bg-gray-200` |

Node size: `w-16 h-16 rounded-full`

---

## 13. Animations (globals.css)

```css
/* slide-up — Chat box */
@keyframes slide-up {
  from { opacity: 0; transform: translate(-50%, 100%); }
  to { opacity: 1; transform: translate(-50%, 0); }
}
.animate-slide-up { animation: slide-up 0.25s cubic-bezier(0.32, 0.72, 0, 1); }

/* fade-in — General entrance */
@keyframes fade-in {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
.animate-fade-in { animation: fade-in 0.4s ease-out; }

/* pulse-ring — Active indicators */
@keyframes pulse-ring {
  0% { transform: scale(0.8); opacity: 0.5; }
  100% { transform: scale(1.2); opacity: 0; }
}

/* slideInRight — Library document panel */
@keyframes slideInRight {
  from { transform: translateX(100%); }
  to { transform: translateX(0); }
}
.animate-slide-in-right { animation: slideInRight 0.3s ease-out; }

/* scaleIn — Content elements */
@keyframes scaleIn {
  from { opacity: 0; transform: scale(0.95); }
  to { opacity: 1; transform: scale(1); }
}
.animate-scale-in { animation: scaleIn 0.25s ease-out; }
```

### Transition Patterns
- `transition-colors` — Color changes
- `transition-all duration-200` — General transitions
- `transition-all duration-300` — Character cards
- `hover:-translate-y-1` — Hover lift

---

## 14. Scrollbar

```css
::-webkit-scrollbar { width: 8px; height: 8px; }
::-webkit-scrollbar-track { background: #f1f1f1; border-radius: 4px; }
::-webkit-scrollbar-thumb { background: #c1c1c1; border-radius: 4px; }
::-webkit-scrollbar-thumb:hover { background: #a1a1a1; }
```

---

## 15. Responsive Breakpoints

```
sm: 640px — Tablets
md: 768px — Medium devices
lg: 1024px — Large
xl: 1280px — Extra large
```

### Common Patterns
- Grid: `grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4`
- Padding: `px-4 sm:px-6 lg:px-8`
- Text: `text-5xl sm:text-6xl lg:text-7xl`

---

## 16. Accessibility

```css
/* Skip link */
.sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100]
focus:bg-blue-600 focus:text-white focus:px-4 focus:py-2 focus:rounded-lg

/* Reduced motion */
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

---

## 17. Decorative Elements

### Blur circles (background)
```
w-96 h-96 bg-{color}-50 rounded-full blur-3xl opacity-60
absolute inset-0 -z-10 overflow-hidden
```

### Section alternation
- Primary: `bg-white`
- Secondary: `bg-gray-50`
- Dark CTA: `bg-gray-900 py-16 sm:py-20`

---

## 18. Icon Library

- **Package**: Lucide React (v0.563.0)
- **Common sizes**: `w-5 h-5`, `w-6 h-6`, `w-7 h-7`
- **Key icons**: Home, BookOpen, Library, Menu, ArrowLeft, ArrowRight, Check, Lock, CheckCircle, AlertCircle, X, Lightbulb, Brain, TrendingUp, Sparkles
