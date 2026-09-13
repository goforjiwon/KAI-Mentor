import { NextResponse } from "next/server";
import { isAdminAuthed } from "@/lib/adminAuth";
import { getSupabaseAdmin } from "@/lib/supabase";
import { readJsonObject, RequestError } from "@/lib/requestSecurity";
import { assertSameOrigin, validUuid } from "@/lib/lessonReportServer";
import { MATCH_FIELDS, matchValues, matchError } from "@/lib/tutoringMatchServer";

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    assertSameOrigin(request);
    if (!(await isAdminAuthed())) throw new RequestError("관리자 로그인이 필요합니다.", 401);
    const { id } = await context.params;
    if (!validUuid(id)) throw new RequestError("잘못된 매칭 번호입니다.");
    const body = await readJsonObject(request, 12000);
    const version = body.version;
    if (typeof version !== "number" || !Number.isSafeInteger(version) || version < 1) throw new RequestError("버전 정보가 없습니다. 새로고침해주세요.");
    const values = matchValues(body);
    const { data, error } = await getSupabaseAdmin().from("tutoring_matches").update({ ...values, version: version + 1, updated_at: new Date().toISOString() }).eq("id", id).eq("version", version).select(MATCH_FIELDS).maybeSingle();
    if (error?.code === "23505") throw new RequestError("동일한 진행 중 매칭이 이미 있습니다.", 409);
    if (error?.code === "23503") throw new RequestError("선택한 강사 또는 학부모 정보가 없습니다.");
    if (error) throw error;
    if (!data) throw new RequestError("다른 곳에서 수정되었거나 삭제된 매칭입니다. 새로고침 후 확인해주세요.", 409);
    return NextResponse.json({ match: data });
  } catch (error) { return matchError(error); }
}
