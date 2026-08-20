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
  description: "세종 지역 KAIST 수학·과학 1:1 멘토 매칭. 학습 고민과 가능한 시간을 알려주시면 무료 상담 후 수업 조건에 맞는 선생님을 찾아드립니다.",
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
