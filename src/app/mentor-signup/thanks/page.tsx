import Link from "next/link";

export default function MentorSignupThanksPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="border-b bg-white">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 h-14 flex items-center">
          <Link href="/" className="text-sm text-slate-500 hover:text-slate-800 transition-colors">
            ← 홈으로
          </Link>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-4 sm:px-6 py-16">
        <div className="max-w-xl w-full text-center">
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
            등록이 완료되었습니다.
          </h1>

          <p className="text-sm sm:text-base text-slate-600 leading-relaxed mb-8">
            운영자가 확인 후 연락드리겠습니다.
          </p>

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
