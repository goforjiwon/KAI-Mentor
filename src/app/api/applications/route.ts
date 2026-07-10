import { NextResponse } from "next/server";
import { sendApplicationEmail, type ApplicationPayload } from "@/lib/email";
import { supabaseAdmin } from "@/lib/supabase";
import { sendKakaoSelfMessage } from "@/lib/kakao";
import { sendTelegramNotification } from "@/lib/telegram";

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as ApplicationPayload;

    // 필수 필드 검증
    if (
      !payload.parentName ||
      !payload.phone ||
      !payload.studentGender ||
      !payload.schoolName ||
      !payload.grade
    ) {
      return NextResponse.json(
        { success: false, message: "필수 항목을 입력해주세요." },
        { status: 400 }
      );
    }

    // 1) Supabase 저장 (실패 시 전체 실패)
    const { data, error } = await supabaseAdmin
      .from("applications")
      .insert({
        parent_name: payload.parentName,
        phone: payload.phone,
        student_gender: payload.studentGender,
        school_name: payload.schoolName,
        grade: payload.grade,
        subjects: payload.subjects ?? [],
        current_level: payload.currentLevel ?? "",
        difficulties: payload.difficulties ?? "",
        goal: payload.goal ?? "",
        goal_date: payload.goalDate ?? "",
        child_personality: payload.childPersonality ?? [],
        mentor_priority: payload.mentorPriority ?? "",
        extra_note: payload.extraNote ?? "",
        status: "new",
      })
      .select("id")
      .single();

    if (error) {
      console.error("[applications] Supabase insert 오류:", error);
      throw new Error(`DB 저장 실패: ${error.message}`);
    }

    console.log("[applications] 저장 완료 id:", data?.id);

    // 2) 알림 전송 — 모든 채널을 병렬 시도. 실패해도 신청 자체는 성공 — DB에 이미 들어감.
    const [emailResult, kakaoResult, telegramResult] = await Promise.allSettled([
      sendApplicationEmail(payload),
      sendKakaoSelfMessage(payload),
      sendTelegramNotification(payload),
    ]);

    function unwrap(
      result: PromiseSettledResult<unknown>
    ): Record<string, unknown> {
      if (result.status === "fulfilled") {
        return (result.value as Record<string, unknown>) ?? { sent: true };
      }
      return {
        sent: false,
        reason: String((result.reason as Error)?.message ?? result.reason),
      };
    }

    const notifications = {
      email: unwrap(emailResult),
      kakao: unwrap(kakaoResult),
      telegram: unwrap(telegramResult),
    };

    if (emailResult.status === "rejected") {
      console.error("[applications] 이메일 실패:", notifications.email);
    }

    return NextResponse.json(
      { success: true, id: data?.id, notifications },
      { status: 201 }
    );
  } catch (error) {
    console.error("신청 처리 오류:", error);
    return NextResponse.json(
      {
        success: false,
        message: "서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.",
      },
      { status: 500 }
    );
  }
}
