import Image from "next/image";
import Link from "next/link";

const STEPS = [
  { number: "1", title: "학생 정보 입력", description: "학교·학년과 필요한 과목을 간단히 알려주세요." },
  { number: "2", title: "멘토 검토", description: "검증된 KAIST 선생님이 신청 내용을 확인합니다." },
  { number: "3", title: "첫 상담 연결", description: "자녀에게 맞는 선생님과 첫 상담을 연결합니다." },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white text-slate-950">
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
          <Link href="/" className="text-xl font-bold tracking-tight text-blue-700">카이멘토</Link>
          <nav className="hidden items-center gap-8 text-sm font-semibold text-slate-600 md:flex">
            <a href="#process" className="hover:text-slate-950">이용 방법</a>
            <Link href="/apply" className="hover:text-slate-950">학부모 신청</Link>
            <a href="#teachers" className="hover:text-slate-950">선생님 안내</a>
          </nav>
          <div className="flex items-center gap-2 sm:gap-3">
            <Link href="/apply" className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-blue-700">무료 멘토 추천</Link>
            <Link href="/teacher/login" className="hidden rounded-xl border border-blue-200 px-4 py-2.5 text-sm font-semibold text-blue-700 hover:bg-blue-50 sm:inline-flex">선생님 로그인</Link>
          </div>
        </div>
      </header>

      <main>
        <section className="overflow-hidden border-b border-slate-200">
          <div className="mx-auto grid max-w-7xl lg:grid-cols-[0.92fr_1.08fr]">
            <div className="flex flex-col justify-center px-4 py-16 sm:px-6 sm:py-20 lg:min-h-[500px] lg:py-14 lg:pr-10">
              <h1 className="max-w-2xl text-4xl font-bold leading-[1.16] tracking-tight text-slate-950 sm:text-5xl lg:text-[3.15rem]">
                우리 아이에게 맞는<br />KAIST 선생님을 만나보세요
              </h1>
              <p className="mt-6 max-w-lg text-base leading-7 text-slate-600 sm:text-lg">
                학부모 회원가입 없이 간단히 신청하면, 세종 지역 수학·과학 멘토를 연결해드립니다.
              </p>
              <div className="mt-8 flex flex-col items-start gap-4">
                <Link href="/apply" className="inline-flex rounded-xl bg-blue-600 px-7 py-4 text-base font-bold text-white shadow-[0_10px_25px_rgba(37,99,235,0.2)] transition hover:-translate-y-0.5 hover:bg-blue-700">무료로 멘토 추천 받기</Link>
                <Link href="/mentor-signup" className="text-sm font-semibold text-blue-700 hover:underline">선생님으로 시작하기 →</Link>
              </div>
              <p className="mt-7 flex items-center gap-2 text-xs font-medium text-slate-600"><span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-50 text-emerald-700">✓</span>멘토 추천·매칭 수수료 0원 · 영업일 24시간 이내 연락</p>
            </div>
            <div className="relative min-h-[360px] bg-slate-100 sm:min-h-[460px] lg:min-h-[500px]">
              <Image src="/images/mentor-study-hero.png" alt="선생님과 학생이 함께 수학 문제를 풀고 있는 모습" fill priority sizes="(max-width: 1024px) 100vw, 54vw" className="object-cover" />
            </div>
          </div>
        </section>

        <section id="process" className="scroll-mt-20 bg-slate-50 py-16 sm:py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <div className="grid gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
              <div>
                <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">간단한 신청, 꼼꼼한 매칭</h2>
                <div className="mt-8 grid gap-3 sm:grid-cols-3">
                  {STEPS.map((step) => (
                    <div key={step.number} className="relative rounded-2xl border border-slate-200 bg-white p-5">
                      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">{step.number}</span>
                      <h3 className="mt-5 font-bold text-slate-900">{step.title}</h3>
                      <p className="mt-2 text-sm leading-6 text-slate-600">{step.description}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
                <p className="text-lg font-bold text-slate-900">멘토 추천이 필요하신가요?</p>
                <p className="mt-3 text-sm leading-6 text-slate-600">
                  학부모 회원가입 없이 신청서를 작성하면, 학생의 학교·학년과 학습 상황을 검토해 적합한 KAIST 선생님을 추천해드립니다.
                </p>
                <Link href="/apply" className="mt-6 flex w-full justify-center rounded-xl bg-blue-600 px-5 py-3.5 text-sm font-bold text-white hover:bg-blue-700">멘토 추천 신청서 작성하기</Link>
              </div>
            </div>
          </div>
        </section>

        <section id="teachers" className="scroll-mt-20 border-y border-blue-100 bg-blue-50 py-16 sm:py-20">
          <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-[1fr_0.9fr] lg:items-center">
            <div>
              <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">KAIST 선생님이신가요?</h2>
              <p className="mt-4 max-w-xl text-sm leading-7 text-slate-600 sm:text-base">가입 후 상담 매칭 이용권을 구매하고 학생을 만나보세요. 이용권과 입금 확인 상태는 선생님 전용 화면에서 관리할 수 있습니다.</p>
              <div className="mt-7 flex flex-wrap gap-3">
                <Link href="/mentor-signup" className="rounded-xl bg-blue-600 px-6 py-3.5 text-sm font-bold text-white hover:bg-blue-700">선생님 회원가입</Link>
                <Link href="/teacher/login" className="rounded-xl border border-blue-200 bg-white px-6 py-3.5 text-sm font-bold text-blue-700 hover:bg-blue-50">선생님 로그인</Link>
              </div>
            </div>
            <div className="rounded-2xl border border-blue-200 bg-white p-7 shadow-sm sm:p-9">
              <p className="text-sm font-semibold text-slate-600">첫 상담 매칭 1회</p>
              <div className="mt-3 flex items-end gap-3"><span className="text-4xl font-bold tracking-tight text-emerald-700">10,000원</span><span className="pb-1 text-sm text-slate-400 line-through">20,000원</span></div>
              <p className="mt-4 text-sm font-semibold text-blue-700">기간 한정 · 선생님당 1회</p>
              <p className="mt-2 text-xs leading-5 text-slate-500">로그인 후 3회·5회·10회 묶음 이용권과 할인율을 확인할 수 있습니다.</p>
            </div>
          </div>
        </section>

        <section className="py-14 sm:py-16">
          <div className="mx-auto grid max-w-5xl gap-3 px-4 sm:grid-cols-2 sm:px-6">
            <Link href="/apply" className="group flex items-center justify-between rounded-2xl bg-blue-600 p-7 text-white transition hover:-translate-y-0.5 hover:bg-blue-700"><div><p className="text-lg font-bold">학부모 신청</p><p className="mt-1 text-sm text-blue-100">회원가입 없이 간편 신청</p></div><span className="text-2xl transition group-hover:translate-x-1">→</span></Link>
            <Link href="/teacher/login" className="group flex items-center justify-between rounded-2xl bg-emerald-700 p-7 text-white transition hover:-translate-y-0.5 hover:bg-emerald-800"><div><p className="text-lg font-bold">선생님 로그인</p><p className="mt-1 text-sm text-emerald-100">기존 계정으로 로그인</p></div><span className="text-2xl transition group-hover:translate-x-1">→</span></Link>
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-200 py-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between sm:px-6"><span className="font-bold text-blue-700">카이멘토</span><span>© 2026 카이멘토 · 세종 KAIST 멘토 매칭</span></div>
      </footer>
    </div>
  );
}
