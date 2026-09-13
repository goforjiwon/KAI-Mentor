"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { koreaToday, REPORT_STATUSES, type LessonReport } from "@/lib/lessonReports";

const control = "mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-100";
const button = "rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50";

export function TeacherLessonReports() {
  const [version, setVersion] = useState(0);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);
  const submission = useRef<string | null>(null);
  const lock = useRef(false);
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (lock.current) return;
    lock.current = true;
    const form = event.currentTarget;
    const fields = Object.fromEntries(new FormData(form));
    submission.current ??= crypto.randomUUID();
    setBusy(true); setMessage(""); setSuccess(false);
    try {
      const response = await fetch("/api/teacher/lesson-reports", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...fields, submission_id: submission.current }) });
      const json = await response.json();
      if (!response.ok) throw new Error(json.message);
      setSuccess(true); setMessage("수업 기록을 저장했습니다. 운영자가 확인할 수 있습니다.");
      form.reset(); submission.current = null; setVersion(v => v + 1);
    } catch (error) { setMessage(error instanceof Error ? error.message : "저장 결과를 확인하지 못했습니다. 다시 제출해도 중복 저장되지 않습니다."); }
    finally { setBusy(false); lock.current = false; }
  }
  return <section id="lesson-reports" className="scroll-mt-24 pt-10">
    <h2 className="text-2xl font-bold">수업 기록</h2>
    <p className="mt-2 text-sm text-slate-600">수업 후 핵심 내용만 간단히 남겨주세요. 기록은 선생님 본인과 운영자만 확인합니다.</p>
    <form onSubmit={submit} className="mt-5 rounded-2xl border border-slate-200 bg-white p-5 sm:p-7">
      <fieldset disabled={busy} className="grid gap-4 sm:grid-cols-3">
        <label className="text-sm font-semibold">학생명 *<input name="student_name" required maxLength={80} placeholder="학생 이름 (동명이인은 학교 함께)" className={control} /></label>
        <label className="text-sm font-semibold">수업일 *<input name="lesson_date" type="date" required defaultValue={koreaToday()} min="2020-01-01" max={koreaToday()} className={control} /></label>
        <label className="text-sm font-semibold">과목 *<input name="subject" required maxLength={80} placeholder="예: 중2 수학" className={control} /></label>
        <label className="text-sm font-semibold sm:col-span-3">수업 요약 *<textarea name="summary" required maxLength={1500} rows={3} placeholder="오늘 배운 내용과 학생의 이해도를 2~3줄로 적어주세요." className={control} /></label>
        <label className="text-sm font-semibold sm:col-span-3">진도 현황<textarea name="progress" maxLength={1000} rows={2} placeholder="예: 연립방정식 활용 p.42~48 완료, 다음 시간 도형" className={control} /></label>
        <label className="text-sm font-semibold sm:col-span-3">코멘트 / 과제<textarea name="comment" maxLength={1000} rows={2} placeholder="과제, 보완할 점, 운영자에게 전달할 내용 (선택)" className={control} /></label>
        <div className="sm:col-span-3"><button className={button} disabled={busy}>{busy ? "저장 중…" : "수업 기록 저장"}</button></div>
      </fieldset>
      {message && <p role="status" className={`mt-3 text-sm ${success ? "text-emerald-700" : "text-red-700"}`}>{message}</p>}
    </form>
    <h3 className="mb-4 mt-8 text-lg font-bold">내가 남긴 기록</h3>
    <ReportList admin={false} version={version} />
  </section>;
}

export function ReportList({ admin, version = 0, reportId = "", mentors = [] }: { admin: boolean; version?: number; reportId?: string; mentors?: { id: string; name: string }[] }) {
  const [reports, setReports] = useState<LessonReport[]>([]);
  const [count, setCount] = useState(0);
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [mentor, setMentor] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refresh, setRefresh] = useState(0);
  const reload = useCallback(() => setRefresh(v => v + 1), []);
  useEffect(() => {
    const controller = new AbortController();
    const params = new URLSearchParams({ page: String(page), search, status, mentor, report: reportId });
    async function load() {
      setLoading(true); setError("");
      try {
        const response = await fetch(`/api/${admin ? "admin" : "teacher"}/lesson-reports?${params}`, { cache: "no-store", signal: controller.signal });
        const json = await response.json();
        if (!response.ok) throw new Error(json.message);
        if (!controller.signal.aborted) { setReports(json.reports); setCount(json.count); }
      } catch (e) { if (!controller.signal.aborted) setError(e instanceof Error ? e.message : "기록을 불러오지 못했습니다."); }
      finally { if (!controller.signal.aborted) setLoading(false); }
    }
    void load();
    return () => controller.abort();
  }, [admin, version, page, search, status, mentor, reportId, refresh]);
  return <div>
    {admin && !reportId && <div className="mb-5 grid gap-3 sm:grid-cols-3">
      <label className="text-sm">학생 검색<input className={control} value={search} onChange={e => { setSearch(e.target.value); setPage(0); }} placeholder="학생 이름" maxLength={80} /></label>
      <label className="text-sm">강사<select className={control} value={mentor} onChange={e => { setMentor(e.target.value); setPage(0); }}><option value="">전체 강사</option>{mentors.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}</select></label>
      <label className="text-sm">확인 상태<select className={control} value={status} onChange={e => { setStatus(e.target.value); setPage(0); }}><option value="">전체 상태</option>{Object.entries(REPORT_STATUSES).map(([key,label]) => <option key={key} value={key}>{label}</option>)}</select></label>
    </div>}
    <div className="mb-3 flex items-center justify-between text-sm text-slate-600"><span>{count}건 · 수업일 최신순</span><button onClick={reload} className="font-semibold text-blue-700">새로고침</button></div>
    {error ? <p role="alert" className="rounded-xl bg-red-50 p-4 text-red-700">{error} <button onClick={reload} className="underline">다시 시도</button></p> : loading ? <p role="status" className="py-8 text-center text-slate-500">기록을 불러오는 중…</p> : reports.length === 0 ? <p className="rounded-xl border bg-white p-8 text-center text-slate-500">수업 기록이 없습니다.</p> : <div className="space-y-4">{reports.map(report => <ReportCard key={report.id} report={report} admin={admin} onSaved={updated => setReports(list => list.map(r => r.id === updated.id ? updated : r))} />)}</div>}
    {!loading && !error && count > 20 && <nav aria-label="수업 기록 페이지" className="mt-5 flex items-center justify-center gap-5 text-sm"><button disabled={page === 0} onClick={() => setPage(v => v - 1)} className="disabled:opacity-30">이전</button><span>{page + 1} / {Math.ceil(count / 20)}</span><button disabled={(page + 1) * 20 >= count} onClick={() => setPage(v => v + 1)} className="disabled:opacity-30">다음</button></nav>}
  </div>;
}

function ReportCard({ report, admin, onSaved }: { report: LessonReport; admin: boolean; onSaved: (r: LessonReport) => void }) {
  const [status, setStatus] = useState(report.status);
  const [memo, setMemo] = useState(report.admin_memo ?? "");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  async function save(event: React.FormEvent) {
    event.preventDefault(); setBusy(true); setMessage("");
    try {
      const response = await fetch(`/api/admin/lesson-reports/${report.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status, admin_memo: memo }) });
      const json = await response.json();
      if (!response.ok) throw new Error(json.message);
      onSaved(json.report); setMessage("관리 내용을 저장했습니다.");
    } catch (e) { setMessage(e instanceof Error ? e.message : "저장하지 못했습니다."); }
    finally { setBusy(false); }
  }
  async function retry() {
    setBusy(true); setMessage("");
    try {
      const response = await fetch(`/api/admin/lesson-reports/${report.id}/notify`, { method: "POST" });
      const json = await response.json();
      if (!response.ok) throw new Error(json.message);
      setMessage(json.message);
      onSaved({ ...report, notification_status: json.sent ? "sent" : "failed" });
    } catch (e) { setMessage(e instanceof Error ? e.message : "전송하지 못했습니다."); }
    finally { setBusy(false); }
  }
  return <article className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
    <div className="flex flex-wrap items-center gap-2"><h3 className="font-bold">{report.student_name} · {report.subject}</h3><span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs text-blue-700">{REPORT_STATUSES[report.status]}</span></div>
    <p className="mt-2 text-sm text-slate-500">{report.lesson_date}{admin && ` · ${report.mentor?.name ?? "선생님"}`}</p>
    <dl className="mt-4 space-y-3 text-sm">{[["수업 요약", report.summary], ["진도 현황", report.progress], ["코멘트 / 과제", report.comment]].map(([label, value]) => <div key={label}><dt className="font-semibold text-slate-500">{label}</dt><dd className="mt-1 whitespace-pre-wrap break-words leading-6">{value || "—"}</dd></div>)}</dl>
    {admin && <div className="mt-5 border-t border-slate-200 pt-4">
      <p className="text-xs text-slate-500">텔레그램 알림: {report.notification_status === "sent" ? "전송 완료" : report.notification_status === "failed" ? "전송 실패" : "전송 확인 중"}
        {report.notification_status !== "sent" && <button disabled={busy} onClick={retry} className="ml-3 font-semibold text-blue-700 underline">재전송</button>}</p>
      <form onSubmit={save} className="mt-4 space-y-3">
        <label className="block text-sm font-semibold">확인 상태<select disabled={busy} className={control} value={status} onChange={e => setStatus(e.target.value as LessonReport["status"])}>{Object.entries(REPORT_STATUSES).map(([key,label]) => <option key={key} value={key}>{label}</option>)}</select></label>
        <label className="block text-sm font-semibold">관리자 메모 (강사에게 비공개)<textarea disabled={busy} className={control} rows={2} maxLength={2000} value={memo} onChange={e => setMemo(e.target.value)} placeholder="학부모 전달 사항, 후속 상담 내용 등" /></label>
        <button disabled={busy} className={button}>{busy ? "처리 중…" : "관리 내용 저장"}</button>
      </form>
      {message && <p role="status" className="mt-3 text-sm text-blue-700">{message}</p>}
    </div>}
  </article>;
}
