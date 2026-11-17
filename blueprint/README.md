# Blueprint

Name every part of a web component or page, say how each part sizes, and bind every size to the
one design token that sets it. Then measure it as it renders, check the code against it, and draw
it as an engineering blueprint. Someone who can read the drawing but not the code can ask for a
change by a part's name ("part 3's gap, smaller"), and it lands on exactly one token in one file.

## Install

```sh
npm install @juansync7/blueprint
```

Plain TypeScript with no dependencies. Measuring and drawing need a browser (a page, a same-origin
frame, or Playwright); the index builder runs anywhere.

## A spec

```ts
import { onPage, type Blueprint } from '@juansync7/blueprint';

export const ARTICLE: Blueprint = {
  id: 'article',
  kind: 'template',
  title: 'Article page',
  summary: 'An article with its contents column on the right.',
  source: ['src/pages/article.astro', 'src/styles/tokens/layout.css'],
  views: onPage('/blog/some-post/', 'main'),          // measured at 1280 and 390 px
  parts: [
    { id: 1, name: 'Page column', selector: '', sizing: 'fill' },
    { id: 2, name: 'Article', selector: 'article', sizing: 'fill', aliases: ['text column'] },
    { id: 3, name: 'Contents', selector: 'nav.toc', sizing: 'fixed', views: ['desktop'] },
  ],
  sizes: [
    { measure: 'padding-x', part: 1, token: '--page-pad' },
    { measure: 'gap', part: 1, token: '--toc-gap', between: [2, 3], views: ['desktop'] },
    { measure: 'width', part: 3, token: '--toc-w', views: ['desktop'] },
  ],
  number: 'TP-0001',
  revision: 'A',
  drawn: '2026-11-17',
};
```

A spec holds structure only: parts, how each sizes (`hug`, `fill`, `fixed`), and which token sets
each size. Never colours, motion or content.

## What it gives

| Function | What it does |
|---|---|
| `measureIn(document, spec, view, sizer)` | Each part's box, each size against its token, and whether the token really drives the size: the token is set 8 px larger in the browser and the size must follow, so a hardcoded value that happens to equal the token is caught. With a sizer, how each part sizes. |
| `layout(measured, scale, lettering)` | The drawing: part outlines and numbers, dimensions in lanes clear of each other, notes for line widths, radii and offsets. For any renderer. |
| `render(overlay, drawing, origin, lettering)` | The drawing as DOM over a live component or page. |
| `catalogue(specs, tokenFiles, sources)` | The translator's index: one row per size with its part in plain words, its token, where the token is defined, what it resolves to and what else reads it. |

Measures: `width`, `max-width`, `height`, `min-height`, `inset-left`, `inset-right`, `padding-x`,
`padding-y`, `gap`, and the notes `border`, `radius`, `edge-x`, `edge-y`, `font-size`. A part can be
a pseudo-element (`pseudo: '::before'`).

The worked use is [juansync.dev's blueprint lab](https://juansync.dev/lab/blueprints/): fifteen
blueprints, an A3 sheet for each, and the index. The drawings are lettered with
[`@juansync7/iso-lettering`](../iso-lettering).

## Licence

MIT. Part of Juan Kok's [frontend kit](https://github.com/JuanSync7/frontend-kit). Report a problem
with the [blueprint issue form](https://github.com/JuanSync7/frontend-kit/issues/new?template=blueprint.yml).
