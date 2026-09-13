import { NextResponse } from "next/server";
import { isAdminAuthed } from "@/lib/adminAuth";
import { getSupabaseAdmin } from "@/lib/supabase";
import { RequestError } from "@/lib/requestSecurity";
import { reportError, validUuid } from "@/lib/lessonReportServer";
import { REPORT_STATUSES } from "@/lib/lessonReports";

export async function GET(request: Request) {
  try {
    if (!(await isAdminAuthed())) throw new RequestError("관리자 로그인이 필요합니다.", 401);
    const params = new URL(request.url).searchParams;
    const page = Math.max(0, Number(params.get("page")) || 0);
    if (!Number.isSafeInteger(page) || page > 100000) throw new RequestError("잘못된 페이지입니다.");
    let query = getSupabaseAdmin().from("lesson_reports").select("*, mentor:mentors(name)", { count: "exact" });
    const id = params.get("report");
    if (id) { if (!validUuid(id)) throw new RequestError("잘못된 기록 번호입니다."); query = query.eq("id", id); }
    const status = params.get("status");
    if (status && Object.hasOwn(REPORT_STATUSES, status)) query = query.eq("status", status);
    const search = (params.get("search") ?? "").trim().slice(0,80).replace(/[%_\\]/g, "");
    if (search) query = query.ilike("student_name", `%${search}%`);
    const mentor = params.get("mentor");
    if (mentor) { if (!validUuid(mentor)) throw new RequestError("잘못된 강사입니다."); query = query.eq("mentor_id", mentor); }
    const { data, count, error } = await query.order("lesson_date", { ascending: false }).order("created_at", { ascending: false }).range(page * 20, page * 20 + 19);
    if (error) throw error;
    return NextResponse.json({ reports: data, count }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) { return reportError(error); }
}
