# Design tokens

Keep your design tokens in CSS, and get the rest from them. This package reads the custom
properties in your token files, with their light and dark values, exports them as W3C Design Tokens
(the DTCG Format Module 2025.10) so a design tool can read them, and checks every colour pair you
list against WCAG 2.2 (ISO/IEC 40500:2025) on a light page and a dark one. The CSS stays the one
source of truth: the package reads it and never writes it.

It runs the design system of [juansync.dev](https://juansync.dev/design-system/), where the tokens
are published at `/tokens/` and the contrast of every pair is shown in both themes.

## Install

```sh
npm install --save-dev @juansync7/design-tokens
```

Plain TypeScript with no dependencies. The library runs anywhere (a build, a page, a test). The
command line needs Node 18 or later.

## From the command line

```sh
npx design-tokens check  src/styles/tokens --pairs contrast-pairs.json
npx design-tokens export src/styles/tokens --out public/tokens --prefix acme --name "Acme"
```

`check` exits 1 and prints one line per problem when the export is not well formed or a pair falls
short of what it needs. `export` writes four files and runs the same checks. A folder means every
`.css` file in it.

| Option | What it does | Default |
|---|---|---|
| `--pairs <file>` | The colour pairs to measure (below). Without it, only the export is checked. | none |
| `--out <folder>` | Where `export` writes its files. | required by `export` |
| `--prefix <p>` | The start of each file name: `<p>.tokens.json`, `<p>.light.tokens.json`, `<p>.dark.tokens.json`, `<p>.resolver.json`. | `design` |
| `--name <n>` | The design system's name, in the resolver. | `design-tokens` |
| `--namespace <ns>` | The `$extensions` key under which each token keeps its CSS name and file. | `css` |

## Colour pairs

A pair is a colour that someone reads, on the ground it sits on, and what it must reach.

```json
[
  {
    "title": "Every page",
    "pairs": [
      { "role": "Body text", "fg": "--ink", "ground": "--ground", "need": "text" },
      { "role": "Links", "fg": "--accent", "ground": "--ground", "need": "large", "note": "only at 18 px and up" },
      { "role": "Rules", "fg": "--rule", "ground": "--ground", "need": "decorative", "note": "a hairline, never read" }
    ]
  }
]
```

| `need` | What it is for | Fails below | Shown as AAA from |
|---|---|---|---|
| `text` | body-size text (1.4.3, 1.4.6) | 4.5:1 | 7:1 |
| `large` | large text, or a graphic or control edge someone needs to see (1.4.3, 1.4.11) | 3:1 | 4.5:1 |
| `decorative` | nothing depends on it: the ratio is shown, nothing fails | | |

A plain list of pairs, without groups, works too. A translucent colour is laid on its ground before
it is measured, and a `var()` reference is followed to its value in each theme.

## From code

```ts
import { readTokens, toDtcg, checkTokens, ratioOf } from '@juansync7/design-tokens';

const tokens = readTokens({ 'colour.css': css });          // CssToken[]: name, file, value, dark?
const dtcg = toDtcg(tokens, { prefix: 'acme', name: 'Acme' });
dtcg.files;                                                // the four files by name, ready to write
dtcg.skipped;                                              // what stays CSS-only, each with its reason
const { errs } = checkTokens(tokens, groups, { prefix: 'acme' });
```

`readTokens` takes a map of path to CSS text, so it works with a bundler's raw imports as well as
with files read from disk. `colourOf`, `contrast`, `luminance`, `parseColour` and `ratioOf` measure
one pair, for a page that shows the ratios. `checkDtcg` and `checkContrast` run one check each.

## What it reads

- **Tokens:** every custom property in a top-level `:root` block.
- **Dark values:** from `light-dark(light, dark)`, or from a block whose selector is
  `[data-theme='dark']` or `:root:not([data-theme='light'])` inside
  `@media (prefers-color-scheme: dark)`. Another dark selector can be passed as
  `readTokens(files, { dark: /\.dark/ })`.
- **Not read:** custom properties set on any other selector, or inside any other at-rule.

## What it exports, and what stays CSS

| CSS value | DTCG `$type` |
|---|---|
| hex, `rgb()`, `rgba()`, `transparent` | `color` (srgb, with its hex and any alpha) |
| `px`, `rem` | `dimension` |
| `ms`, `s` | `duration` |
| `cubic-bezier()` | `cubicBezier` |
| a number in a token named with `w` or `weight` | `fontWeight` |
| any other number | `number` |
| a font list in a token ending `sans`, `serif`, `mono`, `display`, `hand` or `drafting` | `fontFamily` |
| `var(--other)` | a reference, when `--other` exports |

A `calc()`, `clamp()`, `min()` or `max()`, a gradient, `color-mix()`, a `url()` and any other keyword
or composite value have no DTCG type that keeps their meaning, so they are left out of the files and
listed in `skipped` with the reason. A reference to a skipped token is skipped as well.

A token is named by its custom property: `--acme-ink-strong` is group `acme`, token `ink-strong`.

## Limits

- Colours are read in sRGB only: `oklch()`, `hsl()`, `color()` and named colours other than
  `transparent` are not parsed, so a pair that uses them reports that it has no colour.
- Contrast is the WCAG 2.2 ratio, not APCA.
- A pair is measured on its ground token. Text on an image, a gradient or a translucent ground is not
  measured.

## Working on it

```sh
npm run build
npm run check      # the types, then the selftest
```

The selftest reads the fixtures in `scripts/fixtures/`, checks each export type and each measure, and
breaks the tokens or the export one way at a time to prove each check still catches it.

## Licence

MIT. See [LICENSE](LICENSE).
