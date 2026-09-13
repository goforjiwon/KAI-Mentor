import { NextResponse } from "next/server";
import { isAdminAuthed } from "@/lib/adminAuth";
import { getSupabaseAdmin } from "@/lib/supabase";
import { optionalString, readJsonObject, requiredString, RequestError } from "@/lib/requestSecurity";
import { assertSameOrigin, reportError, validUuid } from "@/lib/lessonReportServer";
import { REPORT_STATUSES } from "@/lib/lessonReports";

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    assertSameOrigin(request);
    if (!(await isAdminAuthed())) throw new RequestError("관리자 로그인이 필요합니다.", 401);
    const { id } = await context.params;
    if (!validUuid(id)) throw new RequestError("잘못된 기록 번호입니다.");
    const body = await readJsonObject(request, 10000);
    const status = requiredString(body, "status", 20);
    if (!Object.hasOwn(REPORT_STATUSES, status)) throw new RequestError("잘못된 상태입니다.");
    const admin_memo = optionalString(body, "admin_memo", 2000);
    const { data, error } = await getSupabaseAdmin().from("lesson_reports").update({ status, admin_memo }).eq("id", id).select("*, mentor:mentors(name)").maybeSingle();
    if (error) throw error;
    if (!data) throw new RequestError("기록을 찾을 수 없습니다.", 404);
    return NextResponse.json({ report: data });
  } catch (error) { return reportError(error); }
}
