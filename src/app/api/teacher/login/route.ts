import { NextResponse } from "next/server";
import { setMentorSession } from "@/lib/mentorAuth";
import { createAuthServerClient, supabaseAdmin } from "@/lib/supabase";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { email?: string; password?: string };
    const email = body.email?.trim().toLowerCase();
    if (!email || !body.password) {
      return NextResponse.json(
        { success: false, message: "이메일과 비밀번호를 입력해주세요." },
        { status: 400 }
      );
    }

    const authClient = createAuthServerClient();
    const { data, error } = await authClient.auth.signInWithPassword({
      email,
      password: body.password,
    });

    if (error || !data.user) {
      return NextResponse.json(
        { success: false, message: "이메일 또는 비밀번호를 확인해주세요." },
        { status: 401 }
      );
    }

    const { data: mentor } = await supabaseAdmin
      .from("mentors")
      .select("id")
      .eq("auth_user_id", data.user.id)
      .maybeSingle();

    if (!mentor) {
      return NextResponse.json(
        { success: false, message: "선생님 계정을 찾을 수 없습니다." },
        { status: 403 }
      );
    }

    await setMentorSession(data.user.id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[teacher-login] 오류:", error);
    return NextResponse.json(
      { success: false, message: "로그인 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
