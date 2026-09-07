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
  cisa: { label: 'CISA｜Insider Threat Mitigation Guide', note: '兆候は脅威の確定を意味せず、文脈を含む追加確認が必要', url: 'https://www.cisa.gov/sites/default/files/2022-11/Insider%20Threat%20Mitigation%20Guide_Final_508.pdf' },
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
                onClick={() => setConsultantId(item.id)}
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
        {consultantId === 'taku' ? (
          <TakuReport audience={audience} />
        ) : (
          <PendingReport consultant={consultant} audience={audience} onBack={() => setConsultantId('taku')} />
        )}
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

function ReportActions({ audience, title }: { audience: Audience; title: string }) {
  function shareByEmail() {
    const subject = `【ワークログ・インサイト】${audienceLabels[audience]}向けレポート`;
    const body = `${title}\n\nレポートはこちらから確認できます。\n${window.location.href}\n\n※閲覧権限が必要です。`;
    window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  }
  return (
    <aside className="report-actions" aria-label="レポートの保存と共有">
      <p><strong>保存・共有</strong><span>PDFは印刷画面から保存できます</span></p>
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
