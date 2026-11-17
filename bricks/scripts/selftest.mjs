// Proves the checks still catch what they are for. Each fixture breaks a model that passes (the
// joint rig, src/legorig.ts) one way and names the check that must catch it; the rig itself must
// pass as built, and every rig piece must be a catalogue shape.
//
//   npm run selftest   (in bricks/)
import { CATALOGUE_KEYS } from '../src/legocatalogue.ts';
import { inspect } from '../src/legocheck.ts';
import { partKey } from '../src/legoset.ts';
import { build } from '../src/legoswap.ts';
import { br, flap, hg, jumper, leaf, RIG, side } from '../src/legorig.ts';

const brick = (x, y, z) => ({ kind: 'block', x, y, z, w: 2, d: 1, h: 3, tone: 'ink' });
const through = { kind: 'sub', id: 'through', pose: { r: [1, 0, 0, 0, 1, 0, 0, 0, 1], o: [0, 0, -0.3] }, shapes: [{ kind: 'part', part: 'tile', x: 2, y: 4, z: 0, w: 1, d: 1, h: 1, tone: 'ink' }] }; // prettier-ignore
const FIXTURES = [
  { name: 'a brick inside the base', expect: 'clipping', shapes: [...RIG, brick(0, 0, 0)] },
  { name: 'a brick in mid-air', expect: 'floating', shapes: [...RIG, brick(0, 20, 0)] },
  { name: 'a brick half a stud over', expect: 'offGrid', shapes: [...RIG, { ...brick(0, 20, 0), x: 0.5 }] },
  { name: 'a tile half a stud over with no jumper', expect: 'floating', shapes: RIG.filter((s) => s !== jumper) },
  { name: "a tile through a bracket's flange", expect: 'clipping', shapes: [...RIG, through] },
  { name: 'a tile on side studs with no bracket', expect: 'floating', shapes: [RIG[0], br, hg, side({ ...br, x: 5 }), flap(0.3, leaf)] }, // prettier-ignore
  { name: 'a flap turned down into the base', expect: 'clipping', shapes: [RIG[0], br, hg, side(br), flap(-0.5, leaf)] }, // prettier-ignore
  { name: 'a flap with no hinge to hang on', expect: 'floating', shapes: [RIG[0], br, hg, side(br), flap(0.3, leaf.slice(1))] }, // prettier-ignore
  { name: 'two plates in one cell of a flap', expect: 'clipping', shapes: [...RIG.slice(0, 4), flap(0.3, [...leaf, { ...leaf[1], y: 1 }])] }, // prettier-ignore
];

let failed = 0;
const say = (ok, what) => {
  console.log(`${ok ? 'ok  ' : 'FAIL'}  ${what}`);
  if (!ok) failed++;
};
const rig = build(RIG);
const r = inspect(rig);
say(!r.clipping.length && !r.floating.length && !r.offGrid.length, 'the joint rig passes as built');
if (r.clipping.length || r.floating.length || r.offGrid.length) console.log(JSON.stringify(r, null, 1));
const strays = rig.map(partKey).filter((k) => !CATALOGUE_KEYS.has(k));
say(!strays.length, `every rig piece is a catalogue shape${strays.length ? ` (not: ${strays.join(', ')})` : ''}`);
for (const f of FIXTURES) say(inspect(build(f.shapes))[f.expect].length > 0, `${f.expect} catches ${f.name}`);
process.exit(failed ? 1 : 0);
