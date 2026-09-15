import type { Metadata } from "next";
import Image from "next/image";
import { MarketingCTA, MarketingFooter, MarketingHeader, MarketingIcon } from "@/components/Marketing";

export const metadata: Metadata = {
  title: "카이멘토 — 세종 KAIST 수업과 월 1회 학부모님 상담",
  description: "세종 전용 KAIST 수학·과학 1:1 수업과 카이멘토의 월 1회 학부모님 전화 상담. 선생님 연결 이후에도 학습 상황을 확인하고 필요한 조정을 함께합니다.",
};
const careSteps = [["수업 상황 확인", "선생님의 관찰과 가정에서의 변화를 함께 확인합니다."], ["필요한 조정", "숙제·진도·학습 고민을 선생님과 조율합니다."], ["다음 상담에서 확인", "합의한 조정 사항이 반영되었는지 다음 상담에서 확인합니다."]];

export default function HomePage() {
  return <div className="min-h-screen bg-white text-slate-950"><MarketingHeader /><main>
    <section className="border-b border-slate-100"><div className="mx-auto grid max-w-[1440px] lg:grid-cols-[47%_53%]">
      <div className="flex flex-col justify-center px-5 py-10 sm:px-8 sm:py-14 lg:px-16">
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-blue-600"><span className="text-4xl font-bold tracking-tight sm:text-[2.65rem]">세종 전용</span><span className="text-base font-bold">KAIST 수학·과학 1:1</span></div>
        <h1 className="mt-5 text-[2.15rem] font-bold leading-[1.3] tracking-[-0.055em] sm:text-[2.8rem] xl:text-[3rem]">선생님의 수업에,<br /><span className="text-blue-600">카이멘토의 꼼꼼한</span><br />학습 관리까지.</h1>
        <p className="mt-6 text-base leading-8 text-slate-600">KAIST 선생님과의 1:1 수업과<br />월 1회 학부모님 전화 상담을 함께 제공합니다.</p>
        <p className="mt-5 flex w-fit items-center gap-2 rounded-xl bg-blue-50 px-4 py-3 text-sm font-bold text-blue-600"><MarketingIcon className="h-5 w-5 shrink-0" />카이멘토 · 월 1회 · 학부모님 전화 상담</p>
        <div className="mt-5"><MarketingCTA /><p className="mt-3 text-sm text-slate-500">회원가입 없이 1분 신청</p></div>
      </div>
      <div className="relative min-h-[380px] bg-slate-100 sm:min-h-[480px] lg:min-h-[620px]">
        <Image src="/images/mentor-study-hero.png" alt="선생님과 학생이 함께 수학을 공부하는 모습" fill priority sizes="(max-width: 1023px) 100vw, 53vw" className="object-cover" />
        <div className="absolute bottom-12 right-4 ml-4 flex items-center gap-3 rounded-2xl bg-white/95 px-5 py-5 shadow-lg sm:right-8"><span className="text-blue-600"><MarketingIcon /></span><div><p className="text-sm font-bold sm:text-base">학부모님 상담은 <span className="text-blue-600">카이멘토에서</span></p><p className="mt-2 text-xs leading-5 text-slate-600">월 1회, 수업 이후까지 함께 살펴드립니다.</p></div></div>
        <p className="absolute bottom-0 left-0 bg-slate-900/65 px-4 py-2 text-xs text-white">KAIST 선생님과 1:1 수업</p>
      </div>
    </div></section>
    <section id="care" className="scroll-mt-6 bg-blue-50 px-5 py-12 sm:px-8 sm:py-14"><div className="mx-auto max-w-7xl">
      <p className="text-center text-2xl font-bold tracking-tight text-blue-600 sm:text-3xl">카이멘토의 정기 관리</p>
      <h2 className="mt-3 text-center text-2xl font-bold leading-snug tracking-tight sm:text-3xl">선생님 연결 이후에도, 카이멘토가 꾸준히 살펴드립니다.</h2>
      <p className="mt-4 text-center leading-7 text-slate-600">자녀의 수업이 잘 이어지고 있는지, 학부모님과 정기적으로 상담합니다.</p>
      <div className="mt-8 grid gap-5 md:grid-cols-2">
        <article className="flex items-start gap-5 rounded-2xl bg-white p-6 sm:items-center sm:p-8"><span className="rounded-full bg-blue-50 p-4 text-blue-600 sm:p-6"><MarketingIcon kind="book" /></span><div><p className="text-sm font-bold text-blue-600">KAIST 선생님</p><h3 className="mt-2 text-xl font-bold">자녀에게 맞는 1:1 수업</h3><p className="mt-3 leading-7 text-slate-600">수학·과학 개념부터 문제 풀이까지 학생의 수준과 목표에 맞춰 지도합니다.</p></div></article>
        <article className="flex items-start gap-5 rounded-2xl border border-blue-600 bg-white p-6 sm:items-center sm:p-8"><span className="rounded-full bg-blue-50 p-4 text-blue-600 sm:p-6"><MarketingIcon /></span><div><p className="text-sm font-bold text-blue-600">카이멘토 정기 관리</p><h3 className="mt-2 text-xl font-bold">월 1회 학부모님 전화 상담</h3><p className="mt-3 leading-7 text-slate-600">수업 상황과 학부모님의 고민을 듣고 필요한 조정 사항을 선생님과 함께 정리합니다.</p></div></article>
      </div>
    </div></section>
    <section id="process" className="scroll-mt-6 px-5 py-12 sm:px-8 sm:py-14"><div className="mx-auto max-w-7xl">
      <h2 className="text-center text-2xl font-bold leading-snug tracking-tight sm:text-3xl">상담에서 정한 계획을 다음 상담까지 이어갑니다.</h2>
      <ol className="mt-8 grid gap-5 md:grid-cols-3">{careSteps.map(([title, body], index) => <li key={title} className="flex gap-4 rounded-2xl border border-slate-200 p-6"><span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-blue-50 font-bold text-blue-600">0{index + 1}</span><div><h3 className="font-bold">{title}</h3><p className="mt-3 text-sm leading-6 text-slate-600">{body}</p></div></li>)}</ol>
      <div className="mt-10 rounded-2xl bg-blue-50 px-5 py-8 text-center"><h2 className="mb-5 text-xl font-bold leading-relaxed">믿고 맡겨주신 수업, 카이멘토가 꾸준히 살펴드립니다.</h2><MarketingCTA /><p className="mt-3 text-xs text-slate-500">회원가입 없이 1분 신청</p></div>
    </div></section>
  </main><MarketingFooter /></div>;
}
