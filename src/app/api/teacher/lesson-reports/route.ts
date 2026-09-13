import { NextResponse } from "next/server";
import { getAuthedMentor } from "@/lib/mentorAuth";
import { getSupabaseAdmin } from "@/lib/supabase";
import { consumeIdentifierRateLimit, readJsonObject, requiredString, optionalString, RequestError } from "@/lib/requestSecurity";
import { koreaToday, TEACHER_REPORT_FIELDS } from "@/lib/lessonReports";
import { assertSameOrigin, notifyLessonReport, reportError, validUuid } from "@/lib/lessonReportServer";

export async function GET(request: Request) {
  try {
    const mentor = await getAuthedMentor();
    if (!mentor) throw new RequestError("로그인이 필요합니다.", 401);
    const page = Math.max(0, Number(new URL(request.url).searchParams.get("page")) || 0);
    if (!Number.isSafeInteger(page) || page > 100000) throw new RequestError("잘못된 페이지입니다.");
    const { data, error, count } = await getSupabaseAdmin().from("lesson_reports").select(TEACHER_REPORT_FIELDS, { count: "exact" })
      .eq("mentor_id", mentor.id).order("lesson_date", { ascending: false }).order("created_at", { ascending: false }).range(page * 20, page * 20 + 19);
    if (error) throw error;
    return NextResponse.json({ reports: data, count }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) { return reportError(error); }
}

export async function POST(request: Request) {
  try {
    assertSameOrigin(request);
    const mentor = await getAuthedMentor();
    if (!mentor) throw new RequestError("로그인이 필요합니다.", 401);
    const body = await readJsonObject(request, 20000);
    const submission_id = requiredString(body, "submission_id", 36);
    const lesson_date = requiredString(body, "lesson_date", 10);
    if (!validUuid(submission_id)) throw new RequestError("제출 번호가 올바르지 않습니다.");
    if (!/^\d{4}-\d{2}-\d{2}$/.test(lesson_date) || !Number.isFinite(Date.parse(lesson_date)) || new Date(lesson_date).toISOString().slice(0,10) !== lesson_date || lesson_date > koreaToday() || lesson_date < "2020-01-01") throw new RequestError("완료한 수업의 날짜를 확인해주세요.");
    const values = { mentor_id: mentor.id, submission_id, lesson_date,
      student_name: requiredString(body, "student_name", 80), subject: requiredString(body, "subject", 80),
      summary: requiredString(body, "summary", 1500), progress: optionalString(body, "progress", 1000), comment: optionalString(body, "comment", 1000) };
    if (!(await consumeIdentifierRateLimit(mentor.id, "lesson-report", 30, 3600))) throw new RequestError("제출이 많습니다. 잠시 후 다시 시도해주세요.", 429);
    const db = getSupabaseAdmin();
    const { data, error } = await db.from("lesson_reports").insert(values).select(TEACHER_REPORT_FIELDS).single();
    if (error?.code === "23505") {
      const existing = await db.from("lesson_reports").select(TEACHER_REPORT_FIELDS).eq("mentor_id", mentor.id).eq("submission_id", submission_id).single();
      if (existing.error) throw existing.error;
      for (const key of ["student_name", "lesson_date", "subject", "summary", "progress", "comment"] as const) {
        if (existing.data[key] !== values[key]) throw new RequestError("이 제출 번호로 저장된 기록이 있습니다. 기록 목록을 새로고침하여 내용을 확인해주세요.", 409);
      }
      return NextResponse.json({ report: existing.data });
    }
    if (error) throw error;
    await notifyLessonReport(data, mentor.name);
    return NextResponse.json({ report: data }, { status: 201 });
  } catch (error) { return reportError(error); }
}
