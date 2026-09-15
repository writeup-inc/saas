# Claude Code project instructions

@README.md

- このリポジトリで商材ページを追加・更新するときは、READMEの「一覧ページの更新ルール」と「更新時の確認手順」を必ず実行する
- 新サービス公開や大幅な変更では、READMEの「上部の重要告知」に従ってホワイトボードの差し替え要否を判断する
- 商材の実質更新後は、push前に `node tools/update-catalog-entry.mjs --id <id> --latest-change "具体的な変更を一文で"` を実行する。日時・改修回数・作成者・並び順はGit履歴から自動生成し、カードHTMLを手編集しない
- 既存の未コミット変更や無関係なページを上書き・削除しない
- commit、push、公開は、ユーザーから依頼された範囲でのみ実行する

## ルート index.html の生成規約

サービスカードは `catalog/entries/<id>.json` を正本に、`node tools/sync-catalog.mjs --write` で生成する。CodexとClaude Codeのどちらも、カードHTMLを直接編集してはならない。

各担当者は自分の商材ページと対応する `catalog/entries/<id>.json` を更新できる。新規カードは`catalog/entry.template.json`をentryへコピーして作る。同期コマンドが変えるルート `index.html` は生成物であり、競合時は最新mainを取り込んでから再生成する。

- Claude Code が書いてよいのは、いま担当している商材ディレクトリと対応する `catalog/entries/<slug>.json`。
- 商材ディレクトリはClaude Code専用ではない。commit・push・引き継ぎ後は、Codexが同じ商材を続けて編集してよい。逆方向も同じ
- 同じ商材を同時に編集しない。ユーザーから担当を受けてからcommit・push・引き継ぎまでを作業中とし、担当が不明なら編集前に確認する
- 作業開始時は最新のmainと現在のファイル、直近のGit履歴を読み直す
- 商材ページの実質更新後は、ローカルで本体コミットを作成し、push前に下記の同期手順を必ず完了する

### 必須の同期手順

1. 商材ページだけをローカルでcommitする。ここではまだpushしない
2. `node tools/update-catalog-entry.mjs --id <id> --latest-change "具体的な変更を一文で"` を実行する
3. このコマンドが更新したentryと生成済み`index.html`を2つ目のcommitにする
4. `node tools/sync-catalog.mjs --check` と `node tools/check-index.mjs --history` を実行する
5. push直前にfetchし、両commitをまとめてpushする

軽微な変更で公開一覧を変えないときだけ、商材コミットへ `Catalog-Update: no` を付ける。`Index-Update: pending` を使って一覧反映を後回しにする運用は廃止する。

## セミナー・説明会／インタビューは独立リポジトリ（2026-09-13〜）

`monitor`・`members`・`Interviews`・`seminar` は、saasと同列の独立リポジトリに置く方針にした。
`monitor`は`writeup-inc/monitor`、`members`は`writeup-inc/members`、
`Interviews`は`writeup-inc/interviews`、`seminar`は`writeup-inc/seminar`。
それぞれ自分のGitHub Pagesを持つ（例: `https://writeup-inc.github.io/seminar/`）。

saas側の `Interviews/` `seminar/` に残っているファイルは、旧URLからの**転送ページのみ**
（`monitor/elliot/index.html` と同じ「移転しました」パターン）。中身を足したり戻したりしない。
新しいインタビュー記事・セミナーページは、saasではなく各独立リポジトリ側に作る。

旧セミナーの自動生成（`tools/build-seminar-index.mjs`、`seminar:title`等のメタタグ、
`sync-seminar-index`ワークフロー）は2026-09-13に廃止した。ルート`index.html`の
`SEMINAR-LIST`マーカーと「SITE / 関連ページ」欄の最終更新日は、当面は手で更新する。

**未実装（次フェーズ）：** 独立リポジトリ側の更新をsaasの新着欄（ヒーロー右側・新着ダイアログ）へ
自動連携する仕組み（各リポジトリのpushをGitHub Actionsでsaasへ`repository_dispatch`し、
saas側がGitHub APIで最新コミットを取得してヒーローを書き換える案）。
saasへの書き込み権限を持つトークンを各独立リポジトリのActions Secretsに登録する必要があり、
これはユーザー本人の作業が要る。

`monitor`の移行（現在はsaas内、独立リポジトリへ戻す）と`members`側の掃除（saasに残る
古いコピーを転送ページ化）は、まだ未着手。
