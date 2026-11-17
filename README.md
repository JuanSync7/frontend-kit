# Frontend kit

Small, standalone pieces from [juansync.dev](https://juansync.dev), each its own npm package with
its own licence. Install only the one you need.

| Package | What it is | Licence | Status |
|---|---|---|---|
| [`@juansync7/iso-lettering`](iso-lettering) | ISO 3098 type B engineering lettering: an OpenType font, and the characters as pen strokes | SIL OFL 1.1 | 1.0.0 |
| [`@juansync7/blueprint`](blueprint) | Blueprints for components and pages: every part named, every size bound to its design token, measured and drawn | MIT | 0.1.0 |

Coming when each runs outside the site: bricks (models built from LEGO's published sizes, drawn
from our own geometry), stickers (CC BY 4.0) and isometric shapes. LEGO is a trademark of the LEGO
Group, which does not sponsor or endorse this kit.

## Taking one piece

```sh
npm install @juansync7/iso-lettering             # the package
npx degit JuanSync7/frontend-kit/iso-lettering   # the folder, without git history
```

Or a sparse clone: `git clone --filter=blob:none --sparse <repo>`, then
`git sparse-checkout set iso-lettering`.

Each folder stands alone: its own README, licence and `package.json`. One package uses another only
through its published name, never by reaching into the folder next door.

## Reporting a problem

Open an issue with the form for that package; it is labelled for that package automatically.

## Working on it

```sh
npm install
npm run build
npm run check
```
