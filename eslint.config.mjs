import nextPlugin from '@next/eslint-plugin-next';

/** @type {import('eslint').Linter.FlatConfig[]} */
const eslintConfig = [
  // Add other global configurations if needed, e.g., eslint:recommended
  // For TypeScript, Next.js's recommended config usually handles it.
  // If more specific TypeScript rules are needed, you can add tseslint.configs.recommended.

  nextPlugin.configs.recommended,
  nextPlugin.configs['core-web-vitals'],
];

export default eslintConfig;
