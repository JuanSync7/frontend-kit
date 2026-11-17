// One source: JuanSync7/frontend-kit, bricks/src (@juansync7/bricks). A project's copy is synced from it, never edited.
/** Bricks: a catalogue of real LEGO parts drawn from our own geometry, models planned as shapes and
 *  swapped into them, and the checks that the result could be built. See README.md. */
export { CATALOGUE, CATALOGUE_KEYS } from './legocatalogue.ts';
export { cellOf, cellsOf, footprint, KINDS, partKey, PLATE, studsOf, turn } from './legoset.ts';
export type { Kind, Piece, Tone, Tones } from './legoset.ts';
export { build, piece, PROFILE, ROT, sizesOf, swap } from './legoswap.ts';
export type { Dir, Shape } from './legoswap.ts';
export { both, mirror } from './legomirror.ts';
export {
  apply,
  compose,
  FLANGE_T,
  hingeRow,
  IDENTITY,
  KNUCKLE_OUT,
  KNUCKLE_R,
  KNUCKLE_Y,
  local,
  mirrorPose,
  onHinge,
  onSide,
} from './legopose.ts';
export type { Pose, V3 } from './legopose.ts';
export { jointsOf } from './legojoint.ts';
export type { Joint } from './legojoint.ts';
export { clashes } from './legoclash.ts';
export { inspect, mustHold } from './legocheck.ts';
export type { Report } from './legocheck.ts';
export { flap, flapTiles } from './legoaero.ts';
export { body, GAP, STUD_H, STUD_R } from './legomesh.ts';
export type { BodyOpts, Part } from './legomesh.ts';
export { finishedAt, liftAt, loopOf } from './legoplay.ts';
export type { Timeline } from './legoplay.ts';
export { RIG } from './legorig.ts';
