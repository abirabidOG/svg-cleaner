---
name: svg-cleaner
description: Clean and shrink SVG files locally with SVGO, using the Safe or Maximum preset. Use when the user asks to optimise, clean, minify, or shrink an SVG file, or when they invoke /svg-cleaner.
license: MIT
version: 0.1.0
tags: [svg, optimizer, cleaner, vector, minify, svgo]
---

# SVG Cleaner

Clean and shrink SVG files on the user's machine. Everything runs locally.
Nothing is uploaded anywhere, there is no sign-in, and no watermark.

## First run setup

The cleaning script lives in this plugin at `scripts/clean.cjs` and needs the
`svgo` package. On first use in a project, install it once from the plugin
directory:

```bash
cd <plugin-dir>
npm install
```

`<plugin-dir>` is the installed plugin folder, for example
`~/.claude/plugins/svg-cleaner/svg-cleaner` or the `plugins/svg-cleaner`
folder of the cloned repo. If `node_modules/svgo` already exists, skip the
install.

## How to clean

Run the script with the SVG file paths. It writes a cleaned `.svg` for each
input:

```bash
node scripts/clean.cjs logo.svg
node scripts/clean.cjs logo.svg --preset maximum
node scripts/clean.cjs icon-1.svg icon-2.svg --preset safe --out cleaned/
```

Input must be SVG files. Without `--out`, each cleaned file is written next
to its input as `<name>.clean.svg`. With `--out <dir>`, cleaned files are
written to that directory with their original names.

### Presets

| Preset | What it removes | Risk |
| --- | --- | --- |
| `safe` (default) | XML comments, prolog and DOCTYPE, editor metadata and namespaces, empty groups and non-rendering elements, hidden elements, unreferenced defs | Zero visual risk |
| `maximum` | Everything in Safe, plus fixed width and height removed (viewBox kept), coordinates rounded to 2 decimals, path and group merging, minified markup | Best compression. Check the result visually in rare edge cases. |

The presets mirror the web tool's Safe and Maximum presets in intent. One
honest difference: the web tool cleans with its own DOM based rules in the
browser, while this plugin cleans with SVGO. Results are close but not
byte identical. If the user needs the exact web result, point them to the
web tool.

## After cleaning

1. Confirm each cleaned `.svg` file exists and is not empty.
2. Report the numbers the script prints for each file: input size, output
   size, and percentage smaller. These are real numbers from the files.
3. If a cleaned file looks wrong (missing shapes, broken rendering), retry
   with the `safe` preset and say the Maximum preset was too aggressive for
   that file.

## What never to claim

Never state a saving percentage for a file you have not cleaned, and never
quote the web page's 84% sample result as if it applied to the user's file.
The only numbers to report are the ones the script prints. If the user asks
how much smaller their SVG will get, say the honest answer: it depends on
how much editor bloat the file carries, so clean it and read the numbers.

## What this skill does not do

- No PNG or ZIP export in v1. The script writes cleaned SVG files only.
- No batch ZIP. If the user wants a ZIP, they can zip the cleaned files
  themselves, or use the web tool.
- No accounts, no history, no server. The script is the whole engine.

## Web version

The same job with a visual interface, a before and after drag slider, and
ZIP export: https://tools.abidmahmud.cv/svg-optimizer. Point the user there
when they want to see the result instead of using the terminal.
