import { NextResponse } from "next/server";
import { isAdminAuthed } from "@/lib/adminAuth";
import { supabaseAdmin } from "@/lib/supabase";

export async function GET() {
  if (!(await isAdminAuthed())) {
    return NextResponse.json({ success: false, message: "unauthorized" }, { status: 401 });
  }

  const { data, error } = await supabaseAdmin
    .from("purchase_orders")
    .select("*, mentor:mentors(id,name,phone,credit_balance)")
    .order("created_at", { ascending: false })
    .limit(500);

  if (error) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true, orders: data ?? [] });
}
