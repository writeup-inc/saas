'use client';

import { useEffect, useState, type ReactNode } from 'react';

type Audience = 'executive' | 'manager' | 'staff';
type EmployeeSort = 'attention' | 'load' | 'focus' | 'change';

const consultants = [
  { id: 'kei', name: '慧', short: 'AI化', role: 'AI化コンサルタント' },
  { id: 'taku', name: '拓', short: '業務改善', role: '業務改善コンサルタント' },
  { id: 'hiyori', name: 'ひより', short: '組織ケア', role: 'ピープルケア' },
  { id: 'kanade', name: '奏', short: '目標・育成', role: 'パーソナルコーチ' },
  { id: 'makoto', name: '誠', short: 'リスク', role: 'リスク・ガバナンス' },
  { id: 'ren', name: '蓮', short: '営業効率化', role: '営業効率化コンサルタント' },
];

const audienceLabels: Record<Audience, string> = {
  executive: '経営層',
  manager: '管理職',
  staff: 'スタッフ本人',
};

const employeeSortLabels: Record<EmployeeSort, string> = {
  attention: '改善余地順',
  load: '高負荷順',
  focus: '集中時間順',
  change: '前週変化順',
};

const employeeProfiles = [
  { name: '田中', dept: '第三営業部', role: '営業', signal: '確認依頼が集中', tone: 'amber', primary: '顧客対応・レビュー', hours: 48.7, focus: 8.2, switches: 246, change: 18.4, attention: 94, insight: '午前中のレビュー依頼が週後半に集中。担当分散の確認対象です。' },
  { name: '佐藤', dept: '第三営業部', role: '営業', signal: '高負荷傾向', tone: 'amber', primary: '商談・提案作成', hours: 51.2, focus: 10.1, switches: 219, change: 12.8, attention: 91, insight: '商談後の入力が終業後へ移動。入力工程の短縮余地があります。' },
  { name: '鈴木', dept: '業務推進部', role: '運用', signal: '手戻り増加', tone: 'blue', primary: '確認・データ更新', hours: 46.4, focus: 7.4, switches: 271, change: 15.6, attention: 88, insight: '同じ案件の再確認が増加。依頼フォーマットの統一候補です。' },
  { name: '高橋', dept: '第三営業部', role: '営業', signal: '改善進行中', tone: 'blue', primary: '顧客対応・調査', hours: 44.1, focus: 12.8, switches: 178, change: -9.2, attention: 72, insight: 'チャット確認の集約後、切り替え回数が前週より減少しています。' },
  { name: '伊藤', dept: '経営企画部', role: '企画', signal: '集中時間が安定', tone: 'green', primary: '企画・資料作成', hours: 42.8, focus: 16.4, switches: 126, change: 2.1, attention: 54, insight: '午前の集中ブロックが安定。チーム内で再現できる進め方です。' },
  { name: '渡辺', dept: '業務推進部', role: '運用', signal: '会議後作業が増加', tone: 'amber', primary: '会議・管理事務', hours: 49.6, focus: 6.9, switches: 238, change: 14.2, attention: 86, insight: '会議後24時間以内の転記が増加。連携方法の見直し対象です。' },
  { name: '山本', dept: '第三営業部', role: '営業', signal: '成果ペース安定', tone: 'green', primary: '商談・顧客対応', hours: 43.5, focus: 14.6, switches: 151, change: -3.8, attention: 46, insight: '商談準備と顧客対応がまとまっており、切り替えが少ない状態です。' },
  { name: '中村', dept: '第一営業部', role: '営業', signal: '資料作成が長期化', tone: 'blue', primary: '提案・資料作成', hours: 47.9, focus: 11.7, switches: 193, change: 10.5, attention: 82, insight: '提案書の修正回数が増加。テンプレート化の確認候補です。' },
  { name: '小林', dept: '業務推進部', role: '事務', signal: '定型作業が多い', tone: 'blue', primary: '入力・照合作業', hours: 45.2, focus: 9.5, switches: 207, change: 6.7, attention: 79, insight: '反復入力が週9時間。自動化候補として業務手順を確認します。' },
  { name: '加藤', dept: '第三営業部', role: '営業', signal: '負荷回復', tone: 'green', primary: '顧客対応・日報', hours: 41.6, focus: 13.2, switches: 162, change: -12.4, attention: 43, insight: '前週の繁忙から通常水準へ回復。追加対応は不要です。' },
  { name: '吉田', dept: '経営企画部', role: '企画', signal: '部門調整が増加', tone: 'amber', primary: '企画・部門連携', hours: 50.3, focus: 8.8, switches: 232, change: 16.9, attention: 89, insight: '部門間の確認が分散。決裁窓口の整理が有効と考えられます。' },
  { name: '山田', dept: '第一営業部', role: '営業', signal: 'データ不足', tone: 'gray', primary: '判定保留', hours: 24.1, focus: 5.1, switches: 88, change: 0, attention: 28, insight: '観測日数が3日のため判定を保留。次週に再確認します。' },
];

const chartColors = ['#24527a', '#557b9c', '#82a0b9', '#aec0cf', '#d4dde5'];

const categoryBenchmarks: Record<Audience, number[]> = {
  executive: [20.8, 16.5, 14.2, 15.0, 11.0],
  manager: [25.4, 15.9, 17.2, 12.5, 11.0],
  staff: [28.0, 18.0, 16.0, 14.5, 9.0],
};

const sourceLibrary = {
  microsoft2025: { label: 'Microsoft Work Trend Index 2025', note: '高通知群では、勤務時間中に平均2分に1回の割り込み', url: 'https://www.microsoft.com/en-us/worklab/work-trend-index/breaking-down-infinite-workday' },
  asana2023: { label: 'Asana Anatomy of Work 2023', note: '反復作業や不要な会議など、仕事の周辺作業に関する国際調査', url: 'https://asana.com/resources/anatomy-of-work' },
  mhlw: { label: '厚生労働省｜過重労働による健康障害防止', note: '長時間労働者への健康管理と事後措置', url: 'https://www.mhlw.go.jp/stf/newpage_07041.html' },
  ppc: { label: '個人情報保護委員会｜従業者モニタリング', note: '目的・責任者・ルールの明示と適正運用', url: 'https://www.ppc.go.jp/all_faq_index/faq1-q5-7/' },
  mhlwStress: { label: '厚生労働省｜ストレスチェック制度', note: '個人結果の取扱いと本人同意、集団分析の考え方', url: 'https://www.check-roudou.mhlw.go.jp/study/roudousya_stresscheck.html' },
  cisa: { label: 'CISA｜Insider Threat Mitigation Guide', note: '兆候は脅威の確定を意味せず、文脈を含む追加確認が必要', url: 'https://www.cisa.gov/sites/default/files/2022-11/Insider%20Threat%20Mitigation%20Guide_Final_508.pdf' },
  metiAiGuidelines: { label: '経済産業省｜AI事業者ガイドライン 第1.2版', note: '役割・責任とリスクベースの管理を示す現行の公式ガイドライン（2026年3月31日公表）', url: 'https://www.meti.go.jp/shingikai/mono_info_service/ai_shakai_jisso/20260331_report.html' },
  nistGenerativeAi: { label: 'NIST｜Generative AI Profile（NIST AI 600-1）', note: '導入前テスト、人間によるレビュー、記録、継続監視に関する任意ガイダンス', url: 'https://nvlpubs.nist.gov/nistpubs/ai/NIST.AI.600-1.pdf' },
  nistHumanAi: { label: 'NIST AI RMF｜Human-AI Interaction', note: '人間とAIの役割・責任を明確に分けるための公式解説', url: 'https://airc.nist.gov/airmf-resources/airmf/appendices/app-c-ai-risk-management-and-human-ai-interaction/' },
} as const;

const companyCases = [
  {
    company: 'トヨタL&F東京',
    result: '年間5,618時間を削減',
    takeaway: '拠点間の情報共有を一つに集約し、連絡・確認にかかる時間を削減した事例です。',
    source: 'Slack導入事例（ベンダー公開）',
    url: 'https://slack.com/customer-stories/toyota-story',
  },
  {
    company: 'JCB',
    result: '1人あたり月約6時間を効率化',
    takeaway: '会議の要約・議事録・内容把握を中心に、削減効果をアンケートで継続確認しています。',
    source: 'Microsoft導入事例（ベンダー公開）',
    url: 'https://www.microsoft.com/ja-jp/customers/story/23634-jcb-co-ltd-microsoft-365-copilot',
  },
  {
    company: 'カクイチ',
    result: '意思決定速度が4倍',
    takeaway: '閉じた情報共有を見直し、現場の質問と知見を広く見える状態にした事例です。',
    source: 'Slack導入事例（ベンダー公開）',
    url: 'https://slack.com/customer-stories/historical-kakuichi-boosts-decision-making-speed',
  },
] as const;

type SourceKey = keyof typeof sourceLibrary;

const guideSources: Record<'summary' | 'priority' | 'time' | 'people' | 'action' | 'evidence', SourceKey[]> = {
  summary: ['microsoft2025', 'asana2023'],
  priority: ['asana2023'],
  time: ['microsoft2025'],
  people: ['ppc'],
  action: ['asana2023'],
  evidence: ['ppc', 'cisa'],
};

const executiveAlerts = [
  { level: 'high', category: '情報管理', title: '個人向けクラウドへのアップロード操作候補', targets: '田中（第三営業部）、鈴木（業務推進部）', scope: '2名・5回', signal: 'アップロード画面と社外ドメインへの遷移が連続して観測されました。', inference: '業務ファイルが社内管理外へ移された可能性がありますが、私物利用・テスト・誤検知も考えられます。', verify: 'クラウド監査ログ、対象ファイル名、本人の業務目的を確認' },
  { level: 'high', category: '情報管理', title: '短時間の大量ファイル操作候補', targets: '吉田（経営企画部）', scope: '1名・1回', signal: '約8分間に多数ファイルを選択・圧縮した画面遷移が観測されました。', inference: '持ち出し準備の可能性は否定できませんが、バックアップや納品作業の可能性もあります。', verify: '端末操作ログ、転送先、申請済み業務かを情報システム部が確認' },
  { level: 'medium', category: '労務', title: '深夜帯の連続稼働', targets: '佐藤（第三営業部）、渡辺（業務推進部）、吉田（経営企画部）', scope: '3名・12回', signal: '22時以降に90分を超える連続操作が複数日にわたり観測されました。', inference: '一時的な繁忙ではなく、業務配分または申告外労働の問題が続いている可能性があります。', verify: '勤怠、シフト、本人申告を照合し、健康管理上の対応要否を確認' },
  { level: 'medium', category: '業務逸脱', title: '業務外カテゴリの長時間表示候補', targets: '高橋・山本（第三営業部）', scope: '2名・合計6.4時間', signal: '業務登録のない動画・娯楽カテゴリが長時間前面表示されました。', inference: '業務逸脱の可能性がありますが、調査・広告確認・画面放置の可能性が残ります。', verify: '担当業務、ウィンドウの前面時間、本人説明を確認' },
  { level: 'medium', category: 'セキュリティ', title: '未承認ツールの継続利用候補', targets: '小林・鈴木・高橋・田中', scope: '4名・23回', signal: '社内台帳にない生成AI・ファイル変換サービスへのアクセスが継続しました。', inference: '機密情報入力のリスクがありますが、閲覧だけでデータ送信がない可能性もあります。', verify: '送信ログ、利用規程、入力内容を必要最小限の権限で確認' },
] as const;

function donutBackground(items: { value: number }[]) {
  let cursor = 0;
  const stops = items.map((item, index) => {
    const start = cursor;
    cursor += item.value;
    return `${chartColors[index % chartColors.length]} ${start}% ${cursor}%`;
  });
  if (cursor < 100) stops.push(`#e6ebf0 ${cursor}% 100%`);
  return `conic-gradient(${stops.join(', ')})`;
}

const selfDailyPatterns = [
  { day: '月', date: '08.25', focus: 1.8, switches: 38, highlight: '商談準備を午前に集約', tone: 'blue' },
  { day: '火', date: '08.26', focus: 3.2, switches: 27, highlight: '集中時間が最も安定', tone: 'green' },
  { day: '水', date: '08.27', focus: 1.6, switches: 42, highlight: '午後に確認依頼が集中', tone: 'amber' },
  { day: '木', date: '08.28', focus: 3.5, switches: 24, highlight: '資料作成を予定内に完了', tone: 'green' },
  { day: '金', date: '08.29', focus: 2.5, switches: 33, highlight: 'レビュー対応が増加', tone: 'blue' },
];

type ManagerMemberState = 'good' | 'steady' | 'check' | 'pending';

const managerMembers: Array<{ name: string; state: ManagerMemberState; label: string; signal: string; hours: string; focus: string; switches: number; note: string }> = [
  { name: '田中', state: 'check', label: '声かけ候補', signal: '確認依頼が集中', hours: '48.7h', focus: '8.2h', switches: 246, note: '周囲からのレビュー依頼が週後半に集中。本人の処理速度ではなく、相談窓口になっている可能性があります。' },
  { name: '佐藤', state: 'check', label: '声かけ候補', signal: '終業後作業が増加', hours: '51.2h', focus: '10.1h', switches: 219, note: '商談後の入力が終業後へ移動しています。案件量と入力工程を1on1で確認したい状態です。' },
  { name: '高橋', state: 'good', label: '良い変化', signal: '切り替えが減少', hours: '44.1h', focus: '12.8h', switches: 178, note: 'チャット確認をまとめた週から切り替えが減少。本人の工夫をチームへ共有できそうです。' },
  { name: '山本', state: 'good', label: '良い変化', signal: '集中時間が安定', hours: '43.5h', focus: '14.6h', switches: 151, note: '商談準備と顧客対応がまとまっています。現在の進め方を維持できるか確認します。' },
  { name: '加藤', state: 'good', label: '良い変化', signal: '繁忙から回復', hours: '41.6h', focus: '13.2h', switches: 162, note: '前週の繁忙から通常のリズムへ戻っています。追加の対応は必要なさそうです。' },
  { name: '森', state: 'steady', label: '通常範囲', signal: '顧客対応が安定', hours: '39.8h', focus: '11.9h', switches: 169, note: '勤務時間と切り替え回数が部署の通常範囲です。変化がないか次週も見守ります。' },
  { name: '石井', state: 'good', label: '良い変化', signal: '午前の集中が増加', hours: '40.4h', focus: '13.8h', switches: 158, note: '午前の提案作成時間を確保できています。再現しやすい予定の組み方を確認します。' },
  { name: '松本', state: 'steady', label: '通常範囲', signal: '大きな変化なし', hours: '40.7h', focus: '10.8h', switches: 181, note: '前週との差が小さく、安定しています。本人から困りごとがなければ見守りで十分です。' },
  { name: '林', state: 'check', label: '声かけ候補', signal: '会議後作業が増加', hours: '47.3h', focus: '7.6h', switches: 231, note: '会議後の確認・転記が複数日に分散。会議内容ではなく、その後の工程を確認します。' },
  { name: '清水', state: 'pending', label: '判定保留', signal: '観測日数が不足', hours: '23.6h', focus: '5.4h', switches: 92, note: '観測が3日のため、良し悪しを判定しません。休暇・外出予定を確認して次週に再判定します。' },
  { name: '池田', state: 'steady', label: '通常範囲', signal: '提案作成が安定', hours: '41.2h', focus: '11.4h', switches: 174, note: '大きな偏りは見られません。現在の案件状況と本人の実感が一致するかだけ確認します。' },
  { name: '阿部', state: 'pending', label: '判定保留', signal: '担当変更の影響候補', hours: '36.1h', focus: '8.7h', switches: 147, note: '担当変更週のため通常週と比較できません。新しい役割が落ち着いてから傾向を見ます。' },
];

type HiyoriDialogueState = 'check' | 'positive' | 'pending';

const hiyoriDialogues: Array<{ name: string; anonymous: string; state: HiyoriDialogueState; label: string; observation: string; question: string; source: string }> = [
  { name: '田中', anonymous: 'メンバーA', state: 'check', label: '対話候補', observation: '相談・レビュー依頼の27%が集中。木曜午後に依頼が重なりました。', question: '「相談窓口になって、抱えすぎていることはありませんか？」', source: '業務ログ・依頼履歴' },
  { name: '佐藤', anonymous: 'メンバーB', state: 'check', label: '対話候補', observation: '終業後の入力が2日から4日に増加。商談数も同じ週に増えています。', question: '「商談後の入力で、今いちばん減らしたい工程はどこですか？」', source: '業務ログ・予定表' },
  { name: '林', anonymous: 'メンバーC', state: 'check', label: '対話候補', observation: '会議後30分以内の作業切り替えが週18回。チーム平均の約1.6倍です。', question: '「会議後に、誰へ何を確認するか迷う場面はありますか？」', source: '予定表・作業切り替え' },
  { name: '高橋', anonymous: 'メンバーD', state: 'positive', label: '良い兆し', observation: '通知確認をまとめた日から、午後の集中ブロックが平均42分伸びました。', question: '「うまくいった工夫を、無理のない範囲でチームに共有できますか？」', source: '業務ログ・前週比較' },
  { name: '山本', anonymous: 'メンバーE', state: 'positive', label: '良い兆し', observation: '1on1後の週から依頼の差し戻しが減少。本人の予定変更も少ない状態です。', question: '「先週の対話で、続けたいと思ったことは何ですか？」', source: '予定表・依頼履歴' },
  { name: '清水', anonymous: 'メンバーF', state: 'pending', label: '判定保留', observation: '有効観測が3日分のため、通常週との比較には足りません。', question: 'データが揃うまで結論を出さず、休暇・外出予定だけを確認します。', source: '観測日数' },
];

const takuGuides: Record<Audience, { opening: string; summary: string; priority: string; time: string; people: string; action: string; evidence: string }> = {
  executive: {
    opening: '今月の主因候補は、会議そのものではなく、会議後に生まれる確認・転記・再共有です。あわせて、経営判断が必要なリスク兆候を5件抽出しました。どちらも確定診断ではなく、まず2部門・4週間の検証と、担当部門による事実確認を提案します。',
    summary: '部門間連携312時間のうち、約4割が同じ情報の再確認と転記へ偏っています。会議時間は減っているのに会議後作業が増えているため、現場個人の能力よりも「情報の置き場所と確認先が定まっていない運用」が負担と意思決定遅延を生んでいると推測されます。まず記録場所と責任者を一本化し、削減時間だけでなく手戻り件数も追うのが妥当です。',
    priority: '年間効果、着手のしやすさ、関係部署数の3点で並べると、確認工程の一本化が最初です。新システムを購入する前に運用だけを変えられ、4週間で差分を測れます。次に報告様式、最後に問い合わせ窓口を整える順なら、原因と効果を混同しにくいと判断しました。',
    time: '連絡・コミュニケーション25.0%という量そのものを問題視していません。顧客対応ではなく、同じ情報の探索・転記・再確認が連絡時間の一部に重なっている点が重要です。通知やチャットによる中断が多い一般傾向も踏まえると、会議削減より情報流通の整理が先と推測されます。',
    people: '高負荷の社員ほど、周囲の質問やレビューを引き受けている可能性があります。したがって、一覧は「問題社員の順位」ではなく、業務集中とリスク兆候を確認する順番です。本人説明、勤怠、セキュリティログを照合するまでは、人事評価や処分へ接続しません。',
    action: '経営会議で決めるのは、対象2部門、責任者、効果指標の3点です。同時に、5件のアラートを情報システム・人事労務・現場責任者へ振り分け、48時間以内に一次確認します。確認後に「誤検知」「要観察」「対応必要」へ更新すれば、改善とリスク管理を同じ画面で回せます。',
    evidence: '結論は146,880枚の観測画像、82台、20日の有効観測、1,248件のカレンダー照合から作った仮説です。画像だけでは送信完了、業務目的、本人の健康状態までは確定できません。重要判断は監査ログ・勤怠・本人確認を重ね、モニタリング目的と運用ルールを社内で明示したうえで行います。',
  },
  manager: {
    opening: '第三営業部では、質問とレビューが3名へ集中し、その3名の作業切り替えが増えています。処理が遅いのではなく、チームの相談窓口を実質的に担っている可能性が高いため、個人への追加努力ではなく依頼ルートの整理を提案します。',
    summary: '高負荷の3名は周囲を助けている人でもあります。勤務時間、集中時間、切り替え回数が同じ方向へ悪化している一方、成果遅延だけでは説明できません。まず1on1で依頼内容と時間帯を確認し、本人の認識と一致した部分だけ運用変更へ進めます。',
    priority: '1週間で試せて翌週に効果が分かる施策を優先しました。担当曜日の分散、午前定例の短縮、日報入力の集約を順に試すと、どの変更が切り替え回数を下げたか確認できます。複数施策を同時に恒久化しないのがポイントです。',
    time: '顧客対応を減らす必要はありません。社内確認と事務処理を一定時間へまとめることで、商談準備の連続時間を戻せる見込みです。外部調査でも通知・会議・メールによる頻繁な中断が報告されているため、時間の総量より分断の頻度を追います。',
    people: '本人の実感と一致した人から運用を変えます。推定と違う場合は、役割上必要な対応、出張、研修、画面放置などの事情を先に記録します。データを正解として押しつけず、対話を始める順番として使います。',
    action: '月曜に3名へ確認し、火曜から担当曜日の分散を試し、金曜に15分だけ振り返ります。評価指標は切り替え回数、手戻り、顧客返信速度の3つです。改善しなければ運用仮説を取り下げます。',
    evidence: '切り替え回数・集中時間・前週差の3指標が同じ方向を示したため、依頼集中を主因候補としました。ただし因果は未確定です。本人確認と依頼履歴を照合し、モニタリング目的と閲覧権限を明示した範囲で判断します。',
  },
  staff: {
    opening: '今週の改善は、長く働いたからではなく、火曜と木曜の午前に仕事をまとめられたためと推測されます。集中できた条件を再現し、無理に勤務時間を増やさない進め方を一緒に探します。',
    summary: '必要なのは追加の努力ではありません。集中時間は前週より3時間12分増え、切り替えは18回減っています。変化が同時に起きた火曜・木曜午前を守ることが、来週の最も小さく確かめやすい実験です。',
    priority: 'まず集中枠を継続し、次にチャット確認を1時間ごとへまとめます。レビュー依頼の時間固定は、その2つで不足した場合だけ試します。一度に全部を変えないことで、自分に効いた方法を見分けられます。',
    time: '資料作成の分断を減らせば、勤務時間を増やさずに仕事を終えやすくなる見込みです。一般的にも通知や会議による頻繁な中断が報告されていますが、ここでは平均より自分の前週差を優先します。',
    people: 'この画面では他人と順位比較せず、前週の自分と曜日ごとの変化だけを見ます。体調、外出、担当変更などデータに映らない事情がある場合は、本人の説明を優先して補足します。',
    action: '火曜と木曜の9〜11時を予定表で先に確保し、緊急以外の通知確認をまとめます。金曜に集中できた実感、完成した仕事、切り替え回数を照合し、続けるか自分で決めます。',
    evidence: '実感と違う場合はデータをそのまま受け入れず、根拠となった時間帯を確認して訂正できます。画面データだけで能力、健康、意欲を判断することはありません。',
  },
};

const actionDetails: Record<Audience, { title: string; description: string; owner: string; timing: string; measure: string }[]> = {
  executive: [
    { title: '2部門で先行検証を開始', description: '第三営業部と業務推進部で、会議後の確認先と記録場所を一本化します。', owner: '業務推進責任者', timing: '9月第2週', measure: '確認・転記時間' },
    { title: '月次報告の様式を共通化', description: '部門ごとに異なる報告項目を整理し、転記せずに集計できる形式へ揃えます。', owner: '経営企画部', timing: '9月末まで', measure: '作成時間・修正回数' },
    { title: '4週間後に継続判断', description: '削減時間だけでなく、手戻り件数と現場の使いやすさを含めて判断します。', owner: '経営会議', timing: '10月第1週', measure: '3指標で判定' },
  ],
  manager: [
    { title: '対象3名へ事実確認', description: 'レビュー依頼の種類と、集中を妨げている時間帯を1on1で確認します。', owner: '営業課長', timing: '月曜日', measure: '本人認識との差' },
    { title: 'レビュー担当を曜日分散', description: '依頼先を固定せず、曜日ごとの担当表を1週間だけ試します。', owner: 'チーム全員', timing: '火〜木曜日', measure: '切り替え回数' },
    { title: '短い振り返りを実施', description: '金曜に15分だけ集まり、手戻りと顧客対応への影響を確認します。', owner: '営業課長', timing: '金曜日', measure: '手戻り・対応速度' },
  ],
  staff: [
    { title: '午前の集中枠を確保', description: '火曜と木曜の9時から11時を、資料作成の予定として先に確保します。', owner: 'あなた', timing: '来週2回', measure: '集中できた時間' },
    { title: 'チャット確認をまとめる', description: '緊急連絡を除き、通知確認を1時間ごとにまとめてみます。', owner: 'あなた', timing: '1週間試す', measure: '切り替え回数' },
    { title: '自分の実感と照合', description: '金曜にデータを見て、集中できた感覚と一致していたかをメモします。', owner: 'あなた', timing: '金曜日', measure: '実感との一致' },
  ],
};

const benchmarks: Record<Audience, {
  title: string;
  conclusion: string;
  comparison: string;
  items: { label: string; ours: string; benchmark: string; delta: string; tone: 'risk' | 'good'; insight: string }[];
}> = {
  executive: {
    title: '同規模・同業モデルとの比較',
    conclusion: '会議量ではなく、情報の受け渡し方に構造的なロスがあると推測されます。',
    comparison: 'デモ用比較値｜同規模・同業のモデル企業平均',
    items: [
      { label: '連絡・コミュニケーション', ours: '25.0%', benchmark: '20.8%', delta: '+4.2pt', tone: 'risk', insight: '確認と再共有が平均より多い可能性' },
      { label: '改善余地の比率', ours: '14.7%', benchmark: '10.2%', delta: '+4.5pt', tone: 'risk', insight: '工程整理の効果が出やすい状態' },
      { label: '会議後の重複確認', ours: '40%', benchmark: '28%', delta: '+12pt', tone: 'risk', insight: '記録場所と確認先の分散が主因候補' },
    ],
  },
  manager: {
    title: '同規模営業チームとの比較',
    conclusion: '個人の処理速度ではなく、依頼が3名に集中する運用がボトルネックと推測されます。',
    comparison: 'デモ用比較値｜同規模営業チームのモデル平均',
    items: [
      { label: '作業切り替え／人', ours: '154回', benchmark: '128回', delta: '+20%', tone: 'risk', insight: '割り込みの多さが集中を分断' },
      { label: '集中時間／人', ours: '10.2h', benchmark: '12.6h', delta: '−2.4h', tone: 'risk', insight: '午前のレビュー集中が影響候補' },
      { label: '依頼上位3名への集中', ours: '25%', benchmark: '12%', delta: '+13pt', tone: 'risk', insight: '曜日分散で改善できる可能性' },
    ],
  },
  staff: {
    title: '同職種モデルとの比較',
    conclusion: '長時間労働ではなく、午前に作業をまとめたことが成果改善の主因と推測されます。',
    comparison: 'デモ用比較値｜同職種のモデル平均',
    items: [
      { label: '集中時間の比率', ours: '33.0%', benchmark: '27.0%', delta: '+6.0pt', tone: 'good', insight: '良い働き方を再現できている' },
      { label: '作業切り替え', ours: '164回', benchmark: '190回', delta: '−26回', tone: 'good', insight: '前週より中断を抑えられている' },
      { label: '木曜午前の集中', ours: '3.5h', benchmark: '2.4h', delta: '+1.1h', tone: 'good', insight: '守るべき時間帯が明確' },
    ],
  },
};

const reports = {
  executive: {
    code: 'EXECUTIVE BRIEF 08 / 2026',
    title: '会議を減らす前に、会議後の仕事を減らす。',
    subtitle: '全社82名の業務ログから、来月の経営判断に必要な結論・確認事項・実行順を整理しました。',
    scope: '全社・4部門',
    period: '2026.08.01 — 08.31',
    conclusion: '会議時間よりも、会議後の確認・転記工程に改善余地があります。',
    summary: '部門間連携に使われる312時間のうち、約4割が同じ情報の確認と転記に集中しています。第三営業部と業務推進部を対象に、確認工程の一本化を先行検証するのが妥当です。',
    confidence: '87%',
    stats: [
      { label: '要確認アラート', value: '5', unit: '件', delta: '高2件・中3件／すべて未確定' },
      { label: '48時間以内の確認', value: '3', unit: '部門', delta: '情報システム・人事・現場' },
      { label: '改善余地', value: '418', unit: '時間', delta: '全体の14.7%・試算' },
    ],
    priorities: [
      { no: '01', title: '会議後の確認工程を一本化', owner: '業務推進部', effect: '1,360時間/年', status: '先行検証' },
      { no: '02', title: '月次報告の様式を全社共通化', owner: '経営企画部', effect: '740時間/年', status: '標準化' },
      { no: '03', title: '問い合わせ窓口を部門ごとに集約', owner: '各部門長', effect: '520時間/年', status: '設計' },
    ],
    categories: [
      { label: '連絡・コミュニケーション', value: 25.0, time: '712h' },
      { label: '管理・事務', value: 19.0, time: '541h' },
      { label: '調査・情報収集', value: 15.4, time: '438h' },
      { label: '資料・文書作成', value: 13.4, time: '381h' },
      { label: '企画・計画', value: 10.4, time: '296h' },
    ],
    note: '会議は前月比3.1%減っています。一方、会議終了後24時間以内の確認・転記作業が8.4%増えました。会議をさらに減らすより、会議後の情報流通を先に整える方が改善効果を測りやすい状態です。',
    nextTitle: '9月の経営会議で決めること',
    nextItems: ['2部門で4週間の先行検証を行う', '確認工程の責任者を1名ずつ決める', '削減時間と手戻り件数を効果指標にする'],
  },
  manager: {
    code: 'TEAM BRIEF / WEEK 35',
    title: 'チーム改善ブリーフ',
    subtitle: '第三営業部12名の業務構造から、今週手を入れるべき箇所を整理しました。',
    scope: '第三営業部・12名',
    period: '2026.08.25 — 08.31',
    conclusion: '3名への確認依頼の集中が、チーム全体の作業切り替えを増やしています。',
    summary: '負荷が増えた3名は処理速度が遅いのではなく、レビューと確認の依頼先になっています。担当を曜日で分散し、午前の定例確認を15分短縮することで、週10時間前後の余力を作れる見込みです。',
    confidence: '82%',
    stats: [
      { label: 'チーム業務', value: '486', unit: '時間', delta: '前週比 +3.8%' },
      { label: '作業切り替え', value: '1,842', unit: '回', delta: '前週比 +11.2%' },
      { label: '改善候補', value: '71', unit: '時間', delta: '週あたり試算' },
    ],
    priorities: [
      { no: '01', title: 'レビュー担当を曜日で分散', owner: '営業課長', effect: '4.8時間/週', status: '今週実行' },
      { no: '02', title: '午前定例を15分短縮', owner: 'チーム全員', effect: '6.0時間/週', status: '今週実行' },
      { no: '03', title: '日報入力を終業前に集約', owner: '営業企画', effect: '3.6時間/週', status: '検証' },
    ],
    categories: [
      { label: '顧客・社内コミュニケーション', value: 30.5, time: '148h' },
      { label: '管理・事務', value: 18.7, time: '91h' },
      { label: '資料・文書作成', value: 16.0, time: '78h' },
      { label: '調査・情報収集', value: 13.0, time: '63h' },
      { label: '会議', value: 9.5, time: '46h' },
    ],
    note: '対象3名には同じ分析を本人画面でも表示しています。まず1on1で実情を確認し、推定が違う場合は訂正を受け付けてから、担当分散を実施してください。個人の速度評価には使用しません。',
    nextTitle: '今週のチーム運営で行うこと',
    nextItems: ['3名との1on1で依頼集中の実情を確認', 'レビュー担当表を1週間だけ試す', '金曜に切り替え回数と手戻りを確認'],
  },
  staff: {
    code: 'MY WORK REVIEW / WEEK 35',
    title: '今週の働き方レビュー',
    subtitle: '前週の自分と比較し、うまくいったことと次に試すことを一つずつ整理しました。',
    scope: '本人のみ',
    period: '2026.08.25 — 08.31',
    conclusion: '午前の集中時間が増え、資料作成を前週より3時間12分短縮できました。',
    summary: '火曜と木曜の9時から11時は作業切り替えが少なく、資料作成が安定していました。来週はこの時間帯を維持し、チャット確認を1時間ごとにまとめる方法を試してみましょう。',
    confidence: '91%',
    stats: [
      { label: '今週の業務', value: '38:20', unit: '', delta: '前週比 −1:10' },
      { label: '集中時間', value: '12:40', unit: '', delta: '前週比 +3:12' },
      { label: '作業切り替え', value: '164', unit: '回', delta: '前週比 −18回' },
    ],
    priorities: [
      { no: '01', title: '午前の集中時間を継続', owner: 'あなた', effect: '+2時間05分', status: '継続' },
      { no: '02', title: 'チャット確認を1時間ごとに集約', owner: 'あなた', effect: '1.4時間/週', status: '次に試す' },
      { no: '03', title: 'レビュー依頼を16時に集約', owner: 'あなた', effect: '55分/週', status: '候補' },
    ],
    categories: [
      { label: '顧客対応', value: 30.5, time: '11:42' },
      { label: '資料・文書作成', value: 19.8, time: '7:36' },
      { label: '連絡・コミュニケーション', value: 18.2, time: '6:58' },
      { label: '管理・事務', value: 13.8, time: '5:18' },
      { label: '調査・情報収集', value: 10.0, time: '3:51' },
    ],
    note: '今週は「集中できた時間」が増えています。長く働いたからではなく、作業をまとめられたことが要因候補です。提案が自分の実感と違う場合は、根拠を確認して訂正できます。',
    nextTitle: '来週、自分で試すこと',
    nextItems: ['火曜・木曜の9時から11時を予定に確保', 'チャット通知を一時的にまとめる', '金曜に自分の実感とデータを照合する'],
  },
};

export default function Home() {
  const [consultantId, setConsultantId] = useState('taku');
  const [audience, setAudience] = useState<Audience>('executive');
  const consultant = consultants.find((item) => item.id === consultantId) ?? consultants[1];

  function changeAudience(next: Audience) {
    setAudience(next);
  }

  function changeConsultant(next: string) {
    setConsultantId(next);
  }

  return (
    <div className="demo-app">
      <aside className="sample-switcher" aria-label="サンプル切替">
        <div className="switcher-head">
          <p>DEMO SWITCHER</p>
          <strong>サンプル切替</strong>
          <small>製品画面には含まれません</small>
        </div>

        <div className="switcher-section">
          <p className="switcher-label">CONSULTANT</p>
          <div className="consultant-tabs" role="tablist" aria-label="コンサルタントを選択">
            {consultants.map((item, index) => (
              <button
                key={item.id}
                role="tab"
                aria-selected={consultantId === item.id}
                className={consultantId === item.id ? 'selected' : ''}
                onClick={() => changeConsultant(item.id)}
              >
                <span>{String(index + 1).padStart(2, '0')}</span>
                <strong>{item.name}</strong>
                <small>{item.short}</small>
              </button>
            ))}
          </div>
        </div>

        <div className="switcher-section audience-section">
          <p className="switcher-label">VIEW TYPE</p>
          <div className="audience-tabs" role="tablist" aria-label="対象者を選択">
            {(Object.keys(audienceLabels) as Audience[]).map((key) => (
              <button key={key} role="tab" aria-selected={audience === key} className={audience === key ? 'selected' : ''} onClick={() => changeAudience(key)}>
                {audienceLabels[key]}<span>›</span>
              </button>
            ))}
          </div>
        </div>

        <div className="switcher-foot"><span>6</span><p>提案パターン<br /><small>各社では1人だけを選択</small></p></div>
      </aside>

      <main className="product-stage">
        {consultantId === 'taku'
          ? <TakuReport audience={audience} />
          : consultantId === 'kei'
            ? audience === 'executive'
              ? <KeiExecutiveReport />
              : audience === 'manager'
                ? <KeiManagerReport />
                : <KeiStaffReport />
          : consultantId === 'hiyori'
            ? audience === 'executive'
              ? <HiyoriExecutiveReport />
              : audience === 'manager'
                ? <HiyoriManagerReport />
                : <HiyoriStaffReport />
            : <PendingReport consultant={consultant} audience={audience} onBack={() => setConsultantId('taku')} />}
      </main>
    </div>
  );
}

function usesDedicatedManagerReport(audience: Audience): boolean {
  return audience === 'manager';
}

function TakuReport({ audience }: { audience: Audience }) {
  const report = reports[audience];
  const guide = takuGuides[audience];
  const summaryTargets: Record<Audience, string[]> = {
    executive: ['#risk-watch', '#risk-watch', '#priority'],
    manager: ['#people-pattern', '#people-pattern', '#priority'],
    staff: ['#time-mix', '#my-pattern', '#my-pattern'],
  };

  useEffect(() => {
    const charts = Array.from(document.querySelectorAll<HTMLElement>('[data-chart-motion]'));
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    charts.forEach((chart) => chart.classList.add('motion-ready'));
    if (reducedMotion) {
      charts.forEach((chart) => chart.classList.add('is-visible'));
      return;
    }
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          (entry.target as HTMLElement).classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.28 });
    charts.forEach((chart) => observer.observe(chart));
    return () => observer.disconnect();
  }, [audience]);

  if (audience === 'staff') return <StaffReport />;
  if (usesDedicatedManagerReport(audience)) return <ManagerReport />;

  return (
    <div className="report-page">
      <header className="report-title">
        <div><p>{report.code}</p><h1>{report.title}</h1><span>{report.subtitle}</span></div>
        <dl><div><dt>対象</dt><dd>{report.scope}</dd></div><div><dt>集計期間</dt><dd>{report.period}</dd></div></dl>
      </header>

      <ReportActions audience={audience} title={report.title} />

      <nav className="report-toc" aria-label="レポート内メニュー">
        <a href="#summary"><span>01</span>結論</a>
        <a className="has-alert" href="#diagnosis"><span>02</span>比較<em>平均差</em></a>
        <a href="#work-analysis"><span>03</span>改善分析</a>
        <a href="#people-pattern"><span>04</span>人</a>
        {audience === 'executive' && <a className="has-alert" href="#risk-watch"><span>05</span>リスク<em>ALERT 5</em></a>}
        <a href="#next-action"><span>{audience === 'executive' ? '06' : '05'}</span>実行</a>
        <a href="#evidence"><span>A</span>根拠</a>
      </nav>

      <section className="taku-intro">
        <TakuAvatar />
        <div><span>YOUR WORK ADVISOR</span><h2>拓です。今月の業務を一緒に読み解きます。</h2><p>{guide.opening}</p></div>
      </section>

      <section className="executive-summary" id="summary">
        <div className="chapter-head">
          <div><p className="section-index">01 / SUMMARY</p><h2>経営結論</h2><small>最初に、今月の判断と確認すべき数字を把握します。</small></div>
        </div>
        <div className="summary-body">
          <div className="summary-copy">
            <TakuTalk title="まず、全体像です。" sources={guideSources.summary}>{guide.summary}</TakuTalk>
            <h2>{report.conclusion}</h2>
            <p>{report.summary}</p>
            <div className="confidence"><span>分析信頼度</span><strong>{report.confidence}</strong><i><b style={{ width: report.confidence }} /></i><small>根拠と比較条件を確認できます</small></div>
          </div>
          <div className="summary-stats">
            <SummaryDial audience={audience} />
            {report.stats.map((item, index) => <a className={item.label.includes('アラート') ? 'critical-stat' : ''} href={summaryTargets[audience][index]} key={item.label}><span>{item.label}</span><p><strong>{item.value}</strong><em>{item.unit}</em></p><small>{item.delta}</small><b aria-hidden="true">↓</b></a>)}
          </div>
        </div>
      </section>

      <div className="comparison-cluster" id="diagnosis">
        <BenchmarkSection audience={audience} />
        {audience === 'executive' && <CompanyCases />}
      </div>

      <div className="analysis-grid" id="work-analysis">
        <div className="chapter-head">
          <div><p className="section-index">03 / WORK ANALYSIS</p><h2>改善余地を、順番と時間構成で確認する</h2><small>どこから着手すると効果が大きいかを、2つの視点で整理します。</small></div>
        </div>
        <section className="report-section priority-section" id="priority">
          <div className="section-head subsection-head"><div><p className="section-index">PRIORITY</p><h2>優先して改善する項目</h2></div><span>効果の大きい順</span></div>
          <TakuTalk title="この順番をおすすめします。" sources={guideSources.priority}>{guide.priority}</TakuTalk>
          <div className="priority-table">
            <div className="priority-header"><span>No.</span><span>改善項目</span><span>担当</span><span>期待効果</span></div>
            {report.priorities.map((item) => <div className="priority-row" key={item.no}><span className="priority-no">{item.no}</span><div><strong>{item.title}</strong><small>{item.status}</small></div><span>{item.owner}</span><b>{item.effect}</b></div>)}
          </div>
        </section>

        <section className="report-section mix-section" id="time-mix">
          <div className="section-head subsection-head"><div><p className="section-index">TIME MIX</p><h2>業務時間の構成</h2></div><span>上位5項目</span></div>
          <TakuTalk title="時間の中身を分けて見ましょう。" sources={guideSources.time}>{guide.time}</TakuTalk>
          <div className="mix-visual">
            <div className="donut-block">
              <div className="time-donut chart-ring" data-chart-motion style={{ backgroundImage: donutBackground(report.categories) }}>
                <div><strong>{report.categories[0].value.toFixed(1)}%</strong><span>最多業務</span></div>
              </div>
              <p><strong>{report.categories[0].label}</strong><span>全業務時間に占める割合</span></p>
            </div>
            <div className="mix-list">
              {report.categories.map((item, index) => <div className="mix-row" key={item.label}><div><span className={`mix-dot tone-${index}`} />{item.label}<b>{item.time}</b></div><i><span className={`tone-${index} chart-bar-x`} data-chart-motion style={{ width: `${item.value * 2.8}%` }} /></i><small>自社 {item.value.toFixed(1)}%　<span>業界平均 {categoryBenchmarks[audience][index].toFixed(1)}%</span></small></div>)}
            </div>
          </div>
        </section>
      </div>

      <PeoplePatterns audience={audience} guide={guide.people} />

      {audience === 'executive' && <ExecutiveRiskAlerts />}

      <section className="decision-panel" id="next-action" aria-label="次のアクション">
        <div className="section-head chapter-head"><div><p className="section-index">{audience === 'executive' ? '06' : '05'} / NEXT ACTION</p><h2>{report.nextTitle}</h2><small>分析を、担当・期限・確認指標がある実行計画へつなげます。</small></div><span>提案をすべて表示</span></div>
        <div className="decision-observation"><span>拓の総合所見</span><p>{report.note}</p></div>
        <TakuTalk title="ここから始めてください。" sources={guideSources.action}>{guide.action}</TakuTalk>
        <DecisionFlow audience={audience} />
        <div className="action-cards">
          {actionDetails[audience].map((item, index) => (
            <article key={item.title}><span>{String(index + 1).padStart(2, '0')}</span><h3>{item.title}</h3><p>{item.description}</p><dl><div><dt>担当</dt><dd>{item.owner}</dd></div><div><dt>時期</dt><dd>{item.timing}</dd></div><div><dt>確認指標</dt><dd>{item.measure}</dd></div></dl></article>
          ))}
        </div>
      </section>

      <EvidenceSection audience={audience} guide={guide.evidence} />

      <footer className="report-footer"><p><strong>分析用途</strong> 業務改善と本人支援のために使用します。個人ランキング・人事査定には使用しません。</p><button>判定根拠とデータ利用方針</button></footer>
    </div>
  );
}

function ManagerReport() {
  return (
    <div className="report-page manager-report">
      <header className="report-title manager-title">
        <div><p>TEAM CONDITION / WEEK 35</p><h1>第三営業部 チームコンディション</h1><span>数字で部下を評価するのではなく、良い変化を認め、早めに声をかける相手を見つけます。</span></div>
        <dl><div><dt>対象</dt><dd>第三営業部・12名</dd></div><div><dt>集計期間</dt><dd>2026.08.25 — 08.31</dd></div></dl>
      </header>

      <ReportActions audience="manager" title="第三営業部 チームコンディション" />

      <nav className="report-toc manager-toc" aria-label="管理職向けレポート内メニュー">
        <a href="#manager-summary"><span>01</span>全体</a>
        <a href="#manager-comparison"><span>02</span>全社比較</a>
        <a href="#manager-members"><span>03</span>メンバー</a>
        <a href="#manager-positive"><span>04</span>良い変化</a>
        <a href="#manager-check"><span>05</span>声かけ</a>
        <a href="#manager-action"><span>06</span>今週の対応</a>
        <a href="#manager-data"><span>A</span>データ</a>
      </nav>

      <section className="taku-intro manager-intro">
        <TakuAvatar />
        <div><span>YOUR TEAM ADVISOR</span><h2>拓です。部下の状態を、良い変化と要確認の両方から見ます。</h2><p>今週は3名に確認・レビューが集まっています。一方で4名には集中時間の増加や負荷回復など、良い変化が見られます。数字だけで決めず、褒める・見守る・声をかけるの順番を整理しましょう。</p></div>
      </section>

      <section className="manager-hero" id="manager-summary">
        <div className="manager-hero-copy">
          <p className="section-index">01 / TEAM OVERVIEW</p>
          <span>今週のチーム</span>
          <h2>問題は個人の速さではなく、<br /><em>確認依頼の偏り</em>にありそうです。</h2>
          <p>田中さん・佐藤さん・林さんは勤務時間と切り替え回数がともに高めです。3名は周囲の相談先になっている可能性があるため、注意するのではなく、依頼内容と時間帯を本人に確認するのが先です。</p>
          <small>※画面ログからの推測です。健康状態・能力・意欲を判定するものではありません。</small>
        </div>
        <div className="manager-condition-counts" aria-label="チームコンディション内訳">
          <div className="is-good"><strong>4</strong><span>良い変化</span><small>工夫を聞いて共有</small></div>
          <div className="is-steady"><strong>3</strong><span>通常範囲</span><small>今週は見守る</small></div>
          <div className="is-check"><strong>3</strong><span>声かけ候補</span><small>本人へ事情を確認</small></div>
          <div className="is-pending"><strong>2</strong><span>判定保留</span><small>データを待つ</small></div>
        </div>
      </section>

      <section className="manager-comparison" id="manager-comparison">
        <header className="manager-section-head"><div><p className="section-index">02 / COMPANY COMPARISON</p><h2>担当部署と、会社全体を比べる</h2><small>平均との差は、チーム運営を見直す手がかりです。個人評価には使いません。</small></div><span>デモ集計</span></header>
        <div className="manager-comparison-list">
          <ManagerComparisonRow label="作業切り替え／人" team="154回" company="128回" teamWidth={100} companyWidth={83} delta="+20%" note="部署の方が多い" />
          <ManagerComparisonRow label="集中時間／人" team="10.2h" company="12.6h" teamWidth={81} companyWidth={100} delta="−2.4h" note="部署の方が短い" />
          <ManagerComparisonRow label="上位3名への依頼集中" team="25%" company="12%" teamWidth={100} companyWidth={48} delta="+13pt" note="部署の偏りが大きい" />
        </div>
        <p className="manager-comparison-note">会社平均は同じ期間の全社モデル集計です。営業職の顧客対応など、部署固有の業務を踏まえて解釈します。</p>
      </section>

      <section className="manager-members" id="manager-members">
        <header className="manager-section-head"><div><p className="section-index">03 / TEAM MEMBERS</p><h2>部下一人ひとりの、今週の状態</h2><small>ポジティブな変化も、確認したい変化も同じ重さで見ます。</small></div><span>12 / 12名</span></header>
        <div className="manager-legend" aria-label="状態ラベルの説明"><span className="good">良い変化 4名</span><span className="steady">通常範囲 3名</span><span className="check">声かけ候補 3名</span><span className="pending">判定保留 2名</span></div>
        <div className="manager-member-grid">
          {managerMembers.map((member) => (
            <article className={`manager-member is-${member.state}`} key={member.name}>
              <header><div><strong>{member.name}</strong><small>第三営業部</small></div><span>{member.label}</span></header>
              <h3>{member.signal}</h3>
              <dl><div><dt>業務</dt><dd>{member.hours}</dd></div><div><dt>集中</dt><dd>{member.focus}</dd></div><div><dt>切替</dt><dd>{member.switches}回</dd></div></dl>
              <p>{member.note}</p>
            </article>
          ))}
        </div>
        <p className="manager-members-note">ここに表示する順番は成績順位ではありません。本人確認が必要な人、良い工夫を共有したい人を見つけるための一覧です。</p>
      </section>

      <div className="manager-focus-grid">
        <section className="manager-focus manager-positive" id="manager-positive">
          <header><p className="section-index">04 / POSITIVE</p><h2>今週、認めたい変化</h2></header>
          <div><strong>高橋さん</strong><p>チャット確認をまとめた後、切り替えが減少。本人の工夫を聞き、希望があればチームへ共有します。</p></div>
          <div><strong>山本さん</strong><p>商談準備と顧客対応のまとまりが安定。現在のリズムを崩す追加業務がないか確認します。</p></div>
          <div><strong>加藤さん・石井さん</strong><p>繁忙からの回復、午前集中の増加が見られます。「何が効いたか」を短く聞く価値があります。</p></div>
        </section>
        <section className="manager-focus manager-check" id="manager-check">
          <header><p className="section-index">05 / CHECK-IN</p><h2>今週、声をかけたい3名</h2></header>
          <div><strong>田中さん</strong><p>「レビュー依頼が集まって困っていることはありますか？」</p></div>
          <div><strong>佐藤さん</strong><p>「商談後の入力が遅い時間になっていますが、減らせる工程はありますか？」</p></div>
          <div><strong>林さん</strong><p>「会議後の確認作業で、重複しているものはありますか？」</p></div>
        </section>
      </div>

      <section className="manager-action" id="manager-action">
        <div className="manager-action-copy"><p className="section-index">06 / THIS WEEK</p><span>管理職として、今週すること</span><h2>3名に聞き、4名の工夫を拾う。</h2><p>月曜に声かけ候補3名へ個別確認し、良い変化のあった4名には工夫を聞きます。火曜から依頼先の曜日分散を1週間だけ試し、金曜に切り替え回数と本人の実感を確認します。</p></div>
        <ol><li><span>1</span><div><strong>本人に聞く</strong><small>結論を決めずに事情を確認</small></div></li><li><span>2</span><div><strong>小さく変える</strong><small>依頼先を曜日で分散</small></div></li><li><span>3</span><div><strong>両方で判断</strong><small>データと本人の実感を照合</small></div></li></ol>
      </section>

      <section className="manager-data" id="manager-data">
        <header className="manager-section-head"><div><p className="section-index">APPENDIX / DATA</p><h2>データの範囲と判断条件</h2><small>この画面は、部下との対話を始める順番を整理するものです。</small></div><span>管理職向け</span></header>
        <div className="manager-data-grid"><div><span>観測スクリーンショット</span><strong>21,460枚</strong></div><div><span>対象</span><strong>12名</strong></div><div><span>有効観測日</span><strong>5日</strong></div><div><span>本人確認候補</span><strong>3名</strong></div></div>
        <div className="manager-data-copy"><div><h3>画面から推測できること</h3><p>業務時間、集中のまとまり、作業切り替え、依頼集中の候補を確認できます。</p></div><div><h3>画面だけでは決めないこと</h3><p>健康状態、能力、意欲、人事評価は判断しません。本人の説明、予定、担当変更、勤怠を確認してから運用を変えます。</p></div></div>
        <SourceLinks sources={['ppc']} />
      </section>

      <footer className="report-footer"><p><strong>分析用途</strong> チーム運営の改善と本人支援のために使用します。成績順位・人事査定には使用しません。</p><a href="#manager-data">データ利用方針</a></footer>
    </div>
  );
}

function ManagerComparisonRow({ label, team, company, teamWidth, companyWidth, delta, note }: { label: string; team: string; company: string; teamWidth: number; companyWidth: number; delta: string; note: string }) {
  return (
    <article className="manager-comparison-row">
      <div><h3>{label}</h3><p><strong>{delta}</strong>{note}</p></div>
      <div className="manager-comparison-bars"><div><span>第三営業部</span><i><b className="team-bar" data-chart-motion style={{ width: `${teamWidth}%` }} /></i><strong>{team}</strong></div><div><span>全社平均</span><i><b className="company-bar" data-chart-motion style={{ width: `${companyWidth}%` }} /></i><strong>{company}</strong></div></div>
    </article>
  );
}

type KeiCandidateView = 'ready' | 'design' | 'human';

const keiCandidateGroups: Record<KeiCandidateView, {
  label: string;
  count: number;
  lead: string;
  items: { title: string; evidence: string; boundary: string }[];
}> = {
  ready: {
    label: '今試す',
    count: 4,
    lead: '手順と入力が比較的そろい、まず下書き支援として試せる候補です。',
    items: [
      { title: '商談メモ → CRM入力案', evidence: '同内容の再入力が週平均14.2回／人', boundary: 'CRMへは自動登録せず、担当者が事実確認' },
      { title: '日報の要点下書き', evidence: '商談後の記録が終業後へ移動する日が9名で観測', boundary: '評価コメントは生成せず、本人が編集・提出' },
      { title: '定例会議のアクション抽出', evidence: '決定事項の再確認候補が週31件', boundary: '担当者・期限は会議責任者が確定' },
      { title: '社内FAQの回答候補', evidence: '同じ規程・資料への検索が週86回', boundary: '参照元を併記し、対外回答には使わない' },
    ],
  },
  design: {
    label: '設計してから',
    count: 5,
    lead: '権限、正解条件、参照データを決めてから検証する候補です。',
    items: [
      { title: '顧客メールの返信案', evidence: '定型の問い合わせ候補が週44件', boundary: '宛先・契約条件・最終文面を人が確認' },
      { title: '提案書の初稿', evidence: '過去資料の再利用候補が週23件', boundary: '実績・価格・権利表記の確認が必須' },
      { title: '案件進捗の要約', evidence: '複数画面をまたぐ集計候補が週18回', boundary: 'SFA項目定義と閲覧権限を先に合意' },
      { title: '見積項目の候補抽出', evidence: '過去見積の検索候補が週16回', boundary: '価格決定と値引承認は人が行う' },
      { title: '日程調整の候補提示', evidence: '社内外の調整候補が週29件', boundary: 'カレンダー接続・代理予約は未確認' },
    ],
  },
  human: {
    label: 'AIに任せない',
    count: 3,
    lead: '支援情報は使えても、判断と責任をAIへ移さない領域です。',
    items: [
      { title: '価格・契約条件の最終決定', evidence: '権限と経営判断を伴う', boundary: '権限者が根拠を確認して承認' },
      { title: '人事評価・配置・懲戒', evidence: '本人の事情と重要な権利へ影響する', boundary: '業務ログやAI出力だけで判断しない' },
      { title: '苦情・例外案件の最終対応', evidence: '顧客関係と文脈判断を伴う', boundary: '責任者が顧客事情を確認して決定' },
    ],
  },
};

type KeiPortfolioId = 'sales' | 'report' | 'faq' | 'estimate' | 'hr';

const keiPortfolioItems: Array<{
  id: KeiPortfolioId;
  title: string;
  department: string;
  hours: string;
  effectScore: number;
  readiness: string;
  risk: string;
  decision: string;
  finding: string;
  humanGate: string;
}> = [
  { id: 'sales', title: '商談後の記録', department: '営業3部門', hours: '162h/週', effectScore: 92, readiness: '高', risk: '中', decision: '30日検証', finding: '入力項目が比較的そろい、全社36名で同じ転記候補が観測されています。まず下書きだけで効果と誤りを測れます。', humanGate: '顧客名・金額・次の行動は担当者が原文と照合し、承認後も本人が手動登録します。' },
  { id: 'report', title: '週次報告の要点整理', department: '全6部門', hours: '73h/週', effectScore: 74, readiness: '中', risk: '中', decision: '入力標準化', finding: '部門ごとに報告項目と粒度が異なり、AI導入前に正解例をそろえる必要があります。', humanGate: '評価・原因・次の方針は部門責任者が追記し、AI要約だけで経営報告を確定しません。' },
  { id: 'faq', title: '社内FAQ回答候補', department: '業務推進部', hours: '84h/週', effectScore: 68, readiness: '中', risk: '低', decision: '参照元を整備', finding: '同じ規程検索が多い一方、参照文書の版が混在しています。先に正本と更新責任者を決めます。', humanGate: 'AI回答には参照元と更新日を付け、例外案件は所管部門が回答します。' },
  { id: 'estimate', title: '見積項目の候補抽出', department: '営業・管理部門', hours: '61h/週', effectScore: 59, readiness: '中', risk: '高', decision: '権限設計後', finding: '検索・転記は支援候補ですが、価格表の権限、契約条件、承認経路が未確認です。', humanGate: '価格・値引き・契約条件は権限者だけが決定し、AIによる確定や自動送信は行いません。' },
  { id: 'hr', title: '人事評価・配置判断', department: '人事・全管理職', hours: '29h/週', effectScore: 18, readiness: '対象外', risk: '高', decision: 'AIに任せない', finding: 'ログから評価文や配置案を自動決定すると、本人の事情や成果の文脈を欠くため対象外とします。', humanGate: '人事判断は権限者が複数情報と本人説明を確認し、業務ログやAI出力だけでは決めません。' },
];

function useKeiChartMotion() {
  useEffect(() => {
    const charts = Array.from(document.querySelectorAll<HTMLElement>('[data-chart-motion]'));
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    charts.forEach((chart) => chart.classList.add('motion-ready'));
    if (reducedMotion) {
      charts.forEach((chart) => chart.classList.add('is-visible'));
      return;
    }
    const chartTargets = new Map<Element, HTMLElement[]>();
    charts.forEach((chart) => {
      const target = chart.parentElement ?? chart;
      chartTargets.set(target, [...(chartTargets.get(target) ?? []), chart]);
    });
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          chartTargets.get(entry.target)?.forEach((chart) => chart.classList.add('is-visible'));
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.24 });
    chartTargets.forEach((_, target) => observer.observe(target));
    return () => observer.disconnect();
  }, []);
}

function KeiExecutiveReport() {
  const [portfolioId, setPortfolioId] = useState<KeiPortfolioId>('sales');
  const selected = keiPortfolioItems.find((item) => item.id === portfolioId) ?? keiPortfolioItems[0];
  useKeiChartMotion();

  return (
    <div className="report-page kei-report kei-executive-report">
      <aside className="hiyori-oem-strip kei-oem-strip" aria-label="OEMサンプル表示">
        <span>OEM SAMPLE</span><strong>サンプル人材｜AI化投資判断レポート</strong><small>powered by WORKLOG INSIGHT</small>
      </aside>

      <header className="report-title kei-title">
        <div><p>AI PORTFOLIO / INVESTMENT GATE</p><h1>全社AI化 投資判断レポート</h1><span>候補数ではなく、事業効果・導入条件・人間承認をそろえて投資順を決めます。</span></div>
        <dl><div><dt>対象</dt><dd>全社・82名</dd></div><div><dt>観測期間</dt><dd>2026.08.25 — 08.31</dd></div></dl>
      </header>

      <ReportActions audience="executive" title="全社AI化 投資判断レポート" shareNote="数値・比較基準・連携状況はOEM商談用の架空設定です。本投資やシステム実行を承認する画面ではありません。" />

      <nav className="report-toc kei-toc" aria-label="慧の経営層向けレポート内メニュー">
        <a href="#kei-exec-summary"><span>01</span>経営結論</a>
        <a href="#kei-exec-benchmark"><span>02</span>外部比較</a>
        <a href="#kei-exec-portfolio"><span>03</span>投資候補</a>
        <a className="has-alert" href="#kei-exec-gate"><span>04</span>投資ゲート<em>HOLD</em></a>
        <a href="#kei-exec-impact"><span>05</span>効果試算</a>
        <a href="#kei-exec-evidence"><span>A</span>根拠・OEM</a>
      </nav>

      <section className="kei-hero kei-exec-hero" id="kei-exec-summary">
        <div className="kei-hero-copy">
          <p className="section-index">01 / EXECUTIVE DECISION</p>
          <div className="kei-hero-advisor"><KeiAvatar compact /><div><span>KEI&apos;S DECISION</span><strong>慧の経営判断</strong></div></div>
          <h2>全社導入はまだ決めない。<br /><em><span>営業記録1工程の</span><span>検証だけ承認する。</span></em></h2>
          <p>全社でAI化候補は24工程ありますが、連携費用、入力データ、実行権限が未確認です。まず営業3部門・36名を対象に、外部システムへ接続しない下書き検証を30日行い、誤りと純削減時間を実測してから本投資を判断します。</p>
          <div className="kei-first-action"><span>経営層の最初の行動</span><strong>今週、事業責任者・情報システム・データ管理責任者を1名ずつ指名する。</strong><small>承認するのは調査とオフライン検証です。CRM連携、AI利用契約、自動実行の予算承認ではありません。</small></div>
        </div>
        <div className="kei-hero-numbers" aria-label="経営判断サマリー">
          <a href="#kei-exec-portfolio"><strong>24<small>工程</small></strong><span>全社候補</span><em>デモ観測・可否未判定</em></a>
          <a href="#kei-exec-gate"><strong>3<small>条件</small></strong><span>本投資前の不足</span><em>費用・データ・権限</em></a>
          <a href="#kei-exec-impact" className="is-rule"><strong>76.8<small>h</small></strong><span>4週の純短縮仮説</span><em>デモ計算・保証なし</em></a>
        </div>
      </section>
      <div className="kei-exec-decision-strip" aria-label="経営判断の選択肢"><div><span>承認</span><strong>30日・未接続の検証</strong></div><div><span>条件付き</span><strong>接続は費用・データ・権限確認後</strong></div><div className="hold"><span>保留</span><strong>全社導入と本投資</strong></div><small>判断者：経営会議 ／ 時間軸：今月の検証、四半期の投資判断</small></div>

      <section className="kei-exec-benchmark" id="kei-exec-benchmark">
        <header className="kei-section-head"><div><p className="section-index">02 / EXTERNAL MODEL COMPARISON</p><h2>自社のAI化準備を、2つのデモ母集団と比べる</h2><small>業界・同規模企業の値はOEM商談用の架空モデルです。公的統計や実在企業の平均ではありません。</small></div><span>自社 n=82 ／ デモ比較</span></header>
        <div className="kei-exec-benchmark-list">
          <KeiExecutiveBenchmarkRow label="定型的な反復業務の比率" company="18.6%" industry="13.0%" peer="14.4%" companyWidth={100} industryWidth={70} peerWidth={77} finding="候補量は多い" />
          <KeiExecutiveBenchmarkRow label="試行条件まで定義済み" company="31%" industry="27%" peer="24%" companyWidth={100} industryWidth={87} peerWidth={77} finding="設計はやや先行" tone="positive" />
          <KeiExecutiveBenchmarkRow label="人間承認者が明確な候補" company="42%" industry="55%" peer="51%" companyWidth={76} industryWidth={100} peerWidth={93} finding="承認設計が不足" />
        </div>
        <p className="kei-compare-conclusion"><strong>経営上の読み方</strong>候補の発見数は十分ですが、投資可能な状態とは限りません。人間の承認者、誤り時の停止方法、接続費用がそろうまでは、候補数を増やすより一工程で運用証拠を作る方が妥当です。</p>
        <p className="kei-model-method"><strong>デモ値の作り方</strong>比較状況を説明するため、自社より反復比率は低く、承認者定義率は高い仮想母集団を編集上設定しています。統計的な推定や市場調査結果ではなく、導入時はOEM先が定義・母数・期間・出典を開示して差し替えます。</p>
      </section>

      <section className="kei-exec-portfolio" id="kei-exec-portfolio">
        <header className="kei-section-head"><div><p className="section-index">03 / AI INVESTMENT PORTFOLIO</p><h2>全社候補を、効果だけでなく判断リスクで並べる</h2><small>時間はデモ観測値。準備度・リスク・判断は仮説であり、各業務責任者の確認前です。</small></div><span>表示中：{selected.title}</span></header>
        <div className="kei-portfolio-layout">
          <div className="kei-portfolio-list" role="tablist" aria-label="AI化投資候補を選択">
            {keiPortfolioItems.map((item, index) => (
              <button type="button" role="tab" aria-selected={portfolioId === item.id} className={portfolioId === item.id ? 'selected' : ''} onClick={() => setPortfolioId(item.id)} key={item.id}>
                <span>{String(index + 1).padStart(2, '0')}</span><span className="copy"><strong>{item.title}</strong><small>{item.department} ／ {item.hours}</small></span><i><b data-chart-motion style={{ width: `${item.effectScore}%` }} /></i><em>{item.decision}</em>
              </button>
            ))}
          </div>
          <aside className="kei-portfolio-detail" role="tabpanel">
            <p>SELECTED INVESTMENT CASE</p><h3>{selected.title}</h3>
            <dl><div><dt>準備度</dt><dd>{selected.readiness}</dd></div><div><dt>判断リスク</dt><dd>{selected.risk}</dd></div><div><dt>現時点の判断</dt><dd>{selected.decision}</dd></div></dl>
            <div><strong>推測される結論</strong><p>{selected.finding}</p></div>
            <div className="gate"><strong>残す人間承認</strong><p>{selected.humanGate}</p></div>
          </aside>
        </div>
      </section>

      <section className="kei-exec-gate" id="kei-exec-gate">
        <header className="kei-section-head"><div><p className="section-index">04 / INVESTMENT &amp; GOVERNANCE GATE</p><h2>本投資へ進む前に、4つの経営ゲートを通す</h2><small>現時点は第1ゲートです。未確認の連携や自動実行を、導入済みとして扱いません。</small></div><span>現在：GATE 1</span></header>
        <div className="kei-exec-gate-flow" aria-label="AI投資判断と人間承認のフロー">
          <article className="is-current"><span>GATE 1</span><strong>範囲を承認</strong><p>1工程・36名・30日。責任者と停止条件を決める。</p><small>経営会議</small></article>
          <article><span>GATE 2</span><strong>条件を確認</strong><p>入力データ、AI提供者、保持、連携費用を確認する。</p><small>情シス・法務・データ管理</small></article>
          <article><span>GATE 3</span><strong>下書きを検証</strong><p>未接続環境で精度、修正時間、本人の使いやすさを測る。</p><small>業務責任者・利用者</small></article>
          <article className="is-decision"><span>GATE 4</span><strong>投資を判断</strong><p>純効果から全費用を引き、継続・再設計・停止を決める。</p><small>経営会議・CFO</small></article>
        </div>
        <div className="kei-exec-governance-table" role="table" aria-label="経営判断の責任分担">
          <div role="row" className="head"><span role="columnheader">判断</span><span role="columnheader">承認者</span><span role="columnheader">必要な証拠</span><span role="columnheader">現状</span></div>
          <div role="row"><strong role="cell">30日検証の開始</strong><span role="cell">事業責任者</span><span role="cell">対象・停止条件・利用者説明</span><b role="cell">承認対象</b></div>
          <div role="row"><strong role="cell">データ利用</strong><span role="cell">データ管理責任者</span><span role="cell">機密区分・保持・学習利用</span><b role="cell">未確認</b></div>
          <div role="row"><strong role="cell">システム接続</strong><span role="cell">情報システム責任者</span><span role="cell">権限・監査ログ・復旧手順</span><b role="cell">未接続</b></div>
          <div role="row"><strong role="cell">本投資</strong><span role="cell">経営会議・CFO</span><span role="cell">実測効果・全費用・残余リスク</span><b role="cell">保留</b></div>
        </div>
      </section>

      <section className="kei-exec-impact" id="kei-exec-impact">
        <header className="kei-section-head"><div><p className="section-index">05 / INVESTMENT SCENARIO</p><h2>効果は試算、投資回収はまだ未判定</h2><small>純短縮にはAI出力の確認・修正時間を差し引いています。金額換算は社内原価と全費用が未確認のため行いません。</small></div><span>デモ試算</span></header>
        <p className="kei-assumption-note"><strong>すべて仮定値</strong>営業3部門を各12名と置いた36名、1人週4件、1件あたり純8分を掛けた編集用シナリオです。第三営業部の観測値を全社へ統計的に外挿したものではなく、実測効果でもありません。</p>
        <div className="kei-equation kei-exec-equation"><div><strong>36<small>名</small></strong><span>営業3部門</span></div><b>×</b><div><strong>4<small>件/週</small></strong><span>記録候補</span></div><b>×</b><div><strong>8<small>分</small></strong><span>現行10分 − 確認2分</span></div><b>=</b><div className="result"><strong>19.2<small>h/週</small></strong><span>76.8時間／4週</span></div></div>
        <div className="kei-exec-investment-verdict"><div><span>今、承認できること</span><strong>30日のオフライン検証</strong><p>対象者の説明、正解例の整理、下書き比較、誤り記録まで。</p></div><div><span>本投資前に見積もること</span><strong>初期設計＋利用＋連携＋監査</strong><p>社内原価と全費用をそろえ、純便益とリスク許容度で判断します。</p></div><div><span>停止条件</span><strong>未承認実行・機密利用・重大誤り</strong><p>1件でも発生した場合は拡大せず、入力と権限設計へ戻ります。</p></div></div>
      </section>

      <section className="kei-evidence" id="kei-exec-evidence">
        <header className="kei-section-head"><div><p className="section-index">APPENDIX / EVIDENCE &amp; OEM</p><h2>経営判断に使える範囲と、OEM先の説明責任</h2><small>外部資料はガバナンス設計の参考であり、本画面の効果値や製品機能を証明するものではありません。</small></div><span>経営層向け</span></header>
        <div className="kei-evidence-grid"><div><span>観測事実・デモ</span><strong>5日・82名・146,320枚</strong><p>反復画面、作業時間帯、部署別候補。業務目的と例外は未確認です。</p></div><div><span>推測</span><strong>24工程を候補化</strong><p>AI化可否、品質、事業効果、現場受容を確定するものではありません。</p></div><div><span>外部比較・デモ</span><strong>業界／同規模モデル</strong><p>すべて架空値。導入時は比較定義、母数、期間、出典をOEM先が提示します。</p></div><div><span>未確認条件</span><strong>費用・契約・接続</strong><p>AI提供者、学習利用、保持、権限、監査、連携方法は未設定です。</p></div></div>
        <div className="kei-oem-requirements"><h3>OEM先が経営層へ説明する6条件</h3><ol><li>比較母集団と架空値の区別</li><li>候補抽出の定義と除外業務</li><li>AI提供者・保存・学習利用</li><li>投資範囲と全費用</li><li>承認権限・監査・停止手順</li><li>効果検証日と撤退条件</li></ol></div>
        <div className="kei-guidance-map"><div><strong>経産省 第1.2版</strong><p>経営層のガバナンス構築・モニタリング → 投資ゲートと責任者設計の参考</p></div><div><strong>NIST AI 600-1</strong><p>導入前テスト・記録・継続監視 → 30日検証と停止条件の参考</p></div><div><strong>NIST Human-AI</strong><p>人とAIの役割・責任 → 下書き、個別承認、実行の分離に対応</p></div></div>
        <p className="kei-no-automation"><strong>デモの固定条件</strong> AI生成、CRM書き込み、メール送信、削除、権限変更はすべて未接続です。本画面から投資承認やシステム実行はできません。</p>
        <SourceLinks sources={['metiAiGuidelines', 'nistGenerativeAi', 'nistHumanAi']} />
      </section>

      <footer className="report-footer"><p><strong>利用目的</strong> 経営層がAI化ポートフォリオの検証順と投資ゲートを決めるための画面です。<br /><small>会社名・数値・比較基準・連携状況はすべてOEM商談用の架空設定です。慧のポートレートはAI生成画像です。</small></p><a href="#kei-exec-evidence">判断境界を確認</a></footer>
    </div>
  );
}

function KeiExecutiveBenchmarkRow({ label, company, industry, peer, companyWidth, industryWidth, peerWidth, finding, tone = 'care' }: { label: string; company: string; industry: string; peer: string; companyWidth: number; industryWidth: number; peerWidth: number; finding: string; tone?: 'care' | 'positive' }) {
  return (
    <article className={`kei-exec-benchmark-row is-${tone}`}>
      <div><h3>{label}</h3><p>{finding}</p></div>
      <div className="kei-exec-benchmark-bars"><div><span>自社</span><i><b className="company-bar" data-chart-motion style={{ width: `${companyWidth}%` }} /></i><strong>{company}</strong></div><div><span>業界モデル</span><i><b data-chart-motion style={{ width: `${industryWidth}%` }} /></i><strong>{industry}</strong></div><div><span>同規模モデル</span><i><b data-chart-motion style={{ width: `${peerWidth}%` }} /></i><strong>{peer}</strong></div></div>
    </article>
  );
}

function KeiManagerReport() {
  const [candidateView, setCandidateView] = useState<KeiCandidateView>('ready');
  const candidateGroup = keiCandidateGroups[candidateView];
  useKeiChartMotion();

  return (
    <div className="report-page kei-report">
      <aside className="hiyori-oem-strip kei-oem-strip" aria-label="OEMサンプル表示">
        <span>OEM SAMPLE</span><strong>サンプル人材｜AI業務設計レポート</strong><small>powered by WORKLOG INSIGHT</small>
      </aside>

      <header className="report-title kei-title">
        <div><p>AI WORK DESIGN / PILOT 01</p><h1>第三営業部 AI化設計レポート</h1><span>AIを増やすのではなく、任せる仕事と、人が決めることを一工程ずつ設計します。</span></div>
        <dl><div><dt>対象</dt><dd>第三営業部・12名</dd></div><div><dt>観測期間</dt><dd>2026.08.25 — 08.31</dd></div></dl>
      </header>

      <ReportActions audience="manager" title="第三営業部 AI化設計レポート" shareNote="数値・氏名・連携状況はOEM商談用の架空設定です。30日・下書きのみの検証案で、CRMやメールは未接続です。" />

      <nav className="report-toc kei-toc" aria-label="慧の管理職向けレポート内メニュー">
        <a href="#kei-summary"><span>01</span>重要結論</a>
        <a href="#kei-compare"><span>02</span>全社比較</a>
        <a href="#kei-candidates"><span>03</span>候補12件</a>
        <a className="has-alert" href="#kei-flow"><span>04</span>承認フロー<em>GATE</em></a>
        <a href="#kei-pilot"><span>05</span>30日検証</a>
        <a href="#kei-evidence"><span>A</span>根拠・OEM</a>
      </nav>

      <section className="kei-hero" id="kei-summary">
        <div className="kei-hero-copy">
          <p className="section-index">01 / AI SHIFT SUMMARY</p>
          <div className="kei-hero-advisor"><KeiAvatar compact /><div><span>KEI&apos;S DECISION</span><strong>慧の導入判断</strong></div></div>
          <h2>12候補を広げず、まず<br /><em><span>「商談後の記録」</span><span>1工程だけ。</span></em></h2>
          <p>5日間のデモ観測では、第三営業部は全社より反復入力が多く、9名で商談後の記録が終業後へ移る日がありました。これはAI化できるという確定ではありませんが、入力ルールを確認しやすく、小さな下書き支援から検証しやすい候補です。</p>
          <div className="kei-first-action"><span>最初の行動</span><strong>金曜までに、実際の商談メモ20件と入力ルールを集める。</strong><small>まだシステム接続はしません。まず正解例・必須項目・承認者を確定します。</small></div>
        </div>
        <div className="kei-hero-numbers" aria-label="AI化判断サマリー">
          <a href="#kei-compare"><strong>71<small>h/週</small></strong><span>反復業務候補</span><em>サンプル集計・要確認</em></a>
          <a href="#kei-candidates"><strong>4<small>/12</small></strong><span>試行候補</span><em>AI化可否は未判定</em></a>
          <a href="#kei-flow" className="is-rule"><strong>なし</strong><span>承認なしの実行</span><em>設計方針・実行系は未接続</em></a>
        </div>
      </section>

      <section className="kei-compare" id="kei-compare">
        <header className="kei-section-head"><div><p className="section-index">02 / DEPARTMENT VS COMPANY</p><h2>第三営業部は、全社同職種より「繰り返し」が多い</h2><small>同じ5日間・営業記録カテゴリのデモ比較。個人の優劣ではなく、工程を選ぶための集団傾向です。</small></div><span>第三営業部 n=12 ／ 全社営業職 n=34</span></header>
        <div className="kei-compare-list">
          <KeiComparisonRow label="商談後の記録時間／人・週" team="中央値 5.9h" company="中央値 3.4h" teamWidth={100} companyWidth={58} delta="+2.5h" note="IQR 4.7–6.9h／2.7–4.2h" />
          <KeiComparisonRow label="同内容の再入力／人・週" team="中央値 14.2回" company="中央値 7.8回" teamWidth={100} companyWidth={55} delta="+6.4回" note="IQR 9.5–17.5回／5.0–10.2回" />
          <KeiComparisonRow label="手順が一定の業務比率" team="68%" company="54%" teamWidth={100} companyWidth={79} delta="+14pt" note="試行条件を定義しやすい" tone="positive" />
        </div>
        <p className="kei-compare-conclusion"><strong>推測される結論</strong>部署の働き方が悪いのではなく、商談件数が多い部署に同じ記録工程が重なっています。業務量を減らすより、記録の下書きを一度で作る検証が先です。中央値・IQR・nは画面説明用に作った架空分布で、導入時は実データと案件数で再集計します。</p>
      </section>

      <section className="kei-candidates" id="kei-candidates">
        <header className="kei-section-head"><div><p className="section-index">03 / CANDIDATE INVENTORY</p><h2>12候補を、任せ方で3分類する</h2><small>「使えるツール」ではなく「人が何を確認するか」で分類しています。すべてデモ用の候補です。</small></div><span>4 + 5 + 3</span></header>
        <aside className="kei-scoring-rule"><strong>候補の選び方</strong><p><span>5基準を各1点</span><b>→</b><span>4点以上＋高影響判断なし</span></p><small>デモ既定は、頻度・時間・手順の一定さ・検証しやすさ・誤り時の影響を同じ重みで判定。導入時は定義と閾値を業務責任者が承認します。</small></aside>
        <div className="kei-candidate-tabs" role="tablist" aria-label="AI化候補の分類">
          {(Object.keys(keiCandidateGroups) as KeiCandidateView[]).map((key) => (
            <button type="button" role="tab" aria-selected={candidateView === key} className={candidateView === key ? 'selected' : ''} key={key} onClick={() => setCandidateView(key)}>
              <span>{keiCandidateGroups[key].count}</span><strong>{keiCandidateGroups[key].label}</strong>
            </button>
          ))}
        </div>
        <p className="kei-candidate-lead">{candidateGroup.lead}</p>
        <div className="kei-candidate-list" role="tabpanel">
          {candidateGroup.items.map((item, index) => (
            <article className={candidateView === 'ready' && index === 0 ? 'selected' : ''} key={item.title}>
              <span>{String(index + 1).padStart(2, '0')}</span>
              <div><h3>{item.title}</h3><p><b>観測・理由</b>{item.evidence}</p></div>
              <p><b>人が残す判断</b>{item.boundary}</p>
            </article>
          ))}
        </div>
        <aside className="kei-selected"><span>今回選ぶ1工程</span><strong>商談メモ → CRM入力案</strong><p>入力ルールを確認でき、対外送信せず、担当者が原文と照合できます。効果と誤りの両方を30日で測れるため、最初の候補にします。</p></aside>
      </section>

      <section className="kei-flow-section" id="kei-flow">
        <header className="kei-section-head"><div><p className="section-index">04 / HUMAN-IN-THE-LOOP</p><h2>AIは下書きまで。決める・実行する・止めるは人。</h2><small>CRMやメールとの連携は未確認です。デモでは外部システムへ書き込みません。</small></div><span>現在：導入前の条件確認</span></header>
        <div className="kei-flow" aria-label="AI導入と人間承認の業務フロー">
          <article className="is-current"><span>BEFORE <b>確認中</b></span><strong>AI導入前</strong><p>担当者が商談メモを見ながら、CRMと日報へ別々に入力。</p><small>まず重複と必須項目を確認</small></article>
          <article className="is-ai is-future"><span>ASSIST <b>未着手</b></span><strong>AI支援</strong><p>構造化した商談メモから、CRM入力案と日報要点を生成。</p><small>下書きのみ・保存しない</small></article>
          <article className="is-gate is-future"><span>APPROVE <b>未着手</b></span><strong>人間承認</strong><p>担当者が顧客名、金額、次の行動、期限を原文と照合。</p><small>誤りがあれば修正・却下</small></article>
          <article className="is-future"><span>EXECUTE <b>未接続</b></span><strong>実行</strong><p>承認した担当者がCRMへ登録。自動書き込みは導入要件として別途判断。</p><small>デモ環境では動作しない</small></article>
          <article className="is-future"><span>VERIFY <b>未着手</b></span><strong>実行後確認</strong><p>時間、修正箇所、欠落、却下理由を記録し、継続可否を判断。</p><small>週次で止める判断も行う</small></article>
        </div>
        <div className="kei-boundary-band"><strong>3つの承認責任</strong><p><b>管理職</b>が試行開始を決め、<b>担当者</b>が個別の下書きを採否し、<b>管理職</b>が30日後の継続・停止を決めます。外部送信、価格・契約、削除、権限変更、人事・健康・懲戒はAI出力や業務ログだけで決めません。</p></div>
        <div className="kei-approval-table" role="table" aria-label="人間承認の責任分担">
          <div role="row" className="head"><span role="columnheader">誰が</span><span role="columnheader">何を</span><span role="columnheader">いつ</span><span role="columnheader">否認したら</span></div>
          <div role="row"><strong role="cell">管理職</strong><span role="cell">試行の開始</span><span role="cell">接続・利用前</span><span role="cell">未着手のまま条件を再設計</span></div>
          <div role="row"><strong role="cell">担当者</strong><span role="cell">個別の下書き</span><span role="cell">1件ごと</span><span role="cell">破棄し、外部へ書き込まない</span></div>
          <div role="row"><strong role="cell">管理職</strong><span role="cell">継続・停止</span><span role="cell">週次・30日後</span><span role="cell">停止し、原因と入力を確認</span></div>
        </div>
        <p className="kei-operator-note">担当者は将来の試行時に下書きを確認する役割です。この管理職画面からAI出力を生成・承認する操作はできません。</p>
      </section>

      <section className="kei-pilot" id="kei-pilot">
        <div className="kei-pilot-copy"><p className="section-index">05 / 30-DAY PILOT</p><span>今月の導入判断</span><h2>接続の前に、<br />下書きだけを30日。</h2><p>最初の20件で正解条件をそろえ、1チーム・1工程・下書きのみで試します。条件を満たさなければ拡大せず、入力設計へ戻ります。</p></div>
        <ol className="kei-pilot-steps"><li><span>1週目</span><strong>正解を決める</strong><small>20件・必須項目・承認者</small></li><li><span>2週目</span><strong>下書き検証</strong><small>保存・送信なしで比較</small></li><li><span>3週目</span><strong>限定試行</strong><small>対象9名・1工程だけ</small></li><li><span>4週目</span><strong>継続判断</strong><small>時間・誤り・使いやすさ</small></li></ol>
      </section>

      <aside className="kei-manager-operation" aria-label="試行担当者と部下への確認事項">
        <div><span>試行責任者・デモ設定</span><strong>第三営業部長 石川</strong><small>業務設計：営業企画 山口 ／ データ確認：情報システム部</small></div>
        <div><span>部下へ先に聞く3問</span><ol><li>商談メモのどこを二度入力していますか</li><li>AIに見せてはいけない情報はありますか</li><li>下書きのどこを必ず自分で決めたいですか</li></ol></div>
        <p>氏名・役割はOEM画面用の架空設定です。本人の回答によって対象、入力、承認手順を変更します。試行参加や反復量を人事評価・成績順位には使用しません。</p>
      </aside>

      <section className="kei-impact">
        <header className="kei-section-head"><div><p className="section-index">IMPACT SCENARIO</p><h2>期待効果は、前提ごとに表示する</h2><small>削減保証ではありません。対象人数・件数・1件あたり短縮仮説から置いたデモ試算です。</small></div><span>デモ試算</span></header>
        <div className="kei-equation"><div><strong>9<small>名</small></strong><span>対象者</span></div><b>×</b><div><strong>4<small>件/週</small></strong><span>商談記録</span></div><b>×</b><div><strong>8<small>分</small></strong><span>純短縮：現行10分 − AI確認・修正2分</span></div><b>=</b><div className="result"><strong>4.8<small>時間/週</small></strong><span>19.2時間／4週</span></div></div>
        <div className="kei-scenario-range"><div><span>慎重｜現行10分 − 確認6分</span><strong>純2.4時間／週</strong></div><div className="standard"><span>標準｜現行10分 − 確認2分</span><strong>純4.8時間／週</strong></div><div><span>上限｜現行15分 − 確認3分</span><strong>純7.2時間／週</strong></div></div>
        <p className="kei-cost-note"><strong>純短縮に含めたもの</strong> 1件ごとのAI出力確認・修正時間。<strong>費用試算に含めないもの</strong> 初期設計、AI利用料、連携開発、教育、監査運用。費用対効果はこれらを見積もってから判断します。</p>
        <div className="kei-acceptance"><div><h3>続ける条件</h3><p>必須項目の欠落0件、全件人間承認、中央値で5分以上短縮、利用者の使いやすさが悪化しない。</p></div><div><h3>止める条件</h3><p>未承認の保存・送信、機密データの不適切利用、重大な事実誤り、修正負担の増加が1件でも確認された場合。</p></div></div>
      </section>

      <section className="kei-evidence" id="kei-evidence">
        <header className="kei-section-head"><div><p className="section-index">APPENDIX / EVIDENCE &amp; OEM</p><h2>観測・推測・導入条件を混同しない</h2><small>人材会社がOEM商談で説明し、導入前に顧客と合意するための境界です。</small></div><span>管理職向け</span></header>
        <div className="kei-evidence-grid">
          <div><span>観測事実・デモ</span><strong>5日・12名・21,460枚</strong><p>画面遷移、作業時間帯、反復入力候補。業務目的や正解条件は本人・管理職へ確認します。</p></div>
          <div><span>AI化候補・推測</span><strong>12件を3分類</strong><p>ログの反復だけで自動化可否は確定しません。手順、例外、入力品質、権限を確認します。</p></div>
          <div><span>期待効果・試算</span><strong>4.8時間／週</strong><p>9名×4件×8分のデモ仮説。実測後に更新し、売上や成果を保証しません。</p></div>
          <div><span>導入条件・未確認</span><strong>連携・権限・保存</strong><p>CRM接続、AI提供者、学習利用、保持期間、監査ログは未設定。OEM先ごとに要件化します。</p></div>
        </div>
        <div className="kei-oem-requirements"><h3>OEM先が説明・設定する6条件</h3><ol><li>利用目的と対象業務</li><li>入力データと機密区分</li><li>AI提供者・保存・学習利用</li><li>閲覧・実行・承認権限</li><li>監査ログ・訂正・停止手順</li><li>効果指標と見直し日</li></ol></div>
        <div className="kei-source-note"><strong>参考資料の使い方</strong><p>下記は製品機能の証明ではなく、役割分担、導入前テスト、記録、継続監視を設計するための一次資料です。NIST AI RMF 1.0は改訂作業中のため、導入時に最新版を再確認します。</p></div>
        <p className="kei-no-automation"><strong>デモの固定条件</strong> 本画面で自動実行される処理はありません。AI生成、CRM書き込み、メール送信、削除、権限変更はすべて未接続です。</p>
        <SourceLinks sources={['metiAiGuidelines', 'nistGenerativeAi', 'nistHumanAi']} />
      </section>

      <footer className="report-footer"><p><strong>利用目的</strong> 管理職が、AIへ任せる工程と人が残す判断を小さく検証するための画面です。<br /><small>会社名・氏名・数値・連携状況はすべてデモ用の架空設定です。慧のポートレートはAI生成画像です。</small></p><a href="#kei-evidence">判断境界を確認</a></footer>
    </div>
  );
}

function KeiComparisonRow({ label, team, company, teamWidth, companyWidth, delta, note, tone = 'care' }: { label: string; team: string; company: string; teamWidth: number; companyWidth: number; delta: string; note: string; tone?: 'care' | 'positive' }) {
  return (
    <article className={`kei-comparison-row is-${tone}`}>
      <div><h3>{label}</h3><p><strong>{delta}</strong>{note}</p></div>
      <div className="kei-comparison-bars"><div><span>第三営業部</span><i><b className="team-bar" data-chart-motion style={{ width: `${teamWidth}%` }} /></i><strong>{team}</strong></div><div><span>全社平均</span><i><b className="company-bar" data-chart-motion style={{ width: `${companyWidth}%` }} /></i><strong>{company}</strong></div></div>
    </article>
  );
}

type KeiStaffResponse = 'idle' | 'try' | 'explain';

function KeiStaffReport() {
  const [response, setResponse] = useState<KeiStaffResponse>('idle');
  useKeiChartMotion();

  return (
    <div className="report-page kei-report kei-staff-report">
      <aside className="hiyori-oem-strip kei-oem-strip" aria-label="OEMサンプル表示">
        <span>OEM SAMPLE</span><strong>サンプル人材｜わたしのAI仕事メモ</strong><small>powered by WORKLOG INSIGHT</small>
      </aside>

      <header className="report-title kei-title">
        <div><p>MY AI WORK NOTE / WEEK 35</p><h1>佐藤さんのAI仕事メモ</h1><span>働き方を評価せず、自分で減らしたい繰り返しと、AIへ任せない判断を整理します。</span></div>
        <dl><div><dt>閲覧範囲</dt><dd>本人のみ（デモ既定）</dd></div><div><dt>観測期間</dt><dd>2026.08.25 — 08.31</dd></div></dl>
      </header>

      <ReportActions audience="staff" title="佐藤さんのAI仕事メモ" shareNote="氏名・数値・比較基準・連携状況はOEM商談用の架空設定です。AI下書き、CRM保存、メール送信は未実装・未接続です。" />

      <nav className="report-toc kei-toc" aria-label="慧のスタッフ本人向けレポート内メニュー">
        <a href="#kei-self-summary"><span>01</span>今週の結論</a>
        <a href="#kei-self-compare"><span>02</span>自分の比較</a>
        <a href="#kei-self-boundary"><span>03</span>任せる境界</a>
        <a href="#kei-self-flow"><span>04</span>試し方</a>
        <a className="has-alert" href="#kei-self-next"><span>05</span>来週の一歩<em>5件</em></a>
        <a href="#kei-self-data"><span>A</span>データ範囲</a>
      </nav>

      <section className="kei-self-hero" id="kei-self-summary">
        <div className="kei-self-hero-copy">
          <p className="section-index">01 / YOUR WEEK</p>
          <div className="kei-hero-advisor"><KeiAvatar compact /><div><span>KEI&apos;S NOTE</span><strong>慧から佐藤さんへ</strong></div></div>
          <h2>入力が遅いのではなく、<br /><em>同じ内容を何度も書いています。</em></h2>
          <p>今週は商談後の記録が6.8時間あり、そのうち同じ内容を別画面へ入力した候補が17回ありました。商談数や例外対応の影響もあるため、能力や効率の評価には使いません。来週は5件だけ、AIの下書きと自分の入力を比べてみましょう。</p>
          <div className="kei-first-action"><span>来週の最初の行動</span><strong>月曜に「試してよい商談メモ」を5件、自分で選ぶ。</strong><small>顧客の機密情報は入れず、システムへ接続・保存・送信しない比較テストです。</small></div>
        </div>
        <div className="kei-self-kpis" aria-label="本人向けサマリー">
          <a href="#kei-self-compare"><strong>6.8<small>h/週</small></strong><span>記録時間</span><em>観測候補・事情未確認</em></a>
          <a href="#kei-self-compare"><strong>17<small>回</small></strong><span>同内容の再入力</span><em>画面遷移からの推定</em></a>
          <a href="#kei-self-next"><strong>5<small>件</small></strong><span>来週の小さな試行</span><em>本人が選び、いつでも停止</em></a>
        </div>
      </section>

      <section className="kei-self-compare" id="kei-self-compare">
        <header className="kei-section-head"><div><p className="section-index">02 / YOU VS TEAM VS COMPANY</p><h2>本人・所属部署・全社を、同じ営業記録で比べる</h2><small>同じ5日間のデモ値です。順位づけではなく、本人が減らしたい工程を見つけるために使います。</small></div><span>本人 n=1 ／ 部署 n=12 ／ 全社営業 n=34</span></header>
        <div className="kei-self-comparison-list">
          <KeiStaffComparisonRow label="商談後の記録時間／週" self="6.8h" team="中央値 5.9h" company="中央値 3.4h" selfWidth={100} teamWidth={87} companyWidth={50} note="本人は部署中央値より0.9時間多い" />
          <KeiStaffComparisonRow label="同内容の再入力／週" self="17回" team="中央値 14.2回" company="中央値 7.8回" selfWidth={100} teamWidth={84} companyWidth={46} note="入力先と案件数を本人へ確認" />
          <KeiStaffComparisonRow label="必須項目の入力完了" self="96%" team="93%" company="91%" selfWidth={100} teamWidth={97} companyWidth={95} note="丁寧さは維持できている" tone="positive" />
        </div>
        <p className="kei-compare-conclusion"><strong>良かったこと</strong>記録の必須項目はほぼ揃っています。短くするために情報を削るのではなく、丁寧に書いた一つのメモから下書きを作る方法が合いそうです。数値と分布はすべてデモ用の架空値です。</p>
      </section>

      <section className="kei-self-boundary" id="kei-self-boundary">
        <header className="kei-section-head"><div><p className="section-index">03 / YOUR DECISION BOUNDARY</p><h2>AIに下書きを作らせることと、自分で決めること</h2><small>AIは作業を支援します。顧客への約束や事実の確定は佐藤さんが行います。</small></div><span>下書きまで</span></header>
        <div className="kei-self-boundary-grid">
          <div className="assist"><span>AIに下書きを作らせること</span><ul><li><strong>項目を分ける</strong><small>商談メモから顧客課題・次の行動・期限の候補を抽出</small></li><li><strong>短くまとめる</strong><small>日報用の要点を下書き</small></li><li><strong>抜けを知らせる</strong><small>必須項目が見当たらない箇所を確認候補として表示</small></li></ul></div>
          <div className="human"><span>佐藤さんが判断すること</span><ul><li><strong>事実を確定する</strong><small>顧客名・金額・期限を原文と照合</small></li><li><strong>文脈を直す</strong><small>顧客の温度感や例外事情を自分の言葉で修正</small></li><li><strong>使うか決める</strong><small>下書きを採用・修正・破棄し、登録は自分で実行</small></li></ul></div>
        </div>
        <aside className="kei-self-rights"><strong>試さない選択もできます</strong><p>本人の説明、担当案件、顧客との約束、データの扱いを優先します。この本人画面は本人だけが閲覧するデモ既定で、管理職には別の部署集計画面を表示します。下の希望選択は保存・送信されず、数字やAI提案だけで能力・意欲・人事評価を判断しません。</p></aside>
      </section>

      <section className="kei-self-flow-section" id="kei-self-flow">
        <header className="kei-section-head"><div><p className="section-index">04 / SAFE TRIAL FLOW</p><h2>来週は、外部へつながない5件だけ</h2><small>AI支援以降は未着手です。現在の製品画面からAI生成、CRM保存、メール送信はできません。</small></div><span>現在：試行前</span></header>
        <div className="kei-self-flow" aria-label="本人向けAI下書き試行フロー">
          <article className="is-current"><span>1</span><strong>本人が選ぶ</strong><p>機密情報を除いた5件を選ぶ。</p><small>選ばなくても不利益なし</small></article>
          <article><span>2</span><strong>AIが下書く</strong><p>指定した項目だけを構造化。</p><small>未着手・保存なし</small></article>
          <article className="is-gate"><span>3</span><strong>本人が確認</strong><p>原文と照合し、採用・修正・破棄。</p><small>判断は毎回本人</small></article>
          <article><span>4</span><strong>本人が登録</strong><p>承認した内容だけを手動入力。</p><small>CRMは未接続</small></article>
          <article><span>5</span><strong>本人が振り返る</strong><p>時間、直した箇所、使いやすさを記録。</p><small>続けるか自分でも確認</small></article>
        </div>
      </section>

      <section className="kei-self-next" id="kei-self-next">
        <div className="kei-self-next-copy"><p className="section-index">05 / NEXT WEEK</p><span>来週は、これだけ</span><h2>5件だけ比べて、<br />1件3分以上減るかを見る。</h2><p>現在の入力時間と、AI下書きの確認・修正を含む時間を同じ条件で比べます。速さだけでなく、事実誤りと「自分で使いやすいか」も記録します。</p></div>
        <ol><li><span>1</span><strong>5件を選ぶ</strong><small>機密情報を除く</small></li><li><span>2</span><strong>時間を測る</strong><small>確認・修正を含める</small></li><li><span>3</span><strong>誤りを残す</strong><small>欠落・誤記・違和感</small></li><li><span>4</span><strong>自分で決める</strong><small>続ける・直す・止める</small></li></ol>
      </section>

      <aside className="kei-self-feedback" aria-live="polite">
        <div><strong>この試行について</strong><p>本人の希望を先に記録します。ここで選んでも外部送信されません。</p></div>
        <div className="kei-self-feedback-actions"><button type="button" className={response === 'try' ? 'selected' : ''} onClick={() => setResponse('try')}>5件だけ試してみたい</button><button type="button" className={response === 'explain' ? 'selected' : ''} onClick={() => setResponse('explain')}>先に事情を説明したい</button></div>
        <p>{response === 'try' ? '選択を画面内だけに反映しました。実際の試行開始には、入力範囲と承認方法の確認が必要です。' : response === 'explain' ? '本人の説明を優先する選択です。担当案件や入力先の事情を確認してから、対象を見直します。' : 'まだ選択されていません。試行を断っても、人事評価や業務評価には使いません。'}</p>
      </aside>

      <section className="kei-evidence kei-self-data" id="kei-self-data">
        <header className="kei-section-head"><div><p className="section-index">APPENDIX / YOUR DATA</p><h2>本人画面で分かること、決めないこと</h2><small>OEM導入時は、本人への説明、訂正、削除、相談窓口を事前に合意します。</small></div><span>スタッフ本人向け</span></header>
        <div className="kei-evidence-grid"><div><span>観測事実・デモ</span><strong>5日・本人1名・3,126枚</strong><p>画面遷移、作業時間帯、同内容入力の候補。入力の理由は分かりません。</p></div><div><span>推測</span><strong>再入力17回</strong><p>案件数、顧客事情、作業ルールを確認するまで改善余地とは確定しません。</p></div><div><span>比較・デモ</span><strong>本人／部署／全社</strong><p>同じ営業記録を同期間で比較。すべて架空値で、人事評価には使いません。</p></div><div><span>本人が選べること</span><strong>試す・直す・止める</strong><p>入力対象と下書きの採否を本人が選び、説明や訂正を優先します。</p></div></div>
        <div className="kei-oem-requirements"><h3>OEM先が本人へ説明する6条件</h3><ol><li>観測目的と閲覧者</li><li>入力してよいデータ</li><li>AI提供者・保存・学習利用</li><li>下書きの承認と実行者</li><li>訂正・削除・相談窓口</li><li>人事評価に使わない範囲</li></ol></div>
        <p className="kei-no-automation"><strong>デモの固定条件</strong> AI生成、CRM書き込み、メール送信、削除、権限変更はすべて未接続です。上の希望ボタンも画面内表示だけで、送信されません。</p>
        <SourceLinks sources={['metiAiGuidelines', 'nistGenerativeAi', 'nistHumanAi']} />
      </section>

      <footer className="report-footer"><p><strong>利用目的</strong> 本人が、自分で減らしたい反復作業とAIへ任せない判断を整理するための画面です。<br /><small>氏名・会社名・数値・比較基準・連携状況はすべてOEM商談用の架空設定です。慧のポートレートはAI生成画像です。</small></p><a href="#kei-self-data">データ利用方針</a></footer>
    </div>
  );
}

function KeiStaffComparisonRow({ label, self, team, company, selfWidth, teamWidth, companyWidth, note, tone = 'care' }: { label: string; self: string; team: string; company: string; selfWidth: number; teamWidth: number; companyWidth: number; note: string; tone?: 'care' | 'positive' }) {
  return (
    <article className={`kei-self-comparison-row is-${tone}`}>
      <div><h3>{label}</h3><p>{note}</p></div>
      <div className="kei-self-comparison-bars"><div><span>あなた</span><i><b className="self-bar" data-chart-motion style={{ width: `${selfWidth}%` }} /></i><strong>{self}</strong></div><div><span>所属部署</span><i><b data-chart-motion style={{ width: `${teamWidth}%` }} /></i><strong>{team}</strong></div><div><span>全社営業</span><i><b data-chart-motion style={{ width: `${companyWidth}%` }} /></i><strong>{company}</strong></div></div>
    </article>
  );
}

function HiyoriExecutiveReport() {
  useEffect(() => {
    const charts = Array.from(document.querySelectorAll<HTMLElement>('[data-chart-motion]'));
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    charts.forEach((chart) => chart.classList.add('motion-ready'));
    if (reducedMotion) {
      charts.forEach((chart) => chart.classList.add('is-visible'));
      return;
    }
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          (entry.target as HTMLElement).classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.24 });
    charts.forEach((chart) => observer.observe(chart));
    return () => observer.disconnect();
  }, []);

  return (
    <div className="report-page hiyori-report hiyori-executive-report">
      <aside className="hiyori-oem-strip" aria-label="OEMサンプル表示">
        <span>OEM SAMPLE</span><strong>サンプル人材｜組織ケア経営レポート</strong><small>powered by WORKLOG INSIGHT</small>
      </aside>

      <header className="report-title hiyori-title hiyori-executive-title">
        <div><p>ORGANIZATION CARE / WEEK 35</p><h1>組織ケア経営レポート</h1><span>個人を予測・評価せず、働きにくさを生む組織側の条件と、今月の経営判断を整理します。</span></div>
        <dl><div><dt>対象</dt><dd>全社・82名</dd></div><div><dt>集計期間</dt><dd>2026.08.25 — 08.31</dd></div></dl>
      </header>

      <ReportActions audience="executive" title="組織ケア経営レポート" />

      <nav className="report-toc hiyori-toc hiyori-executive-toc" aria-label="ひより経営層向けレポート内メニュー">
        <a href="#hiyori-exec-summary"><span>01</span>経営要点</a>
        <a href="#hiyori-exec-benchmark"><span>02</span>外部比較</a>
        <a className="has-alert" href="#hiyori-exec-priority"><span>03</span>重点テーマ<em>3件</em></a>
        <a href="#hiyori-exec-decision"><span>04</span>30日計画</a>
        <a href="#hiyori-exec-impact"><span>05</span>効果試算</a>
        <a href="#hiyori-exec-data"><span>A</span>根拠・OEM</a>
      </nav>

      <section className="hiyori-exec-hero" id="hiyori-exec-summary">
        <div className="hiyori-exec-hero-copy">
          <p className="section-index">01 / EXECUTIVE SUMMARY</p>
          <div className="hiyori-hero-advisor"><HiyoriAvatar compact /><div><span>HIYORI&apos;S VIEW</span><strong>ひよりの経営メモ</strong></div></div>
          <h2>辞める人を当てるのではなく、<br /><em>働きにくさを生む構造を先に直す。</em></h2>
          <p>全社では、相談先の集中と終業後作業が同規模企業のデモ基準を上回っています。個人の意欲ではなく、相談窓口・会議後の記録・入力工程が一部の人と部署へ寄っていることが共通要因と推測されます。今月は3テーマを同時に広げず、第三営業部の相談分散から検証します。</p>
          <small>デモデータによる組織傾向の推定です。健康状態・ストレス・退職意向・個人の能力は判定していません。</small>
        </div>
        <div className="hiyori-exec-scoreboard" aria-label="経営判断サマリー">
          <a href="#hiyori-exec-priority"><strong>3</strong><span>要経営判断</span><small>仕組みを変えるテーマ</small></a>
          <a href="#hiyori-exec-benchmark" className="is-watch"><strong>2</strong><span>外部基準超過</span><small>相談集中・終業後作業</small></a>
          <div><strong>1</strong><span>先行実施部署</span><small>第三営業部から開始</small></div>
        </div>
      </section>

      <section className="hiyori-exec-benchmark" id="hiyori-exec-benchmark">
        <header className="hiyori-section-head"><div><p className="section-index">02 / EXTERNAL BENCHMARK</p><h2>会社全体を、同規模企業のデモ基準と比べる</h2><small>外部比較は商談用のモデル値です。導入時は業種・職種・勤務形態を揃えた基準へ置き換えます。</small></div><span>従業員50〜100名モデル</span></header>
        <div className="hiyori-exec-comparison-list">
          <HiyoriExecutiveComparisonRow label="上位3名への相談集中" company="22%" benchmark="13%" companyWidth={100} benchmarkWidth={59} delta="+9pt" finding="窓口が一部社員へ偏る" />
          <HiyoriExecutiveComparisonRow label="終業後作業が週2日以上" company="18%" benchmark="11%" companyWidth={100} benchmarkWidth={61} delta="+7pt" finding="日中に完結しにくい工程" />
          <HiyoriExecutiveComparisonRow label="月1回以上の1on1実施" company="76%" benchmark="71%" companyWidth={100} benchmarkWidth={93} delta="+5pt" finding="対話の土台は確保" tone="positive" />
        </div>
        <p className="hiyori-comparison-note"><strong>結論</strong>対話機会は平均以上ですが、相談と作業の偏りは残っています。1on1の回数を増やすより、そこで確認した困りごとを業務設計へ戻す仕組みが優先です。</p>
      </section>

      <section className="hiyori-exec-priority" id="hiyori-exec-priority">
        <header className="hiyori-section-head"><div><p className="section-index">03 / PRIORITY THEMES</p><h2>経営が今月決める、3つの組織課題</h2><small>個人への注意ではなく、会社側が変えられる条件に限定しています。</small></div><span>優先順</span></header>
        <div className="hiyori-exec-priority-list">
          <article><span>01</span><div><p>最優先｜第三営業部</p><h3>一次相談先を曜日で分散する</h3><small>観測：相談の38%が上位2名へ集中。木曜午後の集中時間は部署平均より31分短い。</small></div><strong>30日で検証</strong></article>
          <article><span>02</span><div><p>次点｜業務推進部</p><h3>会議後の記録先と担当を固定する</h3><small>観測：会議後24時間以内の転記が週47件。重複確認の候補が前月比18%増。</small></div><strong>工程を標準化</strong></article>
          <article><span>03</span><div><p>基盤｜全管理職</p><h3>1on1の困りごとを集団課題へ戻す</h3><small>観測：1on1実施率76%に対し、業務変更の記録が残るのは29%。対話後の実行が途切れています。</small></div><strong>月次で確認</strong></article>
        </div>
        <aside className="hiyori-exec-boundary"><strong>経営画面に個人名は出さない</strong><p>経営層は部署単位の構造と施策を確認します。個別支援が必要な場合も、管理職が本人へ事情を聞き、必要最小限の範囲で対応します。</p></aside>
      </section>

      <section className="hiyori-exec-decision" id="hiyori-exec-decision">
        <div className="hiyori-exec-decision-copy"><p className="section-index">04 / 30-DAY DECISION</p><span>今月の経営判断</span><h2>第三営業部で、<br />相談分散を30日だけ試す。</h2><p>全社制度にする前に、対象部署・担当役員・終了条件を決めて小さく検証します。改善しなければ個人の努力を求めず、窓口設計を見直します。</p></div>
        <div className="hiyori-exec-flow" aria-label="30日検証フロー">
          <p>DECIDE → TRY → REVIEW</p>
          <div><span>1</span><strong>決める</strong><small>責任者・対象・終了条件</small></div>
          <div><span>2</span><strong>試す</strong><small>相談先を曜日で分散</small></div>
          <div><span>3</span><strong>見直す</strong><small>本人実感と集団値を照合</small></div>
        </div>
      </section>

      <section className="hiyori-exec-impact" id="hiyori-exec-impact">
        <header className="hiyori-section-head"><div><p className="section-index">05 / IMPACT SCENARIO</p><h2>30日検証で確認する効果</h2><small>削減を保証する数値ではなく、対象工程と現状時間から置いた試算シナリオです。</small></div><span>デモ試算</span></header>
        <div className="hiyori-exec-impact-grid">
          <div><span>終業後入力</span><strong>月86<small>時間</small></strong><p>対象部署の現状から、日中へ戻せる可能性がある時間</p></div>
          <div><span>確認・再転記</span><strong>月42<small>時間</small></strong><p>記録先と担当を固定した場合の削減候補</p></div>
          <div><span>効果確認</span><strong>3<small>指標</small></strong><p>相談集中・終業後作業・本人の実感で判断</p></div>
        </div>
        <div className="hiyori-exec-verdict"><strong>判断基準</strong><p>相談集中が5pt以上下がり、本人の「進めやすさ」が悪化しなければ次の部署へ展開。どちらかが満たない場合は継続せず、設計を見直します。</p></div>
      </section>

      <section className="hiyori-exec-data" id="hiyori-exec-data">
        <header className="hiyori-section-head"><div><p className="section-index">APPENDIX / EVIDENCE &amp; OEM</p><h2>根拠・判断境界・OEM導入条件</h2><small>人材会社が説明できる範囲までを、画面内に残します。</small></div><span>経営層向け</span></header>
        <div className="hiyori-data-grid"><div><span>観測スクリーンショット</span><strong>126,840枚</strong></div><div><span>対象</span><strong>82名</strong></div><div><span>有効観測日</span><strong>5日</strong></div><div><span>集計単位</span><strong>部署・全社</strong></div></div>
        <div className="hiyori-boundary-grid"><div><h3>この画面で経営判断すること</h3><p>相談窓口、会議後工程、入力工程、管理職支援など、会社側が変更できる条件と検証順を決めます。</p></div><div><h3>この画面では判断しないこと</h3><p>健康状態、ストレス、退職意向、性格、能力、人事評価。個人名や個人順位も経営画面には表示しません。</p></div></div>
        <div className="hiyori-oem-legend"><p><strong>デモで確定していること</strong>3つの役割別画面、個人名を出さない経営集計、判断境界の表示</p><p><strong>OEM導入時に要合意</strong>ブランド、利用目的、比較母集団、閲覧権限、本人への説明、保存・訂正・削除手順</p></div>
        <SourceLinks sources={['ppc', 'mhlwStress']} />
      </section>

      <footer className="report-footer"><p><strong>利用目的</strong> 経営層が組織側の働き方を改善するための画面です。個人の健康・退職・能力予測や人事査定には使用しません。<br /><small>会社名・数値・比較基準はすべてOEM商談用の架空データです。ひよりのポートレートはAI生成画像です。</small></p><a href="#hiyori-exec-data">判断境界を確認</a></footer>
    </div>
  );
}

function HiyoriExecutiveComparisonRow({ label, company, benchmark, companyWidth, benchmarkWidth, delta, finding, tone = 'care' }: { label: string; company: string; benchmark: string; companyWidth: number; benchmarkWidth: number; delta: string; finding: string; tone?: 'care' | 'positive' }) {
  return (
    <article className={`hiyori-exec-comparison-row is-${tone}`}>
      <div><h3>{label}</h3><p><strong>{delta}</strong>{finding}</p></div>
      <div className="hiyori-exec-comparison-bars"><div><span>自社</span><i><b className="company-bar" data-chart-motion style={{ width: `${companyWidth}%` }} /></i><strong>{company}</strong></div><div><span>同規模モデル</span><i><b className="benchmark-bar" data-chart-motion style={{ width: `${benchmarkWidth}%` }} /></i><strong>{benchmark}</strong></div></div>
    </article>
  );
}

function HiyoriManagerReport() {
  const [showNames, setShowNames] = useState(false);
  const dialogueCandidates = hiyoriDialogues.filter((item) => item.state === 'check');

  useEffect(() => {
    const charts = Array.from(document.querySelectorAll<HTMLElement>('[data-chart-motion]'));
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    charts.forEach((chart) => chart.classList.add('motion-ready'));
    if (reducedMotion) {
      charts.forEach((chart) => chart.classList.add('is-visible'));
      return;
    }
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          (entry.target as HTMLElement).classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.24 });
    charts.forEach((chart) => observer.observe(chart));
    return () => observer.disconnect();
  }, []);

  return (
    <div className="report-page hiyori-report">
      <aside className="hiyori-oem-strip" aria-label="OEMサンプル表示">
        <span>OEM SAMPLE</span><strong>サンプル人材｜定着支援レポート</strong><small>powered by WORKLOG INSIGHT</small>
      </aside>

      <header className="report-title hiyori-title">
        <div><p>TEAM CARE / WEEK 35</p><h1>第三営業部 チームケア週報</h1><span>人を評価するのではなく、対話を始める理由を見つける管理職レポートです。</span></div>
        <dl><div><dt>対象</dt><dd>第三営業部・12名</dd></div><div><dt>集計期間</dt><dd>2026.08.25 — 08.31</dd></div></dl>
      </header>

      <ReportActions audience="manager" title="第三営業部 チームケア週報" />

      <nav className="report-toc hiyori-toc" aria-label="ひより管理職向けレポート内メニュー">
        <a href="#hiyori-summary"><span>01</span>要点</a>
        <a href="#hiyori-action"><span>02</span>今週やる</a>
        <a href="#hiyori-pulse"><span>03</span>チーム差</a>
        <a className="has-alert" href="#hiyori-dialogue"><span>04</span>今話す<em>3名</em></a>
        <a href="#hiyori-positive"><span>05</span>チーム改善</a>
        <a href="#hiyori-data"><span>A</span>範囲・OEM</a>
      </nav>

      <section className="hiyori-hero" id="hiyori-summary">
        <div className="hiyori-hero-main">
          <div className="hiyori-hero-copy">
            <p className="section-index">01 / CARE SUMMARY</p>
            <div className="hiyori-hero-advisor"><HiyoriAvatar compact /><div><span>HIYORI&apos;S VIEW</span><strong>ひよりの今週メモ</strong></div></div>
            <h2>3人を判断する前に、<br /><em>3人へ聞く。</em></h2>
            <p>田中さん・佐藤さん・林さんへ、相談・入力・会議後作業が偏っています。忙しさを個人の問題にせず、本人の事情を聞いてから依頼先と時間帯を1週間だけ分散します。</p>
            <small>デモデータによる推定です。健康状態・ストレス・意欲・退職意向は判定していません。</small>
          </div>
          <div className="hiyori-care-flow" aria-label="ひよりの判断フロー">
            <p>OBSERVE → ASK → SUPPORT</p>
            <div><span>1</span><strong>変化を見る</strong><small>集団傾向と前週差</small></div>
            <div><span>2</span><strong>本人に聞く</strong><small>理由を決めつけない</small></div>
            <div><span>3</span><strong>チームを整える</strong><small>1週間だけ試す</small></div>
          </div>
        </div>
        <div className="hiyori-counts" aria-label="今週のチームケア内訳">
          <a href="#hiyori-positive"><strong>4</strong><span>良い兆し</span><small>工夫を認めて共有</small></a>
          <a href="#hiyori-dialogue" className="is-check"><strong>3</strong><span>対話候補</span><small>本人へ事情を確認</small></a>
          <div><strong>3</strong><span>通常範囲</span><small>今週は見守る</small></div>
          <div><strong>2</strong><span>判定保留</span><small>データを待つ</small></div>
        </div>
      </section>

      <section className="hiyori-action" id="hiyori-action">
        <div className="hiyori-action-copy"><p className="section-index">02 / THIS WEEK</p><span>今週、管理職がやること</span><h2>3名に聞き、<br />1つの運用を変える。</h2><p>結論を持たずに事情を聞き、相談先の分散を1週間だけ試します。金曜に本人の実感と集団傾向を照合します。</p><div className="hiyori-prior-week"><span>LAST WEEK</span><p><strong>2名は通常範囲へ</strong>／1名は今週も継続確認 <small>デモ推移</small></p></div></div>
        <ol><li><span>月</span><div><strong>個別に聞く</strong><small>3名へ10分ずつ、最初の質問から</small></div></li><li><span>水</span><div><strong>相談先を分散</strong><small>曜日別の一次相談先を試す</small></div></li><li><span>金</span><div><strong>実感を確認</strong><small>データと本人の説明を照合</small></div></li></ol>
      </section>

      <section className="hiyori-pulse" id="hiyori-pulse">
        <header className="hiyori-section-head"><div><p className="section-index">03 / TEAM PULSE</p><h2>部署の変化を、会社全体と比べる</h2><small>個人の状態ではなく、チーム運営を見直すための集団傾向です。</small></div><span>全社82名・同期間のデモ集計</span></header>
        <div className="hiyori-comparison-list">
          <HiyoriComparisonRow label="上位3名への相談集中" team="27%" company="14%" teamWidth={100} companyWidth={52} delta="+13pt" note="相談先の偏りが大きい" />
          <HiyoriComparisonRow label="終業後作業が週2日以上" team="25%" company="13%" teamWidth={100} companyWidth={52} delta="+12pt" note="業務配分を確認" />
          <HiyoriComparisonRow label="1on1実施率" team="83%" company="72%" teamWidth={100} companyWidth={87} delta="+11pt" note="対話機会は確保" tone="positive" />
        </div>
        <p className="hiyori-comparison-note"><strong>比較の読み方</strong>平均との差は人の優劣ではありません。同期間の全社82名と比べ、管理職が事情を聞くテーマを絞るためのデモ値です。</p>
      </section>

      <section className="hiyori-dialogue" id="hiyori-dialogue">
        <header className="hiyori-section-head">
          <div><p className="section-index">04 / TALK NOW</p><h2>今週、先に話す<wbr />3名</h2><small>観測したことと、本人へ聞くことを分けて表示します。</small></div>
          <div className="hiyori-name-control"><small>個人表示：{showNames ? 'ON（デモ）' : 'OFF（初期値）'}</small><button type="button" aria-pressed={!showNames} onClick={() => setShowNames((current) => !current)}>{showNames ? '匿名表示に戻す' : 'デモで個人名を表示'}</button></div>
        </header>
        <div className="hiyori-privacy-note"><strong>初期値は匿名</strong><p>実運用はOFF開始を想定。個人名は利用目的、閲覧権限、社内ルールを合意したOEM先でのみ表示します。本人画面への開示範囲も導入前に要合意です。ボタンは商談用デモです。</p></div>
        <div className="hiyori-dialogue-list">
          {dialogueCandidates.map((item) => (
            <article className={`hiyori-dialogue-item is-${item.state}`} key={item.name}>
              <header><div><strong>{showNames ? item.name : item.anonymous}</strong><small>第三営業部</small></div><span>{item.label}</span></header>
              <dl><div><dt>観測したこと</dt><dd>{item.observation}</dd></div><div><dt>{item.state === 'positive' ? '本人に聞きたいこと' : item.state === 'pending' ? '扱い方' : '最初の質問'}</dt><dd>{item.question}</dd></div></dl>
              <small>根拠：{item.source}</small>
            </article>
          ))}
        </div>
      </section>

      <div className="hiyori-focus-grid" id="hiyori-positive">
        <section className="hiyori-focus is-positive">
          <header><p className="section-index">05 / KEEP</p><h2>続けたい、ログ上の良い変化</h2><small>4件から代表2件を表示</small></header>
          <div><strong>通知確認をまとめる工夫</strong><p>高橋さんは午後の集中ブロックが42分増加。本人の許可を得て、再現できる条件だけを共有します。</p></div>
          <div><strong>1on1後の差し戻し減少</strong><p>山本さんは相談のタイミングが整い、手戻りが減少。対話内容ではなく、進め方の工夫を確認します。</p></div>
        </section>
        <section className="hiyori-focus is-care">
          <header><p className="section-index">05 / CHANGE</p><h2>管理職が変える、チーム側の条件</h2></header>
          <div><strong>相談窓口を一人に寄せない</strong><p>曜日ごとに一次相談先を分け、3名への集中が下がるかを1週間確認します。</p></div>
          <div><strong>会議後の確認先を明示する</strong><p>会議終了時に「記録場所・決める人・期限」の3点を残し、個人の工夫に依存しない状態を作ります。</p></div>
        </section>
        <aside className="hiyori-hold-note"><span>判定保留 2名</span><p>観測日数や担当変更の影響で通常週と比較できません。今週は結論を出さず、データが揃うのを待ちます。</p></aside>
      </div>

      <section className="hiyori-data" id="hiyori-data">
        <header className="hiyori-section-head"><div><p className="section-index">APPENDIX / DATA & OEM</p><h2>表示する範囲と、OEM導入時の確認項目</h2><small>説明責任をロゴ差し替えだけにしないためのデモ仕様です。</small></div><span>人材会社向けサンプル</span></header>
        <div className="hiyori-data-grid"><div><span>観測スクリーンショット</span><strong>17,920枚</strong></div><div><span>対象</span><strong>12名</strong></div><div><span>有効観測日</span><strong>5日</strong></div><div><span>照合データ</span><strong>3系統</strong></div></div>
        <div className="hiyori-boundary-grid"><div><h3>この画面に表示する</h3><p>作業時間帯、相談・依頼の集中、予定表との重なり、前週からの変化、データ不足。ストレスチェック結果は利用データに含めません。</p></div><div><h3>この画面では判定しない</h3><p>健康状態、ストレス、意欲、能力、退職意向、人事評価。必要な支援は本人との対話から確認します。</p></div></div>
        <div className="hiyori-oem-legend"><p><strong>このデモで操作可能</strong>匿名／個人名の表示切替</p><p><strong>導入時に要合意</strong>以下は設定済み機能ではなく、OEM導入前に決める要件です。</p></div>
        <div className="hiyori-oem-requirements">
          <div><span>要合意｜ブランド</span><strong>提供名・ロゴ・色</strong><small>OEM先ごとに要件確認</small></div>
          <div><span>要合意｜利用データ</span><strong>ログ・予定表・依頼履歴</strong><small>利用目的と取得範囲を明示</small></div>
          <div><span>要合意｜個人表示</span><strong>初期OFF・権限でON</strong><small>組織ルールに合わせて設計</small></div>
          <div><span>要合意｜判定条件</span><strong>集計期間・閾値</strong><small>定義と根拠を説明可能に</small></div>
          <div><span>要合意｜閲覧管理</span><strong>権限・閲覧ログ・保持期間</strong><small>本デモには未実装。導入前に要件定義</small></div>
        </div>
        <SourceLinks sources={['ppc', 'mhlwStress']} />
      </section>

      <footer className="report-footer"><p><strong>利用目的</strong> 採用後・就業後のチーム支援と対話のきっかけに使用します。健康診断・個人順位・人事査定には使用しません。<br /><small>会社名・氏名・数値・経歴はすべてデモ用の架空設定です。ひよりのポートレートはAI生成画像です。</small></p><a href="#hiyori-data">表示範囲を確認</a></footer>
    </div>
  );
}

function HiyoriComparisonRow({ label, team, company, teamWidth, companyWidth, delta, note, tone = 'care' }: { label: string; team: string; company: string; teamWidth: number; companyWidth: number; delta: string; note: string; tone?: 'care' | 'positive' }) {
  return (
    <article className={`hiyori-comparison-row is-${tone}`}>
      <div><h3>{label}</h3><p><strong>{delta}</strong>{note}</p></div>
      <div className="hiyori-comparison-bars"><div><span>第三営業部</span><i><b className="team-bar" data-chart-motion style={{ width: `${teamWidth}%` }} /></i><strong>{team}</strong></div><div><span>全社平均</span><i><b className="company-bar" data-chart-motion style={{ width: `${companyWidth}%` }} /></i><strong>{company}</strong></div></div>
    </article>
  );
}

function HiyoriStaffReport() {
  const [feedback, setFeedback] = useState<'close' | 'different' | 'context' | null>(null);
  const feedbackLabels = {
    close: '実感に近い',
    different: '少し違う',
    context: '事情を補足したい',
  } as const;

  useEffect(() => {
    const charts = Array.from(document.querySelectorAll<HTMLElement>('[data-chart-motion]'));
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    charts.forEach((chart) => chart.classList.add('motion-ready'));
    if (reducedMotion) {
      charts.forEach((chart) => chart.classList.add('is-visible'));
      return;
    }
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          (entry.target as HTMLElement).classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.24 });
    charts.forEach((chart) => observer.observe(chart));
    return () => observer.disconnect();
  }, []);

  return (
    <div className="report-page hiyori-report hiyori-self-report">
      <aside className="hiyori-oem-strip" aria-label="OEMサンプル表示">
        <span>OEM SAMPLE</span><strong>サンプル人材｜セルフケア週報</strong><small>powered by WORKLOG INSIGHT</small>
      </aside>

      <header className="report-title hiyori-title hiyori-self-title">
        <div><p>MY WEEK / WEEK 35</p><h1>田中さんのチームワーク週報</h1><span>評価のためではなく、自分に合う働き方と相談のタイミングを見つける本人専用レポートです。</span></div>
        <dl><div><dt>表示対象</dt><dd>田中さん本人</dd></div><div><dt>集計期間</dt><dd>2026.08.25 — 08.31</dd></div></dl>
      </header>

      <ReportActions audience="staff" title="田中さんのチームワーク週報" />

      <nav className="report-toc hiyori-toc hiyori-self-toc" aria-label="ひよりスタッフ本人向けレポート内メニュー">
        <a href="#hiyori-self-summary"><span>01</span>今週</a>
        <a href="#hiyori-self-type"><span>02</span>あなたの型</a>
        <a href="#hiyori-self-comparison"><span>03</span>部署・全社</a>
        <a href="#hiyori-self-reflection"><span>04</span>良い点・注意</a>
        <a href="#hiyori-self-next"><span>05</span>来週の一歩</a>
        <a href="#hiyori-self-data"><span>A</span>データ</a>
      </nav>

      <section className="hiyori-self-hero" id="hiyori-self-summary">
        <div className="hiyori-self-hero-copy">
          <p className="section-index">01 / YOUR WEEK</p>
          <div className="hiyori-hero-advisor"><HiyoriAvatar /><div><span>HIYORI&apos;S NOTE</span><strong>ひよりと振り返る、あなたの今週</strong></div></div>
          <h2>助ける力が、<br /><em>抱え込む形にならないように。</em></h2>
          <p>今週は、チーム内の相談・レビュー依頼の27%が田中さんに集まりました。頼られていることは明確な強みです。一方、木曜午後に依頼が重なり、自分の提案作成が終業後へ移った日があります。来週は「相談に応える力」を残しながら、自分の時間も守れる形を一つだけ試します。</p>
          <small>今週のデモログから見える傾向です。性格・心身・能力・成果を判定するものではありません。</small>
        </div>
        <div className="hiyori-self-kpis" aria-label="今週の主な特徴">
          <a href="#hiyori-self-comparison"><span>相談・レビューの集中</span><strong>27%</strong><small>部署平均 15% ／ 全社 11%</small></a>
          <a href="#hiyori-self-comparison" className="is-care"><span>まとまった集中時間</span><strong>8.2<small>h</small></strong><small>部署平均より −2.2h</small></a>
          <a href="#hiyori-self-next" className="is-care"><span>終業後の入力</span><strong>4<small>日</small></strong><small>前週より +2日</small></a>
        </div>
      </section>

      <section className="hiyori-self-type" id="hiyori-self-type">
        <header className="hiyori-section-head"><div><p className="section-index">02 / YOUR STYLE</p><h2>あなたは「頼られるハブ型」</h2><small>性格診断ではなく、今週の仕事の流れにつけた仮の名前です。</small></div><span>本人の実感を優先</span></header>
        <div className="hiyori-self-type-grid">
          <div className="hiyori-self-type-main"><strong>頼られるハブ型</strong><p>相談への初動が早く、レビューを止めないため、周囲の仕事を前へ進めています。依頼が短時間に重なると、自分の作業を夕方以降へ送りやすい傾向も見えます。</p></div>
          <dl><div><dt>活きている強み</dt><dd>相談を受け止め、次の判断を早く返せる</dd></div><div><dt>崩れやすい条件</dt><dd>木曜午後にレビュー依頼が連続する</dd></div><div><dt>来週のキーワード</dt><dd>時間を決める・分ける・相談する</dd></div></dl>
        </div>
        <div className="hiyori-self-flow" aria-label="本人向けの振り返りフロー">
          <p>NOTICE → SHARE → TRY</p>
          <div><span>1</span><strong>気づく</strong><small>今週の変化を見る</small></div>
          <div><span>2</span><strong>伝える</strong><small>自分の事情を補足する</small></div>
          <div><span>3</span><strong>試す</strong><small>1週間だけ変える</small></div>
        </div>
        <div className="hiyori-self-feedback" aria-live="polite">
          <div><strong>この見立ては、あなたの実感に近いですか？</strong><small>AIの推測より、本人の説明を優先します。</small></div>
          <div className="hiyori-self-feedback-actions">
            {(Object.keys(feedbackLabels) as Array<keyof typeof feedbackLabels>).map((key) => <button type="button" className={feedback === key ? 'selected' : ''} aria-pressed={feedback === key} onClick={() => setFeedback(key)} key={key}>{feedbackLabels[key]}</button>)}
          </div>
          {feedback && <p>「{feedbackLabels[feedback]}」を選びました。<span>このデモでは回答を保存・送信しません。</span></p>}
        </div>
      </section>

      <section className="hiyori-self-comparison" id="hiyori-self-comparison">
        <header className="hiyori-section-head"><div><p className="section-index">03 / YOU, TEAM &amp; COMPANY</p><h2>自分・所属部署・全社を、同じ尺度で比べる</h2><small>順位づけではなく、今週の働き方に合う相談や調整を見つける比較です。</small></div><span>同期間のデモ集計</span></header>
        <div className="hiyori-self-comparison-list">
          <HiyoriSelfComparisonRow label="相談・レビューの集中" self="27%" department="15%" company="11%" selfWidth={100} departmentWidth={56} companyWidth={41} finding="頼られる一方、依頼先が偏っています。" />
          <HiyoriSelfComparisonRow label="まとまった集中時間" self="8.2h" department="10.4h" company="11.2h" selfWidth={73} departmentWidth={93} companyWidth={100} finding="自分の提案作成時間が少なめです。" tone="care" />
          <HiyoriSelfComparisonRow label="終業後の入力日数" self="4日" department="2.1日" company="1.6日" selfWidth={100} departmentWidth={53} companyWidth={40} finding="入力が遅い時間へ移る日が多めです。" tone="care" />
        </div>
        <p className="hiyori-comparison-note"><strong>比較の読み方</strong>平均との差は良し悪しではありません。担当案件や勤務形態、突発対応など、ログに映らない事情を含めて本人が意味を確かめます。</p>
      </section>

      <section className="hiyori-self-reflection" id="hiyori-self-reflection">
        <header className="hiyori-section-head"><div><p className="section-index">04 / GOOD &amp; CARE</p><h2>良かったことと、少し気をつけたいこと</h2><small>強みを消さずに、負担が生まれる条件だけを調整します。</small></div></header>
        <div className="hiyori-self-reflection-grid">
          <div className="is-good"><span>KEEP</span><h3>周囲の仕事を止めない初動</h3><p>レビュー依頼への初回反応は平均18分。部署平均の34分より早く、相談者が次の仕事へ進みやすい状態をつくれています。</p></div>
          <div className="is-good"><span>KEEP</span><h3>確認の質が安定</h3><p>再確認になった依頼は前週より3件減少。速さだけでなく、相手が判断できる返し方ができています。</p></div>
          <div className="is-care"><span>CARE</span><h3>木曜午後に依頼が集中</h3><p>13〜16時にレビューが7件続き、提案作成のまとまりが途切れました。依頼を断るより、受ける時間を決める方が強みを活かせそうです。</p></div>
          <div className="is-care"><span>CARE</span><h3>自分の入力が終業後へ移動</h3><p>4日で合計2時間05分の入力が終業後に発生。案件量だけでなく、相談対応後の工程を上司と一緒に確認する候補です。</p></div>
        </div>
      </section>

      <section className="hiyori-self-next" id="hiyori-self-next">
        <div className="hiyori-self-next-copy"><p className="section-index">05 / NEXT WEEK</p><span>来週は、これだけ</span><h2>木曜13〜15時を、<br />提案作成の時間として先に確保。</h2><p>レビュー依頼は12時までに集め、緊急でない分は15時以降にまとめます。うまくいったかは処理件数だけで決めず、「相談に応えながら自分の仕事も進めやすかったか」を金曜に振り返ります。</p></div>
        <ol><li><span>月</span><div><strong>上司へ共有</strong><small>木曜の集中枠を宣言</small></div></li><li><span>木</span><div><strong>2時間だけ試す</strong><small>緊急相談は例外にする</small></div></li><li><span>金</span><div><strong>実感で振り返る</strong><small>続けるか自分で決める</small></div></li></ol>
      </section>

      <section className="hiyori-self-data" id="hiyori-self-data">
        <header className="hiyori-section-head"><div><p className="section-index">APPENDIX / YOUR DATA</p><h2>この画面で見ること、決めないこと</h2><small>本人向け画面の説明責任も、OEM導入条件に含めます。</small></div><span>本人専用</span></header>
        <div className="hiyori-data-grid"><div><span>観測スクリーンショット</span><strong>2,842枚</strong></div><div><span>対象</span><strong>本人1名</strong></div><div><span>有効観測日</span><strong>5日</strong></div><div><span>比較対象</span><strong>部署・全社</strong></div></div>
        <div className="hiyori-boundary-grid"><div><h3>この画面に表示する</h3><p>作業時間帯、相談・依頼の集中、まとまった作業時間、前週からの変化、匿名化した部署・全社平均を表示します。</p></div><div><h3>この画面だけでは決めない</h3><p>健康状態、ストレス、性格、能力、意欲、人事評価は判定しません。本人の説明と、担当・予定・勤務形態を優先します。</p></div></div>
        <div className="hiyori-self-sharing"><strong>OEM導入時に要合意</strong><p>本人の回答を誰と共有するか、管理職画面に何を表示するか、保存期間と訂正方法を導入企業ごとに決めます。本デモの回答は保存・送信されません。</p></div>
        <SourceLinks sources={['ppc', 'mhlwStress']} />
      </section>

      <footer className="report-footer"><p><strong>利用目的</strong> 本人が働き方を振り返り、上司との相談や小さな改善へつなげるための画面です。個人順位・人事査定には使用しません。<br /><small>会社名・氏名・数値はすべてデモ用の架空設定です。ひよりのポートレートはAI生成画像です。</small></p><a href="#hiyori-self-data">データ利用方針</a></footer>
    </div>
  );
}

function HiyoriSelfComparisonRow({ label, self, department, company, selfWidth, departmentWidth, companyWidth, finding, tone = 'strength' }: { label: string; self: string; department: string; company: string; selfWidth: number; departmentWidth: number; companyWidth: number; finding: string; tone?: 'strength' | 'care' }) {
  return (
    <article className={`hiyori-self-comparison-row is-${tone}`}>
      <div><h3>{label}</h3><p>{finding}</p></div>
      <div className="hiyori-self-comparison-bars">
        <div><span>あなた</span><i><b className="self-bar" data-chart-motion style={{ width: `${selfWidth}%` }} /></i><strong>{self}</strong></div>
        <div><span>第三営業部</span><i><b className="department-bar" data-chart-motion style={{ width: `${departmentWidth}%` }} /></i><strong>{department}</strong></div>
        <div><span>全社平均</span><i><b className="company-bar" data-chart-motion style={{ width: `${companyWidth}%` }} /></i><strong>{company}</strong></div>
      </div>
    </article>
  );
}

function StaffReport() {
  const report = reports.staff;
  const [feedback, setFeedback] = useState<'yes' | 'partly' | 'context' | null>(null);
  const feedbackLabels = {
    yes: '実感に近い',
    partly: '少し違う',
    context: '事情を補足したい',
  } as const;

  return (
    <div className="report-page staff-report">
      <header className="report-title staff-title">
        <div><p>{report.code}</p><h1>今週の働き方レポート</h1><span>数字を評価にするのではなく、うまくいった条件と来週の小さな一歩を見つけます。</span></div>
        <dl><div><dt>表示対象</dt><dd>本人専用画面</dd></div><div><dt>集計期間</dt><dd>{report.period}</dd></div></dl>
      </header>

      <ReportActions audience="staff" title="今週の働き方レポート" />

      <nav className="report-toc staff-toc" aria-label="本人向けレポート内メニュー">
        <a href="#staff-summary"><span>01</span>今週</a>
        <a href="#staff-type"><span>02</span>タイプ</a>
        <a href="#staff-comparison"><span>03</span>部署・全社</a>
        <a href="#staff-good"><span>04</span>良かったこと</a>
        <a href="#staff-care"><span>05</span>気をつけること</a>
        <a href="#staff-next"><span>06</span>来週</a>
        <a href="#staff-data"><span>A</span>データ</a>
      </nav>

      <section className="taku-intro staff-intro">
        <TakuAvatar />
        <div><span>YOUR WORK ADVISOR</span><h2>拓です。今週の働き方を一緒に振り返ります。</h2><p>今週は、長く働くのではなく、午前に仕事をまとめることで集中のリズムを作れていました。良し悪しを決めつけず、来週も再現できそうな条件を見ていきましょう。</p></div>
      </section>

      <section className="staff-hero" id="staff-summary">
        <div className="staff-hero-copy">
          <p className="section-index">01 / THIS WEEK</p>
          <span className="staff-week-label">今週のあなた</span>
          <h2>午前に集中をつくる<br /><em>「リズム先行型」</em></h2>
          <p>集中時間は前週より3時間12分増え、作業切り替えは18回減りました。火曜・木曜の午前にまとまった時間を確保できたことが、変化と関連している可能性があります。</p>
          <small>※今週のログから見える傾向です。性格・能力・成果を判定するものではありません。</small>
        </div>
        <div className="staff-kpis" aria-label="今週の主な変化">
          <div><span>集中時間</span><strong>12:40</strong><b className="is-positive">前週より +3:12</b></div>
          <div><span>作業切り替え</span><strong>164<small>回</small></strong><b className="is-positive">前週より −18回</b></div>
          <div><span>今週の業務</span><strong>38:20</strong><b>前週より −1:10</b></div>
        </div>
      </section>

      <section className="staff-type" id="staff-type">
        <header className="staff-section-head"><div><p className="section-index">02 / YOUR STYLE</p><h2>あなたは、こんな働き方が合うタイプ</h2></div><span>今週の傾向</span></header>
        <div className="staff-type-grid">
          <div className="staff-type-main">
            <strong>リズム先行型</strong>
            <p>予定の中にまとまった時間があると、集中へ入りやすいタイプです。一方、確認依頼が細かく続く日は、ペースを戻すまでに時間がかかりやすい傾向があります。</p>
          </div>
          <dl>
            <div><dt>力を出しやすい条件</dt><dd>午前に2時間ほどのまとまりがある</dd></div>
            <div><dt>崩れやすい条件</dt><dd>午後に確認や返信が細かく重なる</dd></div>
            <div><dt>来週のキーワード</dt><dd>守る・まとめる・振り返る</dd></div>
          </dl>
        </div>
        <div className="staff-feedback" aria-live="polite">
          <div><strong>この見立ては、あなたの実感に近いですか？</strong><small>本人の実感を、AIの推測より優先します。</small></div>
          <div className="staff-feedback-actions">
            {(Object.keys(feedbackLabels) as Array<keyof typeof feedbackLabels>).map((key) => <button type="button" className={feedback === key ? 'selected' : ''} aria-pressed={feedback === key} onClick={() => setFeedback(key)} key={key}>{feedbackLabels[key]}</button>)}
          </div>
          {feedback && <p>「{feedbackLabels[feedback]}」を選択しました。<span>デモ画面のため、この回答は送信・保存されません。</span></p>}
        </div>
      </section>

      <section className="staff-comparison" id="staff-comparison">
        <header className="staff-section-head"><div><p className="section-index">03 / TEAM &amp; COMPANY</p><h2>所属部署・全社と比べた、今週のあなた</h2><small>個人名や順位ではなく、匿名化した平均との違いから自分の特徴を見ます。</small></div><span>デモ集計</span></header>
        <div className="staff-comparison-list">
          <StaffComparisonRow label="集中時間の割合" self="33.0%" department="29.1%" company="27.0%" selfWidth={100} departmentWidth={88} companyWidth={82} note="部署・全社平均より高く、まとまった作業時間を作れています。" />
          <StaffComparisonRow label="作業切り替え" self="164回" department="176回" company="190回" selfWidth={86} departmentWidth={93} companyWidth={100} note="部署・全社平均より少なく、今週は中断を比較的抑えられています。" />
          <StaffComparisonRow label="業務時間" self="38:20" department="39:10" company="40:05" selfWidth={96} departmentWidth={98} companyWidth={100} note="長時間化せずに、部署平均を上回る集中比率を確保できました。" />
        </div>
        <p className="staff-comparison-note">所属部署・全社平均は同じ集計期間のモデル値です。職種・担当・勤務形態の違いがあるため、優劣や人事評価には使用しません。</p>
      </section>

      <div className="staff-reflection-grid">
        <section className="staff-reflection staff-good" id="staff-good">
          <header><p className="section-index">04 / GOOD</p><h2>今週、良かったこと</h2></header>
          <ol>
            <li><span>01</span><div><strong>集中できる時間を増やせた</strong><p>勤務時間を増やさず、集中時間は前週より3時間12分増えました。</p></div></li>
            <li><span>02</span><div><strong>切り替えを18回減らせた</strong><p>作業をまとめたことで、細かな中断から戻る回数を抑えられています。</p></div></li>
            <li><span>03</span><div><strong>木曜日のリズムが特に安定</strong><p>木曜は集中時間3.5時間、切り替え24回で、今週最もまとまりのある一日でした。</p></div></li>
          </ol>
        </section>

        <section className="staff-reflection staff-care" id="staff-care">
          <header><p className="section-index">05 / CARE</p><h2>少し気をつけたいこと</h2></header>
          <ol>
            <li><span>01</span><div><strong>水曜日は切り替えが多め</strong><p>42回と今週最多で、集中時間も1.6時間に留まりました。午後の確認依頼が影響した可能性があります。</p></div></li>
            <li><span>02</span><div><strong>金曜日はレビュー対応が増加</strong><p>自分の仕事と依頼対応を交互に進めています。返信する時間を決めると、ペースを守りやすくなりそうです。</p></div></li>
          </ol>
          <small>悪い評価ではありません。予定変更や担当業務など、ログに映らない事情があれば本人の説明を優先します。</small>
        </section>
      </div>

      <section className="staff-pattern" aria-label="曜日別の集中時間">
        <header className="staff-section-head"><div><p className="section-index">WEEKLY RHYTHM</p><h2>1週間のリズム</h2><small>棒の高さは集中時間、下の数字は作業切り替え回数です。</small></div></header>
        <div className="staff-rhythm-chart">
          {selfDailyPatterns.map((item) => <div className="staff-rhythm-day" key={item.day}><div className="staff-rhythm-bar"><strong>{item.focus.toFixed(1)}h</strong><i className="chart-bar-y" data-chart-motion style={{ height: `${item.focus / 4 * 100}%` }} /></div><b>{item.day}</b><small>{item.switches}回</small></div>)}
        </div>
      </section>

      <section className="staff-next" id="staff-next">
        <div className="staff-next-lead"><p className="section-index">06 / NEXT WEEK</p><span>来週は、これだけ</span><h2>火曜・木曜の9〜11時を<br />先に予定へ入れてみましょう。</h2><p>緊急でないチャット確認は、この時間の前後にまとめます。全部を変えず、まず1週間だけ試して、金曜日に自分の実感と照らし合わせれば十分です。</p></div>
        <div className="staff-next-steps">
          <div><span>1</span><strong>予定を確保</strong><small>火・木 9:00–11:00</small></div>
          <div><span>2</span><strong>通知をまとめる</strong><small>緊急連絡は除く</small></div>
          <div><span>3</span><strong>自分で振り返る</strong><small>金曜に5分だけ</small></div>
        </div>
      </section>

      <section className="staff-data" id="staff-data">
        <header className="staff-section-head"><div><p className="section-index">APPENDIX / YOUR DATA</p><h2>この画面のデータについて</h2><small>何を見て、何を決めないかを明示します。</small></div><span>本人向け</span></header>
        <div className="staff-data-grid">
          <div><span>観測スクリーンショット</span><strong>2,842枚</strong></div><div><span>対象端末</span><strong>本人1台</strong></div><div><span>有効観測日</span><strong>5日</strong></div><div><span>比較対象</span><strong>前週・部署・全社</strong></div>
        </div>
        <div className="staff-data-copy">
          <div><h3>数字の定義</h3><p>集中時間は同じ作業がまとまって続いた時間、作業切り替えは主なアプリ・作業カテゴリが変わった回数です。日別時間は0.1時間単位で丸めています。</p></div>
          <div><h3>この画面だけでは決めないこと</h3><p>能力、意欲、健康状態、人事評価は判定しません。管理者には個人画面ではなく、目的に応じた別の集計画面が表示されます。</p></div>
        </div>
        <SourceLinks sources={['ppc']} />
      </section>

      <footer className="report-footer"><p><strong>分析用途</strong> 自分の働き方を振り返り、無理のない改善を試すための画面です。個人ランキング・人事査定には使用しません。</p><a href="#staff-data">データ利用方針</a></footer>
    </div>
  );
}

function StaffComparisonRow({ label, self, department, company, selfWidth, departmentWidth, companyWidth, note }: { label: string; self: string; department: string; company: string; selfWidth: number; departmentWidth: number; companyWidth: number; note: string }) {
  return (
    <article className="staff-comparison-row">
      <div><h3>{label}</h3><p>{note}</p></div>
      <div className="staff-comparison-bars">
        <div><span>あなた</span><i><b className="self-bar" data-chart-motion style={{ width: `${selfWidth}%` }} /></i><strong>{self}</strong></div>
        <div><span>所属部署</span><i><b className="department-bar" data-chart-motion style={{ width: `${departmentWidth}%` }} /></i><strong>{department}</strong></div>
        <div><span>全社平均</span><i><b className="company-bar" data-chart-motion style={{ width: `${companyWidth}%` }} /></i><strong>{company}</strong></div>
      </div>
    </article>
  );
}

function SummaryDial({ audience }: { audience: Audience }) {
  const item = audience === 'executive'
    ? { value: 14.7, label: '改善余地', note: '業界平均 10.2% ／ +4.5pt' }
    : audience === 'manager'
      ? { value: 14.6, label: '改善候補', note: '業界平均 10.8% ／ +3.8pt' }
      : { value: 33.0, label: '集中時間', note: '同職種平均 27.0% ／ +6.0pt' };
  return (
    <a className="summary-dial-wrap" href="#time-mix" aria-label={`${item.label} ${item.value.toFixed(1)}%。業務時間の構成へ移動`}>
      <div className="summary-dial chart-ring" data-chart-motion style={{ backgroundImage: `conic-gradient(#1f64c8 0 ${item.value}%, #dce4ec ${item.value}% 100%)` }}>
        <div><strong>{item.value.toFixed(1)}%</strong><span>{item.label}</span></div>
      </div>
      <p>{item.note}</p>
      <b aria-hidden="true">↓</b>
    </a>
  );
}

function ReportActions({ audience, title, shareNote }: { audience: Audience; title: string; shareNote?: string }) {
  function shareByEmail() {
    const subject = `【ワークログ・インサイト】${audienceLabels[audience]}向けレポート`;
    const body = `${title}\n\nレポートはこちらから確認できます。\n${window.location.href}\n\n※閲覧権限が必要です。${shareNote ? `\n※${shareNote}` : ''}`;
    window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  }
  return (
    <aside className="report-actions" aria-label="レポートの保存と共有">
      <p><strong>保存・共有</strong><span>PDFは印刷画面から保存できます</span>{shareNote ? <small>メールは端末の作成画面を開くのみ。送信・宛先管理・履歴保存は行いません。</small> : null}</p>
      <div>
        <button type="button" onClick={() => window.print()}><b aria-hidden="true">↓</b>PDFで保存</button>
        <button type="button" onClick={shareByEmail}><b aria-hidden="true">✉</b>メールで送付</button>
      </div>
    </aside>
  );
}

function TakuAvatar({ compact = false }: { compact?: boolean }) {
  return (
    <span className={`taku-profile-shell${compact ? ' compact' : ''}`}>
      <button type="button" className="taku-avatar" aria-label="拓のプロフィールを表示">
        <img src={`${process.env.NEXT_PUBLIC_BASE_PATH ?? ''}/taku-consultant-v2.png`} alt="" width="96" height="96" /><i />
      </button>
      <span className="taku-profile-card" role="tooltip">
        <span className="profile-kicker">AI CONSULTANT PROFILE</span>
        <strong>拓（Taku）</strong>
        <em>業務改善コンサルタント</em>
        <dl>
          <div><dt>経歴</dt><dd>製造業の現場改善12年、SaaS導入支援7年という設定。付箋よりログを見る派。</dd></div>
          <div><dt>得意</dt><dd>会議後の転記、質問の集中、名もなき手戻りを見つけること。</dd></div>
          <div><dt>休日</dt><dd>喫茶店の行列を勝手に工程分析。自分の机だけは改善バックログが増えがち。</dd></div>
        </dl>
        <b>※人物・経歴はAIによる架空設定です</b>
      </span>
    </span>
  );
}

function HiyoriAvatar({ compact = false }: { compact?: boolean }) {
  return (
    <span className={`taku-profile-shell hiyori-profile-shell${compact ? ' compact' : ''}`}>
      <button type="button" className="taku-avatar hiyori-avatar" aria-label="ひよりのプロフィールを表示">
        <img src={`${process.env.NEXT_PUBLIC_BASE_PATH ?? ''}/hiyori-consultant.png`} alt="" width="96" height="96" /><i />
      </button>
      <span className="taku-profile-card hiyori-profile-card" role="tooltip">
        <span className="profile-kicker">AI CONSULTANT PROFILE</span>
        <strong>ひより（Hiyori）</strong>
        <em>組織ケア・対話設計パートナー</em>
        <dl>
          <div><dt>経歴</dt><dd>人材会社の定着支援8年、組織開発6年という架空設定。数字より先に質問を整える派。</dd></div>
          <div><dt>得意</dt><dd>良い変化を見逃さず、決めつけない声かけとチーム側の改善へつなげること。</dd></div>
          <div><dt>休日</dt><dd>植物の新芽を毎朝観察。伸びた理由を考えすぎて、水やりを忘れそうになる。</dd></div>
        </dl>
        <b>※人物・経歴はAIによる架空設定です</b>
      </span>
    </span>
  );
}

function KeiAvatar({ compact = false }: { compact?: boolean }) {
  return (
    <span className={`taku-profile-shell kei-profile-shell${compact ? ' compact' : ''}`}>
      <button type="button" className="taku-avatar kei-avatar" aria-label="慧のプロフィールを表示">
        <img src={`${process.env.NEXT_PUBLIC_BASE_PATH ?? ''}/kei-consultant.png`} alt="" width="96" height="96" /><i />
      </button>
      <span className="taku-profile-card kei-profile-card" role="tooltip">
        <span className="profile-kicker">AI CONSULTANT PROFILE</span>
        <strong>慧（Kei）</strong>
        <em>AI業務設計パートナー</em>
        <dl>
          <div><dt>経歴</dt><dd>BPR支援9年、業務システム設計6年という架空設定。ツール名より先に承認者を聞く派。</dd></div>
          <div><dt>得意</dt><dd>AIへ任せる下書き、人が決める判断、失敗した時に止める条件を一枚に描くこと。</dd></div>
          <div><dt>休日</dt><dd>コーヒー豆の在庫補充は自動化済み。でも「今日は何を飲むか」だけは毎朝ちゃんと悩む。</dd></div>
        </dl>
        <b>※人物・経歴はAIによる架空設定です</b>
      </span>
    </span>
  );
}

function SourceLinks({ sources }: { sources: SourceKey[] }) {
  if (!sources.length) return null;
  return (
    <div className="source-links"><span>参考データ</span>{sources.map((key) => {
      const source = sourceLibrary[key];
      return <a key={key} href={source.url} target="_blank" rel="noreferrer"><strong>{source.label}</strong><small>{source.note}</small></a>;
    })}</div>
  );
}

function TakuTalk({ title, children, sources = [] }: { title: string; children: ReactNode; sources?: SourceKey[] }) {
  return <aside className="taku-talk"><div><span className="talk-label">拓の推定結論</span><strong>{title}</strong><p>{children}</p><SourceLinks sources={sources} /></div></aside>;
}

function ExecutiveRiskAlerts() {
  return (
    <section className="risk-alerts" id="risk-watch" aria-label="経営リスクアラート">
      <header className="chapter-head">
        <div><p className="section-index">05 / RISK WATCH</p><h2>経営判断前に確認する5件</h2><small>社員の不正・不調を断定するものではなく、追加確認の優先順位です。</small></div>
        <div className="risk-counts"><strong>5</strong><span>高 2件<br />中 3件</span></div>
      </header>
      <div className="risk-disclaimer"><strong>すべて未確認の推定です</strong><p>画面上の兆候だけで本人を処分・評価しません。業務目的、監査ログ、勤怠、本人説明を担当部門が照合してから判定します。</p></div>
      <div className="risk-grid">
        {executiveAlerts.map((alert, index) => (
          <details className={alert.level === 'high' ? 'is-high' : ''} key={alert.title} open={index === 0}>
            <summary>
              <span className="risk-no">{String(index + 1).padStart(2, '0')}</span>
              <b className={alert.level}>{alert.level === 'high' ? '高' : '中'}</b>
              <span className="risk-summary-copy"><em>{alert.category}</em><strong>{alert.title}</strong><small>{alert.targets} ／ {alert.scope}</small></span>
              <i aria-hidden="true">＋</i>
            </summary>
            <dl><div><dt>観測</dt><dd>{alert.signal}</dd></div><div><dt>推定</dt><dd>{alert.inference}</dd></div><div><dt>確認</dt><dd>{alert.verify}</dd></div></dl>
          </details>
        ))}
      </div>
      <SourceLinks sources={['ppc', 'cisa', 'mhlw']} />
    </section>
  );
}

function DecisionFlow({ audience }: { audience: Audience }) {
  const flows = {
    executive: [
      ['兆候を抽出', 'ログから改善・リスク候補を整理'],
      ['事実を確認', '本人・勤怠・監査ログを照合'],
      ['小さく検証', '2部門で4週間だけ運用変更'],
      ['継続を判断', '時間・手戻り・現場感で判定'],
    ],
    manager: [
      ['候補を絞る', '負荷と切り替えの変化を確認'],
      ['本人に聞く', '1on1でデータとの差を確認'],
      ['1週間試す', '担当分散を限定運用'],
      ['続けるか決める', '手戻りと対応速度で判定'],
    ],
    staff: [
      ['良い時間を知る', '集中できた曜日を確認'],
      ['一つだけ選ぶ', '無理のない行動に絞る'],
      ['1週間試す', '予定と通知を少し調整'],
      ['自分で決める', '実感とデータを照合'],
    ],
  } as const;
  return (
    <div className="decision-flow" aria-label="改善判断の流れ">
      {flows[audience].map(([title, description], index) => (
        <div key={title}><span>{String(index + 1).padStart(2, '0')}</span><strong>{title}</strong><small>{description}</small></div>
      ))}
    </div>
  );
}

function CompanyCases() {
  return (
    <section className="company-cases" aria-label="他社の参考事例">
      <div className="company-case-lead">
        <p className="section-index">REFERENCE CASES</p>
        <h2>他社では、情報共有の整理から効果を測っています。</h2>
        <span>以下はベンダー公開事例です。業種・規模・導入条件が異なるため、自社効果の保証や直接比較には使用しません。</span>
      </div>
      <div className="company-case-grid">
        {companyCases.map((item) => (
          <a href={item.url} target="_blank" rel="noreferrer" key={item.company}>
            <span>{item.company}</span>
            <strong>{item.result}</strong>
            <p>{item.takeaway}</p>
            <small>{item.source} ↗</small>
          </a>
        ))}
      </div>
    </section>
  );
}

function BenchmarkSection({ audience }: { audience: Audience }) {
  const benchmark = benchmarks[audience];
  return (
    <section className="benchmark-section" aria-label="自社全体と業界平均との比較">
      <div className="benchmark-lead chapter-head">
        <p className="section-index">02 / BENCHMARK</p>
        <h2>自社全体を、業界平均と比べる</h2>
        <small>{benchmark.conclusion}</small>
        <p>{benchmark.title}</p>
      </div>
      <div className="benchmark-grid">
        {benchmark.items.map((item) => (
          <article className={item.tone === 'risk' ? 'is-alert' : ''} key={item.label}>
            <div className="benchmark-name"><span>{item.label}{item.tone === 'risk' && <i className="alert-mark" aria-label="要確認">!</i>}</span><b className={item.tone}>{item.delta}</b></div>
            <div className="benchmark-values"><p><small>自社全体</small><strong>{item.ours}</strong></p><i /><p><small>業界モデル平均</small><strong>{item.benchmark}</strong></p></div>
            <h3>{item.insight}</h3>
          </article>
        ))}
      </div>
      <footer><strong>{benchmark.comparison}</strong><span>業種・従業員規模・集計条件を揃えた場合にだけ、経営判断の参考として使用します。</span></footer>
    </section>
  );
}

function EvidenceSection({ audience, guide }: { audience: Audience; guide: string }) {
  const items = audience === 'executive'
    ? [['観測スクリーンショット', '146,880枚'], ['対象端末', '82台'], ['有効観測日', '20日'], ['カレンダー照合', '1,248件']]
    : audience === 'manager'
      ? [['観測スクリーンショット', '21,460枚'], ['対象端末', '12台'], ['有効観測日', '5日'], ['本人確認予定', '3名']]
      : [['観測スクリーンショット', '2,842枚'], ['対象端末', '本人1台'], ['有効観測日', '5日'], ['比較対象', '前週の自分']];
  return (
    <section className="evidence-section" id="evidence">
      <div className="section-head chapter-head appendix-head"><div><p className="section-index">APPENDIX / EVIDENCE</p><h2>分析の根拠と読み方</h2><small>数値の出所と、このレポートだけでは決めないことを明示します。</small></div><span>判断条件を明示</span></div>
      <TakuTalk title="数字の背景も確認できます。" sources={guideSources.evidence}>{guide}</TakuTalk>
      {audience === 'executive' && <div className="evidence-verdict"><strong>4系統の根拠を照合</strong><span>画面146,880枚 × 82台 × 20日 × 予定表1,248件</span></div>}
      <div className={`evidence-grid${audience === 'executive' ? ' evidence-grid-featured' : ''}`}>{items.map(([label, value]) => <div key={label}><span>{label}</span><strong>{value}</strong></div>)}</div>
      <div className="evidence-copy"><h3>このレポートで行っていること</h3><p>稼働中に取得した画面データから、利用アプリ、作業の継続、切り替え、会議予定との重なりを集計しています。内容の意味はAIが推定するため、重要な判断では本人確認と業務ルールの確認を組み合わせます。</p><h3>このレポートだけでは決めないこと</h3><p>人事評価、懲戒、健康状態の断定、個人の能力順位には使用しません。データ不足や業務上の事情がある場合は「判定保留」とし、確認後に分析へ反映します。</p></div>
    </section>
  );
}

function PeoplePatterns({ audience, guide }: { audience: Audience; guide: string }) {
  const [sort, setSort] = useState<EmployeeSort>('attention');
  const [showAll, setShowAll] = useState(false);

  if (audience === 'staff') {
    return (
      <section className="people-section self-patterns" id="my-pattern">
        <div className="people-heading chapter-head">
          <div><p className="section-index">04 / MY PATTERN</p><h2>日別のワークパターン</h2><small>他の従業員と比べず、自分の変化だけを確認します。</small></div>
          <p>自分の変化だけを確認</p>
        </div>
        <TakuTalk title="自分の変化だけを見ます。" sources={guideSources.people}>{guide}</TakuTalk>
        <div className="self-focus-chart" aria-label="曜日別の集中時間グラフ">
          <div className="chart-axis"><span>4h</span><span>2h</span><span>0h</span></div>
          <div className="focus-columns">
            {selfDailyPatterns.map((item) => <div className="focus-column" key={item.day}><div><strong>{item.focus.toFixed(1)}h</strong><i className="chart-bar-y" data-chart-motion style={{ height: `${item.focus / 4 * 100}%` }} /></div><span>{item.day}</span></div>)}
          </div>
        </div>
        <div className="self-day-list">
          {selfDailyPatterns.map((item) => (
            <article className="self-day" key={item.day}>
              <div className="self-date"><strong>{item.day}</strong><span>{item.date}</span></div>
              <div className="self-focus"><span>集中時間</span><strong>{item.focus.toFixed(1)}h</strong></div>
              <div className="self-switch"><span>切替回数</span><strong>{item.switches}回</strong></div>
              <div className="self-highlight"><i className={`status-dot ${item.tone}`} /><span>{item.highlight}</span></div>
            </article>
          ))}
        </div>
      </section>
    );
  }

  const visibleEmployees = audience === 'manager'
    ? employeeProfiles.filter((employee) => employee.dept === '第三営業部')
    : employeeProfiles;
  const sortedEmployees = [...visibleEmployees].sort((a, b) => {
    if (sort === 'load') return b.hours - a.hours;
    if (sort === 'focus') return b.focus - a.focus;
    if (sort === 'change') return Math.abs(b.change) - Math.abs(a.change);
    return b.attention - a.attention;
  });
  const displayedCount = audience === 'executive' && !showAll ? 6 : sortedEmployees.length;

  return (
    <section className="people-section" id="people-pattern">
      <div className="people-heading chapter-head">
        <div>
          <p className="section-index">04 / PEOPLE PATTERN</p>
          <h2>{audience === 'manager' ? '第三営業部の従業員別傾向' : '従業員別ワークパターン'}</h2>
          <small>順位ではなく、状況を確認する順番を整理します。</small>
        </div>
          <p>{displayedCount} / {sortedEmployees.length}名を表示</p>
      </div>
      <TakuTalk title="一覧は、声をかける順番です。" sources={guideSources.people}>{guide}</TakuTalk>
      <WorkloadOverview employees={sortedEmployees} audience={audience} />
      <div className="people-sort" role="tablist" aria-label="従業員一覧の並び順">
        {(Object.keys(employeeSortLabels) as EmployeeSort[]).map((key) => (
          <button key={key} role="tab" aria-selected={sort === key} className={sort === key ? 'selected' : ''} onClick={() => setSort(key)}>
            {employeeSortLabels[key]}
          </button>
        ))}
      </div>
      <div className="people-table" role="table" aria-label="従業員別ワークパターン">
        <div className="people-table-head" role="row">
          <span role="columnheader">従業員 / 部門</span><span role="columnheader">現在の傾向</span><span role="columnheader">主な業務</span><span role="columnheader">業務時間</span><span role="columnheader">集中時間</span><span role="columnheader">切替</span><span role="columnheader">前週差</span>
        </div>
        {sortedEmployees.map((employee, index) => (
          <article className={`employee-row${audience === 'executive' && !showAll && index >= 6 ? ' is-collapsed' : ''}`} role="row" key={`${employee.dept}-${employee.name}`}>
            <div className="employee-name" role="cell"><strong>{employee.name}</strong><span>{employee.dept}・{employee.role}</span></div>
            <div className="employee-signal" role="cell"><span><i className={`status-dot ${employee.tone}`} />{employee.signal}</span><small>{employee.insight}</small></div>
            <span className="employee-primary" role="cell">{employee.primary}</span>
            <b data-label="業務時間" role="cell">{employee.hours.toFixed(1)}h</b>
            <b data-label="集中時間" role="cell">{employee.focus.toFixed(1)}h</b>
            <b data-label="切替" role="cell">{employee.switches}回</b>
            <b data-label="前週差" className={employee.change > 8 ? 'change-up' : employee.change < 0 ? 'change-down' : ''} role="cell">{employee.change > 0 ? '+' : ''}{employee.change.toFixed(1)}%</b>
          </article>
        ))}
      </div>
      {audience === 'executive' && sortedEmployees.length > 6 && (
        <button className="people-more" type="button" aria-expanded={showAll} onClick={() => setShowAll((current) => !current)}>
          {showAll ? '上位6名に戻す' : `残り${sortedEmployees.length - 6}名を表示`}
        </button>
      )}
      <footer className="people-note"><span>表示について</span><p>スクリーンショットから推定した傾向です。人事評価には使用せず、本人確認と業務改善のきっかけとして扱います。</p></footer>
    </section>
  );
}

function WorkloadOverview({ employees, audience }: { employees: typeof employeeProfiles; audience: Exclude<Audience, 'staff'> }) {
  const averageHours = employees.reduce((sum, employee) => sum + employee.hours, 0) / employees.length;
  const averageFocus = employees.reduce((sum, employee) => sum + employee.focus, 0) / employees.length;
  const highLoad = employees.filter((employee) => employee.hours >= 48).length;
  const modelAverage = audience === 'manager' ? { hours: '44.0h', focus: '12.6h' } : { hours: '43.2h', focus: '11.8h' };
  return (
    <div className="workload-overview">
      <div className="workload-copy">
        <p>WORKLOAD DISTRIBUTION</p>
        <h3>業務時間と負荷の分布</h3>
        <dl>
          <div><dt>平均業務時間</dt><dd>{averageHours.toFixed(1)}h</dd></div>
          <div><dt>平均集中時間</dt><dd>{averageFocus.toFixed(1)}h</dd></div>
          <div><dt>48時間以上</dt><dd>{highLoad}名</dd></div>
        </dl>
        <small className="workload-benchmark">業界平均　業務 {modelAverage.hours} ／ 集中 {modelAverage.focus}</small>
      </div>
      <div className="workload-chart" aria-label="従業員別の業務時間グラフ">
        <small className="workload-scale-note">0h起点 ／ 上限52h</small>
        <div className="workload-grid"><span>52h</span><span>26h</span><span>0h</span></div>
        <div className="workload-bars">
          {employees.map((employee) => (
            <div className={`workload-bar${employee.hours >= 48 ? ' is-alert' : ''}`} key={`${employee.dept}-${employee.name}`} title={`${employee.name} ${employee.hours.toFixed(1)}時間`}>
              <div className="workload-bar-plot"><i data-chart-motion className={`${employee.hours >= 48 ? 'alert' : employee.tone === 'green' ? 'good' : ''} chart-bar-y`} style={{ height: `${Math.max(2, Math.min(100, employee.hours / 52 * 100))}%` }} /></div>
              <span>{employee.name}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function PendingReport({ consultant, audience, onBack }: { consultant: (typeof consultants)[number]; audience: Audience; onBack: () => void }) {
  return (
    <div className="report-page pending-page">
      <div className="report-context">
        <span>{consultant.role}</span><strong>{consultant.name.slice(0, 1)}</strong><i /><p>{audienceLabels[audience]}向け</p>
      </div>
      <section className="pending-card">
        <p>NEXT SAMPLE</p>
        <h1>{consultant.name}の分析レポートは次回制作します</h1>
        <span>現在は「拓／業務改善コンサルタント」の3画面を確認できます。</span>
        <button onClick={onBack}>拓のサンプルを見る</button>
      </section>
    </div>
  );
}
