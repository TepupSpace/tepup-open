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

/* ---------- cỡ chữ: đổi cỡ gốc, mọi kích thước rem (chữ và khoảng cách) co giãn theo ---------- */
html[data-reader-size='1']:has(.reader) { font-size: 90%; }
html[data-reader-size='3']:has(.reader) { font-size: 112.5%; }
html[data-reader-size='4']:has(.reader) { font-size: 125%; }
html[data-reader-size='5']:has(.reader) { font-size: 150%; }

/* Sinh bởi: node scripts/gen-reader-css.mjs node_modules/tailwindcss/theme.css app/reader.css */
`;
writeFileSync(outPath, css);
console.log(`wrote ${outPath}: ${lines.length} colour variables (${chromatic.length} chromatic hues)`);
