import type { Metadata } from "next";
import { Noto_Sans_KR } from "next/font/google";
import "./globals.css";
import { Analytics } from '@vercel/analytics/react';

const notoSansKr = Noto_Sans_KR({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "카이멘토 (KAIMentor) — 세종 KAIST 멘토 매칭",
  description: "카이멘토(KAIMentor): 세종 지역 전용 KAIST 재학생 수학·과학 1:1 멘토 매칭 서비스. 멘토 추천·매칭 수수료 0원.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body className={notoSansKr.className}>{children}<Analytics /></body>
    </html>
  );
}
