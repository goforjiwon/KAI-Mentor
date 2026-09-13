import Link from "next/link";
import { redirect } from "next/navigation";
import { isAdminAuthed } from "@/lib/adminAuth";
import { getSupabaseAdmin } from "@/lib/supabase";
import { ReportList } from "@/components/LessonReports";

export const dynamic = "force-dynamic";
export default async function LessonReportsPage({ searchParams }: { searchParams: Promise<{ report?: string }> }) {
  const { report } = await searchParams;
  if (!(await isAdminAuthed())) redirect(`/admin/login?next=${encodeURIComponent(`/admin/lesson-reports${report ? `?report=${encodeURIComponent(report)}` : ""}`)}`);
  const { data, error } = await getSupabaseAdmin().from("mentors").select("id,name").order("name").limit(1000);
  return <main className="min-h-screen bg-slate-50 px-4 py-8 text-slate-950"><div className="mx-auto max-w-5xl">
    <Link href="/admin" className="text-sm font-semibold text-blue-700">← 어드민 홈</Link>
    <h1 className="mt-6 text-3xl font-bold">수업 기록 관리</h1>
    <p className="mb-6 mt-2 text-sm text-slate-600">학생별 수업 내용과 진도를 확인하고, 후속 상담 및 관리 메모를 남겨주세요.</p>
    {report && <Link href="/admin/lesson-reports" className="mb-5 inline-block text-sm font-semibold text-blue-700">전체 기록 보기</Link>}
    {error && <p role="alert" className="mb-4 text-red-700">강사 필터를 불러오지 못했습니다. 페이지를 새로고침해주세요.</p>}
    <ReportList admin reportId={report} mentors={data ?? []} />
  </div></main>;
}
