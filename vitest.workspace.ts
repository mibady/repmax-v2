import { defineWorkspace } from 'vitest/config';

export default defineWorkspace([
  {
    extends: './apps/web/vitest.config.ts',
    test: {
      name: 'web',
      root: './apps/web',
    },
  },
  {
    extends: './packages/shared/vitest.config.ts',
    test: {
      name: 'shared',
      root: './packages/shared',
    },
  },
]);
