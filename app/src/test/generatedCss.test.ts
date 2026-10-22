/// <reference types="node" />
import { describe, expect, it } from 'vitest';
import { compile } from 'tailwindcss';
import { Scanner } from '@tailwindcss/oxide';
import fs from 'node:fs';
import path from 'node:path';

/* Guards the Tailwind generation pipeline itself: a class token that the
   scanner never extracts (e.g. glued to a `${...}` interpolation) silently
   drops the rule, and class-token tests cannot see that. Card's 18px vertical
   padding was lost exactly this way once. */

const APP_ROOT = path.join(path.dirname(new URL(import.meta.url).pathname), '..', '..');
const SRC = path.join(APP_ROOT, 'src');

async function loadStylesheet(
  id: string,
  basedir: string,
): Promise<{ path: string; base: string; content: string }> {
  let p: string;
  if (id === 'tailwindcss') p = path.join(APP_ROOT, 'node_modules', 'tailwindcss', 'index.css');
  else if (id.startsWith('.')) p = path.resolve(basedir, id);
  else p = require.resolve(id, { paths: [APP_ROOT] });
  return { path: p, base: path.dirname(p), content: fs.readFileSync(p, 'utf8') };
}

function scannedSources() {
  const files = [path.join(SRC, 'App.tsx')];
  for (const f of fs.readdirSync(path.join(SRC, 'ui'))) {
    if (f.endsWith('.tsx')) files.push(path.join(SRC, 'ui', f));
  }
  return files;
}

async function generatedCss() {
  const result = await compile(fs.readFileSync(path.join(SRC, 'index.css'), 'utf8'), {
    base: SRC,
    loadStylesheet,
  });
  const scanner = new Scanner({});
  const candidates = scanner.scanFiles(
    scannedSources().map((f) => ({ content: fs.readFileSync(f, 'utf8'), extension: 'tsx' })),
  );
  return { candidates, css: result.build(candidates) };
}

describe('Tailwind generation pipeline', () => {
  it('extracts every sentinel utility the primitives rely on', async () => {
    const { candidates } = await generatedCss();
    const sentinels = [
      'py-[18px]', // Card vertical padding - the original glued-token casualty
      'px-5',
      'bg-green',
      'text-black',
      'bg-panel-2',
      'animate-[tj-rise_.28s_ease-out_both]',
      'first-of-type:border-t-0',
      'max-sm:bg-transparent',
      'max-[400px]:hidden',
      'accent-green',
      'shadow-[0_4px_14px_rgba(29,185,84,.35)]',
    ];
    for (const s of sentinels) {
      expect(candidates, `scanner must extract ${s}`).toContain(s);
    }
  });

  it('emits the Card padding rule with its 18px declaration', async () => {
    const { css } = await generatedCss();
    const rule = css.match(/\.py-\\\[18px\\\]\s*\{[^}]*\}/s);
    expect(rule, 'generated CSS must contain the .py-[18px] rule').not.toBeNull();
    expect(rule![0]).toMatch(/padding[a-z-]*:\s*18px/);
  });

  it('emits state, variant and animation rules', async () => {
    const { css } = await generatedCss();
    expect(css).toMatch(/\.bg-green\s*\{/);
    expect(css).toMatch(/\.first-of-type\\:border-t-0:first-of-type\s*\{/);
    expect(css).toMatch(/\.max-sm\\:bg-transparent\s*\{/);
    expect(css).toMatch(/animation:\s*tj-rise \.28s ease-out both/);
    expect(css).toMatch(/@keyframes tj-rise/);
    expect(css).toMatch(/\.accent-green\s*\{/);
  });

  it('no className token is glued to a template interpolation (scanner-invisible)', () => {
    // A token like `py-[18px]${...}` is one whitespace-delimited blob to the
    // scanner - the utility is never extracted and its rule silently vanishes.
    const glued = /className=\{`[^`]*\S\$\{/;
    for (const f of scannedSources()) {
      const text = fs.readFileSync(f, 'utf8');
      expect(text, `${path.basename(f)} has a class token glued to an interpolation`).not.toMatch(glued);
    }
  });
});
