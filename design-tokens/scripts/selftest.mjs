// Proves the package still reads, exports and measures as it should, and that each check still
// catches the breakage it exists for. Run by `npm run check`; exit 1 if any case is missed.
import { execFileSync } from 'node:child_process';
import { mkdtempSync, readFileSync, readdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import {
  checkContrast,
  checkDtcg,
  checkTokens,
  contrast,
  parseColour,
  readTokens,
  toDtcg,
} from '../src/index.ts';

const DIR = new URL('./fixtures/', import.meta.url).pathname;
const files = Object.fromEntries(
  readdirSync(DIR)
    .filter((f) => f.endsWith('.css'))
    .map((f) => [f, readFileSync(DIR + f, 'utf8')]),
);
const groups = JSON.parse(readFileSync(DIR + 'pairs.json', 'utf8'));
const tokens = readTokens(files);
const byName = new Map(tokens.map((t) => [t.name, t]));
const clone = (x) => JSON.parse(JSON.stringify(x));

let ok = true;
const expect = (what, pass) => {
  console.log(`design-tokens selftest: ${pass ? 'ok' : 'MISSED'} - ${what}`);
  ok &&= pass;
};
const close = (a, b) => Math.abs(a - b) < 0.01;

// Reading.
expect('light-dark() splits into a light and a dark value', byName.get('--ds-ground')?.dark === '#1d2126');
expect('a dark-theme block gives the dark value', byName.get('--ds-ink')?.dark === '#eef0f2');
expect('a token with one value has no dark value', byName.get('--ds-signal')?.dark === undefined);

// Measuring.
expect('black on white is 21:1', close(contrast(parseColour('#000'), parseColour('#fff')), 21));
expect('#777 on white is 4.48:1', close(contrast(parseColour('#777777'), parseColour('#fff')), 4.48));
expect('a translucent colour is laid on its ground', close(contrast(parseColour('rgba(0,0,0,0)'), parseColour('#fff')), 1));

// Exporting.
const x = toDtcg(tokens, { prefix: 'fixture' });
const t = (g, k) => x.foundation[g]?.[k];
expect('a colour exports as srgb with its hex', t('ds', 'signal')?.$value?.hex === '#d4561c');
expect('an alias exports as a reference', t('ds', 'link')?.$value === '{ds.signal}');
expect('px, ms, cubic-bezier, weight and font family get their types',
  ['space-2:dimension', 'dur-turn:duration', 'ease:cubicBezier', 'w-bold:fontWeight', 'font-sans:fontFamily']
    .every((s) => { const [k, type] = s.split(':'); return t('ds', k)?.$type === type; }));
expect('calc-like and gradient values stay CSS-only with a reason',
  ['--ds-measure', '--ds-wash'].every((n) => x.skipped.some((s) => s.name === n && s.reason)));
expect('a theme-dependent token is in the light and dark files', x.dark.ds?.ground?.$value?.hex === '#1d2126');
expect('the four files are named by the prefix', Object.keys(x.files).sort().join() ===
  'fixture.dark.tokens.json,fixture.light.tokens.json,fixture.resolver.json,fixture.tokens.json');

// The checks pass the fixture and catch each breakage.
expect('the fixture passes both checks', checkTokens(tokens, groups).errs.length === 0);
const faint = readTokens({ ...files, 'colour.css': files['colour.css'].replace('#5d5548', '#cfc6b4') });
expect('catches muted text too faint on a light page', checkContrast(faint, groups).some((e) => e.includes('light page')));
const darkFaint = readTokens({ ...files, 'colour.css': files['colour.css'].replace('#a8aeb6', '#3a3f47') });
expect('catches muted text too faint on a dark page only',
  checkContrast(darkFaint, groups).every((e) => e.includes('dark page')) && checkContrast(darkFaint, groups).length > 0);
expect('catches a pair whose token is gone', checkContrast(tokens, [{ title: 't', pairs: [
  { role: 'gone', fg: '--ds-nowhere', ground: '--ds-ground', need: 'text' }] }]).length > 0);
const broken = (edit) => { const y = clone(x); edit(y); return checkDtcg(y).length > 0; };
expect('catches a reference to no token', broken((y) => { y.foundation.ds.link.$value = '{ds.nowhere}'; }));
expect('catches a token with no $type', broken((y) => { delete y.foundation.ds['space-2'].$type; }));
expect('catches a colour that is not srgb', broken((y) => { y.foundation.ds.signal.$value.colorSpace = 'display-p3'; }));
expect('catches the wrong resolver version', broken((y) => { y.resolver.version = '2025.01'; }));
expect('catches a resolver naming a missing file', broken((y) => { delete y.files['fixture.dark.tokens.json']; }));

// The command line.
const cli = new URL('../src/cli.ts', import.meta.url).pathname;
const run = (...args) => {
  try {
    execFileSync('npx', ['tsx', cli, ...args], { stdio: 'pipe' });
    return 0;
  } catch (e) {
    return e.status;
  }
};
const out = mkdtempSync(join(tmpdir(), 'design-tokens-'));
expect('the CLI passes the fixture folder', run('check', DIR, '--pairs', DIR + 'pairs.json') === 0);
expect('the CLI exports four files', run('export', DIR, '--out', out, '--prefix', 'fx') === 0 && readdirSync(out).length === 4);
expect('the CLI fails a bad pairs file', run('check', DIR, '--pairs', DIR + 'colour.css') === 2);
expect('the CLI fails with no command', run() === 2);

process.exit(ok ? 0 : 1);
