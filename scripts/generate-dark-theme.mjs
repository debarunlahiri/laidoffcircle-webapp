// Generates styles/dark.generated.css: a dark mirror of the light stylesheets.
// Every colour-related declaration in the light CSS is re-emitted under
// html[data-theme="dark"] with light colours remapped to dark equivalents,
// preserving rule order so cascade behaviour matches the light theme.
// Usage: npm run theme:dark   (re-run after changing colours in styles/*.css)
import { readFileSync, writeFileSync } from "node:fs";
import { format } from "prettier";

// Follow local imports recursively: feed, profile and referral styles are split
// into folders. The token-based mobile layer owns its own dark theme.
const sources = [];
const seen = new Set();
const stylesRoot = new URL("../styles/", import.meta.url);
const excluded = new Set([
  "dark.css",
  "dark.generated.css",
  "m-design-system.css",
  "settings.css",
]);
function collectStyles(file) {
  const css = readFileSync(file, "utf8").replace(/\/\*[\s\S]*?\*\//g, "");
  for (const [, path] of css.matchAll(/@import\s+["']([^"']+)["']\s*;/g)) {
    const imported = new URL(path, file);
    if (!imported.href.startsWith(stylesRoot.href)) continue;
    const name = imported.href.slice(stylesRoot.href.length);
    if (excluded.has(name) || seen.has(name)) continue;
    seen.add(name);
    collectStyles(imported);
    sources.push(name);
  }
}
collectStyles(new URL("../app/globals.css", import.meta.url));
const scope = 'html[data-theme="dark"]';

// ---- colour helpers -------------------------------------------------------
function parseColor(token) {
  let m = /^#([0-9a-f]{3,8})$/i.exec(token);
  if (m) {
    let h = m[1];
    if (h.length <= 4) h = [...h].map((c) => c + c).join("");
    return {
      r: parseInt(h.slice(0, 2), 16),
      g: parseInt(h.slice(2, 4), 16),
      b: parseInt(h.slice(4, 6), 16),
      a: h.length === 8 ? parseInt(h.slice(6, 8), 16) / 255 : 1,
    };
  }
  m =
    /^rgba?\(\s*(\d+)[,\s]+(\d+)[,\s]+(\d+)(?:[,\s/]+([\d.]+%?))?\s*\)$/i.exec(
      token,
    );
  if (m) {
    const a =
      m[4] === undefined
        ? 1
        : m[4].endsWith("%")
          ? parseFloat(m[4]) / 100
          : parseFloat(m[4]);
    return { r: +m[1], g: +m[2], b: +m[3], a };
  }
  if (/^white$/i.test(token)) return { r: 255, g: 255, b: 255, a: 1 };
  return null;
}
function toHsl({ r, g, b }) {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b),
    min = Math.min(r, g, b),
    l = (max + min) / 2;
  const d = max - min;
  let h = 0,
    s = 0;
  if (d) {
    s = d / (1 - Math.abs(2 * l - 1));
    h =
      max === r
        ? ((g - b) / d) % 6
        : max === g
          ? (b - r) / d + 2
          : (r - g) / d + 4;
    h = (h * 60 + 360) % 360;
  }
  return { h, s, l };
}
const out = (h, s, l, a) =>
  `hsl(${Math.round(h)} ${Math.round(s * 100)}% ${Math.round(l * 1000) / 10}%${a < 1 ? ` / ${Math.round(a * 100) / 100}` : ""})`;
const navy = (c) => (c.s < 0.25 ? { ...c, h: 222, s: 0.28 } : c);

function mapBackground(c) {
  const hsl = toHsl(c);
  if (hsl.l < 0.72) return null; // dark and brand colours stay
  if (hsl.l > 0.98 && hsl.s < 0.1 && c.a === 1) return "var(--white)";
  const base = navy(hsl);
  return out(
    base.h,
    Math.min(base.s * 0.6, 0.45),
    0.12 + (1 - hsl.l) * 0.55,
    c.a,
  );
}
function mapBorder(c) {
  const hsl = toHsl(c);
  if (hsl.l < 0.72) return null;
  if (hsl.s < 0.3 && c.a === 1) return "var(--line)";
  const base = navy(hsl);
  return out(base.h, Math.min(base.s * 0.5, 0.3), 0.29, c.a);
}
function mapText(c) {
  const hsl = toHsl(c);
  if (hsl.l > 0.9) return null; // white-ish text sits on dark/brand surfaces
  if (hsl.s > 0.5 && hsl.l >= 0.25)
    return hsl.l >= 0.68 ? null : out(hsl.h, Math.min(hsl.s, 0.9), 0.72, c.a); // accents: lighten
  if (hsl.l > 0.62) return null;
  const base = navy(hsl);
  return out(
    base.h,
    Math.min(base.s * 0.5, 0.25),
    Math.min(0.97 - hsl.l * 0.75, 0.93),
    c.a,
  );
}
// Named colours must be standalone tokens, never part of a custom property.
const colorToken = /#[0-9a-f]{3,8}\b|rgba?\([^)]*\)|(?<![\w-])white(?![\w-])/gi;
const remap = (value, fn) =>
  value.replace(colorToken, (token) => {
    const parsed = parseColor(token);
    return (parsed && fn(parsed)) || token;
  });

function transformDeclaration(prop, value) {
  const p = prop.toLowerCase();
  if (p === "background" || p === "background-color")
    return remap(value, mapBackground);
  if (p === "color")
    return remap(
      value.replace(/var\(--green(-dark)?\)/g, "var(--accent-text)"),
      mapText,
    );
  if (
    /^border(-(top|right|bottom|left))?(-color)?$/.test(p) ||
    p === "outline-color"
  )
    return remap(value, mapBorder);
  return null; // not a colour property we handle
}

// ---- minimal CSS walker (the stylesheets use plain, un-nested CSS) --------
function walk(css, emit) {
  let i = 0;
  while (i < css.length) {
    const open = css.indexOf("{", i);
    if (open < 0) break;
    const prelude = css.slice(i, open).trim();
    let depth = 1,
      j = open + 1;
    while (j < css.length && depth) {
      if (css[j] === "{") depth++;
      else if (css[j] === "}") depth--;
      j++;
    }
    const body = css.slice(open + 1, j - 1);
    i = j;
    if (prelude.startsWith("@media") || prelude.startsWith("@supports")) {
      const inner = [];
      walk(body, (rule) => inner.push(rule));
      if (inner.length) emit(`${prelude} {\n${inner.join("\n")}\n}`);
    } else if (!prelude.startsWith("@")) {
      emit(rule(prelude, body));
    }
  }
}
// Commas inside :is(), :not(), or attribute values are not selector separators.
function splitSelectors(selector) {
  const parts = [];
  let depth = 0;
  let quote = "";
  let start = 0;
  for (let i = 0; i < selector.length; i++) {
    const char = selector[i];
    if (char === "\\") {
      i++;
      continue;
    }
    if (quote) {
      if (char === quote) quote = "";
      continue;
    }
    if (char === '"' || char === "'") quote = char;
    else if (char === "(" || char === "[") depth++;
    else if (char === ")" || char === "]") depth--;
    else if (char === "," && depth === 0) {
      parts.push(selector.slice(start, i));
      start = i + 1;
    }
  }
  parts.push(selector.slice(start));
  return parts;
}
function rule(selector, body) {
  // Keep hand-tuned theme rules at their original position, without remapping
  // their dark colours or adding a second (impossible) html ancestor.
  if (selector.includes("data-theme")) return `${selector} {${body}}`;
  const declarations = [];
  for (const part of body.split(/;(?![^(]*\))/)) {
    const idx = part.indexOf(":");
    if (idx < 0) continue;
    const prop = part.slice(0, idx).trim();
    const value = part.slice(idx + 1).trim();
    const mapped = transformDeclaration(prop, value);
    if (mapped !== null) declarations.push(`  ${prop}: ${mapped};`);
  }
  if (!declarations.length) return "";
  const scoped = splitSelectors(selector)
    .map((s) => s.trim())
    .map((s) =>
      /^(html|:root)$/.test(s)
        ? scope
        : `${scope} ${s.replace(/^body\b/, "body")}`,
    )
    .join(",\n");
  return `${scoped} {\n${declarations.join("\n")}\n}`;
}

let result =
  "/* GENERATED by scripts/generate-dark-theme.mjs — do not edit by hand. */\n";
for (const name of sources) {
  const css = readFileSync(new URL(name, stylesRoot), "utf8")
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/@import[^;]*;/g, "");
  const rules = [];
  walk(css, (r) => r && rules.push(r));
  result += `\n/* ${name} */\n${rules.join("\n")}\n`;
}
result = await format(result, { parser: "css" });
writeFileSync(new URL("../styles/dark.generated.css", import.meta.url), result);
console.log(`dark.generated.css written (${result.split("\n").length} lines)`);
