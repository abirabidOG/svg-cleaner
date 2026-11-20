# SVG Optimizer and Cleaner

**Get a smaller, cleaner SVG in seconds. Free, no upload, your file never leaves your browser.**

Use it now: https://tools.abidmahmud.cv/svg-optimizer

SVG Optimizer and Cleaner removes editor bloat from SVG files and shrinks them without changing how they look. Paste in an SVG exported from Illustrator, Figma, Inkscape, or Sketch and get back clean code that is ready for the web.

## What it does

- **100% client side.** Files are parsed and cleaned in your browser with DOMParser and XMLSerializer. Nothing is uploaded to a server.
- **Batch cleaning.** Drag and drop or browse up to 20 SVG files at once, up to 5 MB each.
- **Safe preset (default).** Removes XML comments, the XML prolog and DOCTYPE, editor metadata and namespaces from Illustrator, Inkscape, Sketch, CorelDraw, and Figma, empty groups and non-rendering elements, hidden elements, and unreferenced defs. Zero visual risk.
- **Maximum preset.** Adds the aggressive rules: coordinates rounded to 2 decimal places, shortened IDs, fixed width and height removed while the viewBox is kept, and minified markup. Best compression, with a safety warning to check the result.
- **Before and after preview.** Side by side previews on a transparency checkerboard, with a drag slider, so you can confirm nothing shifted.
- **One click export.** Download the cleaned SVG, download all as a ZIP, or copy the cleaned code to the clipboard.
- **Try a sample.** One click loads a sample SVG with Illustrator bloat, so you can see the cleaning work before using your own file.

The live page shows its own sample result of 9.3 KB down to 1.5 KB, 84% smaller. Your own results depend on how much bloat your file carries.

## Use it on the web

Open https://tools.abidmahmud.cv/svg-optimizer, drop in your SVG files, pick Safe or Maximum, and download the result. No sign up, no account.

## Run it locally

```bash
npm install
npm run dev
```

Open http://localhost:3000 to use the tool.

Build for production:

```bash
npm run build
npm run start
```

## Tech

- Next.js (App Router) and TypeScript
- Tailwind CSS
- JSZip for Download All as ZIP
- Deploys on Vercel

## Claude Code plugin

This repo also ships a public Claude Code plugin that cleans SVG files from the terminal with SVGO. See `plugins/svg-cleaner/README.md`. Install it with:

```text
/plugin marketplace add abirabidOG/svg-cleaner
/plugin install svg-cleaner@svg-cleaner
```

## Author

Built by Abid Mahmud, Brand Identity Designer: https://www.abidmahmud.cv

## Licence

MIT. See `LICENSE`.
