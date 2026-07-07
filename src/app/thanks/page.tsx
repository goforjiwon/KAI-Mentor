import Link from "next/link";

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
            신청이 잘 접수되었습니다.
          </h1>

          <p className="text-sm sm:text-base text-slate-600 leading-relaxed mb-6">
            작성해주신 내용을 바탕으로, 검증된 KAIST 재학생 수학·과학 멘토 중에서
            자녀분과 잘 맞을 것 같은 멘토를 골라 첫 미팅을 연결해 드리겠습니다.
          </p>

          <div className="bg-blue-50 border border-blue-200 rounded-xl p-5 text-left space-y-3 mb-8">
            <p className="flex items-start gap-2 text-sm text-slate-700">
              <span className="text-blue-500 shrink-0 mt-0.5">•</span>
              <span>
                <strong>보통 영업일 기준 24시간 이내</strong>에 문자로 연락을 드립니다.
              </span>
            </p>
            <p className="flex items-start gap-2 text-sm text-slate-700">
              <span className="text-blue-500 shrink-0 mt-0.5">•</span>
              <span>
                학부모님께서는 <strong>어떤 수수료도 내지 않으며</strong>, 자녀와 잘 맞는 멘토를
                찾을 때까지 여러 명의 KAIST 멘토를 차례로 만나보실 수 있습니다.
              </span>
            </p>
            <p className="flex items-start gap-2 text-sm text-slate-700">
              <span className="text-blue-500 shrink-0 mt-0.5">•</span>
              <span>
                시급과 과외비는, 마음에 드는 멘토와 직접 상의해서{" "}
                <strong>자유롭게 정하시면 됩니다.</strong>
              </span>
            </p>
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
        © 2025 카이멘토 (KAIMentor)
      </footer>
    </div>
  );
}
