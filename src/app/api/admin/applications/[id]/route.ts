import { NextResponse } from "next/server";
import { isAdminAuthed } from "@/lib/adminAuth";
import { getSupabaseAdmin } from "@/lib/supabase";

const ALLOWED_STATUSES = [
  "new",
  "contacted",
  "matching",
  "meeting_scheduled",
  "meeting_done",
  "paid",
  "closed",
  "spam",
];

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAdminAuthed())) {
    return NextResponse.json({ success: false, message: "unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = (await request.json()) as { status?: string; admin_memo?: string };

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
  if (body.admin_memo !== undefined) {
    update.admin_memo = body.admin_memo;
  }

  if (Object.keys(update).length === 0) {
    return NextResponse.json({ success: false, message: "변경 내용 없음" }, { status: 400 });
  }

  const { error } = await getSupabaseAdmin()
    .from("applications")
    .update(update)
    .eq("id", id);

  if (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
