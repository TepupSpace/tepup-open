// Accessibility lint rules for learner-facing code, shared by eslint.config.mjs (editor
// and `npm run lint`) and eslint.a11y.config.mjs (the CI gate, `npm run lint:a11y`).
// Background and the reasoning behind each check: docs/accessibility.md.
//
// jsx-a11y comes from eslint-config-next (already registered there), so no extra dependency.
import nextVitals from "eslint-config-next/core-web-vitals";

const jsxA11y = nextVitals.find((c) => c.plugins?.["jsx-a11y"]).plugins["jsx-a11y"];

/** Everything people use: learner pages, plus the contributor, admin and sign-in areas. */
export const a11yFiles = [
  "app/layout.tsx",
  "app/(auth)/**/*.{ts,tsx}",
  "app/admin/**/*.{ts,tsx}",
  "app/contributor/**/*.{ts,tsx}",
  "components/admin/**/*.{ts,tsx}",
  "components/contributor/**/*.{ts,tsx}",
  "components/review/**/*.{ts,tsx}",
  "components/pwa/**/*.{ts,tsx}",
  "app/(learn)/**/*.{ts,tsx}",
  "app/(player)/**/*.{ts,tsx}",
  "app/(courses-hub)/**/*.{ts,tsx}",
  "components/*.tsx",
  "components/learn/**/*.{ts,tsx}",
  "components/blocks/**/*.{ts,tsx}",
  "components/ai/**/*.{ts,tsx}",
  "components/reader/**/*.{ts,tsx}",
  "components/courses-hub/**/*.{ts,tsx}",
  "components/library/**/*.{ts,tsx}",
  "components/mobile/**/*.{ts,tsx}",
  "components/skeletons/**/*.{ts,tsx}",
  "components/ui/**/*.{ts,tsx}",
];

// TepUp-specific checks on class strings. Heuristics: they look at one string at a time, so
// a class list split across variables can slip through, and a true exception can be
// silenced with `// eslint-disable-next-line no-restricted-syntax -- <reason>`.
const CLASS_CHECKS = [
  {
    // Light greys fail 4.5:1 on white and on tinted panels (gray-400 is 2.6:1).
    // placeholder:/disabled:/hover: variants are not matched.
    pattern: String.raw`(?<![\w:-])text-(gray|slate|zinc|neutral|stone)-(300|400)\b`,
    message:
      "Low-contrast text: gray-300/400 fails WCAG 1.4.3 (4.5:1). Use gray-500 or darker for meaningful text. See docs/accessibility.md#colour.",
  },
  {
    // White text on mid-tone fills: green-500 is 2.2:1, blue-500 3.8:1, teal-600 3.7:1.
    pattern: String.raw`^(?=.*(?<![\w:-])text-white\b)(?=.*(?<![\w:-])bg-((green|teal|emerald|lime|orange|amber|yellow|cyan|sky)-(300|400|500|600)|(blue|indigo|violet|purple|fuchsia|pink|rose|red)-(300|400|500))\b)`,
    message:
      "White text on this fill fails 4.5:1. Use -600 for blue/indigo/violet/purple/red/pink/rose and -700 for the other hues. See docs/accessibility.md#colour.",
  },
  {
    pattern: String.raw`(?<![\w-])text-\[(8|9|10|11)px\]`,
    message: "Text below 12px. Use text-xs or larger (and rem units, so the reading-size setting scales it).",
  },
  {
    // Literal colours bypass the reader dark theme, which re-points Tailwind's palette variables.
    pattern: String.raw`(?<![\w-])(bg|text|border|from|via|to|fill|stroke|ring|outline|decoration|divide|placeholder)-\[#`,
    message:
      "Hard-coded colour: dark mode only adapts Tailwind palette classes. Use a palette class (bg-gray-50, text-blue-700…). See docs/accessibility.md#dark-mode.",
  },
  {
    // Removing the outline without a replacement leaves keyboard users with no focus indicator.
    pattern: String.raw`^(?=.*(?<![\w-])(focus:|focus-visible:)?outline-none\b)(?!.*(focus|focus-visible|focus-within):(ring|outline-(?!none)|border-(gray|slate|blue|indigo|teal|green)-[6-9]00))`,
    message:
      "outline-none without a visible focus style. Add focus-visible:ring-2 (with a -600/-700 colour) or remove outline-none. See docs/accessibility.md#keyboard.",
  },
];

const restricted = CLASS_CHECKS.flatMap(({ pattern, message }) => [
  { selector: `Literal[value=/${pattern}/]`, message },
  { selector: `TemplateElement[value.raw=/${pattern}/]`, message },
]);

export const a11yRules = {
  // Every jsx-a11y "strict" rule, as errors.
  ...Object.fromEntries(Object.keys(jsxA11y.configs.strict.rules).map((rule) => [rule, "error"])),
  // Deprecated, and its strict form demands BOTH nesting and id; the maintained rule below
  // accepts either, which is what browsers and screen readers need.
  "jsx-a11y/label-has-for": "off",
  "jsx-a11y/label-has-associated-control": ["error", { assert: "either", depth: 3 }],
  // Form fields are covered by label-has-associated-control; this rule doesn't see a field
  // nested in its <label> and would flag every radio/checkbox built that way.
  "jsx-a11y/control-has-associated-label": [
    "error",
    { ignoreElements: ["audio", "canvas", "embed", "input", "select", "textarea", "tr", "video"], depth: 3 },
  ],
  "no-restricted-syntax": ["error", ...restricted],
};

/** Flat-config block: the rules above, on learner-facing files only. */
export const a11yConfig = { files: a11yFiles, rules: a11yRules };
