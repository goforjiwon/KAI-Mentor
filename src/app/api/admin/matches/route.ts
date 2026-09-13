import { NextResponse } from "next/server";
import { isAdminAuthed } from "@/lib/adminAuth";
import { getSupabaseAdmin } from "@/lib/supabase";
import { readJsonObject, requiredString, RequestError } from "@/lib/requestSecurity";
import { assertSameOrigin, validUuid } from "@/lib/lessonReportServer";
import { MATCH_STATUSES } from "@/lib/tutoringMatches";
import { MATCH_FIELDS, matchValues, matchError } from "@/lib/tutoringMatchServer";

export async function GET(request: Request) {
  try {
    if (!(await isAdminAuthed())) throw new RequestError("관리자 로그인이 필요합니다.", 401);
    const params = new URL(request.url).searchParams;
    const page = Number(params.get("page") ?? 0);
    if (!Number.isSafeInteger(page) || page < 0 || page > 100000) throw new RequestError("잘못된 페이지입니다.");
    let query = getSupabaseAdmin().from("tutoring_matches").select(MATCH_FIELDS, { count: "exact" });
    const status = params.get("status");
    if (status) { if (!Object.hasOwn(MATCH_STATUSES, status)) throw new RequestError("잘못된 상태입니다."); query = query.eq("status", status); }
    for (const key of ["mentor_id", "application_id"]) {
      const value = params.get(key);
      if (value) { if (!validUuid(value)) throw new RequestError("잘못된 검색 조건입니다."); query = query.eq(key, value); }
    }
    const search = (params.get("student") ?? "").trim().slice(0,80).replace(/[%_\\]/g, "");
    if (search) query = query.ilike("student_name", `%${search}%`);
    const { data, count, error } = await query.order("created_at", { ascending: false }).order("id").range(page * 20, page * 20 + 19);
    if (error) throw error;
    return NextResponse.json({ matches: data, count }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) { return matchError(error); }
}

export async function POST(request: Request) {
  try {
    assertSameOrigin(request);
    if (!(await isAdminAuthed())) throw new RequestError("관리자 로그인이 필요합니다.", 401);
    const body = await readJsonObject(request, 12000);
    const id = requiredString(body, "id", 36);
    if (!validUuid(id)) throw new RequestError("잘못된 등록 번호입니다.");
    const values = matchValues(body);
    const db = getSupabaseAdmin();
    const { data, error } = await db.from("tutoring_matches").insert({ id, ...values }).select(MATCH_FIELDS).single();
    if (error?.code === "23505") {
      const existing = await db.from("tutoring_matches").select(MATCH_FIELDS).eq("id", id).maybeSingle();
      if (existing.error) throw existing.error;
      if (existing.data && Object.entries(values).every(([key,value]) => existing.data[key] === value)) return NextResponse.json({ match: existing.data });
      throw new RequestError("이미 등록된 매칭입니다. 목록을 새로고침하여 확인해주세요.", 409);
    }
    if (error?.code === "23503") throw new RequestError("선택한 강사 또는 학부모 정보가 없습니다. 새로고침해주세요.");
    if (error) throw error;
    return NextResponse.json({ match: data }, { status: 201 });
  } catch (error) { return matchError(error); }
}
