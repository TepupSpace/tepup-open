// CI gate for accessibility: ONLY the rules in eslint.a11y.mjs, on learner-facing files.
// `npm run lint:a11y` (and .github/workflows/accessibility.yml) uses this file.
//
// Why a separate config: the full `npm run lint` still has older, unrelated errors (admin,
// seed scripts), so it can't gate merges yet. This one is kept at zero errors.
// Next's configs are spread first so their plugins and the TypeScript parser are registered
// (otherwise every `eslint-disable … @next/next/…` comment would error), then all of their
// rules are switched off and only the accessibility rules are switched on.
import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import { a11yConfig } from "./eslint.a11y.mjs";

const inherited = [...nextVitals, ...nextTs];
const allOff = Object.fromEntries(
  inherited.flatMap((c) => Object.keys(c.rules ?? {})).map((rule) => [rule, "off"]),
);

export default defineConfig([
  ...inherited,
  { rules: allOff },
  // Disable comments for rules switched off above are expected here, not stale.
  { linterOptions: { reportUnusedDisableDirectives: "off" } },
  a11yConfig,
  globalIgnores([".next/**", "out/**", "build/**", "next-env.d.ts", "node_modules/**"]),
]);
