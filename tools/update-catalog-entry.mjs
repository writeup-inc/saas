#!/usr/bin/env node

import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = dirname(dirname(fileURLToPath(import.meta.url)));
const args = process.argv.slice(2);
const valueFor = (flag) => args[args.indexOf(flag) + 1];
const id = valueFor("--id");
const latestChange = valueFor("--latest-change");

if (!id || !latestChange?.trim()) {
  console.error("Usage: node tools/update-catalog-entry.mjs --id <service-id> --latest-change <one-line summary>");
  process.exit(1);
}

const entryPath = join(rootDir, "catalog", "entries", `${id}.json`);
if (!existsSync(entryPath)) {
  console.error(`[${id}] 商材ページまたはcatalog entryがありません`);
  process.exit(1);
}

const entry = JSON.parse(readFileSync(entryPath, "utf8"));
const route = entry.route ?? id;
const pagePath = join(rootDir, route, "index.html");
if (!existsSync(pagePath)) {
  console.error(`[${id}] 商材ページまたはcatalog entryがありません`);
  process.exit(1);
}

const latestCommit = execFileSync("git", ["log", "-1", "--format=%H", "--", `${route}/`], {
  cwd: rootDir,
  encoding: "utf8"
}).trim();
if (!latestCommit) {
  console.error(`[${id}] 本体コミットを取得できません`);
  process.exit(1);
}

entry.latestChange = latestChange.trim();
entry.latestChangeFor = latestCommit;
writeFileSync(entryPath, `${JSON.stringify(entry, null, 2)}\n`);
execFileSync(process.execPath, [join(rootDir, "tools", "sync-catalog.mjs"), "--write"], {
  cwd: rootDir,
  stdio: "inherit"
});
console.log(`[${id}] catalog entry と生成済みindex.htmlを更新しました (${latestCommit.slice(0, 7)})`);
