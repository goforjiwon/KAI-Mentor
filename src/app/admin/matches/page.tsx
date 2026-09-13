import Link from "next/link";
import { redirect } from "next/navigation";
import { isAdminAuthed } from "@/lib/adminAuth";
import { getSupabaseAdmin } from "@/lib/supabase";
import MatchManager from "./MatchManager";

export const dynamic = "force-dynamic";
export default async function MatchesPage() {
  if (!(await isAdminAuthed())) redirect("/admin/login?next=%2Fadmin%2Fmatches");
  const db = getSupabaseAdmin();
  const [mentors, applications] = await Promise.all([
    db.from("mentors").select("id,name,auth_user_id").order("name").limit(1000),
    db.from("applications").select("id,parent_name,school_name,grade").order("created_at", { ascending: false }).limit(1000),
  ]);
  return <main className="min-h-screen bg-slate-50 px-4 py-8 text-slate-950"><div className="mx-auto max-w-6xl">
    <nav className="flex gap-5 text-sm font-semibold text-blue-700"><Link href="/admin">← 어드민 홈</Link><Link href="/admin/lesson-reports">수업 기록 관리</Link></nav>
    <h1 className="mt-6 text-3xl font-bold">강사·학부모 매칭 현황</h1>
    <p className="mb-6 mt-2 text-sm text-slate-600">어떤 선생님이 어떤 학생·학부모와 연결되어 있는지 확인하고 관리하세요.</p>
    {mentors.error || applications.error ? <p role="alert" className="rounded-xl bg-red-50 p-5 text-red-700">강사 또는 학부모 목록을 불러오지 못했습니다. 페이지를 새로고침해주세요.</p> : <MatchManager choices={{ mentors: (mentors.data ?? []).map(m => ({ id: m.id, name: m.name, has_login: !!m.auth_user_id })), applications: applications.data ?? [] }} />}
  </div></main>;
}
