/* eslint-disable no-console */
import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const bookmarkletPath = join(__dirname, '..', 'dist', 'bookmarklet.js');

const raw = readFileSync(bookmarkletPath, 'utf-8').trim();

// Vite + Terser emits the preamble on its own line: "javascript:\n!function(){...}();"
// A bookmark URL must be a single line, so the newline is stripped here.
const PREAMBLE = 'javascript:\n';
if (!raw.startsWith(PREAMBLE)) {
    console.error('Unexpected bookmarklet format - preamble not found.');
    process.exit(1);
}

const wrapped = 'javascript:' + raw.slice(PREAMBLE.length);
writeFileSync(bookmarkletPath, wrapped, 'utf-8');

console.log(`Bookmarklet wrapped successfully. Final size: ${(wrapped.length / 1024).toFixed(1)} KB`);

// The isolation harness (public/harness.html) loads the real built bundle as a plain
// script, so it has to be refreshed on every build or it silently tests stale code.
const harnessPath = join(__dirname, '..', 'public', 'harness-bundle.js');
writeFileSync(harnessPath, wrapped.slice('javascript:'.length), 'utf-8');
console.log('Isolation harness bundle refreshed.');
