#!/usr/bin/env node

import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const toolsDir = dirname(fileURLToPath(import.meta.url));
const rootDir = dirname(toolsDir);
const indexPath = join(rootDir, "index.html");
const configPath = join(toolsDir, "index-check.config.json");
const html = readFileSync(indexPath, "utf8");
const config = JSON.parse(readFileSync(configPath, "utf8"));
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

function commitsAfterBaseline(path) {
  const output = git(["rev-list", "--reverse", `${config.historyBaseline}..HEAD`, "--", path]);
  return output ? output.split("\n") : [];
}

function commitInfo(commit) {
  const output = git(["show", "-s", "--format=%aI%n%B", commit]);
  const [authorDate, ...bodyLines] = output.split("\n");
  return { commit, authorDate, body: bodyLines.join("\n") };
}

function latestMaterialCommit(path) {
  const commits = commitsAfterBaseline(path).map(commitInfo);
  return commits.reverse().find(({ body }) => !/^Catalog-Update:\s*no\s*$/im.test(body)) ?? null;
}

const listMatch = html.match(/<section class="list"[\s\S]*?<\/section>/);
if (!listMatch) {
  error(".list セクションが見つかりません");
}

const cardPattern = /<article class="service-entry" id="([^"]+)" data-published="([^"]+)" data-updated="([^"]+)">([\s\S]*?)<\/article>/g;
const cards = [...(listMatch?.[0] ?? "").matchAll(cardPattern)].map((match) => ({
  id: match[1],
  published: match[2],
  updated: match[3],
  body: match[4]
}));

if (cards.length === 0) error("サービスカードが1件も見つかりません");

unique(cards.map(({ id }) => id), "カードID");

const hrefs = [];
const copyAnchors = [];

cards.forEach((card, index) => {
  const prefix = `[${card.id}]`;
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
    if (href !== `./${card.id}/`) error(`${prefix} href がIDと一致しません: ${href}`);
  }
  if (copyAnchor) copyAnchors.push(copyAnchor);
  if (copyAnchor !== card.id) error(`${prefix} data-copy-anchor がIDと一致しません: ${copyAnchor ?? "欠落"}`);
  const canonical = new URL(config.canonicalBaseUrl);
  const expectedUrl = `${canonical.host}${canonical.pathname}${card.id}/`;
  if (urlText !== expectedUrl) error(`${prefix} 画面上のURLがIDと一致しません: ${urlText ?? "欠落"}`);
  if (!existsSync(join(rootDir, card.id, "index.html"))) {
    error(`${prefix} リンク先の ${card.id}/index.html がありません`);
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
  if (cards.some(({ id }) => id === directory)) continue;
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
  if (!serviceDirectories.includes(card.id)) error(`[${card.id}] 一覧対象ではないディレクトリのカードがあります`);
}

const heroBoards = [...html.matchAll(/<a class="hero-board" href="([^"]+)"[\s\S]*?<time datetime="([^"]+)">([^<]+)<\/time>[\s\S]*?<\/a>/g)];
if (heroBoards.length > 3) error(`重要告知が3件を超えています: ${heroBoards.length}件`);
for (const board of heroBoards) {
  const match = board[1].match(/^\.\/([^/]+)\/$/);
  if (!match || !existsSync(join(rootDir, match[1], "index.html"))) error(`重要告知のリンク先が存在しません: ${board[1]}`);
}

if (historyEnabled) {
  try {
    git(["merge-base", "--is-ancestor", config.historyBaseline, "HEAD"]);
    for (const card of cards) {
      const latest = latestMaterialCommit(card.id);
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

console.log(`Index check passed: ${cards.length} card(s), ${heroBoards.length} announcement(s), ${warnings.length} warning(s)`);
