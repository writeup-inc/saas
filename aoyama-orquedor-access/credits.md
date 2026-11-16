# 青山オルクドール 会場アクセス案内

日本橋版 `../nihonbashi-orquedor-access/` の配色・余白・見出し・2つの出発地点という構成を継承。日本橋の道順は日本橋版に保持する。両会場はそれぞれの恒久URLで開き、上部の会場選択から相互に移動できる。

## 写真と資料（2026-11-16確認）

- `images/3rd-minami-aoyama.jpg`：三菱地所オフィス情報「3rd MINAMI AOYAMA」の建物外観。出典 https://office.mec.co.jp/search/detail/011850/ 、元画像 https://office.mec.co.jp/storage/buildings/011850/exterior/011850_exterior_01_org_a.jpg 。写真自体は未加工、表示上のみトリミング。建物外観の識別に用い、出典リンクを写真に併記。
- 東海東京証券の開設発表 https://www.tokaitokyo.co.jp/pdf/company/news/s20240105.pdf ：南青山3-1-34、12・13階の構成。
- 三菱地所の建物情報：外苑前駅徒歩4分。
- 東京メトロ https://www.tokyometro.jp/station/gaiemmae/yardmap/index_print.html ：出口番号。段差回避の経路は https://www.tokyometro.jp/station/gaiemmae/accessibility/index.html を案内。
- 同ビル入居施設 https://www.eri-clinic.com/access/ ：1a出口徒歩4分。同施設の7階はオルクドールの受付階として使わない。
- ライヴェックス https://www.livex-inc.com/office_and/tokyo/3rd-minami-aoyama/ ：1a出口から表参道方面、南青山三丁目交差点通過の道順と現地写真。住所は建物管理者・サロン運営者の一次資料を優先。

## 催し固有の未確認情報

今回の講演会の受付階・日時・入口運用・受付連絡先は未提供。12階に固定せず、主催者の開催案内を優先する旨をファーストビューと本文に明記する。日本橋の9階乗り換え・32階・黒い扉等の説明は青山へ流用しない。

## 共通動作

`../nihonbashi-orquedor-access/shared/` の `lp-ui.css` と `lp-behavior.js` は ai-workbench の共有正本から無改変で配置。ページ固有の会場選択・ヘッダー寸法は `venue.css`。黄色クリックマーカーは ai-workbench の `scripts/add_click_marker.py` から注入する。

一覧は講演会来場者向け案内のため対象外。`tools/index-check.config.json` に理由を登録。
