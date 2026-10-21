// Preview-only config: bundles the whole app into one HTML file so it can be
// opened from a single URL for visual review. The shipped build (npm run build)
// uses vite.config.ts and stays a normal multi-asset bundle.
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { viteSingleFile } from 'vite-plugin-singlefile';

export default defineConfig({
  plugins: [react(), viteSingleFile()],
  build: { assetsInlineLimit: 1024 * 1024 * 8 },
});
