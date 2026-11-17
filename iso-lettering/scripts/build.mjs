// Builds fonts/iso-lettering-b.otf from the stroke glyphs in src/. Deterministic: the same glyphs
// give the same bytes, so `npm run check` can fail when the committed font drifts from its source.
//   npm run build    write the font
//   npm run check    fail if the committed font is not what src/ builds
import { readFileSync, writeFileSync } from 'node:fs';
import { buildFont } from '../src/font.ts';

const OUT = new URL('../fonts/iso-lettering-b.otf', import.meta.url);
const bytes = Buffer.from(buildFont());
if (process.argv.includes('--check')) {
  const same = Buffer.compare(readFileSync(OUT), bytes) === 0;
  console.log(same ? 'font matches its source' : 'fonts/iso-lettering-b.otf differs from src/: run npm run build');
  process.exit(same ? 0 : 1);
}
writeFileSync(OUT, bytes);
console.log(`wrote fonts/iso-lettering-b.otf (${bytes.length} bytes)`);
