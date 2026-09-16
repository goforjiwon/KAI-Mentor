import Link from "next/link";
import OfficialPaymentNotice from "@/components/OfficialPaymentNotice";

export default function ThanksPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* 헤더 */}
      <header className="border-b bg-white">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 h-14 flex items-center">
          <Link href="/" className="text-sm text-slate-500 hover:text-slate-800 transition-colors">
            ← 홈으로
          </Link>
        </div>
      </header>

      {/* 본문 */}
      <main className="flex-1 flex items-center justify-center px-4 sm:px-6 py-16">
        <div className="max-w-xl w-full text-center">
          {/* 체크 아이콘 */}
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center">
              <svg
                className="w-10 h-10 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-4">
            무료 상담 신청이 잘 접수되었습니다.
          </h1>

          <p className="text-sm sm:text-base text-slate-600 leading-relaxed mb-6">
            아래 버튼을 눌러 카이멘토 카카오톡 채널을 추가하고,
            신청자 성함을 메시지로 보내주세요. 신청 내용을 확인하고 상담을 이어가겠습니다.
          </p>

          <a
            href="https://pf.kakao.com/_TqcrX"
            target="_blank"
            rel="noopener noreferrer"
            className="flex w-full items-center justify-center rounded-xl bg-[#FEE500] px-6 py-4 text-base font-semibold text-slate-900 transition-colors hover:bg-[#FADA0A] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-slate-900"
          >
            카카오톡으로 상담 이어가기
          </a>
          <p className="mt-3 mb-8 text-sm text-slate-600 leading-relaxed">
            채널에서 채팅을 열고 “상담 신청한 ○○○입니다”라고 보내주세요.
          </p>

          <div className="bg-blue-50 border border-blue-200 rounded-xl p-5 text-left space-y-3 mb-8">
            <p className="flex items-start gap-2 text-sm text-slate-700">
              <span className="text-blue-500 shrink-0 mt-0.5">•</span>
              <span>
                보내주신 메시지를 확인한 뒤 <strong>보통 영업일 기준 24시간 이내</strong>에
                카이멘토 채널에서 답장드립니다.
              </span>
            </p>
            <p className="flex items-start gap-2 text-sm text-slate-700">
              <span className="text-blue-500 shrink-0 mt-0.5">•</span>
              <span>
                카카오톡으로 과목·목표·가능한 시간을 함께 정리하고, 필요하면 통화 일정을 조율합니다.
              </span>
            </p>
            <p className="flex items-start gap-2 text-sm text-slate-700">
              <span className="text-blue-500 shrink-0 mt-0.5">•</span>
              <span>
                <strong>상담 비용은 없습니다.</strong> 상담 후 수업 조건에 맞는 선생님과 첫 수업을 안내해드립니다.
              </span>
            </p>
          </div>

          <div className="mb-8 text-left">
            <OfficialPaymentNotice />
          </div>

          <Link
            href="/"
            className="inline-flex items-center gap-2 border border-slate-300 bg-white px-6 py-3 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
          >
            ← 홈으로 돌아가기
          </Link>
        </div>
      </main>

      <footer className="border-t py-5 px-4 text-center text-xs text-slate-400">
        © 2026 카이멘토 (KAIMentor)
      </footer>
    </div>
  );
}
