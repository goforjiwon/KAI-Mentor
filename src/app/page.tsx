import Image from "next/image";
import Link from "next/link";

function ArrowIcon() {
  return (
    <svg aria-hidden="true" className="h-5 w-5" fill="none" viewBox="0 0 24 24">
      <path d="M5 12h14m-5-5 5 5-5 5" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
    </svg>
  );
}

function FamilyIcon() {
  return (
    <svg aria-hidden="true" className="h-7 w-7" fill="none" viewBox="0 0 24 24">
      <path d="M8.5 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm7.5-1a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5ZM3.5 19v-1.5a5 5 0 0 1 10 0V19m.5-6.3a4.5 4.5 0 0 1 6.5 4V18" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.7" />
    </svg>
  );
}

function TeacherIcon() {
  return (
    <svg aria-hidden="true" className="h-7 w-7" fill="none" viewBox="0 0 24 24">
      <path d="m3 8 9-4 9 4-9 4-9-4Z" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.7" />
      <path d="M7 10.2v4.3c0 1.6 2.2 3 5 3s5-1.4 5-3v-4.3M21 8v6" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.7" />
    </svg>
  );
}

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white text-slate-950">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link href="/" className="text-xl font-bold tracking-tight text-blue-700">
            카이멘토
          </Link>
          <p className="hidden text-sm font-medium text-slate-500 sm:block">
            세종 KAIST 수학·과학 멘토 매칭
          </p>
        </div>
      </header>

      <main>
        <section className="relative overflow-hidden border-b border-slate-200 bg-slate-50">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-56 bg-[radial-gradient(circle_at_top,_rgba(37,99,235,0.12),_transparent_68%)]" />
          <div className="relative mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-20 lg:py-24">
            <div className="mx-auto max-w-2xl text-center">
              <h1 className="text-3xl font-bold leading-tight tracking-tight text-slate-950 sm:text-4xl lg:text-5xl">
                어떤 분이신가요?
              </h1>
              <p className="mx-auto mt-4 max-w-xl text-base leading-7 text-slate-600 sm:text-lg">
                이용 목적에 맞는 화면으로 안내해드릴게요.
              </p>
            </div>

            <div className="mx-auto mt-10 grid max-w-4xl gap-5 md:grid-cols-2">
              <Link
                href="/apply"
                className="group relative flex min-h-[290px] flex-col overflow-hidden rounded-3xl border border-blue-200 bg-white p-7 shadow-[0_18px_55px_rgba(37,99,235,0.09)] transition duration-200 hover:-translate-y-1 hover:border-blue-400 hover:shadow-[0_22px_65px_rgba(37,99,235,0.16)] sm:p-8"
              >
                <div className="absolute inset-x-0 top-0 h-1.5 bg-blue-600" />
                <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-700">
                  <FamilyIcon />
                </span>
                <h2 className="mt-7 text-2xl font-bold tracking-tight text-slate-950">학부모 / 학생</h2>
                <p className="mt-3 text-sm leading-6 text-slate-600">
                  학습 상황을 알려주시면 우리 아이에게 맞는 KAIST 선생님을 추천해드립니다.
                </p>
                <span className="mt-auto flex items-center justify-between pt-8 font-bold text-blue-700">
                  멘토 추천 시작하기
                  <span className="transition-transform group-hover:translate-x-1"><ArrowIcon /></span>
                </span>
              </Link>

              <Link
                href="/teacher-guide"
                className="group relative flex min-h-[290px] flex-col overflow-hidden rounded-3xl border border-emerald-200 bg-white p-7 shadow-[0_18px_55px_rgba(5,150,105,0.08)] transition duration-200 hover:-translate-y-1 hover:border-emerald-400 hover:shadow-[0_22px_65px_rgba(5,150,105,0.14)] sm:p-8"
              >
                <div className="absolute inset-x-0 top-0 h-1.5 bg-emerald-600" />
                <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
                  <TeacherIcon />
                </span>
                <h2 className="mt-7 text-2xl font-bold tracking-tight text-slate-950">선생님</h2>
                <p className="mt-3 text-sm leading-6 text-slate-600">
                  학생 매칭 이용 방식과 선생님 전용 비용 안내를 확인하고 시작할 수 있습니다.
                </p>
                <span className="mt-auto flex items-center justify-between pt-8 font-bold text-emerald-700">
                  선생님 안내 보기
                  <span className="transition-transform group-hover:translate-x-1"><ArrowIcon /></span>
                </span>
              </Link>
            </div>

            <p className="mt-8 text-center text-sm text-slate-500">
              학부모·학생의 멘토 추천 및 매칭 수수료는 무료입니다.
            </p>
          </div>
        </section>

        <section className="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:px-6 md:grid-cols-[1fr_1.15fr] md:items-center sm:py-16">
          <div>
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">검증된 KAIST 선생님과 만나요</h2>
            <p className="mt-4 max-w-lg text-sm leading-7 text-slate-600 sm:text-base">
              세종 지역 학생의 학교·학년과 학습 고민을 확인해 수학·과학 멘토를 연결합니다. 회원가입 없이 간단히 신청할 수 있습니다.
            </p>
          </div>
          <div className="relative min-h-[230px] overflow-hidden rounded-3xl bg-slate-100 sm:min-h-[290px]">
            <Image
              src="/images/mentor-study-hero.png"
              alt="선생님과 학생이 함께 수학 문제를 풀고 있는 모습"
              fill
              sizes="(max-width: 768px) 100vw, 55vw"
              className="object-cover"
            />
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-200 py-7">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <span className="font-bold text-blue-700">카이멘토</span>
          <span>© 2026 카이멘토 · 세종 KAIST 멘토 매칭</span>
        </div>
      </footer>
    </div>
  );
}
