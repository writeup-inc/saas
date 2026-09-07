import type { Metadata } from 'next';
import './globals.css';

const publicUrl = 'https://writeup-inc.github.io/saas/worklog-insight-taku-sample/';

export const metadata: Metadata = {
  metadataBase: new URL(publicUrl),
  title: 'ワークログ・インサイト｜コンサルタントサンプル',
  description:
    'スクリーンショットログから業務改善の示唆を届ける、ワークログ・インサイトの管理画面サンプルです。',
  robots: { index: false, follow: false },
  openGraph: {
    title: 'ワークログ・インサイト｜拓サンプル',
    description: '業務改善コンサルタント「拓」の経営層・管理職・スタッフ本人向け分析画面。',
    url: publicUrl,
    images: [{ url: `${publicUrl}og.png`, width: 1731, height: 909, alt: 'ワークログ・インサイト 管理画面サンプル' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ワークログ・インサイト｜拓サンプル',
    description: '業務改善コンサルタント「拓」の3階層向け分析画面。',
    images: [`${publicUrl}og.png`],
  },
  alternates: { canonical: publicUrl },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  );
}
