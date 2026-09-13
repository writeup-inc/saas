#!/usr/bin/env node

// seminar/*/index.html を走査して、
//   1. seminar/index.html のセミナー一覧
//   2. ルート index.html のヒーロー右側「セミナー申し込みページ」
// を同じ元データから生成する。
//
//   node tools/build-seminar-index.mjs          … 生成して書き込む
//   node tools/build-seminar-index.mjs --check  … 差分があれば異常終了（CI用）

import { existsSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const toolsDir = dirname(fileURLToPath(import.meta.url));
const rootDir = dirname(toolsDir);
const seminarDir = join(rootDir, "seminar");
const checkOnly = process.argv.includes("--check");

const START = "<!-- SEMINAR-LIST:START -->";
const END = "<!-- SEMINAR-LIST:END -->";
const KNOWN_STATUS = ["募集中", "準備中", "終了"];

const escapeHtml = (value) =>
  value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");

const statusClass = (status) => (status === "募集中" ? "open" : status === "準備中" ? "soon" : "closed");

function meta(html, name) {
  const pattern = new RegExp(
    `<meta\\s+name=["']${name}["']\\s+content=["']([^"']*)["']\\s*/?>`,
    "i"
  );
  return html.match(pattern)?.[1]?.trim() ?? "";
}

function collect() {
  if (!existsSync(seminarDir)) return [];

  const entries = readdirSync(seminarDir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && !entry.name.startsWith("."))
    .filter((entry) => existsSync(join(seminarDir, entry.name, "index.html")))
    .map((entry) => entry.name);

  const problems = [];
  const pages = entries.map((slug) => {
    const html = readFileSync(join(seminarDir, slug, "index.html"), "utf8");
    const fallbackTitle = html.match(/<title>([^<]*)<\/title>/i)?.[1]?.trim() ?? slug;
    const title = meta(html, "seminar:title") || fallbackTitle.split("｜")[0].trim();
    const summary = meta(html, "seminar:summary");
    const audience = meta(html, "seminar:audience");
    const status = meta(html, "seminar:status") || "募集中";
    const order = Number.parseInt(meta(html, "seminar:order"), 10);

    if (!meta(html, "seminar:title")) {
      problems.push(`[seminar/${slug}] <meta name="seminar:title"> がありません（<title>で代用しました）`);
    }
    if (!summary) {
      problems.push(`[seminar/${slug}] <meta name="seminar:summary"> がありません`);
    }
    if (!KNOWN_STATUS.includes(status)) {
      problems.push(`[seminar/${slug}] seminar:status は ${KNOWN_STATUS.join(" / ")} のいずれかにしてください: ${status}`);
    }

    return {
      slug,
      title,
      summary,
      audience,
      status,
      order: Number.isFinite(order) ? order : 9000
    };
  });

  pages.sort((a, b) => a.order - b.order || a.slug.localeCompare(b.slug));
  return { pages, problems };
}

function heroBlock(pages) {
  if (pages.length === 0) {
    return [`<p class="hero-seminar-empty">現在ご案内中のセミナーはありません。</p>`];
  }
  const items = pages.map((page) => {
    const status = statusClass(page.status);
    const audience = page.audience ? `<span class="hero-seminar-audience">${escapeHtml(page.audience)}</span>` : "";
    return `  <li><a class="hero-seminar-link" href="./seminar/${page.slug}/"><span class="hero-seminar-status ${status}">${escapeHtml(page.status)}</span><span class="hero-seminar-title">${escapeHtml(page.title)}</span>${audience}</a></li>`;
  });
  return [`<ul class="hero-seminar-list">`, ...items, `</ul>`];
}

function pageBlock(pages) {
  if (pages.length === 0) {
    return [`<p class="seminar-empty">現在ご案内中のセミナーはありません。</p>`];
  }
  const items = pages.flatMap((page) => {
    const status = statusClass(page.status);
    const audience = page.audience ? `<span class="seminar-audience">${escapeHtml(page.audience)}</span>` : "";
    const lines = [
      `  <li class="seminar-item">`,
      `    <a class="seminar-link" href="./${page.slug}/">`,
      `      <span class="seminar-meta"><span class="seminar-status ${status}">${escapeHtml(page.status)}</span>${audience}</span>`,
      `      <span class="seminar-title">${escapeHtml(page.title)}</span>`
    ];
    if (page.summary) lines.push(`      <p class="seminar-summary">${escapeHtml(page.summary)}</p>`);
    lines.push(
      `      <span class="seminar-url">writeup-inc.github.io/saas/seminar/${page.slug}/</span>`,
      `    </a>`,
      `  </li>`
    );
    return lines;
  });
  return [`<ul class="seminar-list">`, ...items, `</ul>`];
}

function replaceBlock(path, block) {
  const html = readFileSync(path, "utf8");
  const escapeRe = (value) => value.replaceAll(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const pattern = new RegExp(`${escapeRe(START)}[\\s\\S]*?([ \\t]*)${escapeRe(END)}`);
  if (!pattern.test(html)) {
    throw new Error(`${path} に ${START} / ${END} のマーカーがありません`);
  }
  const next = html.replace(pattern, (_match, indent) => {
    const body = block.map((line) => (line ? `${indent}${line}` : "")).join("\n");
    return `${START}\n${body}\n${indent}${END}`;
  });
  return { path, current: html, next };
}

const { pages, problems } = collect();
const targets = [
  replaceBlock(join(rootDir, "index.html"), heroBlock(pages)),
  replaceBlock(join(seminarDir, "index.html"), pageBlock(pages))
];

for (const problem of problems) console.warn(`WARN ${problem}`);

const stale = targets.filter(({ current, next }) => current !== next);

if (checkOnly) {
  if (stale.length > 0) {
    for (const { path } of stale) {
      console.error(`ERROR ${path.slice(rootDir.length + 1)} がセミナー一覧と一致していません`);
    }
    console.error("\n`node tools/build-seminar-index.mjs` を実行して再生成してください。");
    process.exit(1);
  }
  console.log(`Seminar index check passed: ${pages.length} seminar page(s).`);
} else {
  for (const { path, next } of stale) {
    writeFileSync(path, next);
    console.log(`updated ${path.slice(rootDir.length + 1)}`);
  }
  console.log(`Seminar index built: ${pages.length} seminar page(s), ${stale.length} file(s) rewritten.`);
}
