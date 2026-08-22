import { NextResponse } from "next/server";
import { setMentorSession } from "@/lib/mentorAuth";
import {
  consumeIdentifierRateLimit,
  consumeRateLimit,
  optionalString,
  readJsonObject,
  RequestError,
  requiredString,
} from "@/lib/requestSecurity";
import { getSupabaseAdmin } from "@/lib/supabase";
import { isAllowedOption, MENTOR_SUBJECTS, TEACHING_MODES } from "@/lib/formOptions";

export async function POST(request: Request) {
  try {
    if (!(await consumeRateLimit(request, "mentor-signup", 3, 60 * 60))) {
      return NextResponse.json(
        { success: false, message: "등록 요청이 너무 많습니다. 잠시 후 다시 시도해주세요." },
        { status: 429, headers: { "Retry-After": "3600" } }
      );
    }

    const body = await readJsonObject(request, 16 * 1024);
    const email = requiredString(body, "email", 254).toLowerCase();
    const password = requiredString(body, "password", 128);
    const name = requiredString(body, "name", 80);
    const phone = requiredString(body, "phone", 30);
    const major = requiredString(body, "major", 200);
    const subjects = requiredString(body, "subjects", 200);
    const teachingMode = requiredString(body, "teachingMode", 200);
    const memo = optionalString(body, "memo", 2_000);

    if (!/^\S+@\S+\.\S+$/.test(email)) {
      throw new RequestError("이메일 주소를 확인해주세요.");
    }
    if (password.length < 8) {
      throw new RequestError("비밀번호는 8자 이상으로 입력해주세요.");
    }
    if (!isAllowedOption(subjects, MENTOR_SUBJECTS)) {
      throw new RequestError("가능 과목을 확인해주세요.");
    }
    if (!isAllowedOption(teachingMode, TEACHING_MODES)) {
      throw new RequestError("가능한 수업 방식을 확인해주세요.");
    }
    if (!(await consumeIdentifierRateLimit(email, "mentor-signup-email", 3, 24 * 60 * 60))) {
      return NextResponse.json(
        { success: false, message: "이 이메일의 등록 요청이 너무 많습니다." },
        { status: 429, headers: { "Retry-After": "86400" } }
      );
    }

    const supabaseAdmin = getSupabaseAdmin();
    const { data: authData, error: authError } =
      await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        app_metadata: { role: "mentor" },
        user_metadata: { name },
      });

    if (authError || !authData.user) {
      const duplicate =
        authError?.code === "email_exists" ||
        authError?.message.toLowerCase().includes("already");
      return NextResponse.json(
        {
          success: false,
          message: duplicate
            ? "이미 가입된 이메일입니다. 로그인해주세요."
            : "계정을 만들지 못했습니다. 입력 내용을 확인해주세요.",
        },
        { status: duplicate ? 409 : 400 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from("mentors")
      .insert({
        auth_user_id: authData.user.id,
        email,
        name,
        phone,
        major,
        subjects,
        teaching_mode: teachingMode,
        memo,
        status: "new",
        credit_balance: 0,
        total_credits_purchased: 0,
        total_credits_used: 0,
      })
      .select("id")
      .single();

    if (error) {
      console.error("[mentors] Supabase insert 오류:", error);
      const { error: cleanupError } = await supabaseAdmin.auth.admin.deleteUser(authData.user.id);
      if (cleanupError) {
        console.error("[mentors] Auth 사용자 정리 실패:", cleanupError.message);
      }
      throw new Error(`DB 저장 실패: ${error.message}`);
    }

    await setMentorSession(authData.user.id);
    return NextResponse.json({ success: true, id: data?.id }, { status: 201 });
  } catch (error) {
    console.error("선생님 등록 처리 오류:", error);
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
