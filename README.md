# Frontend kit

Small, standalone pieces from [juansync.dev](https://juansync.dev), each its own npm package with
its own licence. Install only the one you need.

| Package | What it is | Licence | Status |
|---|---|---|---|
| [`@juansync7/iso-lettering`](iso-lettering) | ISO 3098 type B engineering lettering: an OpenType font, and the characters as pen strokes | SIL OFL 1.1 | 1.0.0 |
| [`@juansync7/blueprint`](blueprint) | Blueprints for components and pages: every part named, every size bound to its design token, measured and drawn | MIT | 0.1.0 |
| [`@juansync7/bricks`](bricks) | A catalogue of real LEGO parts drawn from our own geometry, models swapped into them, and checks that the result could be built | MIT | 0.1.0 |
| [`@juansync7/design-tokens`](design-tokens) | Design tokens kept in CSS, exported as W3C Design Tokens with light and dark themes, every colour pair checked against WCAG 2.2 in both | MIT | 0.1.0 |

Coming when each runs outside the site: stickers (CC BY 4.0) and isometric shapes. LEGO is a
trademark of the LEGO Group, which does not sponsor or endorse this kit.

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

## Releasing

Raise the version in the package's `package.json`, then on GitHub: Actions → release → Run
workflow → pick the package. It builds, checks, publishes to npm and tags the commit
`<package>@<version>`, signing in with npm Trusted Publishing, so no token is stored anywhere.

A new package's first version has to be published once by hand (`npm login`, then
`npm publish --workspace <package> --access public`), because npm only lets a trusted publisher be
set on a package that exists. Then on npmjs.com, in the package's Settings → Trusted publisher, add
GitHub Actions with owner `JuanSync7`, repository `frontend-kit` and workflow `release.yml`.

## Working on it

```sh
npm install
npm run build
npm run check
```
