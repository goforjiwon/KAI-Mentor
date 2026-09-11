import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { MarketingCTA, MarketingFooter, MarketingHeader, MarketingIcon } from "@/components/Marketing";

export const metadata: Metadata = { title: "선생님 안내 | 카이멘토", description: "수업료 안내의 부담은 덜고, 학생을 가르치는 일에 집중하세요. 카이멘토가 학부모님 수업료 안내와 입금 확인, 정기 전화 상담을 맡습니다." };
const services = [{ kind: "book" as const, title: "수업료 안내", body: "납부 금액과 방법을 학부모님께 안내드립니다." }, { kind: "check" as const, title: "입금 확인", body: "입금 여부를 확인하고 필요한 안내를 진행합니다." }, { kind: "chat" as const, title: "수납 문의 응대", body: "수업료 납부 관련 문의는 카이멘토에서 응대합니다." }];

export default function TeacherGuidePage() {
  return <div className="min-h-screen bg-white text-slate-950"><MarketingHeader teacher /><main>
    <section><div className="mx-auto grid max-w-[1440px] lg:grid-cols-2">
      <div className="flex flex-col justify-center px-5 py-10 sm:px-8 sm:py-14 lg:px-16">
        <p className="font-bold text-emerald-700">세종 지역 KAIST 선생님을 모십니다</p>
        <h1 className="mt-5 text-[2rem] font-bold leading-[1.35] tracking-[-0.05em] sm:text-[2.6rem]"><span className="text-emerald-700">수업료 안내의 부담은 덜고,</span><br />학생을 가르치는 일에<br />집중하세요.</h1>
        <p className="mt-6 text-base leading-8 text-slate-600">학부모님께 수업료 입금을 요청하는 연락,<br />이제 카이멘토가 맡겠습니다.</p>
        <div className="mt-7 flex flex-wrap items-center gap-5"><MarketingCTA teacher /><Link href="/teacher/login" className="text-sm font-semibold text-slate-600 underline underline-offset-4">기존 계정으로 로그인</Link></div>
        <div className="mt-7 flex flex-wrap gap-2 text-sm font-semibold text-slate-600">{["학생 연결", "수업료 안내", "입금 확인"].map(label => <span key={label} className="rounded-full border border-emerald-200 px-4 py-2.5">{label}</span>)}</div>
      </div>
      <div className="relative min-h-[360px] bg-stone-100 sm:min-h-[440px] lg:min-h-[590px]">
        <Image src="/images/teacher-preparation-hero.png" alt="수업을 준비하며 학습 자료를 정리하는 선생님" fill priority sizes="(max-width: 1023px) 100vw, 50vw" className="object-cover" />
        <div className="absolute bottom-8 right-4 ml-4 flex items-center gap-4 rounded-2xl bg-white/95 p-5 shadow-lg sm:right-8"><span className="text-emerald-700"><MarketingIcon kind="chat" /></span><div><p className="font-bold">수업료 안내는 카이멘토에서</p><p className="mt-2 text-sm leading-6 text-slate-600">선생님 대신 학부모님께 안내드립니다.</p></div></div>
      </div>
    </div></section>
    <section className="bg-emerald-50 px-5 py-12 sm:px-8 sm:py-14"><div className="mx-auto max-w-7xl">
      <h2 className="text-center text-2xl font-bold leading-relaxed tracking-tight sm:text-3xl"><span className="text-emerald-700">“수업료 입금 부탁드립니다.”</span><br />이 문자를 직접 보내지 않으셔도 됩니다.</h2>
      <p className="mx-auto mt-4 max-w-3xl text-center leading-8 text-slate-600">수업료 안내와 입금 확인은 카이멘토가 맡아<br className="hidden sm:block" /> 선생님과 학부모님이 수업 이야기에 집중하실 수 있도록 돕습니다.</p>
      <div className="mt-7 grid gap-5 md:grid-cols-3">{services.map(service => <article key={service.title} className="rounded-2xl bg-white p-7 text-center"><span className="mb-5 inline-flex text-emerald-800"><MarketingIcon kind={service.kind} className="h-10 w-10" /></span><h3 className="text-xl font-bold">{service.title}</h3><p className="mx-auto mt-3 max-w-[240px] leading-7 text-slate-600">{service.body}</p></article>)}</div>
    </div></section>
    <section id="process" className="scroll-mt-6 px-5 py-12 sm:px-8"><div className="mx-auto max-w-7xl">
      <h2 className="text-center text-2xl font-bold tracking-tight sm:text-3xl">선생님과 카이멘토, 이렇게 함께합니다</h2>
      <div className="mt-8 grid gap-5 md:grid-cols-2"><article className="flex items-start gap-5 rounded-2xl border border-slate-200 p-6 sm:p-8"><span className="text-emerald-800"><MarketingIcon kind="people" className="h-10 w-10" /></span><div><p className="text-sm font-bold text-emerald-700">선생님</p><h3 className="mt-2 text-xl font-bold">수업과 학습 피드백</h3><p className="mt-3 leading-7 text-slate-600">학생에게 맞는 수업을 진행하고 학습 상황을 카이멘토에 공유해 주세요.</p></div></article><article className="flex items-start gap-5 rounded-2xl border border-slate-200 p-6 sm:p-8"><span className="text-emerald-800"><MarketingIcon kind="chat" className="h-10 w-10" /></span><div><p className="text-sm font-bold text-emerald-700">카이멘토</p><h3 className="mt-2 text-xl font-bold">수납 안내와 학부모님 상담</h3><p className="mt-3 leading-7 text-slate-600">수업료 안내·입금 확인과 월 2회 학부모님 전화 상담을 맡습니다.</p></div></article></div>
    </div></section>
    <section className="bg-emerald-50 px-5 py-8 text-center"><h2 className="mb-5 text-xl font-bold leading-relaxed">가르치는 일에 집중할 수 있도록, 카이멘토가 함께합니다.</h2><Link href="/mentor-signup" className="inline-flex rounded-xl bg-emerald-700 px-7 py-3.5 font-bold text-white hover:bg-emerald-800">선생님 등록하기</Link></section>
  </main><MarketingFooter teacher /></div>;
}
