import Link from "next/link";
import { MATCHING_PLANS, formatWon } from "@/lib/pricing";

function CheckIcon() {
  return (
    <svg aria-hidden="true" className="h-4 w-4" fill="none" viewBox="0 0 20 20">
      <path d="m4 10 3.5 3.5L16 5.5" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
    </svg>
  );
}

export default function TeacherGuidePage() {
  return (
    <div className="min-h-screen bg-white text-slate-950">
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link href="/" className="text-xl font-bold tracking-tight text-blue-700">카이멘토</Link>
          <div className="flex items-center gap-2 sm:gap-3">
            <Link href="/teacher/login" className="rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50 hover:text-slate-950 sm:px-4">로그인</Link>
            <Link href="/mentor-signup" className="rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-emerald-700">선생님 등록</Link>
          </div>
        </div>
      </header>

      <main>
        <section className="border-b border-emerald-100 bg-emerald-50/70">
          <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:px-6 sm:py-20 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
            <div>
              <Link href="/" className="inline-flex items-center gap-1 text-sm font-semibold text-slate-500 hover:text-slate-900">← 역할 다시 선택</Link>
              <h1 className="mt-6 max-w-xl text-3xl font-bold leading-tight tracking-tight sm:text-4xl lg:text-5xl">
                KAIST 선생님으로<br />학생을 만나보세요
              </h1>
              <p className="mt-5 max-w-xl text-base leading-7 text-slate-600 sm:text-lg">
                선생님 계정을 만들고 상담 매칭 이용권을 통해 학습 도움이 필요한 세종 지역 학생과 연결됩니다.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link href="/mentor-signup" className="rounded-xl bg-emerald-600 px-6 py-3.5 text-center text-sm font-bold text-white shadow-[0_10px_25px_rgba(5,150,105,0.18)] hover:bg-emerald-700">선생님으로 시작하기</Link>
                <Link href="/teacher/login" className="rounded-xl border border-emerald-200 bg-white px-6 py-3.5 text-center text-sm font-bold text-emerald-700 hover:bg-emerald-50">기존 계정으로 로그인</Link>
              </div>
            </div>

            <div className="rounded-3xl border border-emerald-200 bg-white p-7 shadow-[0_22px_65px_rgba(5,150,105,0.10)] sm:p-9">
              <p className="text-sm font-semibold text-slate-600">첫 상담 매칭 1회</p>
              <div className="mt-3 flex flex-wrap items-end gap-x-3 gap-y-1">
                <span className="text-4xl font-bold tracking-tight text-emerald-700">10,000원</span>
                <span className="pb-1 text-sm text-slate-400 line-through">20,000원</span>
              </div>
              <p className="mt-4 text-sm font-bold text-blue-700">기간 한정 · 선생님당 1회</p>
              <ul className="mt-6 space-y-3 text-sm text-slate-600">
                <li className="flex items-center gap-2"><span className="text-emerald-600"><CheckIcon /></span>가입비 없이 이용권이 필요할 때만 구매</li>
                <li className="flex items-center gap-2"><span className="text-emerald-600"><CheckIcon /></span>로그인 후 구매와 입금 확인을 한곳에서 관리</li>
              </ul>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-20">
          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
            <div>
              <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">상담 매칭 이용권</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">학생 상담 연결에 사용하는 선생님 전용 이용권입니다.</p>
            </div>
            <p className="text-xs text-slate-500">결제 수단 · 계좌이체</p>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {MATCHING_PLANS.map((plan) => (
              <article key={plan.code} className="relative flex min-h-[270px] flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                {plan.code === "first" && (
                  <span className="absolute right-5 top-5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700">첫 이용</span>
                )}
                <h3 className="pr-14 text-lg font-bold">{plan.name}</h3>
                {"originalPrice" in plan ? (
                  <p className="mt-5 text-sm text-slate-400 line-through">{formatWon(plan.originalPrice)}</p>
                ) : (
                  <div className="mt-5 h-5" />
                )}
                <p className="mt-1 text-2xl font-bold tracking-tight text-blue-700">{formatWon(plan.price)}</p>
                <p className="mt-3 text-sm text-slate-600">회당 {formatWon(plan.unitPrice)}</p>
                <div className="mt-auto pt-6">
                  <p className="text-sm font-bold text-emerald-700">{plan.savingRate}% 절약</p>
                  <p className="mt-1 text-xs text-slate-500">{plan.description}</p>
                </div>
              </article>
            ))}
          </div>

          <div className="mt-10 flex flex-col items-center rounded-2xl bg-slate-50 px-5 py-7 text-center sm:px-8">
            <p className="font-bold text-slate-900">준비되셨다면 선생님 계정을 만들어주세요.</p>
            <p className="mt-2 text-sm text-slate-600">가입 후 전용 화면에서 이용권 구매와 학생 연결 현황을 관리할 수 있습니다.</p>
            <Link href="/mentor-signup" className="mt-5 rounded-xl bg-emerald-600 px-6 py-3.5 text-sm font-bold text-white hover:bg-emerald-700">선생님 등록하기</Link>
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-200 py-7">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <span className="font-bold text-blue-700">카이멘토</span>
          <span>© 2026 카이멘토 · 선생님 전용 안내</span>
        </div>
      </footer>
    </div>
  );
}
