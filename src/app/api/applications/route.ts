import { after, NextResponse } from "next/server";
import { sendApplicationEmail, type ApplicationPayload } from "@/lib/email";
import { sendKakaoSelfMessage } from "@/lib/kakao";
import {
  consumeRateLimit,
  optionalString,
  optionalStringArray,
  readJsonObject,
  RequestError,
  requiredString,
  requiredStringArray,
} from "@/lib/requestSecurity";
import { getSupabaseAdmin } from "@/lib/supabase";
import { sendTelegramNotification } from "@/lib/telegram";
import {
  APPLICATION_SUBJECTS,
  CHILD_PERSONALITIES,
  GRADES,
  hasOnlyAllowedOptions,
  isAllowedOption,
  MENTOR_PRIORITIES,
  sortByOptionOrder,
  STUDENT_GENDERS,
  WEEKDAYS,
} from "@/lib/formOptions";

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function parsePayload(body: Record<string, unknown>) {
  const submissionId = requiredString(body, "submissionId", 36);
  if (!UUID_PATTERN.test(submissionId)) {
    throw new RequestError("올바른 제출 식별자가 아닙니다.");
  }

  const desiredStartDate = requiredString(body, "desiredStartDate", 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(desiredStartDate)) {
    throw new RequestError("희망 시작일을 확인해주세요.");
  }

  const preferredDays = requiredStringArray(body, "preferredDays", 7, 10);
  if (!hasOnlyAllowedOptions(preferredDays, WEEKDAYS)) {
    throw new RequestError("가능한 수업 요일을 확인해주세요.");
  }
  const subjects = requiredStringArray(body, "subjects", 5, 40);
  if (!hasOnlyAllowedOptions(subjects, APPLICATION_SUBJECTS)) {
    throw new RequestError("도움이 필요한 과목을 확인해주세요.");
  }
  const childPersonality = optionalStringArray(body, "childPersonality", 10, 80);
  if (!hasOnlyAllowedOptions(childPersonality, CHILD_PERSONALITIES)) {
    throw new RequestError("자녀 성향 선택을 확인해주세요.");
  }

  const studentGender = requiredString(body, "studentGender", 20);
  const grade = requiredString(body, "grade", 40);
  const mentorPriority = requiredString(body, "mentorPriority", 300);
  if (!isAllowedOption(studentGender, STUDENT_GENDERS)) {
    throw new RequestError("학생 성별을 확인해주세요.");
  }
  if (!isAllowedOption(grade, GRADES)) {
    throw new RequestError("학생 학년을 확인해주세요.");
  }
  if (!isAllowedOption(mentorPriority, MENTOR_PRIORITIES)) {
    throw new RequestError("멘토 선호사항을 확인해주세요.");
  }

  const payload: ApplicationPayload = {
    parentName: requiredString(body, "parentName", 80),
    phone: requiredString(body, "phone", 30),
    studentGender,
    schoolName: requiredString(body, "schoolName", 120),
    grade,
    subjects: sortByOptionOrder(subjects, APPLICATION_SUBJECTS),
    currentLevel: requiredString(body, "currentLevel", 500),
    difficulties: requiredString(body, "difficulties", 2_000),
    goal: requiredString(body, "goal", 1_000),
    goalDate: requiredString(body, "goalDate", 200),
    childPersonality: sortByOptionOrder(childPersonality, CHILD_PERSONALITIES),
    mentorPriority,
    preferredDays: sortByOptionOrder(preferredDays, WEEKDAYS),
    preferredTime: requiredString(body, "preferredTime", 500),
    desiredStartDate,
    extraNote: optionalString(body, "extraNote", 3_000),
  };
  return { payload, submissionId };
}

function scheduleNotifications(payload: ApplicationPayload, applicationId: string) {
  after(async () => {
    const results = await Promise.allSettled([
      sendApplicationEmail(payload),
      sendKakaoSelfMessage(payload),
      sendTelegramNotification(payload),
    ]);
    results.forEach((result, index) => {
      if (result.status === "rejected") {
        const channels = ["email", "kakao", "telegram"];
        console.error(
          `[applications:${applicationId}] ${channels[index]} 알림 실패:`,
          result.reason instanceof Error ? result.reason.message : result.reason
        );
      }
    });
  });
}

export async function POST(request: Request) {
  try {
    if (!(await consumeRateLimit(request, "applications", 5, 60 * 60))) {
      return NextResponse.json(
        { success: false, message: "신청 횟수가 너무 많습니다. 잠시 후 다시 시도해주세요." },
        { status: 429, headers: { "Retry-After": "3600" } }
      );
    }

    const { payload, submissionId } = parsePayload(await readJsonObject(request));
    const supabaseAdmin = getSupabaseAdmin();
    const { data, error } = await supabaseAdmin
      .from("applications")
      .insert({
        submission_id: submissionId,
        parent_name: payload.parentName,
        phone: payload.phone,
        student_gender: payload.studentGender,
        school_name: payload.schoolName,
        grade: payload.grade,
        subjects: payload.subjects,
        current_level: payload.currentLevel,
        difficulties: payload.difficulties,
        goal: payload.goal,
        goal_date: payload.goalDate,
        child_personality: payload.childPersonality,
        mentor_priority: payload.mentorPriority,
        preferred_days: payload.preferredDays,
        preferred_time: payload.preferredTime,
        desired_start_date: payload.desiredStartDate,
        extra_note: payload.extraNote,
        status: "new",
      })
      .select("id")
      .single();

    if (error?.code === "23505") {
      const { data: existing, error: lookupError } = await supabaseAdmin
        .from("applications")
        .select("id")
        .eq("submission_id", submissionId)
        .single();
      if (lookupError) throw lookupError;
      return NextResponse.json({ success: true, id: existing.id, duplicate: true });
    }
    if (error || !data) throw error ?? new Error("신청 저장 결과가 없습니다.");

    scheduleNotifications(payload, data.id);
    return NextResponse.json({ success: true, id: data.id }, { status: 201 });
  } catch (error) {
    console.error("신청 처리 오류:", error);
    const status = error instanceof RequestError ? error.status : 500;
    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof RequestError
            ? error.message
            : "서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.",
      },
      { status }
    );
  }
}
