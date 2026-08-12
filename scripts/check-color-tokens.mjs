#!/usr/bin/env node
// Fails while raw Tailwind hue utilities remain where a semantic token belongs.
//
// The palette lives in app/[locale]/globals.css as tokens (error, success,
// warning, info, muted-foreground, border). Reaching past them for a raw hue
// is what produced two greens, two ambers and five reds across the site.
//
// Two files are deliberately exempt: their colours are identity, not meaning.

import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

const ROOTS = ["app", "components"];

const EXEMPT = new Map([
  ["components/footer.tsx", "social platform brand colours"],
  ["components/voting-section.tsx", "medal metals (silver, bronze)"],
]);

const HUES = [
  "red", "orange", "amber", "yellow", "lime", "green", "emerald", "teal",
  "cyan", "sky", "blue", "indigo", "violet", "purple", "fuchsia", "pink",
  "rose", "slate", "gray", "zinc", "neutral", "stone",
].join("|");

const PROPS = [
  "text", "bg", "from", "to", "via", "border", "shadow", "ring", "fill",
  "stroke", "divide", "placeholder",
].join("|");

const PATTERN = new RegExp(
  `\\b(?:${PROPS})-(?:${HUES})-\\d{2,3}(?:\\/\\d{1,3})?\\b`,
  "g",
);

function* walk(dir) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      yield* walk(full);
    } else if (/\.(tsx|ts|jsx|js)$/.test(entry)) {
      yield full;
    }
  }
}

const findings = [];
let exemptCount = 0;

for (const root of ROOTS) {
  for (const file of walk(root)) {
    const key = file.split("\\").join("/");
    const text = readFileSync(file, "utf8");
    const lines = text.split(/\r?\n/);

    lines.forEach((line, i) => {
      const matches = line.match(PATTERN);
      if (!matches) return;
      if (EXEMPT.has(key)) {
        exemptCount += matches.length;
        return;
      }
      for (const m of matches) {
        findings.push(`${key}:${i + 1}: ${m}`);
      }
    });
  }
}

for (const f of findings) console.log(f);

console.log(`\n${findings.length} raw hue utilities outside the exempt list.`);
console.log(`${exemptCount} exempt (${[...EXEMPT.values()].join("; ")}).`);

process.exit(findings.length === 0 ? 0 : 1);
