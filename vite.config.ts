import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  const repoName = process.env.GITHUB_REPOSITORY?.split('/')[1];
  const isUserOrOrgPagesRepo = repoName?.toLowerCase().endsWith('.github.io');
  const useRepoBase = repoName && (isUserOrOrgPagesRepo === false || isUserOrOrgPagesRepo === undefined);
  const base = useRepoBase ? '/' + repoName + '/' : '/';

  return {
    base,
    plugins: [react(), tailwindcss()],
    define: {
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
    },
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
