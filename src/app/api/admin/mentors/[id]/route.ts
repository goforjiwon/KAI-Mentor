import { NextResponse } from "next/server";
import { isAdminAuthed } from "@/lib/adminAuth";
import { getSupabaseAdmin } from "@/lib/supabase";

const ALLOWED_STATUSES = ["new", "active", "inactive", "blocked"];

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAdminAuthed())) {
    return NextResponse.json({ success: false, message: "unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = (await request.json()) as { status?: string; memo?: string };

  const update: Record<string, string> = {};
  if (body.status !== undefined) {
    if (!ALLOWED_STATUSES.includes(body.status)) {
      return NextResponse.json(
        { success: false, message: "유효하지 않은 상태 값" },
        { status: 400 }
      );
    }
    update.status = body.status;
  }
  if (body.memo !== undefined) {
    update.memo = body.memo;
  }

  if (Object.keys(update).length === 0) {
    return NextResponse.json({ success: false, message: "변경 내용 없음" }, { status: 400 });
  }

  const { error } = await getSupabaseAdmin()
    .from("mentors")
    .update(update)
    .eq("id", id);

  if (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
