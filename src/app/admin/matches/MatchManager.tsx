"use client";

import { useEffect, useRef, useState } from "react";
import { MATCH_STATUSES, type MatchChoices, type TutoringMatch } from "@/lib/tutoringMatches";

const input = "mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100";
const button = "rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50";
const colors = { active: "bg-emerald-50 text-emerald-700", paused: "bg-amber-50 text-amber-700", ended: "bg-slate-100 text-slate-600" };

export default function MatchManager({ choices }: { choices: MatchChoices }) {
  const [matches, setMatches] = useState<TutoringMatch[]>([]);
  const [count, setCount] = useState(0);
  const [page, setPage] = useState(0);
  const [status, setStatus] = useState("");
  const [mentor, setMentor] = useState("");
  const [parent, setParent] = useState("");
  const [student, setStudent] = useState("");
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [refresh, setRefresh] = useState(0);
  const dirty = useRef(false);
  function discardDraft() { return !dirty.current || window.confirm("저장하지 않은 변경 사항을 닫을까요?"); }
  function changeFilter(action: () => void) {
    if (!discardDraft()) return;
    dirty.current = false; setEditing(null); setCreating(false); setPage(0); action();
  }
  useEffect(() => {
    const controller = new AbortController();
    async function load() {
      setLoading(true); setError("");
      try {
        const params = new URLSearchParams({ page: String(page), status, mentor_id: mentor, application_id: parent, student });
        const response = await fetch(`/api/admin/matches?${params}`, { cache: "no-store", signal: controller.signal });
        const json = await response.json();
        if (!response.ok) throw new Error(json.message);
        if (!controller.signal.aborted) { setMatches(json.matches); setCount(json.count); }
      } catch (e) { if (!controller.signal.aborted) setError(e instanceof Error ? e.message : "매칭 정보를 불러오지 못했습니다."); }
      finally { if (!controller.signal.aborted) setLoading(false); }
    }
    void load(); return () => controller.abort();
  }, [page, status, mentor, parent, student, refresh]);
  function saved() {
    dirty.current = false; setCreating(false); setEditing(null); setMessage("매칭 정보를 저장했습니다."); setRefresh(v => v + 1);
  }
  const editingMatch = matches.find(m => m.id === editing);
  return <div>
    <div className="flex flex-wrap items-center justify-between gap-3">
      <p className="text-sm text-slate-600">계약이 종료된 매칭도 이력으로 보관합니다.</p>
      <button className={button} onClick={() => { if (!discardDraft()) return; dirty.current = false; setEditing(null); setCreating(true); setMessage(""); }}>새 매칭 등록</button>
    </div>
    {creating && <div className="mt-5 rounded-2xl border border-blue-200 bg-white p-5"><h2 className="mb-4 text-lg font-bold">새 매칭 등록</h2><MatchForm choices={choices} onDirty={() => { dirty.current = true; }} onSaved={saved} onCancel={() => { if (discardDraft()) { dirty.current = false; setCreating(false); } }} /></div>}
    {editingMatch && <div className="mt-5 rounded-2xl border border-blue-200 bg-white p-5"><h2 className="mb-4 text-lg font-bold">매칭 정보 수정</h2><MatchForm key={editingMatch.id} match={editingMatch} choices={choices} onDirty={() => { dirty.current = true; }} onSaved={saved} onCancel={() => { if (discardDraft()) { dirty.current = false; setEditing(null); } }} /></div>}
    {message && <p role="status" className="mt-4 text-sm text-emerald-700">{message}</p>}
    <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      <label className="text-sm font-semibold">상태<select className={input} value={status} onChange={e => changeFilter(() => setStatus(e.target.value))}><option value="">전체 상태</option>{Object.entries(MATCH_STATUSES).map(([key,label]) => <option key={key} value={key}>{label}</option>)}</select></label>
      <label className="text-sm font-semibold">선생님<select className={input} value={mentor} onChange={e => changeFilter(() => setMentor(e.target.value))}><option value="">전체 선생님</option>{choices.mentors.map(m => <option key={m.id} value={m.id}>{m.name} · {m.has_login ? "가입 계정" : "기존 등록"}</option>)}</select></label>
      <label className="text-sm font-semibold">학부모<select className={input} value={parent} onChange={e => changeFilter(() => setParent(e.target.value))}><option value="">전체 학부모</option>{choices.applications.map(a => <option key={a.id} value={a.id}>{parentLabel(a)}</option>)}</select></label>
      <label className="text-sm font-semibold">학생 검색<input className={input} value={student} maxLength={80} placeholder="학생 이름" onChange={e => changeFilter(() => setStudent(e.target.value))} /></label>
    </div>
    <div className="my-4 flex items-center justify-between text-sm text-slate-600"><span>총 {count}건</span><button className="font-semibold text-blue-700" onClick={() => changeFilter(() => setRefresh(v => v + 1))}>새로고침</button></div>
    {error ? <p role="alert" className="rounded-xl bg-red-50 p-4 text-red-700">{error}</p> : loading ? <p role="status" className="py-10 text-center text-slate-500">매칭 정보를 불러오는 중…</p> : matches.length === 0 ? <p className="rounded-2xl border bg-white p-10 text-center text-slate-500">해당하는 매칭이 없습니다.</p> : <div className="space-y-4">{matches.map(match => <article key={match.id} className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
      <div className="flex items-center justify-between gap-3"><span className={`rounded-full px-3 py-1 text-xs font-semibold ${colors[match.status]}`}>{MATCH_STATUSES[match.status]}</span><button className="text-sm font-semibold text-blue-700" onClick={() => { if (!discardDraft()) return; dirty.current = false; setCreating(false); setEditing(match.id); setMessage(""); window.scrollTo({ top: 0, behavior: "smooth" }); }}>수정</button></div>
      <dl className="mt-4 grid gap-4 sm:grid-cols-3"><Person label="선생님" value={match.mentor?.name ?? "정보 없음"} /><Person label="학생" value={match.student_name || "이름 미입력"} /><Person label="학부모" value={match.application?.parent_name ?? "정보 없음"} /></dl>
      <p className="mt-4 text-sm text-slate-500">{[match.application?.school_name,match.application?.grade].filter(Boolean).join(" · ") || "학교·학년 미입력"}</p>
      <p className="mt-2 text-sm text-slate-500">시작일 {match.started_on || "미입력"}{match.status === "ended" && ` · 종료일 ${match.ended_on || "미입력"}`}</p>
      {match.admin_memo && <p className="mt-4 whitespace-pre-wrap break-words rounded-xl bg-slate-50 p-3 text-sm leading-6">{match.admin_memo}</p>}
    </article>)}</div>}
    {!loading && !error && count > 20 && <nav aria-label="매칭 목록 페이지" className="mt-6 flex items-center justify-center gap-5 text-sm"><button disabled={page === 0} className="disabled:opacity-30" onClick={() => { if (discardDraft()) { dirty.current = false; setEditing(null); setCreating(false); setPage(v => v - 1); } }}>이전</button><span>{page + 1} / {Math.ceil(count / 20)}</span><button disabled={(page + 1) * 20 >= count} className="disabled:opacity-30" onClick={() => { if (discardDraft()) { dirty.current = false; setEditing(null); setCreating(false); setPage(v => v + 1); } }}>다음</button></nav>}
  </div>;
}

function parentLabel(a: MatchChoices["applications"][number]) { return [a.parent_name,a.school_name,a.grade].filter(Boolean).join(" · "); }
function Person({ label, value }: { label: string; value: string }) { return <div><dt className="text-xs font-semibold text-slate-500">{label}</dt><dd className="mt-1 break-words text-lg font-bold">{value}</dd></div>; }

function MatchForm({ choices, match, onSaved, onCancel, onDirty }: { choices: MatchChoices; match?: TutoringMatch; onSaved: () => void; onCancel: () => void; onDirty: () => void }) {
  const [status, setStatus] = useState(match?.status ?? "active");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const lock = useRef(false);
  const id = useRef<string | null>(null);
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); if (lock.current) return;
    lock.current = true; setBusy(true); setError("");
    const fields = Object.fromEntries(new FormData(event.currentTarget));
    id.current ??= crypto.randomUUID();
    try {
      const response = await fetch(`/api/admin/matches${match ? `/${match.id}` : ""}`, { method: match ? "PATCH" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...fields, ended_on: status === "ended" ? fields.ended_on : "", id: id.current, version: match?.version }) });
      const json = await response.json();
      if (!response.ok) throw new Error(json.message);
      onSaved();
    } catch (e) { setError(e instanceof Error ? e.message : "저장하지 못했습니다. 다시 시도해주세요."); }
    finally { setBusy(false); lock.current = false; }
  }
  return <form onSubmit={submit} onChange={onDirty}>
    <fieldset disabled={busy} className="grid gap-4 sm:grid-cols-2">
      <label className="text-sm font-semibold">선생님 *<select className={input} name="mentor_id" required defaultValue={match?.mentor_id ?? ""}><option value="" disabled>선생님 선택</option>{choices.mentors.map(m => <option key={m.id} value={m.id}>{m.name} · {m.has_login ? "가입 계정" : "기존 등록"}</option>)}</select></label>
      <label className="text-sm font-semibold">학부모 *<select className={input} name="application_id" required defaultValue={match?.application_id ?? ""}><option value="" disabled>학부모 선택</option>{choices.applications.map(a => <option key={a.id} value={a.id}>{parentLabel(a)}</option>)}</select></label>
      <label className="text-sm font-semibold">학생 이름<input className={input} name="student_name" maxLength={80} defaultValue={match?.student_name ?? ""} placeholder="아직 모르면 비워두세요" /></label>
      <label className="text-sm font-semibold">매칭 상태<select className={input} name="status" value={status} onChange={e => setStatus(e.target.value as TutoringMatch["status"])}>{Object.entries(MATCH_STATUSES).map(([key,label]) => <option key={key} value={key}>{label}</option>)}</select></label>
      <label className="text-sm font-semibold">시작일 (선택)<input className={input} type="date" name="started_on" defaultValue={match?.started_on ?? ""} /></label>
      {status === "ended" && <label className="text-sm font-semibold">종료일 (선택)<input className={input} type="date" name="ended_on" defaultValue={match?.ended_on ?? ""} /></label>}
      <label className="text-sm font-semibold sm:col-span-2">관리 메모<textarea className={input} name="admin_memo" maxLength={2000} rows={3} defaultValue={match?.admin_memo ?? ""} placeholder="수업 일정, 계약 종료 사유 등 확인된 내용만 남겨주세요." /></label>
      <p className="text-xs text-slate-500 sm:col-span-2">학부모 목록은 기존 매칭 신청에서 가져옵니다. 날짜를 모르는 경우 비워둘 수 있습니다.</p>
      <div className="flex gap-3 sm:col-span-2"><button className={button} disabled={busy}>{busy ? "저장 중…" : "매칭 저장"}</button><button className="px-3 text-sm text-slate-600" type="button" onClick={onCancel} disabled={busy}>취소</button></div>
    </fieldset>
    {error && <p role="alert" className="mt-3 text-sm text-red-700">{error}</p>}
  </form>;
}
