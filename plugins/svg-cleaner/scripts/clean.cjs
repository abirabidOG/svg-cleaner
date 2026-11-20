#!/usr/bin/env node
/**
 * SVG Cleaner CLI — clean and shrink SVG files, locally.
 *
 * Usage:
 *   node scripts/clean.cjs <file.svg...> [--preset safe|maximum] [--out dir]
 *
 * Engine: SVGO (MIT), runs fully offline. Nothing is uploaded.
 * Presets mirror the web tool at https://tools.abidmahmud.cv/svg-optimizer:
 *   safe    — removes comments, editor metadata, empty groups, hidden
 *             elements and unreferenced defs. Zero visual risk.
 *   maximum — everything in safe, plus coordinate rounding to 2 decimals,
 *             removal of fixed width/height (viewBox kept), path and group
 *             merging. May change rendering in rare edge cases, so check
 *             the result visually.
 * --out writes cleaned files to a directory (created if needed). Without
 * --out, each cleaned file is written next to its input as <name>.clean.svg.
 */
const fs = require("fs");
const path = require("path");
const { optimize } = require("svgo");

const SAFE_PLUGINS = [
  "removeDoctype",
  "removeXMLProcInst",
  "removeComments",
  "removeMetadata",
  "removeEditorsNSData",
  "removeEmptyAttrs",
  "removeEmptyContainers",
  "removeHiddenElems",
  "removeUselessDefs",
  "removeUnusedNS",
  "cleanupAttrs",
  "removeEmptyText",
];

const MAXIMUM_PLUGINS = [
  ...SAFE_PLUGINS,
  "removeDimensions",
  "collapseGroups",
  "mergePaths",
  "convertPathData",
  "convertTransform",
  { name: "cleanupNumericValues", params: { floatPrecision: 2 } },
];

function parseArgs(argv) {
  const inputs = [];
  const opts = { preset: "safe" };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--preset") opts.preset = argv[++i];
    else if (a === "--out") opts.outDir = argv[++i];
    else if (a.startsWith("--")) {
      console.error(`Unknown option: ${a}`);
      process.exit(2);
    } else inputs.push(a);
  }
  return { inputs, opts };
}

function cleanOne(input, outPath, preset) {
  const original = fs.readFileSync(input, "utf8");
  const result = optimize(original, {
    multipass: preset === "maximum",
    plugins: preset === "maximum" ? MAXIMUM_PLUGINS : SAFE_PLUGINS,
  });
  if (result.error) throw new Error(result.error);
  if (!result.data || !result.data.includes("<svg")) {
    throw new Error("SVGO produced no valid SVG output");
  }
  fs.writeFileSync(outPath, result.data);
  const inBytes = Buffer.byteLength(original);
  const outBytes = Buffer.byteLength(result.data);
  const saving = inBytes > 0 ? ((1 - outBytes / inBytes) * 100).toFixed(1) : "0.0";
  return { inBytes, outBytes, saving };
}

function main() {
  const { inputs, opts } = parseArgs(process.argv.slice(2));
  if (inputs.length === 0) {
    console.error(
      "Usage: node scripts/clean.cjs <file.svg...> [--preset safe|maximum] [--out dir]"
    );
    process.exit(2);
  }
  if (opts.preset !== "safe" && opts.preset !== "maximum") {
    console.error(`Unknown preset: ${opts.preset}. Use safe or maximum.`);
    process.exit(2);
  }
  if (opts.outDir) fs.mkdirSync(opts.outDir, { recursive: true });
  for (const input of inputs) {
    if (!fs.existsSync(input)) {
      console.error(`Not found: ${input}`);
      process.exit(1);
    }
    if (path.extname(input).toLowerCase() !== ".svg") {
      console.error(`Skipped (not an SVG file): ${input}`);
      continue;
    }
    const base = path.parse(input).name;
    const outPath = opts.outDir
      ? path.join(opts.outDir, `${base}.svg`)
      : path.join(path.dirname(input), `${base}.clean.svg`);
    try {
      const r = cleanOne(input, outPath, opts.preset);
      console.log(
        `${path.basename(input)} -> ${outPath} (${r.inBytes} B to ${r.outBytes} B, ${r.saving}% smaller, ${opts.preset})`
      );
    } catch (err) {
      console.error(`Failed to clean ${input}: ${err.message}`);
      process.exit(1);
    }
  }
}

main();
