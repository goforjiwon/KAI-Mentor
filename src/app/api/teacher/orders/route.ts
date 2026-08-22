import { randomBytes } from "crypto";
import { NextResponse } from "next/server";
import { getAuthedMentor } from "@/lib/mentorAuth";
import { getMatchingPlan } from "@/lib/pricing";
import { readJsonObject, RequestError, requiredString } from "@/lib/requestSecurity";
import { getSupabaseAdmin } from "@/lib/supabase";

function makeOrderNumber() {
  const date = new Date().toISOString().slice(0, 10).replaceAll("-", "");
  return `KM-${date}-${randomBytes(3).toString("hex").toUpperCase()}`;
}

export async function POST(request: Request) {
  try {
    const mentor = await getAuthedMentor();
    if (!mentor) {
      return NextResponse.json(
        { success: false, message: "로그인이 필요합니다." },
        { status: 401 }
      );
    }

    const body = await readJsonObject(request, 8 * 1024);
    const plan = getMatchingPlan(requiredString(body, "planCode", 30));
    const depositorName = requiredString(body, "depositorName", 80);

    if (!plan || !depositorName) {
      return NextResponse.json(
        { success: false, message: "이용권과 입금자명을 확인해주세요." },
        { status: 400 }
      );
    }

    const { data, error } = await getSupabaseAdmin()
      .from("purchase_orders")
      .insert({
        order_number: makeOrderNumber(),
        mentor_id: mentor.id,
        plan_code: plan.code,
        plan_name: plan.name,
        credit_count: plan.credits,
        amount: plan.price,
        depositor_name: depositorName,
        status: "pending",
      })
      .select("*")
      .single();

    if (error?.code === "23505" && plan.code === "first") {
      return NextResponse.json(
        { success: false, message: "첫 매칭 프로모션은 선생님당 한 번만 이용할 수 있습니다." },
        { status: 409 }
      );
    }
    if (error) throw error;
    return NextResponse.json({ success: true, order: data }, { status: 201 });
  } catch (error) {
    console.error("[teacher-orders] 생성 실패:", error);
    const status = error instanceof RequestError ? error.status : 500;
    return NextResponse.json(
      { success: false, message: error instanceof RequestError ? error.message : "입금 확인 요청을 만들지 못했습니다." },
      { status }
    );
  }
}
