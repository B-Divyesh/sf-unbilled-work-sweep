import { createHash } from 'node:crypto';
import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { defineConfig, type Plugin } from 'vite';

/**
 * `public/sw.js` is deliberately small and framework-free. Vite hashes the
 * executable files after the public directory is copied, so fill its two
 * placeholders from Vite's manifest at the very end of a production build.
 */
function precacheBuiltShell(): Plugin {
  return {
    name: 'precache-built-shell',
    apply: 'build',
    async closeBundle() {
      const output = resolve(process.cwd(), 'dist');
      const manifest = JSON.parse(await readFile(resolve(output, '.vite/manifest.json'), 'utf8')) as Record<string, {
        file: string;
        css?: string[];
        assets?: string[];
      }>;
      const files = [...new Set(Object.values(manifest).flatMap((entry) => [entry.file, ...(entry.css ?? []), ...(entry.assets ?? [])]))]
        .filter((file) => /\.(?:js|css)$/u.test(file))
        .map((file) => `/${file}`);
      if (!files.some((file) => file.endsWith('.js')) || !files.some((file) => file.endsWith('.css'))) {
        throw new Error('The service worker precache is missing a built JavaScript or CSS app asset.');
      }
      const version = `unbilled-work-sweep-${createHash('sha256').update(files.join('|')).digest('hex').slice(0, 12)}`;
      const serviceWorkerPath = resolve(output, 'sw.js');
      const source = await readFile(serviceWorkerPath, 'utf8');
      if (!source.includes('__CACHE_VERSION__') || !source.includes('__PRECACHE_ASSETS__')) {
        throw new Error('Service worker precache placeholders were not found.');
      }
      await writeFile(serviceWorkerPath, source
        .replace('__CACHE_VERSION__', version)
        .replace('__PRECACHE_ASSETS__', JSON.stringify(files)));
    }
  };
}

export default defineConfig({
  build: {
    target: 'es2022',
    sourcemap: true,
    manifest: true,
    rollupOptions: { output: { assetFileNames: 'assets/[name]-[hash][extname]' } }
  },
  plugins: [precacheBuiltShell()]
});
