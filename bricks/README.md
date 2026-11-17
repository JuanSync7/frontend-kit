# Bricks

A catalogue of real LEGO parts, each drawn from our own geometry and checked against the real
part. Plan a model as shapes (blocks, ramps, rounds, wings on hinges), swap it into catalogue
pieces, and check that it could be built: no two pieces in one place, nothing floating, every
piece on the grid. It is the kit behind the LEGO F1 car and city on
[juansync.dev](https://juansync.dev).

## Install

```sh
npm install @juansync7/bricks three
```

The catalogue, the swap and the checks are plain TypeScript and run anywhere. The piece geometry
(`body`) needs [three.js](https://threejs.org).

## A model

```ts
import { build, inspect, type Shape } from '@juansync7/bricks';

const model: Shape[] = [
  { kind: 'block', x: 0, y: 0, z: 0, w: 8, d: 6, h: 2, root: true, tone: 'grey' },
  { kind: 'ramp', x: 0, y: 2, z: 0, profile: 'slope45', wid: 6, dir: 'x-', tone: 'red' },
  { kind: 'part', part: 'hinge', x: 4, y: 2, z: 0, w: 6, d: 1, h: 1, tone: 'grey' },
];

const pieces = build(model);        // every shape swapped into catalogue pieces
const report = inspect(pieces);     // { clipping, floating, offGrid }, each a list of faults
```

A block is laid in a bond, course over course, so each bridges the seams of the one below. A
hinge row becomes real 2 x 1 click hinges, and a flap hangs from it as a sub-assembly turned on
the hinge's axis (`flap`, `onHinge`). A bracket's side studs carry a sub-assembly on its side
(`onSide`).

## The catalogue

`CATALOGUE` holds every shape a model can be swapped into, once each. Every shape stands for one
real LEGO part, named in [`parts/ldraw-parts.json`](parts/ldraw-parts.json) by its `partKey`:
bricks, plates and tiles in the usual sizes, a grille tile, slopes (45, 33, inverted, curved),
rounds, domes, a cone, wedge plates, a jumper plate, up brackets, click hinges with one finger and
with two, two wheels and a Technic axle.

| Function | What it does |
|---|---|
| `build(shapes)` | The pieces a model is made of, sub-assemblies posed in place. |
| `inspect(pieces)` | Clipping (pieces sharing a cell, or overlapping across sub-assemblies), floating (pieces not joined to the root by studs, side studs, a hinge or an axle) and off-grid pieces. |
| `mustHold(pieces, name)` | Throws when `inspect` finds anything, for a figure to call at build. |
| `body(piece)` | The piece's geometry for three.js, in its own frame. |
| `partKey(piece)` | The shape's name in the part map: kind, size, height, and a wedge's hand, a bracket's flange or a hinge's fingers. |

Colours are names. To name yours, merge them into `Tones` from a file of your own:

```ts
declare module '@juansync7/bricks' {
  interface Tones { grey: true; red: true }
}
```

## Checking the catalogue

```sh
npm run selftest                    # each check still catches the fault it is for
npm run reference -- <ldraw dir>    # every catalogue shape against its real part
```

The reference compare reads each named part from a local copy of the
[LDraw parts library](https://library.ldraw.org) (or the GitHub mirror
`gkjohnson/ldraw-parts-library`), turns it to fit, and measures it against our own geometry: the
same size, studs where ours are, and a top surface within 0.05 of a stud. A shape with no part
named, or a part named for no shape, fails it. Nothing from the library is copied into this
package.

## Adding a piece

Find the real part first. Add its shape to `src/legoset.ts` (what it fills and where its studs
are), its geometry to `src/legomesh.ts` or `src/legodetail.ts`, one entry to `CATALOGUE` and its
part number to `parts/ldraw-parts.json`. Then run the reference compare and the selftest. A shape
LEGO does not make does not go in.

## In a project

A project that grows the catalogue alongside its own models (juansync.dev does) keeps a copy of
`src/` and the part map, synced byte for byte by a script of its own, and never edits the copy:
a change is made here, checked here, then synced. Every source file says so in its first line.

## Licence

MIT. LEGO is a trademark of the LEGO Group, which does not sponsor or endorse this package. Part
of Juan Kok's [frontend kit](https://github.com/JuanSync7/frontend-kit). Report a problem with the
[bricks issue form](https://github.com/JuanSync7/frontend-kit/issues/new?template=bricks.yml).
