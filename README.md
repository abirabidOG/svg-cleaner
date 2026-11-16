# SVG Optimizer & Cleaner — Clean and Shrink SVG Files Free

> Get a smaller, cleaner SVG in seconds. Free, no upload, your file never leaves your browser.

A 100% client-side web utility built with **Next.js (App Router)**, **TypeScript**, and **Tailwind CSS**, deploy-ready for Vercel.

## Features
- **100% Client-Side Privacy**: Parses, cleans, and optimizes SVGs directly in your browser using DOMParser and XMLSerializer. Zero server uploads.
- **Batch Processing**: Drag-and-drop or browse up to 20 SVG files at once, up to 5 MB each.
- **Safe Rules (Default ON)**:
  - Remove XML comments, prolog (`<?xml ... ?>`), and DOCTYPE declarations.
  - Remove editor metadata and namespaces from Adobe Illustrator, Inkscape, Sketch, CorelDraw, and Figma.
  - Remove empty groups (`<g>`) and non-rendering elements.
  - Remove hidden elements (`display="none"`, `visibility="hidden"`, `opacity="0"`).
  - Remove unreferenced `<defs>`.
- **Aggressive Rules (Optional)**:
  - Round coordinate paths to 2 decimal places.
  - Shorten IDs and unreferenced identifiers.
  - Remove fixed `width`/`height` while retaining `viewBox` for fluid responsive vectors.
  - Minify SVG markup.
- **Presets**:
  - **Safe (Recommended)**: Safe options only with zero visual risk.
  - **Maximum**: Turns on Aggressive rules for maximum compression with safety warning.
- **Synchronized Visual Diff**: Side-by-side Before and After previews on a transparency checkerboard to confirm zero visual shifts.
- **One-Click Export**:
  - Download Cleaned SVG (`.svg`).
  - Download All as ZIP (`JSZip`).
  - Copy Cleaned SVG Code to clipboard.
- **Try a Sample SVG**: Instant 1-click test state with a geometric brand mark containing Illustrator bloat.
- **SEO & Schema**: Includes Open Graph tags, WebApplication, and `FAQPage` JSON-LD schema.
- **Google Analytics 4**: Configurable measurement ID (`G-ZF1FSM8N07`) with `svg_optimized` and `download_svg_clean` conversion tracking.

## Development

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the tool.

## Build

```bash
npm run build
npm run start
```
