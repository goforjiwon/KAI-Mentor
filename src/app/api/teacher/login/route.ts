import { NextResponse } from "next/server";
import { setMentorSession } from "@/lib/mentorAuth";
import { consumeRateLimit, readJsonObject, RequestError, requiredString } from "@/lib/requestSecurity";
import { createAuthServerClient, getSupabaseAdmin } from "@/lib/supabase";

export async function POST(request: Request) {
  try {
    if (!(await consumeRateLimit(request, "teacher-login", 10, 15 * 60))) {
      return NextResponse.json(
        { success: false, message: "로그인 시도가 너무 많습니다. 잠시 후 다시 시도해주세요." },
        { status: 429, headers: { "Retry-After": "900" } }
      );
    }
    const body = await readJsonObject(request, 8 * 1024);
    const email = requiredString(body, "email", 254).toLowerCase();
    const password = requiredString(body, "password", 128);

    const authClient = createAuthServerClient();
    const { data, error } = await authClient.auth.signInWithPassword({
      email,
      password,
    });

    if (error || !data.user) {
      return NextResponse.json(
        { success: false, message: "이메일 또는 비밀번호를 확인해주세요." },
        { status: 401 }
      );
    }

    const { data: mentor, error: mentorError } = await getSupabaseAdmin()
      .from("mentors")
      .select("id,status")
      .eq("auth_user_id", data.user.id)
      .maybeSingle();

    if (mentorError) throw mentorError;
    if (!mentor || !["new", "active"].includes(mentor.status)) {
      return NextResponse.json(
        { success: false, message: "현재 이용할 수 없는 선생님 계정입니다." },
        { status: 403 }
      );
    }

    await setMentorSession(data.user.id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[teacher-login] 오류:", error);
    const status = error instanceof RequestError ? error.status : 500;
    return NextResponse.json(
      { success: false, message: error instanceof RequestError ? error.message : "로그인 중 오류가 발생했습니다." },
      { status }
    );
  }
}
