/** design-tokens: check CSS tokens against DTCG 2025.10 and WCAG 2.2, or export them as DTCG files.
 *
 *    design-tokens check  <css file or folder>... [--pairs pairs.json] [options]
 *    design-tokens export <css file or folder>... --out <folder> [options]
 *
 *  Options: --name <system name>, --prefix <file prefix>, --namespace <$extensions key>.
 *  A folder means every .css file in it. pairs.json is a list of pairs or of groups of pairs
 *  ({ "role", "fg", "ground", "need": "text" | "large" | "decorative", "note"? }).
 *  Exit 0 when all is well, 1 when a check fails, 2 when it was called wrongly. */
import { mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { checkTokens, readTokens, type ContrastGroup, type ContrastPair, type DtcgOptions } from './index';

const USAGE = `usage: design-tokens check  <css file or folder>... [--pairs pairs.json] [--name n] [--prefix p] [--namespace ns]
       design-tokens export <css file or folder>... --out <folder> [--name n] [--prefix p] [--namespace ns]`;

function fail(message: string, code = 2): never {
  console.error(message);
  process.exit(code);
}

const isRecord = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null;
const NEEDS = new Set(['text', 'large', 'decorative']);
function isPair(v: unknown): v is ContrastPair {
  return (
    isRecord(v) &&
    typeof v.role === 'string' &&
    typeof v.fg === 'string' &&
    typeof v.ground === 'string' &&
    typeof v.need === 'string' &&
    NEEDS.has(v.need)
  );
}
function isGroup(v: unknown): v is ContrastGroup {
  return isRecord(v) && typeof v.title === 'string' && Array.isArray(v.pairs) && v.pairs.every(isPair);
}

function readPairs(path: string): ContrastGroup[] {
  let data: unknown;
  try {
    data = JSON.parse(readFileSync(path, 'utf8'));
  } catch (e) {
    fail(`design-tokens: cannot read ${path}: ${e instanceof Error ? e.message : String(e)}`);
  }
  if (Array.isArray(data) && data.every(isGroup)) return data;
  if (Array.isArray(data) && data.every(isPair)) return [{ title: path, pairs: data }];
  return fail(`design-tokens: ${path} is not a list of pairs or of groups of pairs`);
}

function cssFiles(paths: string[]): Record<string, string> {
  const files: Record<string, string> = {};
  for (const p of paths) {
    let names: string[];
    try {
      names = statSync(p).isDirectory()
        ? readdirSync(p)
            .filter((f) => f.endsWith('.css'))
            .sort()
            .map((f) => join(p, f))
        : [p];
    } catch {
      fail(`design-tokens: no such file or folder: ${p}`);
    }
    for (const f of names) files[f] = readFileSync(f, 'utf8');
  }
  return files;
}

const [command, ...rest] = process.argv.slice(2);
const inputs: string[] = [];
const flags: Record<string, string> = {};
for (let i = 0; i < rest.length; i++) {
  const a = rest[i] ?? '';
  if (a.startsWith('--')) {
    const v = rest[i + 1];
    if (v === undefined) fail(`design-tokens: ${a} needs a value\n${USAGE}`);
    flags[a.slice(2)] = v;
    i++;
  } else inputs.push(a);
}
if ((command !== 'check' && command !== 'export') || !inputs.length) fail(USAGE);
const known = new Set(['pairs', 'out', 'name', 'prefix', 'namespace']);
for (const k of Object.keys(flags)) if (!known.has(k)) fail(`design-tokens: unknown option --${k}\n${USAGE}`);

const options: DtcgOptions = { name: flags.name, prefix: flags.prefix, namespace: flags.namespace };
const tokens = readTokens(cssFiles(inputs));
if (!tokens.length) fail('design-tokens: no custom properties found in a top-level :root block', 1);
const groups = flags.pairs ? readPairs(flags.pairs) : [];
const { errs, dtcg, pairs } = checkTokens(tokens, groups, options);

if (command === 'export') {
  const out = flags.out ?? fail(`design-tokens: export needs --out <folder>\n${USAGE}`);
  mkdirSync(out, { recursive: true });
  for (const [name, json] of Object.entries(dtcg.files)) writeFileSync(join(out, name), `${JSON.stringify(json, null, 2)}\n`);
  console.log(`design-tokens: wrote ${Object.keys(dtcg.files).length} files to ${out}`);
}
for (const e of errs) console.error(e);
const summary = `${dtcg.exported} of ${tokens.length} tokens export as DTCG 2025.10 (${dtcg.skipped.length} stay CSS-only)`;
const pairText = groups.length ? `; ${pairs} colour pairs ${errs.length ? 'checked' : 'meet WCAG 2.2 in both themes'}` : '';
console.log(`design-tokens: ${summary}${pairText}${errs.length ? `; ${errs.length} problem(s)` : ''}.`);
process.exit(errs.length ? 1 : 0);
