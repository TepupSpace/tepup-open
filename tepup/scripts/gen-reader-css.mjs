// Generates tepup/app/reader.css from Tailwind's own palette.
// Usage (from tepup/): node scripts/gen-reader-css.mjs node_modules/tailwindcss/theme.css app/reader.css
import { readFileSync, writeFileSync } from 'node:fs';

const [, , themePath, outPath] = process.argv;
const theme = readFileSync(themePath, 'utf8');
const shades = ['50', '100', '200', '300', '400', '500', '600', '700', '800', '900', '950'];
const value = (hue, shade) => {
  const m = theme.match(new RegExp(`--color-${hue}-${shade}:\\s*([^;]+);`));
  if (!m) throw new Error(`missing ${hue}-${shade}`);
  return m[1].trim();
};
const hues = [...new Set([...theme.matchAll(/--color-([a-z]+)-950:/g)].map((m) => m[1]))];
const neutrals = ['slate', 'gray', 'zinc', 'neutral', 'stone'];
const chromatic = hues.filter((h) => !neutrals.includes(h));

// Neutral ramp tuned for dark surfaces (not a plain inversion): white = card,
// 50 = page, 100–300 = raised surfaces and borders, 400–950 = text, darkest to lightest.
const DARK_NEUTRAL = {
  white: 'oklch(21.5% 0.012 260)',
  50: 'oklch(17% 0.01 260)',
  100: 'oklch(25.5% 0.013 260)',
  200: 'oklch(31% 0.014 260)',
  300: 'oklch(40% 0.015 260)',
  400: 'oklch(60% 0.015 260)',
  500: 'oklch(68% 0.014 260)',
  600: 'oklch(77% 0.012 260)',
  700: 'oklch(84% 0.01 260)',
  800: 'oklch(90% 0.008 260)',
  900: 'oklch(94% 0.006 260)',
  950: 'oklch(97% 0.004 260)',
};
const invert = Object.fromEntries(shades.map((s, i) => [s, shades[shades.length - 1 - i]]));
// A plain inversion keeps -500 as is. For these darker hues -500 text on the dark card is
// under 4.5:1 (indigo 3.8, violet 4.0, purple 4.3), so their -500 takes the -400 value.
const LIFT_500 = new Set(['red', 'rose', 'pink', 'purple', 'violet', 'indigo', 'blue']);
const darkShade = (hue, s) => (s === '500' && LIFT_500.has(hue) ? '400' : invert[s]);

const lines = [];
// --color-black stays black: it is only used for backdrops (bg-black/50), which must stay dark.
lines.push(`  --color-white: ${DARK_NEUTRAL.white};`);
for (const hue of neutrals) for (const s of shades) lines.push(`  --color-${hue}-${s}: ${DARK_NEUTRAL[s]};`);
for (const hue of chromatic) for (const s of shades) lines.push(`  --color-${hue}-${s}: ${value(hue, darkShade(hue, s))};`);

const css = `/* ============================================================================
   Tuỳ chọn đọc cho trang học (khoá học, câu chuyện, trình phát bài).

   Chỉ có hiệu lực khi trang có phần tử \`.reader\` — /courses, trang chủ, admin
   không bị ảnh hưởng. Thuộc tính \`data-reader-*\` trên <html> do
   lib/reader-prefs.ts đặt (script trong <head> + nút "Aa").

   FILE NÀY ĐƯỢC SINH TỰ ĐỘNG phần bảng màu tối từ bảng màu Tailwind v4
   (node_modules/tailwindcss/theme.css). Muốn đổi thì sửa scripts/gen-reader-css.mjs rồi chạy lại;
   lệnh chạy ở cuối file.

   Cách làm chế độ tối: các tiện ích Tailwind v4 đọc biến (\`bg-white\` =
   \`var(--color-white)\`), nên chỉ cần đặt lại biến màu khi tối là ~950 class màu
   viết cứng trong các component tự đổi theo, không phải thêm \`dark:\` từng chỗ.
   - Nhóm xám (slate/gray/zinc/neutral/stone): một thang riêng cho nền tối
     (white = thẻ, 50 = nền trang, 100–300 = bề mặt/viền, 400–950 = chữ).
   - Nhóm có màu: đảo thang (50↔950, 100↔900 … 500 giữ nguyên), nên nền nhạt
     thành nền sẫm cùng sắc, chữ đậm thành chữ sáng.
   ========================================================================= */

/* ---------- chế độ tối ---------- */
html[data-reader-theme='dark']:has(.reader) {
  color-scheme: dark;
  --background: ${DARK_NEUTRAL[50]};
  --foreground: ${DARK_NEUTRAL[900]};
${lines.join('\n')}
}

/* <body> mang class bg-white, nằm ngoài .reader: phải tự đổi nền. */
html[data-reader-theme='dark']:has(.reader) body {
  background-color: ${DARK_NEUTRAL[50]};
  color: ${DARK_NEUTRAL[900]};
}

/* Thanh cuộn tuỳ biến trong globals.css viết cứng màu sáng. */
html[data-reader-theme='dark']:has(.reader) ::-webkit-scrollbar-track { background: ${DARK_NEUTRAL[100]}; }
html[data-reader-theme='dark']:has(.reader) ::-webkit-scrollbar-thumb { background: ${DARK_NEUTRAL[300]}; }
html[data-reader-theme='dark']:has(.reader) ::-webkit-scrollbar-thumb:hover { background: ${DARK_NEUTRAL[400]}; }

/* Ảnh chụp nhiều nền trắng: dịu đi một chút để không chói giữa nền tối. Ảnh tác giả đưa
   vào bài (class content-image: khối ảnh, lật thẻ) có nền trắng phía sau, kẻo sơ đồ nét đen
   nền trong suốt chìm vào nền tối. Chỉ ảnh trong bài: logo và hình nhân vật vốn trong suốt
   có chủ đích, thêm nền trắng thì thành ô vuông trắng. */
html[data-reader-theme='dark'] .reader img.content-image {
  background-color: #fff;
}
html[data-reader-theme='dark'] .reader img:not([src$='.svg']) {
  filter: brightness(0.92);
}

/* Tailwind đặt màu khoảng hở của vòng focus (ring-offset) mặc định là trắng: ở nền tối thành
   một quầng trắng. Cho nó theo màu thẻ. */
html[data-reader-theme='dark']:has(.reader) * {
  --tw-ring-offset-color: ${DARK_NEUTRAL.white};
}

/* Màu chữ tác giả đặt thẳng trong nội dung bài (span không có class, thường là đen
   rgb(0,0,0) dán từ Google Docs/Word) không đổi theo giao diện: ở nền tối là đen trên gần
   đen, 1.2:1. Ở chế độ tối, chữ đó theo màu chữ của giao diện. Mất màu nhấn là chấp nhận
   được: tô màu để nhấn mạnh vốn không được dùng làm cách duy nhất (docs/accessibility.md). */
html[data-reader-theme='dark'] .reader span[style*='color']:not([class]),
html[data-reader-theme='dark'] .reader font[color] {
  color: inherit !important;
}

/* ---------- phông dễ đọc (Andika, có đủ dấu tiếng Việt) ---------- */
html[data-reader-font='readable']:has(.reader) body,
html[data-reader-font='readable'] .reader :where(button, input, textarea, select) {
  font-family: var(--font-andika), Arial, Helvetica, sans-serif;
}
/* Giãn chữ và từ vừa phải — các hướng dẫn cho người khó đọc đều khuyên vậy. */
html[data-reader-font='readable'] .reader {
  letter-spacing: 0.02em;
  word-spacing: 0.08em;
}

/* Trang học "giấy" (components/learn/player-paper.css) đặt Be Vietnam Pro / Fraunces qua hai biến
   này; phông dễ đọc phải thắng cả hai, kể cả tiêu đề nghiêng. */
html[data-reader-font='readable'] .reader {
  --pl-sans: var(--font-andika), Arial, Helvetica, sans-serif;
  --pl-serif: var(--font-andika), Arial, Helvetica, sans-serif;
}

/* ---------- token màu "giấy" của trang học ----------
   Dùng trong components/learn/player-paper.css (lớp .pl). Màu sáng và màu tối nằm cạnh nhau.
   Các cặp chữ/nền chính đều ≥ 4.5:1:
   sáng — ink/page 10.6, muted/page 4.7, muted/card 5.7, trắng/nút đỏ 4.5 (hover 5.2),
          chọn 4.8, đúng 6.4, sai 5.0, trắng/nút xanh 4.8, callout info 7.9 · warning 7.0 ·
          success 6.4, nút tắt 4.7; thanh tiến độ/rãnh 3.4 (đồ hoạ, cần 3:1);
   tối  — ink/page 13.8, muted/card 6.6, trắng/nút đỏ 5.4, chọn 6.8, đúng 7.3, sai 6.1,
          callout info 9.0 · warning 8.8 · success 8.7, nút tắt 4.9, tiến độ/rãnh 4.5.
   Màu "solid" là nền của chữ text-white trong block tương tác: ở chế độ tối text-white là màu
   thẻ (sẫm) nên solid phải sáng (≥ 6.4:1 với #2a2826). */
.reader {
  --pl-page: #e8e8e8;
  --pl-texture-opacity: 0.5;
  --pl-ink: #313131;
  --pl-ink-strong: #141414;
  --pl-muted: #666666;
  --pl-card: #ffffff;
  --pl-card-hover: #f8f8f8;
  --pl-subtle: #f7f7f7;
  --pl-line: #e1e1e1;
  --pl-line-strong: #bdbdbd;
  --pl-track: #d9d9d9;
  --pl-red: #e03e28;
  --pl-red-fill: #da3c27;
  --pl-red-fill-hover: #c83622;
  --pl-red-solid: #da3c27;
  --pl-on-red: #ffffff;
  --pl-red-text: #c3301c;
  --pl-sel-bg: #ffeae8;
  --pl-green: #2cab8b;
  --pl-green-fill: #1e8068;
  --pl-green-fill-hover: #196e59;
  --pl-green-solid: #1e8068;
  --pl-on-green: #ffffff;
  --pl-green-text: #106852;
  --pl-right-bg: #e6fff9;
  --pl-progress: #1e8068;
  --pl-wrong: #ca1414;
  --pl-wrong-solid: #ca1414;
  --pl-wrong-bg: #ffe8e8;
  --pl-info-bg: #e6f3ff;
  --pl-info-line: #3187d7;
  --pl-info-solid: #2470b8;
  --pl-info-text: #184c7d;
  --pl-warning-bg: #fff3e6;
  --pl-warning-line: #f1922c;
  --pl-warning-solid: #a65a0c;
  --pl-warning-text: #794815;
  --pl-success-bg: #e6fff9;
  --pl-success-line: #2cab8b;
  --pl-success-text: #106852;
  --pl-disabled-bg: #d9d9d9;
  --pl-disabled-text: #5c5c5c;
  --pl-seg-bg: #fff1c7;
  --pl-seg-line: #f1922c;
  /* Thang xám của block tương tác (xem player-paper.css). */
  --pl-n400: #949494;
  --pl-n600: #5c5c5c;
  --pl-n700: #3f3f3f;
}
html[data-reader-theme='dark'] .reader {
  --pl-page: #1f1d1b;
  --pl-texture-opacity: 0.06;
  --pl-ink: #ece8e3;
  --pl-ink-strong: #faf7f2;
  --pl-muted: #b3ada6;
  --pl-card: #2a2826;
  --pl-card-hover: #33302d;
  --pl-subtle: #33302d;
  --pl-line: #4a4642;
  --pl-line-strong: #6b6560;
  --pl-track: #45413d;
  --pl-red: #f0705c;
  --pl-red-fill: #c23a26;
  --pl-red-fill-hover: #a93020;
  --pl-red-solid: #f0705c;
  --pl-on-red: #ffffff;
  --pl-red-text: #ff9b8a;
  --pl-sel-bg: #45231d;
  --pl-green: #3cc29f;
  --pl-green-fill: #1e8068;
  --pl-green-fill-hover: #196e59;
  --pl-green-solid: #3cc29f;
  --pl-on-green: #ffffff;
  --pl-green-text: #6fd9bc;
  --pl-right-bg: #163a31;
  --pl-progress: #3cc29f;
  --pl-wrong: #ff8a80;
  --pl-wrong-solid: #ff8a80;
  --pl-wrong-bg: #4a1f1f;
  --pl-info-bg: #1b2c3d;
  --pl-info-line: #4a9be0;
  --pl-info-solid: #7ab8ee;
  --pl-info-text: #a9d2f5;
  --pl-warning-bg: #3a2a17;
  --pl-warning-line: #f1922c;
  --pl-warning-solid: #f1a95c;
  --pl-warning-text: #f7c690;
  --pl-success-bg: #163a31;
  --pl-success-line: #2cab8b;
  --pl-success-text: #9ee6d0;
  --pl-disabled-bg: #3d3a37;
  --pl-disabled-text: #b0aaa3;
  --pl-seg-bg: #4a3a12;
  --pl-seg-line: #f1a95c;
  --pl-n400: #8a847d;
  --pl-n600: #c4beb7;
  --pl-n700: #d6d1cb;
}

/* ---------- cỡ chữ: đổi cỡ gốc, mọi kích thước rem (chữ và khoảng cách) co giãn theo ---------- */
html[data-reader-size='1']:has(.reader) { font-size: 90%; }
html[data-reader-size='3']:has(.reader) { font-size: 112.5%; }
html[data-reader-size='4']:has(.reader) { font-size: 125%; }
html[data-reader-size='5']:has(.reader) { font-size: 150%; }

/* Sinh bởi: node scripts/gen-reader-css.mjs node_modules/tailwindcss/theme.css app/reader.css */
`;
writeFileSync(outPath, css);
console.log(`wrote ${outPath}: ${lines.length} colour variables (${chromatic.length} chromatic hues)`);
