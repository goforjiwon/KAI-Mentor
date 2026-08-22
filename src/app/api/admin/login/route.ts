import { NextResponse } from "next/server";
import { setAdminAuthed } from "@/lib/adminAuth";
import { consumeRateLimit, readJsonObject, RequestError, requiredString } from "@/lib/requestSecurity";

export async function POST(request: Request) {
  try {
    if (!(await consumeRateLimit(request, "admin-login", 5, 15 * 60))) {
      return NextResponse.json(
        { success: false, message: "로그인 시도가 너무 많습니다. 15분 후 다시 시도해주세요." },
        { status: 429, headers: { "Retry-After": "900" } }
      );
    }
    const password = requiredString(await readJsonObject(request, 4 * 1024), "password", 256);
    const ok = await setAdminAuthed(password);
    if (!ok) {
      return NextResponse.json(
        { success: false, message: "비밀번호가 올바르지 않습니다." },
        { status: 401 }
      );
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    const status = error instanceof RequestError ? error.status : 500;
    return NextResponse.json(
      {
        success: false,
        message: error instanceof RequestError ? error.message : "로그인 요청을 처리하지 못했습니다.",
      },
      { status }
    );
  }
}
