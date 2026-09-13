import "server-only";
import { NextResponse } from "next/server";
import { optionalString, requiredString, RequestError } from "./requestSecurity";
import { validUuid } from "./lessonReportServer";
import { MATCH_STATUSES } from "./tutoringMatches";

export const MATCH_FIELDS = "*,mentor:mentors(name),application:applications(parent_name,school_name,grade)";
export function matchError(error: unknown) {
  if (!(error instanceof RequestError)) console.error("[tutoring-matches] request failed");
  return NextResponse.json({ message: error instanceof RequestError ? error.message : "매칭 정보를 처리하지 못했습니다. 다시 시도해주세요." }, { status: error instanceof RequestError ? error.status : 500 });
}
export function matchValues(body: Record<string, unknown>) {
  const mentor_id = requiredString(body, "mentor_id", 36);
  const application_id = requiredString(body, "application_id", 36);
  if (!validUuid(mentor_id) || !validUuid(application_id)) throw new RequestError("강사와 학부모를 선택해주세요.");
  const status = requiredString(body, "status", 10);
  if (!Object.hasOwn(MATCH_STATUSES, status)) throw new RequestError("매칭 상태를 확인해주세요.");
  function date(key: string) {
    const value = optionalString(body, key, 10);
    if (!value) return null;
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value) || !Number.isFinite(Date.parse(value)) || new Date(value).toISOString().slice(0,10) !== value) throw new RequestError("올바른 날짜를 입력해주세요.");
    return value;
  }
  const started_on = date("started_on");
  const ended_on = date("ended_on");
  if (ended_on && status !== "ended") throw new RequestError("종료일은 계약 종료 상태에서 입력해주세요.");
  if (started_on && ended_on && ended_on < started_on) throw new RequestError("종료일은 시작일보다 빠를 수 없습니다.");
  return { mentor_id, application_id, status, started_on, ended_on,
    student_name: optionalString(body, "student_name", 80), admin_memo: optionalString(body, "admin_memo", 2000) };
}
