# SVG Cleaner plugin for Claude Code

Clean and shrink SVG files without leaving the terminal. Free, local, no
sign-up, nothing uploaded.

## Install

In Claude Code:

```text
/plugin marketplace add abirabidOG/svg-cleaner
/plugin install svg-cleaner@svg-cleaner
```

First run only: the skill installs its cleaning engine once, from the plugin
folder:

```bash
cd <plugin-dir>
npm install
```

## Use

```text
/svg-cleaner logo.svg
/svg-cleaner logo.svg --preset maximum
/svg-cleaner icon-1.svg icon-2.svg --preset safe --out cleaned/
```

Or ask Claude in plain words: "clean this SVG". Presets: `safe` (default,
zero visual risk) and `maximum` (best compression, check the result).

## How it works

The plugin ships a skill (`skills/svg-cleaner/SKILL.md`), a slash command
(`/svg-cleaner`), and a small Node script (`scripts/clean.cjs`) built on
SVGO (MIT). Cleaning runs entirely on your machine. The script prints real
numbers only: input size, output size, and percentage smaller. It never
claims a saving it did not measure.

One honest difference from the web tool: the web tool cleans with its own
DOM based rules in the browser, while this plugin cleans with SVGO. The
presets match in intent, but results are close rather than byte identical.

## What it does not do (v1)

- No PNG export, no ZIP export. The script writes cleaned SVG files only.
- No accounts, no history, no server.

## Web version

The same job with a visual interface, a before and after drag slider, and
ZIP export: https://tools.abidmahmud.cv/svg-optimizer

## Licence

MIT. By Abid Mahmud, https://www.abidmahmud.cv
