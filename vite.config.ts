import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';

export default defineConfig(() => {
  const repoName = process.env.GITHUB_REPOSITORY?.split('/')[1];
  const isUserOrOrgPagesRepo = repoName?.toLowerCase().endsWith('.github.io');
  const useRepoBase = repoName && (isUserOrOrgPagesRepo === false || isUserOrOrgPagesRepo === undefined);
  const base = useRepoBase ? '/' + repoName + '/' : '/';

  return {
    base,
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      hmr: process.env.DISABLE_HMR === 'true' ? false : true,
    },
    test: {
      environment: 'jsdom',
      globals: true,
      setupFiles: ['./src/tests/setup.ts'],
      include: ['src/tests/**/*.test.{ts,tsx}'],
      coverage: {
        provider: 'v8',
        include: ['src/lib/**'],
        reporter: ['text', 'html'],
      },
    },
  };
});
