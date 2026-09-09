#!/usr/bin/env node

import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const toolsDir = dirname(fileURLToPath(import.meta.url));
const rootDir = dirname(toolsDir);
const config = JSON.parse(readFileSync(join(toolsDir, "critical-typography.config.json"), "utf8"));
const selfTest = process.argv.includes("--self-test");

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function extractCss(html) {
  return [...html.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/gi)].map((match) => match[1]).join("\n");
}

function rule(css, selector) {
  const match = css.match(new RegExp(`(?:^|})\\s*${escapeRegExp(selector)}\\s*\\{([^}]*)\\}`));
  if (!match) return null;
  const declarations = new Map();
  for (const entry of match[1].split(";")) {
    const separator = entry.indexOf(":");
    if (separator === -1) continue;
    declarations.set(entry.slice(0, separator).trim(), entry.slice(separator + 1).trim());
  }
  return { declarations, index: match.index ?? -1 };
}

function validatePage(page, html) {
  const errors = [];
  const css = extractCss(html);

  if (!css) errors.push("style要素が見つかりません");

  if (page.forbidRemoteFonts) {
    if (/fonts\.(googleapis|gstatic)\.com/i.test(html) || /@import\s+url\(\s*["']?https?:/i.test(css)) {
      errors.push("外部フォント依存が再導入されています");
    }
  }

  for (const font of page.requiredFallbackFonts ?? []) {
    if (!css.includes(font)) errors.push(`代替フォントがありません: ${font}`);
  }

  for (const required of page.requiredRules ?? []) {
    const found = rule(css, required.selector);
    if (!found) {
      errors.push(`必須CSSルールがありません: ${required.selector}`);
      continue;
    }
    for (const [property, expected] of Object.entries(required.declarations ?? {})) {
      const actual = found.declarations.get(property);
      if (actual !== expected) errors.push(`${required.selector} の ${property} が不正です: ${actual ?? "欠落"} (期待値: ${expected})`);
    }
    for (const earlierSelector of required.after ?? []) {
      const earlier = rule(css, earlierSelector);
      if (!earlier) {
        errors.push(`優先順位の比較対象がありません: ${earlierSelector}`);
      } else if (found.index <= earlier.index) {
        errors.push(`${required.selector} は ${earlierSelector} より後に定義してください`);
      }
    }
  }

  for (const forbidden of page.forbiddenRules ?? []) {
    if (rule(css, forbidden)) errors.push(`低優先度の禁止CSSルールがあります: ${forbidden}`);
  }

  for (const occurrence of page.requiredOccurrences ?? []) {
    const count = html.split(occurrence.text).length - 1;
    if (count < occurrence.minimum) errors.push(`${occurrence.text} が不足しています: ${count}件 (最低${occurrence.minimum}件)`);
  }

  return errors;
}

let failureCount = 0;

for (const page of config.pages ?? []) {
  const html = readFileSync(join(rootDir, page.path), "utf8");
  const errors = validatePage(page, html);

  for (const message of errors) console.error(`ERROR [${page.path}] ${message}`);
  failureCount += errors.length;

  if (!selfTest || errors.length > 0) continue;

  for (const mutation of page.selfTestMutations ?? []) {
    if (!html.includes(mutation.find)) {
      console.error(`ERROR [${page.path}] self-test対象が見つかりません: ${mutation.name}`);
      failureCount += 1;
      continue;
    }
    const mutated = html.replace(mutation.find, mutation.replace);
    const mutationErrors = validatePage(page, mutated);
    if (mutationErrors.length === 0) {
      console.error(`ERROR [${page.path}] 回帰を検知できませんでした: ${mutation.name}`);
      failureCount += 1;
    } else {
      console.log(`SELF-TEST PASS [${page.path}] ${mutation.name}`);
    }
  }
}

if (failureCount > 0) {
  console.error(`\nCritical typography check failed: ${failureCount} error(s)`);
  process.exit(1);
}

console.log(`Critical typography check passed: ${config.pages?.length ?? 0} page(s)`);
