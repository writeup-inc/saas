# SaaS 資料置き場

ライトアップのSaaS商材について、営業・企画で使う資料や公開LPを置くリポジトリ。
商材ごとにフォルダを分け、単一HTMLまたは静的書き出し一式を配置する。

- 公開URL: https://writeup-inc.github.io/saas/
- 単一HTMLは外部依存なし（インラインCSS/SVG・ライト/ダーク対応）
- Next.jsなどの静的書き出しは、アセットを各商材フォルダ内に閉じる

## 共同編集の運用

各商材ディレクトリは、Claude CodeとCodexの共同編集領域とする。作成者に関係なく、最新のファイルを正としてどちらも翌日以降に編集してよい。ただし、同じ商材を同時に編集しない。

### 同時編集を避けるための作業権

- ユーザーがClaude CodeまたはCodexへ特定の商材を依頼した時点から、その担当がcommit・push・引き継ぎを完了するまでを「作業中」とする
- 作業中の商材を別のAIへ同時に依頼しない。途中で交代する場合は、先の担当を停止し、未コミット変更の有無と引き継ぎ内容を確認する
- Git、ローカルフック、GitHub Actionsは、まだpushされていない別環境の変更を検出できない。この作業権はユーザーを起点とした直列運用で担保する
- 自分が現在の担当か判断できない場合、AIは対象ファイルを変更する前にユーザーへ確認する

1. 作業開始時に `git status --short --branch` で未コミット変更を確認する
2. cleanな状態で `git fetch origin` を行い、上流が進んでいれば取り込む
3. 対象商材の現在のファイルと直近のGit履歴を読み、以前の構造を前提にしない
4. 作業終了時は検証後にcommit・pushし、対象、最終コミット、変更ファイル、変更内容、未完了事項、一覧更新の要否を引き継ぐ
5. 生成元が別にある静的書き出しは生成物を直接編集せず、生成元を更新して再生成する。生成元や手順がリポジトリ外にある場合は、商材ディレクトリの `SOURCE.md` に正本の場所とビルド手順を書く

公開LPの正本はこのリポジトリの `origin/main` とする。リポジトリ外にある同一HTMLの作業用コピーは生成元として扱わず、更新対象にしない。`SOURCE.md` は、実際の生成元または再生成に必要な正本が別に存在する場合だけ作成する。

ルート `index.html` のサービスカードは `catalog/entries/<id>.json` から生成する。CodexもClaude CodeもカードHTMLを直接編集しない。各担当は自分の商材ページと対応entryを更新でき、`node tools/sync-catalog.mjs --write` が生成物を更新する。

## 収録

| フォルダ | 資料 | 用途 |
|---|---|---|
| `monitor/` | AIサービス先行モニター一覧 | 外部企業向けに、初期費用・月額利用料0円、API実費のみの対象サービスと利用条件を案内 |
| `lsync-sales-talk/` | Lシンク 営業トーク集 | 営業担当が商談前に読む。話す順番と言葉、切り返し、地雷 |
| `mcp-guide/` | MCP導入ガイド | 中小企業が業務に合うMCPを比較し、導入条件を確認する公開メディア |
| `member/` | LIGHT UP PARTNER BRIEFING | 販売パートナー向けに、現場の動き・売り方・注意点を外部公開可能な知見へ編集して届けるメディア |
| `members/` | AI CONSULTANT MEMBERS（旧URL転送のみ） | 本体は独立リポジトリ `writeup-inc/members`（`https://writeup-inc.github.io/members/`）へ移設済み |
| `Interviews/` | SaaSチーム インタビュー記事一覧（旧URL転送のみ） | 本体は独立リポジトリ `writeup-inc/interviews`（`https://writeup-inc.github.io/interviews/`）へ移設済み |
| `seminar/` | セミナー・説明会 申し込みページ（旧URL転送のみ） | 本体は独立リポジトリ `writeup-inc/seminar`（`https://writeup-inc.github.io/seminar/`）へ移設済み |

## 追加のしかた

1. `<商材名>-<用途>/index.html` または静的書き出し一式を配置し、`catalog/entry.template.json`を`catalog/entries/<id>.json`へコピーして、カード文言を入力する
2. 商材ページを先にコミットし、そのコミット日時と変更内容を確認する
3. ローカルで本体commitを作成し、まだpushしない
4. `node tools/update-catalog-entry.mjs --id <id> --latest-change "具体的な変更を一文で"` を実行し、entryと生成済み一覧を別commitにする
5. `node tools/sync-catalog.mjs --check` と `node tools/check-index.mjs --history` を通して、両commitをまとめてpushする
6. push後、GitHub Pagesのビルド完了と公開URLを確認する

## 一覧ページの更新ルール

ルートの `index.html` は、企画やサービスの「最近の動き」が分かる一覧として運用する。

- カードは `data-updated` の新しい順に並べる。JavaScriptでも自動整列するが、JavaScript無効時に備えてHTML上の順番も合わせる
- `data-published` と `data-updated`、画面上の「初回公開」「最終更新」は、ISO 8601形式の日本時間と分単位の表示を一致させる
- Git履歴から日時を取る場合は、実質的な本体変更コミットのAuthor Dateを正とする。rebaseで変動するCommitter Dateは使わない
- 各カードに「最新の変更」を1行で記載する。何を追加・変更したかが分かる具体的な文にし、「更新しました」だけでは済ませない
- 各カードの冒頭にある `REV. n回` は、初回公開後にその商材ディレクトリへ入ったGitコミット数である。新しいページは `0回` とし、一覧だけを更新したコミットは含めない。値は `node tools/check-index.mjs --history` でGit履歴と照合する
- 初回公開から7日以内は「新着」を自動表示し、カード背景を強調する
- 新着期間を過ぎた既存ページを実質的に更新した場合は、更新から7日間「更新」を自動表示する
- 「新着」と「更新」の条件を両方満たす場合は「新着」を優先し、同時表示しない
- 誤字修正、一覧の並べ替え、日時メタ情報だけの修正では、商材の `data-updated` を変更しない
- 公開ページ本体のコミット日時を確認してから一覧を更新する。一覧だけのコミット日時を商材の最終更新日時にしない
- リポジトリ移管前のためGit履歴だけでは初回作成者を特定できないページについて、ユーザーが初回作成者を明示した場合は `tools/index-check.config.json` の `attribution.creatorOverrides` に根拠とともに記録し、カードの作成者タグと制作区分へ反映する
- 各カードの外側に商材フォルダ名と同じ `id` を付け、`https://writeup-inc.github.io/saas/#<id>` でそのカードを頭出しできるようにする
- 「共有URLをコピー」では個別LP直行URLではなく、一覧内で該当カードを頭出しするURLをコピーする。カード本体のリンクは従来どおり個別LPへ遷移させる

### 上部の重要告知

- 新規追加・実質更新は、カードの `data-published` / `data-updated` から自動集計する。個別の固定お知らせを手で差し替えない
- 対象期間は原則として直近24時間。日本時間の日曜日は土曜分を含む直近48時間、月曜日は週末分を含む直近72時間に広げる
- 初回公開が対象期間内のカードは「新規に追加されたもの」、初回公開より後の実質更新が対象期間内のカードは「更新されたもの」として分ける。同じカードを両方には出さない
- 初回アクセス時はダイアログを表示し、上段の新規を広めに、下段の更新をコンパクトに表示する。ダイアログ内部でスクロールが必要にならないよう、件数に応じて密度を下げる
- ダイアログを閉じた後も、ヒーロー右側に直近分を1行ずつ残す。新規・更新を明示し、10件なら10行表示する
- 直近分がない場合は、ダイアログ起動ボタンとヒーロー右側の一覧を表示しない。カード一覧の「最新の変更」は引き続き各商材の履歴として残す
- ルート一覧の主要コンテンツ幅は1300pxを標準とし、画面が狭い場合はレスポンシブな余白で収める

### 更新時の確認手順

1. 商材ページの変更をローカルでcommitする（まだpushしない）
2. `node tools/update-catalog-entry.mjs --id <id> --latest-change "具体的な変更を一文で"` を実行する
3. entryと生成済み一覧をcommitする。日時、改修回数、作成者、順序はGit履歴から自動算出される
4. `node tools/sync-catalog.mjs --check` と `node tools/check-index.mjs --history` を実行する
5. デスクトップとモバイルで、バッジ、背景、変更文、日時、横スクロールの有無を確認する
6. push直前に `git fetch origin` を行い、上流の新しい変更を確認する
7. 両commitをまとめてpushし、GitHub ActionsとGitHub Pagesのビルド完了、公開ページの表示内容を再確認する

### 一覧を後から反映するコミット

商材の実質更新は、entryと生成済み一覧を同じpushへ必ず含める。`Index-Update: pending` による一覧反映の後回しは廃止する。

誤字、リンク、ビルド時刻だけの差分など、一覧の「最終更新」を変えない軽微な変更では次を付ける。

```text
Catalog-Update: no
```

過去に実質更新へ誤ってこのtrailerを付けた場合は、履歴を書き換えず、対応entryの`latestChange`と`latestChangeFor`をそのコミットSHAへ修正する。同期処理は、その明示的な参照だけを当該サービスの実質更新として再分類する。

検証スクリプトは、entryが最新の実質更新commitを指すことと、生成済み一覧がentry・Git履歴と一致することを必須にする。過去の移行履歴は `tools/index-check.config.json` の `historyBaseline` より後を検査する。

## 一覧の自動検証

`node tools/check-index.mjs --history` は、並び順、連番、日時表示、リンク、共有アンカー、カテゴリ、対象ディレクトリ、重要告知、基準コミット以降のGit履歴を検査する。GitHub Actionsでも同じコマンドを実行する。

`node tools/sync-catalog.mjs --check` は、各`catalog/entries/<id>.json`と生成済みカードが一致し、entryの`latestChangeFor`が本体の最新実質更新commitを指すことを検査する。GitHub Pagesは、この検査を含む全検査が成功したmainのcommitだけを公開する。

`node tools/check-monitor.mjs` は、`monitor/index.html` の料金表示、事前確認事項、サービスカード、共有アンカー、連絡導線、レスポンシブ対応の必須要素を検査する。GitHub Actionsでも同じコマンドを実行する。

公開一覧へ載せない商材ディレクトリは、理由とともに `tools/index-check.config.json` の `excludedDirectories` へ明示する。

## 重要タイポグラフィの回帰検査

見出し階層や強調文の太さ・大きさを合意したLPは、`tools/critical-typography.config.json` に検査条件を登録する。`node tools/check-critical-typography.mjs --self-test` は、外部フォント依存、代替フォント、必須CSS宣言、本文ルールに負けないセレクタ優先順位を検査し、意図的に崩した陰性試験でも検知できることを確認する。GitHub Actionsでも毎回実行する。

外部フォントを削除・変更するときは、代替フォントだけでなく、1440pxと390pxで見出しと強調文のcomputed style、横スクロール、コンソールエラーを確認する。CSS上の指定値だけでなく、ブラウザで最終的に適用された値を判定する。

外部フォントを前提とするページは、公開前にproviderのstylesheet、必要family、`display=swap`、`preconnect`、代替フォントを静的検査へ登録する。さらに実ブラウザで`document.fonts`のロード完了、対象familyのFontFace、computed `font-family`、フォント通信エラーの有無を確認し、指定名だけで未読込の状態を公開しない。

## 注意

- **料金・導入期間・個人情報の取り扱いは、資料に書かない。** 正本が未確定の商材があるため、社内の質問部屋で都度確認する運用にしている
- 各資料には `noindex` を入れている。検索結果には出ないが、URLを知っていれば誰でも読める
- 既存の `writeup-inc/saas-test` は Next.js の検証用リポジトリで、こことは別物
