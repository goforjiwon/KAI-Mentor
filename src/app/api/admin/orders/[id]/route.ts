import { NextResponse } from "next/server";
import { isAdminAuthed } from "@/lib/adminAuth";
import { getSupabaseAdmin } from "@/lib/supabase";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAdminAuthed())) {
    return NextResponse.json({ success: false, message: "unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = (await request.json()) as {
    action?: "approve" | "mismatch";
    adminNote?: string;
  };

  if (body.action === "approve") {
    const { data, error } = await getSupabaseAdmin().rpc("approve_purchase_order", {
      p_order_id: id,
      p_admin_note: body.adminNote?.trim() || null,
    });

    if (error) {
      const alreadyProcessed = error.message.includes("already processed");
      return NextResponse.json(
        {
          success: false,
          message: alreadyProcessed
            ? "이미 처리된 입금 요청입니다."
            : "이용권 충전에 실패했습니다.",
        },
        { status: alreadyProcessed ? 409 : 500 }
      );
    }
    return NextResponse.json({ success: true, result: data });
  }

  if (body.action === "mismatch") {
    const { data, error } = await getSupabaseAdmin()
      .from("purchase_orders")
      .update({ status: "mismatch", admin_note: body.adminNote?.trim() || "입금 정보 불일치" })
      .eq("id", id)
      .eq("status", "pending")
      .select("id")
      .maybeSingle();

    if (error) {
      return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
    if (!data) {
      return NextResponse.json(
        { success: false, message: "이미 처리된 입금 요청입니다." },
        { status: 409 }
      );
    }
    return NextResponse.json({ success: true });
  }

  return NextResponse.json(
    { success: false, message: "지원하지 않는 처리 방식입니다." },
    { status: 400 }
  );
}
