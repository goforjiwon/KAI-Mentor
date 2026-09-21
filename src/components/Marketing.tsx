import Link from "next/link";

export function MarketingIcon({ kind = "phone", className = "h-7 w-7" }: { kind?: "phone" | "book" | "check" | "chat" | "people"; className?: string }) {
  return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {kind === "phone" && <><path d="M7 3 4 4c-2 2 1 8 5 12s10 7 12 5l1-3-5-3-2 2c-3-1-6-4-7-7l2-2-3-5Z"/><path d="M14 3a8 8 0 0 1 7 7M14 7a4 4 0 0 1 3 3"/></>}
    {kind === "book" && <><rect x="5" y="3" width="14" height="18" rx="2"/><path d="M9 8h6M9 12h6M9 16h4"/></>}
    {kind === "check" && <><circle cx="12" cy="12" r="9"/><path d="m7 12 3 3 7-7"/></>}
    {kind === "chat" && <><path d="M5 4h14a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H9l-6 4V6a2 2 0 0 1 2-2Z"/><path d="M7 9h10M7 13h6"/></>}
    {kind === "people" && <><circle cx="12" cy="7" r="4"/><path d="M4 21v-3a8 8 0 0 1 16 0v3H4Z"/></>}
  </svg>;
}

export function MarketingHeader({ teacher = false }: { teacher?: boolean }) {
  return <header className="border-b border-slate-200 bg-white"><div className="mx-auto flex min-h-20 max-w-[1440px] flex-wrap items-center justify-between gap-4 px-5 py-4 sm:px-8 lg:px-16">
    <Link href="/" className="shrink-0 text-2xl font-bold tracking-[-0.06em] text-blue-600 sm:text-3xl">카이멘토</Link>
    <nav aria-label="주 메뉴" className="order-last flex w-full flex-wrap items-center justify-center gap-x-4 gap-y-2 border-t border-slate-100 pt-3 text-sm font-semibold text-slate-700 md:order-none md:w-auto md:gap-8 md:border-0 md:pt-0">{teacher ? <><Link href="/mentor-signup" className="py-2">선생님 지원</Link><a href="#process" className="py-2">이용 방법</a></> : <><a href="#process" className="py-2">이용 방법</a><a href="#care" className="py-2">정기 상담</a><Link href="/teacher-guide" className="rounded-lg bg-emerald-700 px-3 py-3 font-bold text-white hover:bg-emerald-800 md:rounded-none md:bg-transparent md:px-0 md:py-2 md:font-semibold md:text-slate-700 md:hover:bg-transparent md:hover:text-emerald-700">선생님 안내</Link></>}</nav>
    <div className="flex flex-wrap items-center gap-3 sm:gap-5">{teacher && <Link href="/teacher/login" className="text-sm font-semibold text-slate-600">로그인</Link>}<Link href={teacher ? "/mentor-signup" : "/apply"} className={`rounded-xl px-4 py-3 text-sm font-bold text-white sm:px-6 ${teacher ? "bg-emerald-700 hover:bg-emerald-800" : "bg-blue-600 hover:bg-blue-700"}`}>{teacher ? "선생님 등록" : "무료 상담"}</Link></div>
  </div></header>;
}

export function MarketingCTA({ teacher = false }: { teacher?: boolean }) {
  return <Link href={teacher ? "/mentor-signup" : "/apply"} className={`inline-flex w-full max-w-full items-center justify-center gap-3 rounded-xl px-5 py-4 sm:w-auto sm:gap-5 sm:px-7 text-base font-bold text-white shadow-sm transition-colors sm:text-lg ${teacher ? "bg-emerald-700 hover:bg-emerald-800" : "bg-blue-600 hover:bg-blue-700"}`}>{teacher ? "선생님으로 시작하기" : "첫 무료 상담 신청하기"}<span className="shrink-0" aria-hidden="true">→</span></Link>;
}

export function MarketingFooter({ teacher = false }: { teacher?: boolean }) {
  return <footer className="border-t border-slate-200 px-5 py-7 sm:px-8"><div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-5 text-xs text-slate-500"><Link href="/" className="text-lg font-bold text-blue-600">카이멘토</Link><span>© 2026 카이멘토 · {teacher ? "선생님 전용 안내" : "세종 KAIST 수학·과학 1:1"}</span><div className="flex gap-5"><a href="#process">이용 방법</a><Link href={teacher ? "/teacher/login" : "/teacher-guide"}>{teacher ? "선생님 로그인" : "선생님 안내"}</Link></div></div></footer>;
}
