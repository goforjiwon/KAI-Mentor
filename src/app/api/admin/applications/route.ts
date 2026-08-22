import { NextResponse } from "next/server";
import { isAdminAuthed } from "@/lib/adminAuth";
import { getSupabaseAdmin } from "@/lib/supabase";

export async function GET() {
  if (!(await isAdminAuthed())) {
    return NextResponse.json({ success: false, message: "unauthorized" }, { status: 401 });
  }

  const { data, error } = await getSupabaseAdmin()
    .from("applications")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(500);

  if (error) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true, applications: data ?? [] });
}
