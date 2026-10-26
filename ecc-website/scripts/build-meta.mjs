#!/usr/bin/env node
/**
 * After `vite build`: write dist/<page>/index.html for each page in
 * src/data/pageMeta.js, with that page's title, description and preview image,
 * so links shared on WhatsApp / iMessage show the right preview.
 */
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { SITE_URL, pageMeta } from "../src/data/pageMeta.js";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const dist = resolve(root, "dist");
const template = await readFile(resolve(dist, "index.html"), "utf8");

const esc = (s) =>
  String(s).replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

function render(path, meta) {
  const url = SITE_URL + (path === "/" ? "/" : path);
  const tags = [
    `<title>${esc(meta.title)}</title>`,
    `<meta name="description" content="${esc(meta.description)}" />`,
    `<link rel="canonical" href="${url}" />`,
    `<meta property="og:site_name" content="Easton–Emeralds Cricket Club" />`,
    `<meta property="og:type" content="website" />`,
    `<meta property="og:url" content="${url}" />`,
    `<meta property="og:title" content="${esc(meta.title)}" />`,
    `<meta property="og:description" content="${esc(meta.description)}" />`,
    `<meta property="og:image" content="${meta.image}" />`,
    `<meta property="og:image:width" content="1200" />`,
    `<meta property="og:image:height" content="630" />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
    `<meta name="twitter:title" content="${esc(meta.title)}" />`,
    `<meta name="twitter:description" content="${esc(meta.description)}" />`,
    `<meta name="twitter:image" content="${meta.image}" />`,
  ].join("\n    ");
  return template
    .replace(/<!-- meta:start -->[\s\S]*?<!-- meta:end -->/, `<!-- meta:start -->\n    ${tags}\n    <!-- meta:end -->`);
}

if (!template.includes("<!-- meta:start -->")) {
  throw new Error("index.html is missing the <!-- meta:start --> / <!-- meta:end --> markers");
}

let count = 0;
for (const [path, meta] of Object.entries(pageMeta)) {
  const out = path === "/" ? resolve(dist, "index.html") : resolve(dist, `.${path}`, "index.html");
  await mkdir(dirname(out), { recursive: true });
  await writeFile(out, render(path, meta));
  count++;
}
console.log(`build-meta: wrote link previews for ${count} pages`);
