# 青山オルクドール 会場アクセス案内

日本橋版 `../nihonbashi-orquedor-access/` の配色・余白・見出し・2つの出発地点という構成を継承。日本橋の道順は日本橋版に保持する。両会場はそれぞれの恒久URLで開き、上部の会場選択から相互に移動できる。

## 写真と資料（2026-11-16確認）

- `images/3rd-minami-aoyama.jpg`：三菱地所オフィス情報「3rd MINAMI AOYAMA」の建物外観。出典 https://office.mec.co.jp/search/detail/011850/ 、元画像 https://office.mec.co.jp/storage/buildings/011850/exterior/011850_exterior_01_org_a.jpg 。写真自体は未加工、表示上のみトリミング。建物外観の識別に用い、出典リンクを写真に併記。
- 東海東京証券の開設発表 https://www.tokaitokyo.co.jp/pdf/company/news/s20240105.pdf ：南青山3-1-34、12・13階の構成。
- 三菱地所の建物情報：外苑前駅徒歩4分。
- 東京メトロ https://www.tokyometro.jp/station/gaiemmae/yardmap/index_print.html ：出口番号。段差回避の経路は https://www.tokyometro.jp/station/gaiemmae/accessibility/index.html を案内。
- 同ビル入居施設 https://www.eri-clinic.com/access/ ：1a出口徒歩4分。同施設の7階はオルクドールの受付階として使わない。
- ライヴェックス https://www.livex-inc.com/office_and/tokyo/3rd-minami-aoyama/ ：1a出口から表参道方面、南青山三丁目交差点通過の道順と現地写真。住所は建物管理者・サロン運営者の一次資料を優先。

- ボルボ・カー・ジャパン https://www.volvocars.com/jp/l/studios/tokyo/ ：1階の目印「Volvo Studio Tokyo」の名称・所在地。公式発表 https://jp.volvocars.com/pressrelease/wp-content/uploads/2024/04/20240405_Volvo-Studio-Tokyo1%E5%91%A8%E5%B9%B4%E8%A8%98%E5%BF%B5%E3%80%8C1st-Aniversary-Spring-Festival%E3%80%8D%E3%82%92%E9%96%8B%E5%82%AC.pdf に1F・青山通り沿いと記載（2026-11-16確認）。サロンへの入館は現地の館内案内に従う旨を併記。

- `images/volvo-studio-tokyo-exterior.jpg`：ボルボ・カー・ジャパンの2023年4月5日公式プレスリリース掲載の実写外観写真。出典 https://jp.volvocars.com/pressrelease/2023-04-05/ 、元画像 https://jp.volvocars.com/pressrelease/wp-content/uploads/2023/04/Main_Volvo-Studio-Tokyo.jpg 。原寸ファイルを無加工で同梱し、ブラウザで表示範囲のみ調整。クリックで写真全体を開ける。写真直下に出典と公開年を明記し、展示車や装飾は現況と異なる場合がある旨を併記（2026-11-16確認）。

## 催し固有の未確認情報

今回の講演会の受付階・日時・入口運用・受付連絡先は未提供。12階に固定せず、主催者の開催案内を優先する旨をファーストビューと本文に明記する。日本橋の9階乗り換え・32階・黒い扉等の説明は青山へ流用しない。

## 共通動作

`../nihonbashi-orquedor-access/shared/` の `lp-ui.css` と `lp-behavior.js` は ai-workbench の共有正本から無改変で配置。ページ固有の会場選択・ヘッダー寸法は `venue.css`。黄色クリックマーカーは ai-workbench の `scripts/add_click_marker.py` から注入する。

一覧は講演会来場者向け案内のため対象外。`tools/index-check.config.json` に理由を登録。
