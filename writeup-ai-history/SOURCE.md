# 生成元と公開手順

- 生成元: `/Users/taka/Documents/ChatGPT/いったん保存/lightup-ai-history-build`
- 公開URL: `https://writeup-inc.github.io/saas/writeup-ai-history/`
- 静的書き出し: Next.js `output: 'export'`

GitHub Pages向けに書き出す際は、生成元の作業コピーで次を設定してからビルドする。

1. `next.config.ts` に `output: 'export'`、`basePath` と `assetPrefix` に `/saas/writeup-ai-history`、`trailingSlash: true` を設定する。
2. `app/layout.tsx` の canonical、OG URL、OG画像、faviconを公開URL基準へ変更し、`noindex, nofollow` を設定する。
3. `app/ChatGptLauncher.tsx` の `SITE_URL` を公開URLへ変更する。
4. `npm ci`、`npm run lint`、`npm run build:vercel` を実行し、生成された `out/` 一式をこのディレクトリへ同期する。

生成物を直接編集せず、生成元を変更して再度静的書き出しする。
