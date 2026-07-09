import Link from "next/link";

const STEPS = [
  {
    n: "01",
    title: "자녀 수학·과학 정보 입력",
    desc: "학년, 과목, 성적, 목표를 간단히 적어주세요. 이름·학교 정보는 필요 없습니다.",
  },
  {
    n: "02",
    title: "KAIST 멘토가 신청 내용 확인",
    desc: "검증된 KAIST 재학생 멘토가 자녀 상황을 꼼꼼히 검토합니다.",
  },
  {
    n: "03",
    title: "학부모와 멘토 첫 미팅 연결",
    desc: "운영자가 직접 골라 문자로 연락드립니다. 보통 영업일 24시간 이내.",
  },
  {
    n: "04",
    title: "마음에 드는 멘토와 과외 시작",
    desc: "시급과 방식은 멘토와 자유롭게 직접 협의하시면 됩니다.",
  },
];

const WHY = [
  {
    title: "학부모님 비용 부담 0원",
    desc: "신청, 매칭, 첫 미팅 연결까지 학부모님께는 어떤 수수료도 청구하지 않습니다. 시급은 멘토와 직접 자유롭게 정하시면 됩니다.",
  },
  {
    title: "검증된 KAIST 재학생만",
    desc: "이공계 최상위권 대학인 KAIST 재학생 멘토만 연결합니다. 수학·과학 개념 이해와 문제풀이를 가장 잘 아는 사람들입니다.",
  },
  {
    title: "여러 멘토를 부담 없이 만나보세요",
    desc: "한 명이 맞지 않으면 다른 멘토를 다시 연결해드립니다. 자녀에게 딱 맞는 멘토를 찾을 때까지 제한 없이 만나볼 수 있습니다.",
  },
  {
    title: "세종 지역 특화",
    desc: "세종 지역 학생의 교육 환경과 내신·수능 특성을 이해하는 멘토 위주로 연결합니다.",
  },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* 헤더 */}
      <header className="border-b bg-white sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <span className="font-bold text-blue-700 text-lg tracking-tight">카이멘토</span>
          <nav className="flex items-center gap-3">
            <Link
              href="/mentor-signup"
              className="text-xs sm:text-sm font-medium text-slate-500 hover:text-slate-800 transition-colors"
            >
              선생님 등록
            </Link>
            <Link
              href="/apply"
              className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors"
            >
              신청하기
            </Link>
          </nav>
        </div>
      </header>

      {/* 히어로 */}
      <section className="py-16 sm:py-24 px-4 sm:px-6">
        <div className="max-w-3xl mx-auto text-center">
          <div className="flex flex-wrap justify-center gap-2 mb-6">
            {["학부모 수수료 0원", "KAIST 재학생 멘토", "세종 지역 전용", "수학·과학 전문"].map((tag) => (
              <span
                key={tag}
                className="bg-blue-100 text-blue-800 text-xs font-semibold px-3 py-1 rounded-full"
              >
                {tag}
              </span>
            ))}
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-slate-900 leading-tight mb-5">
            세종 지역 전용,
            <br />
            <span className="text-blue-600">검증된 KAIST 재학생</span>
            <br />
            수학·과학 1:1 멘토 매칭
          </h1>

          <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl mx-auto mb-8">
            자녀의 수학·과학 고민을 적어주시면, 검증된 KAIST 재학생 멘토 중에서 잘 맞는 멘토를 골라
            첫 미팅까지 연결해드립니다.{" "}
            <strong className="text-slate-800">학부모님께는 수수료가 없습니다.</strong>
          </p>

          <Link
            href="/apply"
            className="inline-flex items-center gap-2 bg-blue-600 text-white px-8 py-4 rounded-xl text-base font-semibold hover:bg-blue-700 transition-colors shadow-md"
          >
            자녀 수학·과학 고민 입력하고 멘토 추천 받기 →
          </Link>

          <p className="mt-3 text-xs text-slate-400">
            완전 무료 · 자녀 이름·학교 불필요 · 영업일 24시간 이내 연락
          </p>
        </div>
      </section>

      {/* 4단계 */}
      <section className="py-14 sm:py-20 px-4 sm:px-6 bg-white">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-1">이렇게 진행됩니다</h2>
            <p className="text-sm text-slate-500">신청부터 과외 시작까지, 딱 4단계</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {STEPS.map((s) => (
              <div
                key={s.n}
                className="border border-slate-200 rounded-xl p-5 bg-slate-50 hover:shadow-sm transition-shadow"
              >
                <div className="text-xs font-bold text-blue-600 mb-1">STEP {s.n}</div>
                <h3 className="font-semibold text-slate-800 text-sm mb-1">{s.title}</h3>
                <p className="text-xs text-slate-500 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 왜 카이멘토(KAIMentor) */}
      <section className="py-14 sm:py-20 px-4 sm:px-6">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 text-center mb-8">
            왜 카이멘토(KAIMentor)인가요?
          </h2>
          <div className="space-y-3">
            {WHY.map((item) => (
              <div
                key={item.title}
                className="flex gap-4 p-5 bg-white border border-slate-200 rounded-xl hover:shadow-sm transition-shadow"
              >
                <span className="text-blue-500 mt-0.5 shrink-0 text-lg">✓</span>
                <div>
                  <h3 className="font-semibold text-slate-800 text-sm mb-1">{item.title}</h3>
                  <p className="text-xs text-slate-500 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 하단 CTA */}
      <section className="py-14 sm:py-20 px-4 sm:px-6 bg-blue-600 text-white">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-xl sm:text-2xl font-bold mb-3">지금 바로 멘토 추천 신청하세요</h2>
          <p className="text-sm opacity-80 mb-8 leading-relaxed">
            자녀 이름·학교 정보 없이, 학년과 수학·과학 상황만 적어주시면 됩니다.
          </p>
          <Link
            href="/apply"
            className="inline-flex items-center gap-2 bg-white text-blue-700 px-8 py-4 rounded-xl font-semibold hover:bg-blue-50 transition-colors"
          >
            무료로 멘토 추천 받기 →
          </Link>
        </div>
      </section>

      {/* 푸터 */}
      <footer className="border-t py-6 px-4 text-center text-xs text-slate-400">
        © 2025 카이멘토 (KAIMentor) — 세종 KAIST 멘토 매칭
      </footer>
    </div>
  );
}
