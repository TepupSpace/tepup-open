# Fonts

Tepup uses **Geist Sans** and **Geist Mono**, loaded via Google Fonts at the top of `../colors_and_type.css`:

```css
@import url('https://fonts.googleapis.com/css2?family=Geist:wght@300;400;500;600;700;800&family=Geist+Mono:wght@400;500;600&display=swap');
```

This matches how the live codebase loads them — via `next/font/google` in `tepup/app/layout.tsx`. **No local `.woff2` files exist in the source.**

If you want fully offline fidelity (or to ship a static build that doesn't fetch from Google), download Geist from <https://vercel.com/font> and drop the `.woff2` files here, then replace the `@import` in `colors_and_type.css` with `@font-face` rules pointing at this folder.

Geist supports full Latin Extended including Vietnamese diacritics, so the Google Fonts version is byte-equivalent to the local files for the Vietnamese-content use case.
