import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

// eslint-config-next 15.x ships LEGACY (eslintrc) configs. ESLint 9 flat config
// needs them wrapped with FlatCompat — importing them directly into
// defineConfig() (the v16 pattern) crashes with `Plugin "" not found`.
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const compat = new FlatCompat({ baseDirectory: __dirname });

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    ignores: [".next/**", "out/**", "build/**", ".vercel/**", "next-env.d.ts"],
  },
];

export default eslintConfig;
