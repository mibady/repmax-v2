import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./__tests__/setup.ts'],
    include: ['__tests__/**/*.{test,spec}.{ts,tsx}'],
    exclude: ['node_modules', '.next', 'e2e'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      reportsDirectory: './coverage',
      include: [
        'app/api/**/*.ts',
        'lib/actions/**/*.ts',
        'lib/data/**/*.ts',
        'lib/utils/**/*.ts',
      ],
      exclude: [
        'node_modules',
        '.next',
        '**/*.d.ts',
        '**/*.config.*',
        'app/**/layout.tsx',
        'app/**/loading.tsx',
        'app/**/error.tsx',
        'app/**/not-found.tsx',
        // Phase 5-6 routes (not yet in scope for testing sprint)
        'app/api/recruiting/**',
        'app/api/recruiter/**',
        'app/api/rankings/**',
        'app/api/club/**',
        'app/api/notifications/**',
        'app/api/upload/**',
        'app/api/zone/**',
        'app/api/onboarding/**',
        'app/api/admin/moderation/**',
        'app/api/admin/users/**',
        'app/api/athlete/documents/**',
        // Tournament sub-routes (Phase 5-6, complex game/bracket/venue management)
        'app/api/tournaments/**/brackets/**',
        'app/api/tournaments/**/games/**',
        'app/api/tournaments/**/notifications/**',
        'app/api/tournaments/**/register/**',
        'app/api/tournaments/**/registrations/**',
        'app/api/tournaments/**/roster/**',
        'app/api/tournaments/**/venues/**',
        'app/api/tournaments/pay/**',
        // Coach sub-routes (not yet in testing scope)
        'app/api/coach/team/**',
        'app/api/settings/**',
        // Utility files without direct route coverage
        'lib/utils/repmax-id-generator.ts',
        'lib/utils/subscription-server.ts',
        'lib/actions/communication-actions.ts',
        'lib/actions/visit-actions.ts',
        'lib/actions/index.ts',
      ],
      thresholds: {
        branches: 65,
        functions: 70,
        lines: 70,
        statements: 70,
      },
    },
    testTimeout: 10000,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './'),
      '@repmax/shared': path.resolve(__dirname, '../../packages/shared/src'),
    },
  },
});
