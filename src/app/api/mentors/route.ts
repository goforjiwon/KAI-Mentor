import { NextResponse } from "next/server";
import { setMentorSession } from "@/lib/mentorAuth";
import { supabaseAdmin } from "@/lib/supabase";

type MentorPayload = {
  email?: string;
  password?: string;
  name?: string;
  phone?: string;
  major?: string;
  subjects?: string;
  teachingMode?: string;
  memo?: string;
};

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as MentorPayload;

    if (
      !payload.name?.trim() ||
      !payload.email?.trim() ||
      !payload.password ||
      !payload.phone?.trim() ||
      !payload.major?.trim() ||
      !payload.subjects?.trim() ||
      !payload.teachingMode?.trim()
    ) {
      return NextResponse.json(
        { success: false, message: "필수 항목을 입력해주세요." },
        { status: 400 }
      );
    }

    if (payload.password.length < 8) {
      return NextResponse.json(
        { success: false, message: "비밀번호는 8자 이상으로 입력해주세요." },
        { status: 400 }
      );
    }

    const normalizedEmail = payload.email.trim().toLowerCase();
    const { data: authData, error: authError } =
      await supabaseAdmin.auth.admin.createUser({
        email: normalizedEmail,
        password: payload.password,
        email_confirm: true,
        app_metadata: { role: "mentor" },
        user_metadata: { name: payload.name.trim() },
      });

    if (authError || !authData.user) {
      const duplicate = authError?.message.toLowerCase().includes("already");
      return NextResponse.json(
        {
          success: false,
          message: duplicate
            ? "이미 가입된 이메일입니다. 로그인해주세요."
            : "계정을 만들지 못했습니다. 입력 내용을 확인해주세요.",
        },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from("mentors")
      .insert({
        auth_user_id: authData.user.id,
        email: normalizedEmail,
        name: payload.name.trim(),
        phone: payload.phone.trim(),
        major: payload.major.trim(),
        subjects: payload.subjects.trim(),
        teaching_mode: payload.teachingMode.trim(),
        memo: payload.memo?.trim() ?? "",
        status: "new",
        credit_balance: 0,
        total_credits_purchased: 0,
        total_credits_used: 0,
      })
      .select("id")
      .single();

    if (error) {
      console.error("[mentors] Supabase insert 오류:", error);
      await supabaseAdmin.auth.admin.deleteUser(authData.user.id);
      throw new Error(`DB 저장 실패: ${error.message}`);
    }

    await setMentorSession(authData.user.id);

    return NextResponse.json(
      { success: true, id: data?.id },
      { status: 201 }
    );
  } catch (error) {
    console.error("선생님 등록 처리 오류:", error);
    return NextResponse.json(
      {
        success: false,
        message: "서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.",
      },
      { status: 500 }
    );
  }
}
