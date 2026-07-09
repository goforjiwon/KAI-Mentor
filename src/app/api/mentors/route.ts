import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

type MentorPayload = {
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

    const { data, error } = await supabaseAdmin
      .from("mentors")
      .insert({
        name: payload.name.trim(),
        phone: payload.phone.trim(),
        major: payload.major.trim(),
        subjects: payload.subjects.trim(),
        teaching_mode: payload.teachingMode.trim(),
        memo: payload.memo?.trim() ?? "",
        status: "new",
      })
      .select("id")
      .single();

    if (error) {
      console.error("[mentors] Supabase insert 오류:", error);
      throw new Error(`DB 저장 실패: ${error.message}`);
    }

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
