import "server-only";
import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "./supabase";
import { RequestError } from "./requestSecurity";
import type { LessonReport } from "./lessonReports";

export function assertSameOrigin(request: Request) {
  const origin = request.headers.get("origin");
  if (origin && origin !== new URL(request.url).origin) throw new RequestError("허용되지 않은 요청입니다.", 403);
}
export function reportError(error: unknown) {
  if (!(error instanceof RequestError)) console.error("[lesson-reports] request failed");
  return NextResponse.json({ message: error instanceof RequestError ? error.message : "수업 기록을 처리하지 못했습니다. 다시 시도해주세요." }, { status: error instanceof RequestError ? error.status : 500 });
}
export function validUuid(value: string) { return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value); }

export async function notifyLessonReport(report: LessonReport, mentorName: string) {
  let sent = false;
  try {
    const token = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;
    if (token && chatId) {
      // Plain text avoids markup injection; excerpts keep messages below Telegram's limit.
      const text = ["📝 카이멘토 수업 기록", `${mentorName} 선생님 · ${report.student_name}`, `${report.lesson_date} · ${report.subject}`,
        `수업 요약: ${report.summary.slice(0,700)}`, `진도: ${report.progress.slice(0,400) || "-"}`,
        `코멘트: ${report.comment.slice(0,400) || "-"}`, "전체 내용 및 관리:",
        `${process.env.SITE_URL ?? "https://eaureca.com"}/admin/lesson-reports?report=${report.id}`].join("\n\n");
      const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chat_id: chatId, text, disable_web_page_preview: true }), signal: AbortSignal.timeout(8000),
      });
      sent = response.ok && (await response.json()).ok === true;
    }
  } catch { /* Saving a report must survive notification failure. */ }
  const { error } = await getSupabaseAdmin().from("lesson_reports").update({ notification_status: sent ? "sent" : "failed" }).eq("id", report.id);
  if (error) console.error("[lesson-reports] notification status update failed");
  return sent;
}
