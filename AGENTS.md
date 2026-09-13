# Codex project instructions

このリポジトリで作業する前に `README.md` を読み、特に「共同編集の運用」「一覧ページの更新ルール」「更新時の確認手順」に従う。

## 担当範囲

- 各商材ディレクトリは Claude Code と Codex の共同編集領域。作成者に関係なく、最新のファイルを正としてどちらも編集してよい
- ただし、同じ商材ディレクトリを同時に編集しない。ユーザーから担当を受けてから commit・push・引き継ぎまでを作業中とし、担当交代は前の担当が終えてから行う
- Gitは別環境の未push変更を検出できない。自分が現在の担当か不明な場合は、対象ファイルを変更する前にユーザーへ確認する
- ルート `index.html` は Codex が主担当。Claude Code から一覧更新の引き継ぎを受けたら、最新の main を取り込んでから反映する
- 生成物は直接編集しない。商材に生成元やビルド手順がある場合は、その生成元を更新して再生成する

## 作業開始時

1. `git status --short --branch` で未コミット変更を確認する
2. clean な状態で `git fetch origin` を行い、上流が進んでいれば取り込む
3. 対象商材の現在のファイルと直近のGit履歴を読み直す。以前の構造や別セッションの記憶を前提にしない
4. 未コミット変更がある場合は、自動stashや上書きをせず、その変更の所有者と内容を確認する

## 作業終了時

- 対象ページを検証し、ユーザーが依頼した範囲で commit・push する
- 担当を交代するときは、対象、最終コミット、変更ファイル、変更内容、未完了事項、一覧更新の要否を引き継ぐ
- ルート `index.html` を変更したら `node tools/check-index.mjs --history` を実行する
- push直前にも `git fetch origin` を行い、上流の新しい変更を取りこぼしていないことを確認する

## セミナー・説明会ページの置き場所（2026-09-13 追加）

セミナー・説明会の申し込みページは、商材ディレクトリと並べず `seminar/<slug>/` に置く。
社内が覚えるURLルールを「セミナーは `/saas/seminar/` 配下」の1本にするため。

- 既存2本は `seminar/ai-katsuyo/`（AI活用セミナー）と `seminar/worklog-insight-oem/`（ワークログOEM説明会）
- 旧URL `monitor/seminar/` と `worklog-insight-oem-seminar/` には転送ページが残っている。消さない
- `seminar/` はルート `index.html` の商材カード対象外（`tools/index-check.config.json` の `excludedDirectories`）

新しいセミナーページの `<head>` には次のメタを入れる。

```html
<meta name="seminar:title" content="一覧に出す短い名前">
<meta name="seminar:summary" content="一覧に出す1行説明">
<meta name="seminar:audience" content="社外 / パートナー / 社内 など">
<meta name="seminar:status" content="募集中｜準備中｜終了">
<meta name="seminar:order" content="10">
```

### 一覧は手で書かない

`seminar/index.html` と、ルート `index.html` のヒーロー右側
`<!-- SEMINAR-LIST:START -->` 〜 `<!-- SEMINAR-LIST:END -->` の中身は、
`tools/build-seminar-index.mjs` が上記メタから生成する。

- マーカーの内側を手で編集しない。次の生成で上書きされる
- マーカーの外側（見出し、`一覧→` リンク、CSS）は手で編集してよい
- 生成し直すコマンドは `node tools/build-seminar-index.mjs`
- main へ push すると `sync-seminar-index` ワークフローが再生成して自動コミットする
- pull request では `node tools/build-seminar-index.mjs --check` が差分を検出する

ルート `index.html` は Codex が主担当のままだが、ヒーロー右側のこのブロックだけは
生成物として扱う。表示を変えたいときは HTML ではなく生成スクリプト側を直す。
