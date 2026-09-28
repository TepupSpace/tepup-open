# MassEdu Design Style Reference

> Design tokens & patterns từ MassEdu (một nguyên mẫu trước đây của nhóm).
> Dùng làm reference khi muốn áp dụng style MassEdu vào Tepup.

---

## 1. Color Palette

### Primary Brand
| Name | Hex | Usage |
|------|-----|-------|
| Red (Primary) | `#EB3724` | Brand color chính |
| Red Hover | `#FF4A38` | Hover state |
| Red Active | `#D32F1F` | Active/pressed |
| Green (Accent) | `#00D68F` | Growth, success |
| Yellow (Accent) | `#FFE534` | Creative, warning |

### Light Theme
| Name | Hex | Usage |
|------|-----|-------|
| Background Primary | `#FFFEF1` | Warm off-white, nền chính |
| Background Secondary | `#FFFFFF` | Pure white sections |
| Background Tertiary | `#F5F3ED` | Light beige containers |
| Text Primary | `#1A1816` | Dark brown, text chính |
| Text Secondary | `#4A4540` | Medium brown |
| Text Tertiary | `#9A9690` | Light gray-brown |
| Border Subtle | `#E2DDD5` | Borders nhẹ |
| Border Default | `#C9C5BE` | Borders thường |
| Border Emphasis | `#4A4540` | Borders nhấn mạnh |

### Dark Theme
| Name | Hex | Usage |
|------|-----|-------|
| Background Primary | `#1A1816` | Very dark |
| Background Secondary | `#2D2A26` | Dark gray |
| Background Tertiary | `#3D3935` | Medium dark |
| Text Primary | `#F5F3ED` | Off-white |
| Text Secondary | `#C9C5BE` | Light gray |

### Learning Content Colors
| Type | Border | Background |
|------|--------|-----------|
| Lessons | `#66BB6A` | `#E8F5E9` |
| Stories | `#FFA726` | `#FFF3E0` |
| Modules | `#42A5F5` | `#E1F5FE` |
| Concepts | `#AB47BC` | `#F3E5F5` |

---

## 2. Typography

### Font Families
| Role | Font | Type |
|------|------|------|
| Headlines | **Lexend** | Sans-serif |
| Subheadings | **Poppins** | Sans-serif |
| Body | **Lora** | Serif |

### Font Sizes (Fluid)
```css
--font-display: clamp(40px, 6vw, 72px);
--font-h1: clamp(32px, 4.5vw, 52px);
--font-h2: clamp(24px, 3.5vw, 36px);
--font-body: 16px;
--font-body-lg: 18px;
```

### Font Weights
- Regular: 400
- Medium: 500
- Semibold: 600
- Bold: 700

### Line Heights
- Tight: 1.2 (headings)
- Normal: 1.5 (standard)
- Relaxed: 1.75 (readable body)
- Loose: 1.9 (max readability)

---

## 3. Spacing System (8px Grid)

| Token | Value |
|-------|-------|
| XS | 8px |
| SM | 16px |
| MD | 32px |
| LG | 64px |
| XL | 96px |
| 2XL | 128px |
| 3XL | 192px |

### Container Widths
| Size | Width |
|------|-------|
| Narrow | 680px |
| Medium | 960px |
| Wide | 1200px |

### Section Padding
- Default: 96px vertical
- 768px+: 128px vertical

---

## 4. Borders

### Key Characteristics
- **Không border-radius** (sharp edges) — Đây là điểm khác biệt lớn nhất
- **Thick borders** (2-4px) thay vì thin (1px)
- **Left accent borders** (3px) cho section headings
- **Dashed borders** cho document/receipt containers

### Border Widths
| Type | Width |
|------|-------|
| Thin | 1px |
| Default | 2px |
| Thick | 4px |

---

## 5. Shadows

```css
--shadow-sm: 0 2px 8px rgba(0, 0, 0, 0.05);
--shadow-md: 0 4px 16px rgba(0, 0, 0, 0.08);
--shadow-lg: 0 8px 32px rgba(0, 0, 0, 0.12);

/* Dark mode */
--shadow-sm-dark: 0 2px 12px rgba(0, 0, 0, 0.4);
```

---

## 6. Animations

### Timing
| Speed | Duration |
|-------|----------|
| Fast | 0.2s ease |
| Base | 0.3s ease |
| Slow | 0.6s ease |

### Hover Patterns
| Element | Effect |
|---------|--------|
| Buttons | `translateX(8px)` + shadow offset `-8px 0 0 0` |
| Elevation | `translateY(-2px)` + box-shadow glow |
| Cards | `translateY(-8px) rotateX(2deg)` (3D perspective) |
| Fade-in | 0.5s ease-in-out + `translateY(20px)` |

---

## 7. Buttons

### Style
```css
/* Sharp edges, thick borders */
border: 2px solid;  /* hoặc 4px */
border-radius: 0;   /* KHÔNG rounded */
padding: var(--space-sm) var(--space-lg);
font-weight: 600;   /* semibold */

/* Hover */
transform: translateY(-2px);
box-shadow: enhanced;

/* Disabled */
opacity: 0.5;
cursor: not-allowed;
```

---

## 8. Cards

### Standard Card
```css
/* Sharp edges, accent border */
border-left: 5px solid; /* gradient accent */
padding: 1.5rem;
box-shadow: var(--shadow-md);

/* Hover — 3D effect */
transform: translateY(-8px) rotateX(2deg);
box-shadow: 0 12px 24px rgba(235, 55, 36, 0.3);
```

### Trading Card Game Style
- Horizontal scrolling carousel: `scroll-snap-type: x mandatory`
- Desktop width: `flex: 0 0 220px`
- Mobile width: 160px
- 3D perspective: `perspective: 1000px`
- Avatar circle: 80px

---

## 9. Progress Indicators

| State | Style |
|-------|-------|
| Default | Hollow circle (30px), border only |
| Active | Primary color bg, white text |
| Completed | Emphasis-600 bg, white text |
| Mobile | 35px dots |

---

## 10. Hero Section

```css
min-height: 45vh;
border-bottom: thick;
text-align: center;
display: flex; /* centering */

p { max-width: 50ch; }
```

---

## 11. Dark Mode Implementation

```css
/* Selector */
[data-theme='dark'] {
  /* Backgrounds darken */
  /* Text lightens for contrast */
  /* Gradients invert accent direction */
  /* Shadows strengthen */
}
```

---

## 12. Logo

### Files
- `Tepup-Color-Logo-0.png` — Logo variant 0
- `Tepup-Color-Logo-1.png` — Logo variant 1

### Usage
- Header logo: responsive sizes (35px mobile, 50px tablet, 80px+ desktop)
- Social preview: `Tepup-Color-Logo-1.png`

---

## 13. Responsive Breakpoints

| Breakpoint | Width |
|-----------|-------|
| Mobile | ≤ 768px |
| Tablet | 996px |
| Desktop | 1200px+ |

### Mobile Adjustments
- Padding: 2rem → 1rem
- Logo: 35px
- Card width: 160px
- Animations: slower (60s) for performance

---

## 14. Docusaurus Integration

- Framework: Docusaurus 3.8.1 + React 19
- Default language: Vietnamese (vi)
- Syntax highlighting: GitHub (light), Dracula (dark)
- Dev port: 3001

---

## Phù hợp áp dụng cho Tepup

1. **Logo PNG** — Thay thế text logo hiện tại
2. **Typography (Lexend + Lora)** — Đẹp hơn cho education
3. **Warm background (#FFFEF1)** — Cảm giác ấm áp
4. **Learning content colors** — Hệ thống màu cho lessons/stories/modules
5. **Dark mode** — UX improvement lớn

## KHÔNG nên áp dụng

1. **Sharp edges (no border-radius)** — Tepup rounded corners friendly hơn
2. **Red primary (#EB3724)** — Tepup blue phù hợp education hơn
3. **3D card hover effects** — Quá phức tạp, Tepup subtler tốt hơn
4. **Trading card game aesthetic** — Không phù hợp Tepup's learning path UI
