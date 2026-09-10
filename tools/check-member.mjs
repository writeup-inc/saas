import { existsSync, readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const toolsDir = dirname(fileURLToPath(import.meta.url));
const rootDir = resolve(toolsDir, "..");
const memberDir = join(rootDir, "member");
const indexPath = join(memberDir, "index.html");
const errors = [];
const expectedArticles = [
  "about",
  "aio-first-meeting",
  "aio-no-guarantee",
  "worklog-job-first",
  "worklog-not-surveillance",
  "lsync-fit-questions",
  "lsync-scenario-boundary",
  "social-master-fit-questions",
  "social-master-no-guarantee"
];

const fail = (message) => errors.push(message);
if (!existsSync(indexPath)) fail("member/index.html がありません");

const html = existsSync(indexPath) ? readFileSync(indexPath, "utf8") : "";
const required = [
  ["noindex policy", /<meta name="robots" content="noindex, nofollow">/],
  ["canonical", /<link rel="canonical" href="https:\/\/writeup-inc\.github\.io\/saas\/member\/">/],
  ["1200px container", /--container:\s*1200px/],
  ["filters", /data-filter="weekly"[\s\S]*data-filter="playbook"[\s\S]*data-filter="caution"/],
  ["copy control", /data-copy-url=/],
  ["public-safe notice", /PUBLIC-SAFE EDITION/],
  ["reduced motion", /prefers-reduced-motion:\s*reduce/]
];

for (const [label, pattern] of required) {
  if (!pattern.test(html)) fail(`${label} がありません`);
}

if (/<link[^>]+rel=["']stylesheet["'][^>]+https?:\/\//i.test(html) || /fonts\.(googleapis|gstatic)\.com/i.test(html)) {
  fail("外部フォントまたは外部スタイルシートへ依存しています");
}

const cards = [...html.matchAll(/<article class="article-card"[^>]*data-category="([^"]+)"[^>]*data-published="([^"]+)"[^>]*data-updated="([^"]+)"[\s\S]*?<\/article>/g)];
if (cards.length !== expectedArticles.length) fail(`記事カードは${expectedArticles.length}件必要です（現在${cards.length}件）`);

const dates = cards.map((match) => match[3]);
for (let index = 1; index < dates.length; index += 1) {
  if (dates[index - 1] < dates[index]) fail("記事カードが最終更新日の新しい順ではありません");
}

const hrefs = [...html.matchAll(/<h3><a href="(\.\/[^"#?]+\/)"/g)].map((match) => match[1]);
const slugs = hrefs.map((href) => href.slice(2, -1));
if (new Set(slugs).size !== slugs.length) fail("記事リンクに重複があります");
for (const slug of expectedArticles) {
  if (!slugs.includes(slug)) fail(`必須記事が一覧にありません: ${slug}`);
}

for (const href of hrefs) {
  const target = join(memberDir, href.slice(2), "index.html");
  if (!existsSync(target)) fail(`リンク先がありません: ${href}`);
  else {
    const article = readFileSync(target, "utf8");
    if (!/<meta name="robots" content="noindex, nofollow">/.test(article)) fail(`${href} にnoindex, nofollowがありません`);
    if (!/<link rel="canonical" href="https:\/\/writeup-inc\.github\.io\/saas\/member\/[^"/]+\/?">/.test(article)) fail(`${href} のcanonicalが不正です`);
    if (href !== "./about/" && !/<link rel="stylesheet" href="\.\.\/article\.css">/.test(article)) fail(`${href} が共通記事CSSを読み込んでいません`);
    if (href !== "./about/" && !/30秒で分かる要点/.test(article)) fail(`${href} に要点がありません`);
    if (href !== "./about/" && !/SOURCE NOTE/.test(article)) fail(`${href} に根拠メモがありません`);
    if (/<link[^>]+rel=["']stylesheet["'][^>]+https?:\/\//i.test(article) || /fonts\.(googleapis|gstatic)\.com/i.test(article)) fail(`${href} が外部フォントまたは外部CSSへ依存しています`);
  }
}

const categoryCounts = cards.reduce((counts, match) => {
  counts[match[1]] = (counts[match[1]] || 0) + 1;
  return counts;
}, {});
if (categoryCounts.playbook !== 4) fail("売り方の型は4本必要です");
if (categoryCounts.caution !== 4) fail("注意・NGは4本必要です");
if (categoryCounts.guide !== 1) fail("ガイドは1本必要です");

if (errors.length) {
  errors.forEach((message) => console.error(`ERROR: ${message}`));
  process.exit(1);
}

console.log(`Member check passed: ${cards.length} article card(s), ${hrefs.length} linked article(s).`);
