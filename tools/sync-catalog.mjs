#!/usr/bin/env node

import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const toolsDir = dirname(fileURLToPath(import.meta.url));
const rootDir = dirname(toolsDir);
const indexPath = join(rootDir, "index.html");
const config = JSON.parse(readFileSync(join(toolsDir, "index-check.config.json"), "utf8"));
const entriesDir = join(rootDir, "catalog", "entries");
const args = new Set(process.argv.slice(2));
const errors = [];
const commitInfoCache = new Map();
const materialCommitCache = new Map();
const creationCommitCache = new Map();
const latestCommitCache = new Map();
const revisionCache = new Map();
const peopleCache = new Map();

function fail(message) { errors.push(message); }

function git(args) {
  return execFileSync("git", args, { cwd: rootDir, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] }).trim();
}

function commitInfo(commit) {
  if (commitInfoCache.has(commit)) return commitInfoCache.get(commit);
  const [authorDate, ...bodyLines] = git(["show", "-s", "--format=%aI%n%B", commit]).split("\n");
  const info = { commit, authorDate, body: bodyLines.join("\n") };
  commitInfoCache.set(commit, info);
  return info;
}

function isCatalogMarkerOnlyCommit(commit, route) {
  const changedPaths = git(["diff-tree", "--no-commit-id", "--name-only", "-r", commit.commit, "--", `${route}/`]).split("\n").filter(Boolean);
  if (changedPaths.length !== 1) return false;
  const diff = git(["show", "--format=", "--unified=0", commit.commit, "--", changedPaths[0]]);
  const changedLines = diff.split("\n").filter((line) => (line.startsWith("+") && !line.startsWith("+++")) || (line.startsWith("-") && !line.startsWith("---")));
  return changedLines.length > 0 && changedLines.every((line) => /<meta\s+name=["']catalog-card["']\s+content=["']true["']\s*\/?\s*>/i.test(line));
}

function isCatalogOptOut(commit, route) {
  return /^Catalog-Update:\s*no\s*$/im.test(commit.body) || isCatalogMarkerOnlyCommit(commit, route);
}

function latestMaterialCommit(id, reclassifiedCommit = null) {
  const cacheKey = `${id}:${reclassifiedCommit ?? ""}`;
  if (materialCommitCache.has(cacheKey)) return materialCommitCache.get(cacheKey);
  const output = git(["rev-list", "--reverse", `${config.historyBaseline}..HEAD`, "--", `${id}/`]);
  const commits = output ? output.split("\n").map(commitInfo) : [];
  const newestFirst = commits.reverse();
  let material = newestFirst.find((commit) => !isCatalogOptOut(commit, id));
  if (!material) {
    const fullHistory = git(["log", "--format=%H", "--", `${id}/`]);
    material = (fullHistory ? fullHistory.split("\n") : [])
      .map(commitInfo)
      .find((commit) => !isCatalogOptOut(commit, id)) ?? null;
  }
  const reclassified = reclassifiedCommit ? commitInfo(reclassifiedCommit) : null;
  if (reclassified && isCatalogOptOut(reclassified, id) && (!material || Date.parse(reclassified.authorDate) > Date.parse(material.authorDate))) {
    material = reclassified;
  }
  materialCommitCache.set(cacheKey, material);
  return material;
}

function firstCreationCommit(id, route = id) {
  if (creationCommitCache.has(id)) return creationCommitCache.get(id);
  const path = config.attribution.creationOrigins[id] ?? `${route}/index.html`;
  const output = git(["log", "--reverse", "--format=%H", "--", path]);
  const commit = output ? output.split("\n")[0] : null;
  creationCommitCache.set(id, commit);
  return commit;
}

function latestSiteCommit(route) {
  if (latestCommitCache.has(route)) return latestCommitCache.get(route);
  const commit = git(["log", "-1", "--format=%H", "--", `${route}/`]) || null;
  latestCommitCache.set(route, commit);
  return commit;
}

function revisionCount(route) {
  if (revisionCache.has(route)) return revisionCache.get(route);
  const count = Math.max(0, Number.parseInt(git(["rev-list", "--count", "HEAD", "--", `${route}/`]), 10) - 1);
  revisionCache.set(route, count);
  return count;
}

function people(commit) {
  if (peopleCache.has(commit)) return peopleCache.get(commit);
  const [authorName, authorEmail, ...bodyLines] = git(["show", "-s", "--format=%an%n%ae%n%B", commit]).split("\n");
  const aliases = config.attribution.authorAliases;
  const labels = [aliases[authorEmail] ?? authorName];
  for (const match of bodyLines.join("\n").matchAll(/^Co-Authored-By:\s*(.+?)\s*<([^>]+)>\s*$/gim)) {
    labels.push(aliases[match[2]] ?? match[1]);
  }
  const result = { email: authorEmail, label: [...new Set(labels)].join("＋") };
  peopleCache.set(commit, result);
  return result;
}

function japaneseMinute(value) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Tokyo", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", hourCycle: "h23"
  }).formatToParts(new Date(value));
  const get = (type) => parts.find((part) => part.type === type)?.value;
  return `${get("year")}.${get("month")}.${get("day")} ${get("hour")}:${get("minute")}`;
}

function isoMinute(value) {
  const display = japaneseMinute(value);
  return `${display.slice(0, 10).replaceAll(".", "-")}T${display.slice(11)}:00+09:00`;
}

function escapeHtml(value) {
  return String(value).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;");
}

function titleHtml(lines) {
  return lines.map(escapeHtml).join("<br>");
}

function entryRoute(entry) {
  return entry.route ?? entry.id;
}

function parseExistingCards(html) {
  const list = html.match(/<section class="list"[\s\S]*?<\/section>/)?.[0];
  const pattern = /<article class="service-entry" id="([^"]+)" data-published="([^"]+)" data-updated="([^"]+)" data-taka-created="(true|false)">([\s\S]*?)<\/article>/g;
  return [...(list ?? "").matchAll(pattern)].map((match) => {
    const body = match[5];
    const title = body.match(/<h2>([\s\S]*?)<\/h2>/)?.[1] ?? "";
    return {
      id: match[1],
      category: body.match(/<a class="service" data-category="([^"]+)"/)?.[1],
      titleLines: title.split("<br>").map((line) => line.replaceAll("&amp;", "&").trim()),
      type: body.match(/<span class="service-type">([^<]+)<\/span>/)?.[1],
      latestChange: body.match(/<p class="change-note"><span>最新の変更点<\/span><b>([\s\S]*?)<\/b><\/p>/)?.[1]?.replaceAll("&amp;", "&").trim()
    };
  });
}

function bootstrap(html) {
  if (existsSync(entriesDir) && readdirSync(entriesDir).length > 0) {
    fail("catalog/entries はすでに存在します。--bootstrap は空の状態でだけ実行できます");
    return;
  }
  mkdirSync(entriesDir, { recursive: true });
  for (const card of parseExistingCards(html)) {
    const latest = latestMaterialCommit(card.id);
    if (!card.category || !card.type || !card.latestChange || !latest) {
      fail(`[${card.id}] 既存カードからメタデータを初期化できません`);
      continue;
    }
    const entry = {
      schemaVersion: 1,
      id: card.id,
      visibility: "public",
      category: card.category,
      titleLines: card.titleLines,
      type: card.type,
      latestChange: card.latestChange,
      latestChangeFor: latest.commit
    };
    writeFileSync(join(entriesDir, `${card.id}.json`), `${JSON.stringify(entry, null, 2)}\n`);
  }
}

function loadEntries() {
  if (!existsSync(entriesDir)) {
    fail("catalog/entries がありません。初回だけ node tools/sync-catalog.mjs --bootstrap --write を実行してください");
    return [];
  }
  return readdirSync(entriesDir)
    .filter((name) => name.endsWith(".json"))
    .sort()
    .map((name) => {
      try { return JSON.parse(readFileSync(join(entriesDir, name), "utf8")); }
      catch { fail(`catalog/entries/${name} をJSONとして読めません`); return null; }
    })
    .filter(Boolean);
}

function catalogMarkedRoutes(directory = rootDir, prefix = "") {
  const routes = [];
  for (const item of readdirSync(directory, { withFileTypes: true })) {
    if (!item.isDirectory() || item.name.startsWith(".")) continue;
    const route = prefix ? `${prefix}/${item.name}` : item.name;
    const itemPath = join(directory, item.name);
    const pagePath = join(itemPath, "index.html");
    if (existsSync(pagePath) && /<meta\s+name=["']catalog-card["']\s+content=["']true["']\s*\/?\s*>/i.test(readFileSync(pagePath, "utf8"))) {
      routes.push(route);
    }
    routes.push(...catalogMarkedRoutes(itemPath, route));
  }
  return routes;
}

function renderCard(entry, index) {
  const id = entry.id;
  const route = entryRoute(entry);
  const category = config.categories[entry.category];
  const latest = latestMaterialCommit(route, entry.latestChangeFor);
  const creationCommit = firstCreationCommit(id, route);
  const latestCommit = latestSiteCommit(route);
  if (!category) fail(`[${id}] 未定義のcategoryです: ${entry.category}`);
  if (!latest) fail(`[${id}] 実質更新コミットを取得できません`);
  if (!creationCommit || !latestCommit) fail(`[${id}] Git履歴を取得できません`);
  if (!entry.latestChange?.trim()) fail(`[${id}] latestChange がありません`);
  if (entry.latestChangeFor !== latest?.commit) fail(`[${id}] latestChangeFor が最新実質更新と一致しません。期待値: ${latest?.commit}`);
  if (!Array.isArray(entry.titleLines) || entry.titleLines.length === 0) fail(`[${id}] titleLines がありません`);
  if (errors.length > 0) return "";

  const creation = people(creationCommit);
  const editor = people(latestCommit);
  const override = config.attribution.creatorOverrides?.[id];
  const creationUnknown = config.attribution.unknownCreationCommits.includes(creationCommit);
  const creator = override?.label ?? (creationUnknown ? "履歴不明" : creation.label);
  const takaCreated = override?.takaCreated ?? (!creationUnknown && creation.email === config.attribution.takaAuthorEmail);
  const published = isoMinute(commitInfo(creationCommit).authorDate);
  const updated = isoMinute(latest.authorDate);
  const revision = revisionCount(route);
  const number = String(index + 1).padStart(2, "0");
  const visibleName = entry.titleLines.join(" ");

  return `        <article class="service-entry" id="${escapeHtml(id)}" data-published="${published}" data-updated="${updated}" data-taka-created="${takaCreated}">
        <a class="service" data-category="${escapeHtml(entry.category)}" href="./${escapeHtml(route)}/">
          <span class="service-index"><span class="category-icon" aria-hidden="true"><svg><use href="#${category.icon}"/></svg></span><span class="number">${number}</span></span>
          <div>
            <div class="service-topline"><span class="revision-count" data-revisions="${revision}" aria-label="公開後の改修${revision}回"><span>REV.</span><strong>${revision}</strong><span>回</span></span><span class="category-name">${escapeHtml(category.label)}</span><span class="service-type">${escapeHtml(entry.type)}</span><span class="badge-slot-placeholder"></span></div>
            <div class="service-title-row"><h2>${titleHtml(entry.titleLines)}</h2><span class="badge-slot"></span></div>
          </div>
          <div class="description-wrap">
            <p class="change-note"><span>最新の変更点</span><b>${escapeHtml(entry.latestChange)}</b></p>
            <span class="url">writeup-inc.github.io/saas/${escapeHtml(route)}/</span>
            <span class="author-tags"><span class="author-tag creator${creationUnknown ? " unknown" : ""}">初回作成：${escapeHtml(creator)}</span><span class="author-tag editor">最終更新：${escapeHtml(editor.label)}</span></span>
            <span class="dates"><span class="date-item"><b>初回公開</b><time datetime="${published}">${japaneseMinute(published)}</time></span><span class="date-item"><b>最終更新</b><time datetime="${updated}">${japaneseMinute(updated)}</time></span></span>
          </div>
          <span class="arrow" aria-hidden="true">↗</span>
        </a>
        <button class="service-share" type="button" data-copy-anchor="${escapeHtml(id)}" data-service-name="${escapeHtml(visibleName)}" aria-label="${escapeHtml(visibleName)}の一覧内共有URLをコピー"><span aria-hidden="true">⌁</span><span class="service-share-label">共有URLをコピー</span></button>
        </article>`;
}

let html = readFileSync(indexPath, "utf8");
if (args.has("--bootstrap")) bootstrap(html);
const entries = loadEntries();
const markedRoutes = catalogMarkedRoutes();
const excluded = new Set(Object.keys(config.excludedDirectories));
const directories = readdirSync(rootDir, { withFileTypes: true })
  .filter((entry) => entry.isDirectory() && !entry.name.startsWith(".") && existsSync(join(rootDir, entry.name, "index.html")))
  .map((entry) => entry.name)
  .filter((id) => !excluded.has(id));
const entryIds = new Set(entries.map((entry) => entry.id));
const entryRoutes = new Set(entries.map(entryRoute));
for (const id of directories) if (!entryIds.has(id)) fail(`[${id}] catalog/entries/${id}.json がありません`);
for (const route of markedRoutes) if (!entryRoutes.has(route)) fail(`[${route}] catalog-card があるのに対応するcatalog entryがありません`);
for (const entry of entries) {
  const route = entryRoute(entry);
  if (entry.schemaVersion !== 1) fail(`[${entry.id}] schemaVersion: 1 が必要です`);
  if (entry.visibility !== "public") fail(`[${entry.id}] visibility は public だけを許可します。非商材は index-check.config.json の excludedDirectories へ記録してください`);
  if (!/^[a-z0-9][a-z0-9-]*(?:\/[a-z0-9][a-z0-9-]*)*$/.test(route)) fail(`[${entry.id}] route が不正です: ${route}`);
  if (!existsSync(join(rootDir, route, "index.html"))) fail(`[${entry.id}] 対応する公開ページがありません: ${route}/index.html`);
  if (entry.route && !markedRoutes.includes(route)) fail(`[${entry.id}] 子ページを独立カードにするなら ${route}/index.html にcatalog-cardメタタグが必要です`);
}

const ordered = entries.filter((entry) => existsSync(join(rootDir, entryRoute(entry), "index.html"))).sort((a, b) => {
  const latestA = latestMaterialCommit(entryRoute(a), a.latestChangeFor)?.authorDate ?? "";
  const latestB = latestMaterialCommit(entryRoute(b), b.latestChangeFor)?.authorDate ?? "";
  return Date.parse(latestB) - Date.parse(latestA);
});
const rendered = ordered.map(renderCard).join("\n\n");
if (errors.length === 0) {
  const section = html.match(/<section class="list"[\s\S]*?<\/section>/)?.[0];
  const cards = [...(section ?? "").matchAll(/<article class="service-entry"[\s\S]*?<\/article>/g)];
  if (!section || cards.length === 0) fail("index.html のサービスカード領域を見つけられません");
  else {
    const markerStart = section.indexOf("<!-- SERVICE-CARDS:START -->");
    const markerEnd = section.indexOf("<!-- SERVICE-CARDS:END -->");
    const start = markerStart >= 0 ? markerStart : section.indexOf(cards[0][0]);
    const end = markerEnd >= 0
      ? markerEnd + "<!-- SERVICE-CARDS:END -->".length
      : section.indexOf(cards.at(-1)[0]) + cards.at(-1)[0].length;
    const replacement = `<!-- SERVICE-CARDS:START -->\n${rendered}\n        <!-- SERVICE-CARDS:END -->`;
    const nextSection = `${section.slice(0, start)}${replacement}${section.slice(end)}`;
    const nextHtml = html.replace(section, nextSection);
    if (args.has("--write")) writeFileSync(indexPath, nextHtml);
    else if (nextHtml !== html) fail("index.html がcatalog/entriesと同期していません。node tools/sync-catalog.mjs --write を実行してください");
  }
}

if (errors.length > 0) {
  for (const message of errors) console.error(`ERROR ${message}`);
  process.exit(1);
}
console.log(`Catalog sync passed: ${ordered.length} public entry(s)`);
