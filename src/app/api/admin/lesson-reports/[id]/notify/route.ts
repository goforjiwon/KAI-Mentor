import { NextResponse } from "next/server";
import { isAdminAuthed } from "@/lib/adminAuth";
import { getSupabaseAdmin } from "@/lib/supabase";
import { RequestError } from "@/lib/requestSecurity";
import { assertSameOrigin, notifyLessonReport, reportError, validUuid } from "@/lib/lessonReportServer";

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    assertSameOrigin(request);
    if (!(await isAdminAuthed())) throw new RequestError("관리자 로그인이 필요합니다.", 401);
    const { id } = await context.params;
    if (!validUuid(id)) throw new RequestError("잘못된 기록 번호입니다.");
    const db = getSupabaseAdmin();
    // Claim failed notifications atomically. Pending requests older than a minute can recover after an interrupted request.
    const cutoff = new Date(Date.now() - 60000).toISOString();
    const { data, error } = await db.from("lesson_reports").update({ notification_status: "pending", notification_attempt_at: new Date().toISOString() })
      .eq("id", id).or(`notification_status.eq.failed,and(notification_status.eq.pending,notification_attempt_at.lt.${cutoff})`).select("*, mentor:mentors(name)").maybeSingle();
    if (error) throw error;
    if (!data) throw new RequestError("재전송 가능한 실패 알림이 없습니다.", 409);
    const sent = await notifyLessonReport(data, data.mentor?.name ?? "선생님");
    return NextResponse.json({ sent, message: sent ? "알림을 재전송했습니다." : "알림 전송에 실패했습니다. 설정을 확인해주세요." });
  } catch (error) { return reportError(error); }
}
