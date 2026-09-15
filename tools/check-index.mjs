#!/usr/bin/env node

import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const toolsDir = dirname(fileURLToPath(import.meta.url));
const rootDir = dirname(toolsDir);
const indexPath = join(rootDir, "index.html");
const configPath = join(toolsDir, "index-check.config.json");
const entriesDir = join(rootDir, "catalog", "entries");
const html = readFileSync(indexPath, "utf8");
const config = JSON.parse(readFileSync(configPath, "utf8"));
const catalogEntries = new Map(
  existsSync(entriesDir)
    ? readdirSync(entriesDir)
      .filter((name) => name.endsWith(".json"))
      .map((name) => JSON.parse(readFileSync(join(entriesDir, name), "utf8")))
      .map((entry) => [entry.id, entry])
    : []
);
const historyEnabled = process.argv.includes("--history");
const errors = [];
const warnings = [];

function error(message) {
  errors.push(message);
}

function warning(message) {
  warnings.push(message);
}

function unique(values, label) {
  const seen = new Set();
  for (const value of values) {
    if (seen.has(value)) error(`${label} が重複しています: ${value}`);
    seen.add(value);
  }
}

function formatJapaneseMinute(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Tokyo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23"
  }).formatToParts(date);
  const get = (type) => parts.find((part) => part.type === type)?.value;
  return `${get("year")}.${get("month")}.${get("day")} ${get("hour")}:${get("minute")}`;
}

function toJapaneseIsoMinute(value) {
  const display = formatJapaneseMinute(value);
  if (!display) return null;
  return `${display.slice(0, 10).replaceAll(".", "-")}T${display.slice(11)}:00+09:00`;
}

function git(args) {
  return execFileSync("git", args, {
    cwd: rootDir,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"]
  }).trim();
}

function commitPeople(commit) {
  const output = git(["show", "-s", "--format=%an%n%ae%n%B", commit]);
  const [authorName, authorEmail, ...bodyLines] = output.split("\n");
  const aliases = config.attribution.authorAliases;
  const people = [aliases[authorEmail] ?? authorName];
  const body = bodyLines.join("\n");
  const coAuthorPattern = /^Co-Authored-By:\s*(.+?)\s*<([^>]+)>\s*$/gim;

  for (const match of body.matchAll(coAuthorPattern)) {
    people.push(aliases[match[2]] ?? match[1]);
  }

  return {
    primaryEmail: authorEmail,
    label: [...new Set(people)].join("＋")
  };
}

function firstCreationCommit(cardId) {
  const route = entryRoute(catalogEntries.get(cardId));
  const path = config.attribution.creationOrigins[cardId] ?? `${route}/index.html`;
  const output = git(["log", "--reverse", "--format=%H", "--", path]);
  return output ? output.split("\n")[0] : null;
}

function latestSiteCommit(route) {
  const output = git(["log", "-1", "--format=%H", "--", `${route}/`]);
  return output || null;
}

function pageRevisionCount(route) {
  const output = git(["rev-list", "--count", "HEAD", "--", `${route}/`]);
  const commitCount = Number.parseInt(output, 10);
  return Number.isFinite(commitCount) ? Math.max(0, commitCount - 1) : null;
}

function commitsAfterBaseline(path) {
  const output = git(["rev-list", "--reverse", `${config.historyBaseline}..HEAD`, "--", path]);
  return output ? output.split("\n") : [];
}

function commitInfo(commit) {
  const output = git(["show", "-s", "--format=%aI%n%B", commit]);
  const [authorDate, ...bodyLines] = output.split("\n");
  return { commit, authorDate, body: bodyLines.join("\n") };
}

function entryRoute(entry) {
  return entry?.route ?? entry?.id;
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

function latestMaterialCommit(route, entry = null) {
  const commits = commitsAfterBaseline(route).map(commitInfo).reverse();
  let material = commits.find((commit) => !isCatalogOptOut(commit, route)) ?? null;
  const reclassifiedSha = entry?.latestChangeFor;
  const reclassified = reclassifiedSha ? commitInfo(reclassifiedSha) : null;
  if (reclassified && isCatalogOptOut(reclassified, route) && (!material || Date.parse(reclassified.authorDate) > Date.parse(material.authorDate))) {
    material = reclassified;
  }
  return material;
}

const listMatch = html.match(/<section class="list"[\s\S]*?<\/section>/);
if (!listMatch) {
  error(".list セクションが見つかりません");
}

const cardPattern = /<article class="service-entry" id="([^"]+)" data-published="([^"]+)" data-updated="([^"]+)" data-taka-created="(true|false)">([\s\S]*?)<\/article>/g;
const cards = [...(listMatch?.[0] ?? "").matchAll(cardPattern)].map((match) => ({
  id: match[1],
  published: match[2],
  updated: match[3],
  takaCreated: match[4],
  body: match[5]
}));

if (cards.length === 0) error("サービスカードが1件も見つかりません");

unique(cards.map(({ id }) => id), "カードID");

for (const [cardId, override] of Object.entries(config.attribution.creatorOverrides ?? {})) {
  if (!cards.some(({ id }) => id === cardId)) error(`[${cardId}] creatorOverridesに対応するカードがありません`);
  if (!override.label?.trim()) error(`[${cardId}] creatorOverrides.labelがありません`);
  if (typeof override.takaCreated !== "boolean") error(`[${cardId}] creatorOverrides.takaCreatedはbooleanではありません`);
  if (!override.basis?.trim()) error(`[${cardId}] creatorOverrides.basisがありません`);
}

const hrefs = [];
const copyAnchors = [];

cards.forEach((card, index) => {
  const prefix = `[${card.id}]`;
  const entry = catalogEntries.get(card.id);
  const route = entryRoute(entry);
  const publishedTime = Date.parse(card.published);
  const updatedTime = Date.parse(card.updated);
  const expectedNumber = String(index + 1).padStart(2, "0");
  const number = card.body.match(/<span class="number">([^<]+)<\/span>/)?.[1]?.trim();
  const service = card.body.match(/<a class="service" data-category="([^"]+)" href="([^"]+)">/);
  const category = service?.[1];
  const href = service?.[2];
  const copyAnchor = card.body.match(/data-copy-anchor="([^"]+)"/)?.[1];
  const urlText = card.body.match(/<span class="url">([^<]+)<\/span>/)?.[1]?.trim();
  const publishedDisplay = card.body.match(/<b>初回公開<\/b><time datetime="([^"]+)">([^<]+)<\/time>/);
  const updatedDisplay = card.body.match(/<b>最終更新<\/b><time datetime="([^"]+)">([^<]+)<\/time>/);
  const creatorTag = card.body.match(/<span class="author-tag creator(?: unknown)?">初回作成：([^<]+)<\/span>/)?.[1]?.trim();
  const editorTag = card.body.match(/<span class="author-tag editor">最終更新：([^<]+)<\/span>/)?.[1]?.trim();
  const revisionMatch = card.body.match(/<span class="revision-count" data-revisions="(\d+)" aria-label="公開後の改修(\d+)回"><span>REV\.<\/span><strong>(\d+)<\/strong><span>回<\/span><\/span>/);

  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:00\+09:00$/.test(card.published)) {
    error(`${prefix} data-published は分単位の日本時間ISO 8601ではありません: ${card.published}`);
  }
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:00\+09:00$/.test(card.updated)) {
    error(`${prefix} data-updated は分単位の日本時間ISO 8601ではありません: ${card.updated}`);
  }
  if (Number.isNaN(publishedTime) || Number.isNaN(updatedTime)) {
    error(`${prefix} 日時を解釈できません`);
  } else if (publishedTime > updatedTime) {
    error(`${prefix} data-published が data-updated より後です`);
  }
  if (index > 0 && Date.parse(cards[index - 1].updated) < updatedTime) {
    error(`${prefix} HTML上のカード順が data-updated の降順ではありません`);
  }
  if (number !== expectedNumber) {
    error(`${prefix} 連番が ${expectedNumber} ではありません: ${number ?? "欠落"}`);
  }
  if (!service) {
    error(`${prefix} serviceリンクが見つかりません`);
  } else {
    hrefs.push(href);
    if (!entry) error(`${prefix} catalog entryがありません`);
    else if (href !== `./${route}/`) error(`${prefix} href がrouteと一致しません: ${href}`);
  }
  if (copyAnchor) copyAnchors.push(copyAnchor);
  if (copyAnchor !== card.id) error(`${prefix} data-copy-anchor がIDと一致しません: ${copyAnchor ?? "欠落"}`);
  const canonical = new URL(config.canonicalBaseUrl);
  const expectedUrl = `${canonical.host}${canonical.pathname}${route}/`;
  if (urlText !== expectedUrl) error(`${prefix} 画面上のURLがIDと一致しません: ${urlText ?? "欠落"}`);
  if (!route || !existsSync(join(rootDir, route, "index.html"))) {
    error(`${prefix} リンク先の ${route ?? card.id}/index.html がありません`);
  }
  if (!publishedDisplay) {
    error(`${prefix} 初回公開のtime要素がありません`);
  } else {
    if (publishedDisplay[1] !== card.published) error(`${prefix} 初回公開のdatetimeがdata-publishedと一致しません`);
    if (publishedDisplay[2].trim() !== formatJapaneseMinute(card.published)) error(`${prefix} 初回公開の表示日時がdatetimeと一致しません`);
  }
  if (!updatedDisplay) {
    error(`${prefix} 最終更新のtime要素がありません`);
  } else {
    if (updatedDisplay[1] !== card.updated) error(`${prefix} 最終更新のdatetimeがdata-updatedと一致しません`);
    if (updatedDisplay[2].trim() !== formatJapaneseMinute(card.updated)) error(`${prefix} 最終更新の表示日時がdatetimeと一致しません`);
  }
  if (!revisionMatch) {
    error(`${prefix} 改修回数表示がありません`);
  } else {
    const displayedRevisions = revisionMatch.slice(1).map(Number);
    if (new Set(displayedRevisions).size !== 1) error(`${prefix} 改修回数のdata属性・表示・aria-labelが一致しません`);
    const expectedRevisions = pageRevisionCount(route);
    if (displayedRevisions[0] !== expectedRevisions) error(`${prefix} 改修回数がGit履歴と一致しません。期待値: ${expectedRevisions}`);
  }
  const creationCommit = firstCreationCommit(card.id);
  const latestCommit = latestSiteCommit(route);
  if (!creationCommit) {
    error(`${prefix} 初回作成コミットを取得できません`);
  } else {
    const creatorOverride = config.attribution.creatorOverrides?.[card.id];
    const creationUnknown = config.attribution.unknownCreationCommits.includes(creationCommit);
    const creation = commitPeople(creationCommit);
    const expectedCreator = creatorOverride?.label ?? (creationUnknown ? "履歴不明" : creation.label);
    const expectedTakaCreated = String(creatorOverride?.takaCreated ?? (!creationUnknown && creation.primaryEmail === config.attribution.takaAuthorEmail));
    if (creatorTag !== expectedCreator) error(`${prefix} 初回作成者タグが作成者判定と一致しません。期待値: ${expectedCreator}`);
    if (card.takaCreated !== expectedTakaCreated) error(`${prefix} data-taka-createdが作成者判定と一致しません。期待値: ${expectedTakaCreated}`);
  }
  if (!latestCommit) {
    error(`${prefix} 最終更新コミットを取得できません`);
  } else {
    const editor = commitPeople(latestCommit);
    if (editorTag !== editor.label) error(`${prefix} 最終更新者タグがGit履歴と一致しません。期待値: ${editor.label}`);
  }
  const categoryRule = config.categories[category];
  if (!categoryRule) {
    error(`${prefix} 未定義のdata-categoryです: ${category ?? "欠落"}`);
  } else {
    if (!card.body.includes(`<span class="category-name">${categoryRule.label}</span>`)) {
      error(`${prefix} カテゴリ表示が ${categoryRule.label} と一致しません`);
    }
    if (!card.body.includes(`<use href="#${categoryRule.icon}"/>`)) {
      error(`${prefix} カテゴリアイコンが #${categoryRule.icon} と一致しません`);
    }
  }
});

unique(hrefs, "href");
unique(copyAnchors, "data-copy-anchor");

const excluded = new Set(Object.keys(config.excludedDirectories));
const serviceDirectories = readdirSync(rootDir, { withFileTypes: true })
  .filter((entry) => entry.isDirectory() && !entry.name.startsWith(".") && existsSync(join(rootDir, entry.name, "index.html")))
  .map((entry) => entry.name)
  .filter((name) => !excluded.has(name));

for (const directory of serviceDirectories) {
  if (cards.some(({ id }) => entryRoute(catalogEntries.get(id)) === directory)) continue;
  if (historyEnabled) {
    const latest = latestMaterialCommit(directory);
    if (latest && /^Index-Update:\s*pending\s*$/im.test(latest.body)) {
      warning(`[${directory}] 一覧カードの追加待ちです (${latest.commit.slice(0, 7)})`);
      continue;
    }
  }
  error(`[${directory}] 商材ディレクトリに対応するカードがありません`);
}

for (const card of cards) {
  const route = entryRoute(catalogEntries.get(card.id));
  if (!route || !existsSync(join(rootDir, route, "index.html"))) error(`[${card.id}] 一覧対象ではないページのカードがあります`);
}

if (!html.includes('data-hero-activity') || !html.includes('data-hero-activity-list')) {
  error("ヒーロー右側の直近アクティビティ一覧がありません");
}
if (!html.includes('data-news-new-list') || !html.includes('data-news-updated-list')) {
  error("新規・更新を分けるお知らせダイアログの一覧がありません");
}
if (!html.includes("const activityHours = jstWeekday === 'Mon' ? 72 : jstWeekday === 'Sun' ? 48 : 24;")) {
  error("日曜48時間・月曜72時間・通常24時間の新着判定がありません");
}
if (!html.includes('updatedAt > publishedAt') || !html.includes('recentNew') || !html.includes('recentUpdates')) {
  error("新規と更新を分ける直近アクティビティ判定がありません");
}
if (/class="hero-board"/.test(html)) {
  error("固定の重要告知カードが残っています。直近アクティビティの自動表示へ移行してください");
}

if (historyEnabled) {
  try {
    git(["merge-base", "--is-ancestor", config.historyBaseline, "HEAD"]);
    for (const card of cards) {
      const entry = catalogEntries.get(card.id);
      const latest = latestMaterialCommit(entryRoute(entry), entry);
      if (!latest) continue;
      const expected = toJapaneseIsoMinute(latest.authorDate);
      if (card.updated === expected) continue;
      if (/^Index-Update:\s*pending\s*$/im.test(latest.body)) {
        warning(`[${card.id}] ${latest.commit.slice(0, 7)} の一覧反映待ちです。期待値: ${expected}`);
      } else {
        error(`[${card.id}] data-updatedが最新の実質更新 ${latest.commit.slice(0, 7)} のAuthor Dateと一致しません。期待値: ${expected}`);
      }
    }
  } catch (cause) {
    error(`Git履歴チェックを実行できません: ${cause.message.split("\n")[0]}`);
  }
}

for (const message of warnings) console.warn(`WARN ${message}`);
for (const message of errors) console.error(`ERROR ${message}`);

if (errors.length > 0) {
  console.error(`\nIndex check failed: ${errors.length} error(s), ${warnings.length} warning(s)`);
  process.exit(1);
}

console.log(`Index check passed: ${cards.length} card(s), dynamic activity announcement enabled, ${warnings.length} warning(s)`);
