import Image from "next/image";
import Link from "next/link";

type IconName = "chat" | "calendar" | "mentor" | "science" | "kaist";

const STEPS: Array<{
  number: string;
  title: string;
  description: string;
  icon: IconName;
}> = [
  {
    number: "1",
    title: "무료 상담 신청",
    description: "학생의 학습 고민과 가능한 시간을 알려주세요.",
    icon: "chat",
  },
  {
    number: "2",
    title: "학습·일정 상담",
    description: "과목·목표와 원하는 수업 일정을 함께 정합니다.",
    icon: "calendar",
  },
  {
    number: "3",
    title: "맞춤 멘토 연결",
    description: "조건에 맞는 KAIST 선생님과 수업을 시작합니다.",
    icon: "mentor",
  },
];

const TRUST_POINTS: Array<{ label: string; icon: IconName }> = [
  { label: "KAIST 재학생·졸업생", icon: "kaist" },
  { label: "수학·과학 전문", icon: "science" },
  { label: "희망 일정 맞춤", icon: "calendar" },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white text-slate-950">
      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-[1536px] items-center justify-between px-5 sm:px-8 lg:h-20 lg:px-14">
          <Link
            href="/"
              className="text-xl font-bold tracking-[-0.06em] text-blue-600 sm:text-2xl lg:text-[1.7rem]"
          >
            카이멘토
          </Link>

          <nav className="hidden items-center gap-9 text-sm font-semibold text-slate-800 md:flex">
            <a href="#process" className="transition hover:text-blue-600">
              이용 방법
            </a>
            <Link href="/apply" className="transition hover:text-blue-600">
              학부모 신청
            </Link>
            <a href="#teachers" className="transition hover:text-blue-600">
              선생님 안내
            </a>
          </nav>

          <Link
            href="/apply"
            className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-bold text-white shadow-[0_8px_20px_rgba(37,99,235,0.2)] transition hover:-translate-y-0.5 hover:bg-blue-700 sm:px-6 sm:py-3"
          >
            무료 상담
          </Link>
        </div>
      </header>

      <main>
        <section className="overflow-hidden border-b border-slate-200">
          <div className="mx-auto grid max-w-[1536px] lg:grid-cols-[47%_53%]">
            <div className="relative z-10 flex flex-col justify-center px-5 py-14 sm:px-8 sm:py-16 lg:min-h-[620px] lg:px-14 lg:py-16">
              <p className="text-base font-bold tracking-tight text-blue-600 sm:text-lg">
                세종 지역 KAIST 수학·과학 1:1
              </p>
              <h1 className="mt-5 max-w-[650px] text-[2.45rem] font-bold leading-[1.18] tracking-[-0.045em] text-slate-950 sm:text-5xl lg:w-[680px] lg:max-w-none lg:text-[3.25rem] xl:text-[3.65rem]">
                원하는 시간에, 우리 아이에게 딱 맞는 KAIST 선생님을 만나보세요
              </h1>
              <p className="mt-6 max-w-[610px] text-base leading-7 text-slate-600 sm:text-lg sm:leading-8">
                학습 고민과 가능한 시간을 알려주시면, 무료 상담 후 수업 조건에 맞는 KAIST 선생님을 찾아드립니다.
              </p>

              <div className="mt-8 max-w-[390px]">
                <Link
                  href="/apply"
                  className="group flex w-full items-center justify-center gap-5 rounded-xl bg-blue-600 px-7 py-4 text-base font-bold text-white shadow-[0_12px_30px_rgba(37,99,235,0.22)] transition hover:-translate-y-0.5 hover:bg-blue-700 sm:text-lg"
                >
                  무료 상담 신청하기
                  <ArrowIcon />
                </Link>
                <p className="mt-3 flex items-center gap-2 text-sm text-slate-500">
                  <ClockIcon />
                  회원가입 없이 1분 신청
                </p>
              </div>

              <div className="mt-7 flex flex-wrap gap-2.5">
                {TRUST_POINTS.map((point) => (
                  <div
                    key={point.label}
                    className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm font-semibold text-slate-800 shadow-[0_3px_12px_rgba(15,23,42,0.06)]"
                  >
                    <span className="text-blue-600">
                      <FeatureIcon name={point.icon} />
                    </span>
                    {point.label}
                  </div>
                ))}
              </div>
            </div>

            <div className="relative min-h-[390px] bg-slate-100 sm:min-h-[500px] lg:min-h-[620px]">
              <Image
                src="/images/mentor-study-hero.png"
                alt="KAIST 선생님과 학생이 함께 수학 문제를 풀고 있는 모습"
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 53vw"
                className="object-cover object-center"
              />
              <div className="pointer-events-none absolute inset-y-0 left-0 hidden w-24 bg-gradient-to-r from-white to-transparent lg:block" />

              <div className="absolute bottom-7 right-5 rounded-2xl border border-white/80 bg-white/95 px-5 py-4 shadow-[0_16px_38px_rgba(15,23,42,0.18)] backdrop-blur sm:bottom-10 sm:right-8 sm:min-w-[270px]">
                <p className="flex items-center gap-3 text-sm font-bold text-slate-900">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-white">
                    <CheckIcon />
                  </span>
                  희망 일정 확인
                </p>
                <p className="mt-3 flex items-center gap-3 text-sm font-bold text-slate-900">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-600 text-white">
                    <FeatureIcon name="calendar" />
                  </span>
                  월·수 19:00 수업 가능
                </p>
              </div>
            </div>
          </div>
        </section>

        <section id="process" className="scroll-mt-20 bg-white py-12 sm:py-12">
          <div className="mx-auto max-w-7xl px-5 sm:px-8">
            <h2 className="text-center text-3xl font-bold tracking-[-0.035em] text-slate-950 sm:text-4xl">
              상담 한 번으로, 수업 준비까지
            </h2>

            <div className="mt-11 grid gap-7 md:grid-cols-3 md:gap-0">
              {STEPS.map((step, index) => (
                <div key={step.number} className="relative flex gap-5 px-2 md:px-7">
                  <div className="relative shrink-0">
                    <span className="absolute -left-2 -top-2 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white shadow-sm">
                      {step.number}
                    </span>
                    <span className="flex h-24 w-24 items-center justify-center rounded-full border border-slate-200 bg-white text-blue-600 shadow-[0_8px_24px_rgba(15,23,42,0.08)] sm:h-28 sm:w-28">
                      <FeatureIcon name={step.icon} large />
                    </span>
                  </div>
                  <div className="pt-3">
                    <h3 className="text-lg font-bold text-slate-950">{step.title}</h3>
                    <p className="mt-3 text-sm leading-6 text-slate-600">{step.description}</p>
                  </div>
                  {index < STEPS.length - 1 && (
                    <span className="absolute -right-2 top-10 hidden text-slate-300 md:block" aria-hidden="true">
                      <ChevronIcon />
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="border-y border-blue-100 bg-blue-50 py-14 sm:py-16">
          <div className="mx-auto flex max-w-5xl flex-col items-start justify-between gap-6 px-5 sm:px-8 md:flex-row md:items-center">
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-slate-950">우리 아이 수업, 어디서부터 시작할지 고민되시나요?</h2>
              <p className="mt-3 text-sm leading-6 text-slate-600 sm:text-base">
                무료 상담에서 학습 고민과 가능한 시간을 함께 정리해드립니다.
              </p>
            </div>
            <Link
              href="/apply"
              className="group inline-flex shrink-0 items-center gap-3 rounded-xl bg-blue-600 px-6 py-3.5 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:bg-blue-700"
            >
              무료 상담 신청하기
              <ArrowIcon />
            </Link>
          </div>
        </section>

        <section id="teachers" className="scroll-mt-20 py-12">
          <div className="mx-auto flex max-w-5xl flex-col items-start justify-between gap-5 px-5 sm:px-8 md:flex-row md:items-center">
            <div>
              <h2 className="text-lg font-bold text-slate-900">KAIST 선생님이신가요?</h2>
              <p className="mt-2 text-sm text-slate-500">학생 매칭 이용 방식과 선생님 전용 안내를 확인할 수 있습니다.</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link href="/teacher-guide" className="rounded-xl border border-blue-200 px-5 py-3 text-sm font-bold text-blue-700 hover:bg-blue-50">
                선생님 안내
              </Link>
              <Link href="/teacher/login" className="rounded-xl border border-slate-300 px-5 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50">
                선생님 로그인
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-200 py-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-5 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <span className="font-bold text-blue-700">카이멘토</span>
          <span>© 2026 카이멘토 · 세종 KAIST 멘토 매칭</span>
        </div>
      </footer>
    </div>
  );
}

function FeatureIcon({ name, large = false }: { name: IconName; large?: boolean }) {
  const className = large ? "h-11 w-11" : "h-5 w-5";

  if (name === "calendar") {
    return (
      <svg aria-hidden="true" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
        <path strokeLinecap="round" strokeLinejoin="round" d="M7 3v3m10-3v3M4.5 9h15M5 5.5h14a1 1 0 0 1 1 1V20H4V6.5a1 1 0 0 1 1-1Z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 13h2m4 0h2m-8 4h2m4 0h2" />
      </svg>
    );
  }

  if (name === "chat") {
    return (
      <svg aria-hidden="true" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 4h14a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-7l-4.5 3v-3H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Z" />
        <path strokeLinecap="round" d="M8 10h.01M12 10h.01M16 10h.01" />
      </svg>
    );
  }

  if (name === "mentor") {
    return (
      <svg aria-hidden="true" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
        <circle cx="12" cy="7" r="3.5" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 21v-2.5a7 7 0 0 1 14 0V21H5Z" />
      </svg>
    );
  }

  if (name === "science") {
    return (
      <svg aria-hidden="true" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 3h6m-5 0v5l-5 9a2.5 2.5 0 0 0 2.2 4h9.6a2.5 2.5 0 0 0 2.2-4l-5-9V3" />
        <path strokeLinecap="round" d="M8 15h8" />
      </svg>
    );
  }

  return (
    <svg aria-hidden="true" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
      <path strokeLinecap="round" strokeLinejoin="round" d="m3 9 9-5 9 5-9 5-9-5Z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M7 12v4.5c2.8 2 7.2 2 10 0V12m4-3v6" />
    </svg>
  );
}

function ArrowIcon() {
  return (
    <svg aria-hidden="true" className="h-5 w-5 transition group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14m-5-5 5 5-5 5" />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg aria-hidden="true" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
      <circle cx="12" cy="12" r="9" />
      <path strokeLinecap="round" d="M12 7v5l3 2" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg aria-hidden="true" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.2">
      <path strokeLinecap="round" strokeLinejoin="round" d="m6 12 4 4 8-9" />
    </svg>
  );
}

function ChevronIcon() {
  return (
    <svg aria-hidden="true" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
      <path strokeLinecap="round" strokeLinejoin="round" d="m9 5 7 7-7 7" />
    </svg>
  );
}
