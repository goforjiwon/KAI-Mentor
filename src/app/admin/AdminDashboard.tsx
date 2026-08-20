"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { formatWon } from "@/lib/pricing";
import type {
  ApplicationRow,
  ApplicationStatus,
  MentorRow,
  MentorStatus,
  PurchaseOrderRow,
} from "@/lib/supabase";

const APPLICATION_LABELS: Record<ApplicationStatus, string> = {
  new: "신규",
  contacted: "연락 완료",
  matching: "매칭 중",
  meeting_scheduled: "미팅 예정",
  meeting_done: "미팅 완료",
  paid: "입금 완료",
  closed: "종료",
  spam: "스팸",
};

const MENTOR_LABELS: Record<MentorStatus, string> = {
  new: "신규",
  active: "활동 가능",
  inactive: "일시 중지",
  blocked: "제외",
};

const STATUS_COLOR: Record<string, string> = {
  new: "bg-blue-50 text-blue-700 ring-blue-200",
  active: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  contacted: "bg-indigo-50 text-indigo-700 ring-indigo-200",
  matching: "bg-amber-50 text-amber-700 ring-amber-200",
  meeting_scheduled: "bg-purple-50 text-purple-700 ring-purple-200",
  meeting_done: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  paid: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  inactive: "bg-slate-100 text-slate-600 ring-slate-200",
  closed: "bg-slate-100 text-slate-600 ring-slate-200",
  blocked: "bg-red-50 text-red-700 ring-red-200",
  spam: "bg-red-50 text-red-700 ring-red-200",
};

function formatDate(value: string) {
  return new Date(value).toLocaleString("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function join(values: string[]) {
  return values.length ? values.join(", ") : "";
}

export default function AdminDashboard({
  initialApplications,
  initialMentors,
  initialOrders,
}: {
  initialApplications: ApplicationRow[];
  initialMentors: MentorRow[];
  initialOrders: PurchaseOrderRow[];
}) {
  const router = useRouter();
  const [applications, setApplications] = useState(initialApplications);
  const [mentors, setMentors] = useState(initialMentors);
  const [orders, setOrders] = useState(initialOrders);
  const [view, setView] = useState<"members" | "orders" | "applications">("orders");
  const [applicationFilter, setApplicationFilter] = useState<ApplicationStatus | "all">("all");
  const [mentorFilter, setMentorFilter] = useState<MentorStatus | "all">("all");
  const [expandedApplication, setExpandedApplication] = useState<string | null>(null);
  const [expandedMentor, setExpandedMentor] = useState<string | null>(null);
  const [processingOrder, setProcessingOrder] = useState<string | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);

  const refreshAll = useCallback(async () => {
    const [applicationsRes, mentorsRes, ordersRes] = await Promise.all([
      fetch("/api/admin/applications", { cache: "no-store" }),
      fetch("/api/admin/mentors", { cache: "no-store" }),
      fetch("/api/admin/orders", { cache: "no-store" }),
    ]);
    const [applicationsJson, mentorsJson, ordersJson] = await Promise.all([
      applicationsRes.json(),
      mentorsRes.json(),
      ordersRes.json(),
    ]);
    if (applicationsJson.success) setApplications(applicationsJson.applications);
    if (mentorsJson.success) setMentors(mentorsJson.mentors);
    if (ordersJson.success) setOrders(ordersJson.orders);
  }, []);

  useEffect(() => {
    if (!autoRefresh) return;
    const timer = setInterval(() => refreshAll().catch(() => undefined), 30_000);
    return () => clearInterval(timer);
  }, [autoRefresh, refreshAll]);

  const monthStart = useMemo(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1).getTime();
  }, []);
  const teacherMembers = mentors.filter((mentor) => mentor.auth_user_id).length;
  const thisMonthNew =
    applications.filter((item) => new Date(item.created_at).getTime() >= monthStart).length +
    mentors.filter((item) => new Date(item.created_at).getTime() >= monthStart).length;
  const pendingOrders = orders.filter((order) => order.status === "pending");
  const paidOrders = orders.filter((order) => order.status === "paid");
  const totalCredits = paidOrders.reduce((sum, order) => sum + order.credit_count, 0);

  const filteredApplications = applicationFilter === "all"
    ? applications
    : applications.filter((item) => item.status === applicationFilter);
  const filteredMentors = mentorFilter === "all"
    ? mentors
    : mentors.filter((item) => item.status === mentorFilter);

  async function handleOrder(id: string, action: "approve" | "mismatch") {
    const question = action === "approve"
      ? "실제 입금을 확인했고 이용권을 충전할까요?"
      : "입금 정보 불일치로 표시할까요?";
    if (!confirm(question)) return;

    setProcessingOrder(id);
    try {
      const response = await fetch(`/api/admin/orders/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      const json = await response.json();
      if (!response.ok) throw new Error(json.message ?? "처리하지 못했습니다.");
      await refreshAll();
    } catch (error) {
      alert(error instanceof Error ? error.message : "처리하지 못했습니다.");
    } finally {
      setProcessingOrder(null);
    }
  }

  async function updateApplication(id: string, patch: Partial<ApplicationRow>) {
    const response = await fetch(`/api/admin/applications/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    });
    if (!response.ok) return alert("변경 내용을 저장하지 못했습니다.");
    setApplications((list) => list.map((item) => item.id === id ? { ...item, ...patch } : item));
  }

  async function updateMentor(id: string, patch: Partial<MentorRow>) {
    const response = await fetch(`/api/admin/mentors/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    });
    if (!response.ok) return alert("변경 내용을 저장하지 못했습니다.");
    setMentors((list) => list.map((item) => item.id === id ? { ...item, ...patch } : item));
  }

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-950">
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
          <div>
            <p className="text-lg font-bold tracking-tight">카이멘토 운영</p>
            <p className="hidden text-xs text-slate-500 sm:block">회원·입금·이용권·매칭 신청 통합 관리</p>
          </div>
          <div className="flex items-center gap-4">
            <label className="hidden items-center gap-2 text-xs text-slate-600 sm:flex">
              <input type="checkbox" checked={autoRefresh} onChange={(e) => setAutoRefresh(e.target.checked)} className="accent-blue-600" />
              30초 자동 갱신
            </label>
            <button onClick={logout} className="text-sm font-semibold text-slate-600 hover:text-slate-950">로그아웃</button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <section className="grid overflow-hidden rounded-2xl border border-slate-200 bg-white sm:grid-cols-2 xl:grid-cols-5">
          <Metric label="선생님 회원" value={`${teacherMembers}명`} />
          <Metric label="학부모 신청자" value={`${applications.length}명`} />
          <Metric label="이번 달 신규" value={`${thisMonthNew}명`} />
          <Metric label="입금 확인 대기" value={`${pendingOrders.length}건`} />
          <Metric label="총 충전 이용권" value={`${totalCredits}회`} />
        </section>

        <nav className="mt-8 flex gap-7 border-b border-slate-200 text-sm font-semibold">
          <Tab active={view === "members"} onClick={() => setView("members")}>회원 현황</Tab>
          <Tab active={view === "orders"} onClick={() => setView("orders")}>입금·이용권</Tab>
          <Tab active={view === "applications"} onClick={() => setView("applications")}>매칭 신청</Tab>
        </nav>

        {view === "orders" && (
          <section className="pt-8">
            <div className="flex items-end justify-between gap-4">
              <div><h1 className="text-2xl font-bold">입금 확인 대기</h1><p className="mt-2 text-sm text-slate-600">실제 통장 입금을 확인한 뒤 충전하세요.</p></div>
              <span className="text-sm font-semibold text-amber-700">{pendingOrders.length}건 대기</span>
            </div>
            <div className="mt-5 overflow-hidden rounded-2xl border border-slate-200 bg-white">
              {pendingOrders.length === 0 ? <Empty text="입금 확인을 기다리는 요청이 없습니다." /> : (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[900px] text-left text-sm">
                    <thead className="border-b border-slate-200 bg-slate-50 text-xs text-slate-500"><tr><Th>신청일</Th><Th>선생님</Th><Th>입금자명</Th><Th>요금제</Th><Th>입금액</Th><Th>처리</Th></tr></thead>
                    <tbody className="divide-y divide-slate-100">
                      {pendingOrders.map((order) => (
                        <tr key={order.id} className="hover:bg-slate-50/70">
                          <Td>{formatDate(order.created_at)}</Td>
                          <Td><b>{order.mentor?.name ?? "(삭제된 회원)"}</b><span className="mt-0.5 block text-xs text-slate-500">{order.mentor?.phone}</span></Td>
                          <Td><b>{order.depositor_name}</b><span className="mt-0.5 block text-xs text-slate-400">{order.order_number}</span></Td>
                          <Td>{order.plan_name}<span className="mt-0.5 block text-xs text-slate-500">{order.credit_count}회 충전</span></Td>
                          <Td><b>{formatWon(order.amount)}</b></Td>
                          <Td><div className="flex gap-2"><button disabled={processingOrder === order.id} onClick={() => handleOrder(order.id, "approve")} className="rounded-lg bg-blue-600 px-3 py-2 text-xs font-bold text-white hover:bg-blue-700 disabled:opacity-50">입금 확인·충전</button><button disabled={processingOrder === order.id} onClick={() => handleOrder(order.id, "mismatch")} className="rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 disabled:opacity-50">불일치</button></div></Td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              <p className="border-t border-blue-100 bg-blue-50 px-5 py-3 text-xs text-blue-800">입금 확인 후 해당 선생님의 이용권이 자동으로 증가합니다.</p>
            </div>

            <h2 className="mt-10 text-xl font-bold">최근 충전 내역</h2>
            <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200 bg-white">
              {paidOrders.length === 0 ? <Empty text="아직 충전 완료 내역이 없습니다." /> : (
                <div className="overflow-x-auto"><table className="w-full min-w-[780px] text-left text-sm"><thead className="border-b border-slate-200 bg-slate-50 text-xs text-slate-500"><tr><Th>충전일</Th><Th>선생님</Th><Th>요금제</Th><Th>입금액</Th><Th>충전 이용권</Th><Th>상태</Th></tr></thead><tbody className="divide-y divide-slate-100">{paidOrders.slice(0, 15).map((order) => <tr key={order.id}><Td>{formatDate(order.confirmed_at ?? order.created_at)}</Td><Td>{order.mentor?.name ?? "-"}</Td><Td>{order.plan_name}</Td><Td>{formatWon(order.amount)}</Td><Td>{order.credit_count}회</Td><Td><Status text="충전 완료" status="paid" /></Td></tr>)}</tbody></table></div>
              )}
            </div>
          </section>
        )}

        {view === "members" && (
          <section className="pt-8">
            <div className="flex flex-wrap gap-2"> <Filter active={mentorFilter === "all"} onClick={() => setMentorFilter("all")}>전체 {mentors.length}</Filter>{(Object.keys(MENTOR_LABELS) as MentorStatus[]).map((status) => <Filter key={status} active={mentorFilter === status} onClick={() => setMentorFilter(status)}>{MENTOR_LABELS[status]} {mentors.filter((mentor) => mentor.status === status).length}</Filter>)}</div>
            <div className="mt-5 space-y-3">{filteredMentors.length === 0 ? <Empty text="해당 상태의 선생님이 없습니다." /> : filteredMentors.map((mentor) => {
              const open = expandedMentor === mentor.id;
              return <article key={mentor.id} className="overflow-hidden rounded-2xl border border-slate-200 bg-white"><button onClick={() => setExpandedMentor(open ? null : mentor.id)} className="w-full p-5 text-left hover:bg-slate-50"><div className="flex flex-wrap items-center gap-2"><Status status={mentor.status} text={MENTOR_LABELS[mentor.status]} /><span className="text-xs text-slate-400">{formatDate(mentor.created_at)}</span>{mentor.auth_user_id ? <span className="text-xs font-semibold text-blue-700">회원가입 완료</span> : <span className="text-xs text-slate-400">기존 등록</span>}</div><div className="mt-2 flex flex-wrap gap-x-3 text-sm"><b className="text-base">{mentor.name}</b><span className="text-blue-700">{mentor.phone}</span><span>{mentor.email ?? "이메일 없음"}</span><span>{mentor.major}</span><span>{mentor.subjects}</span><span className="font-semibold text-emerald-700">이용권 {mentor.credit_balance ?? 0}회</span></div></button>{open && <div className="grid gap-5 border-t border-slate-200 bg-slate-50 p-5 sm:grid-cols-2"><Details rows={[["가능 방식", mentor.teaching_mode], ["가입 이메일", mentor.email ?? ""], ["누적 구매", `${mentor.total_credits_purchased ?? 0}회`], ["사용 완료", `${mentor.total_credits_used ?? 0}회`], ["메모", mentor.memo]]} /><div><p className="mb-2 text-xs font-semibold text-slate-500">활동 상태</p><div className="flex flex-wrap gap-2">{(Object.keys(MENTOR_LABELS) as MentorStatus[]).map((status) => <button key={status} onClick={() => updateMentor(mentor.id, { status })} className={`rounded-full px-3 py-1.5 text-xs font-semibold ring-1 ${mentor.status === status ? STATUS_COLOR[status] : "bg-white text-slate-600 ring-slate-200"}`}>{MENTOR_LABELS[status]}</button>)}</div></div></div>}</article>;
            })}</div>
          </section>
        )}

        {view === "applications" && (
          <section className="pt-8">
            <div className="flex flex-wrap gap-2"><Filter active={applicationFilter === "all"} onClick={() => setApplicationFilter("all")}>전체 {applications.length}</Filter>{(Object.keys(APPLICATION_LABELS) as ApplicationStatus[]).map((status) => <Filter key={status} active={applicationFilter === status} onClick={() => setApplicationFilter(status)}>{APPLICATION_LABELS[status]} {applications.filter((item) => item.status === status).length}</Filter>)}</div>
            <div className="mt-5 space-y-3">{filteredApplications.length === 0 ? <Empty text="해당 상태의 신청이 없습니다." /> : filteredApplications.map((application) => {
              const open = expandedApplication === application.id;
              return <article key={application.id} className="overflow-hidden rounded-2xl border border-slate-200 bg-white"><button onClick={() => setExpandedApplication(open ? null : application.id)} className="w-full p-5 text-left hover:bg-slate-50"><div className="flex flex-wrap items-center gap-2"><Status status={application.status} text={APPLICATION_LABELS[application.status]} /><span className="text-xs text-slate-400">{formatDate(application.created_at)}</span></div><div className="mt-2 flex flex-wrap gap-x-3 text-sm"><b className="text-base">{application.parent_name}</b><span className="text-blue-700">{application.phone}</span><span>{application.school_name || "학교 미입력"}</span><span>{application.student_gender || "성별 미입력"}</span><span>{application.grade}</span><span>{join(application.subjects)}</span><span className="font-semibold text-emerald-700">{join(application.preferred_days ?? [])} {application.preferred_time}</span></div></button>{open && <div className="space-y-5 border-t border-slate-200 bg-slate-50 p-5"><Details rows={[["학교명", application.school_name], ["학생 성별", application.student_gender], ["현재 성적·수준", application.current_level], ["어려워하는 부분", application.difficulties], ["목표", application.goal], ["목표 시점", application.goal_date], ["자녀 성향", join(application.child_personality)], ["멘토에게 바라는 점", application.mentor_priority], ["가능한 요일", join(application.preferred_days ?? [])], ["가능한 시간", application.preferred_time], ["희망 시작일", application.desired_start_date], ["기타", application.extra_note]]} /><div><p className="mb-2 text-xs font-semibold text-slate-500">상태 변경</p><div className="flex flex-wrap gap-2">{(Object.keys(APPLICATION_LABELS) as ApplicationStatus[]).map((status) => <button key={status} onClick={() => updateApplication(application.id, { status })} className={`rounded-full px-3 py-1.5 text-xs font-semibold ring-1 ${application.status === status ? STATUS_COLOR[status] : "bg-white text-slate-600 ring-slate-200"}`}>{APPLICATION_LABELS[status]}</button>)}</div></div><Memo initial={application.admin_memo ?? ""} onSave={(admin_memo) => updateApplication(application.id, { admin_memo })} /></div>}</article>;
            })}</div>
          </section>
        )}
      </main>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) { return <div className="border-b border-slate-200 px-5 py-5 last:border-0 sm:border-b-0 sm:border-r"><p className="text-xs font-semibold text-slate-500">{label}</p><p className="mt-2 text-2xl font-bold text-blue-700">{value}</p></div>; }
function Tab({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) { return <button onClick={onClick} className={`border-b-2 px-1 pb-3 transition ${active ? "border-blue-600 text-blue-700" : "border-transparent text-slate-500 hover:text-slate-900"}`}>{children}</button>; }
function Filter({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) { return <button onClick={onClick} className={`rounded-full px-3 py-1.5 text-xs font-semibold ring-1 ${active ? "bg-slate-900 text-white ring-slate-900" : "bg-white text-slate-600 ring-slate-200 hover:bg-slate-100"}`}>{children}</button>; }
function Status({ status, text }: { status: string; text: string }) { return <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${STATUS_COLOR[status] ?? "bg-slate-100 text-slate-600 ring-slate-200"}`}>{text}</span>; }
function Empty({ text }: { text: string }) { return <div className="rounded-2xl border border-slate-200 bg-white px-6 py-12 text-center text-sm text-slate-500">{text}</div>; }
function Th({ children }: { children: React.ReactNode }) { return <th className="px-5 py-3.5 font-semibold">{children}</th>; }
function Td({ children }: { children: React.ReactNode }) { return <td className="px-5 py-4 align-middle text-slate-700">{children}</td>; }
function Details({ rows }: { rows: Array<[string, string]> }) { return <dl className="grid gap-4 sm:grid-cols-2">{rows.map(([label, value]) => <div key={label}><dt className="text-xs font-semibold text-slate-500">{label}</dt><dd className="mt-1 whitespace-pre-line text-sm text-slate-800">{value || <span className="text-slate-400">(미입력)</span>}</dd></div>)}</dl>; }
function Memo({ initial, onSave }: { initial: string; onSave: (value: string) => Promise<void> | void }) { const [value, setValue] = useState(initial); const [saving, setSaving] = useState(false); return <div><label className="mb-2 block text-xs font-semibold text-slate-500">운영 메모</label><textarea rows={3} value={value} onChange={(e) => setValue(e.target.value)} className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-100" /><button onClick={async () => { setSaving(true); await onSave(value); setSaving(false); }} disabled={saving} className="mt-2 rounded-lg bg-slate-900 px-3 py-2 text-xs font-semibold text-white disabled:opacity-50">{saving ? "저장 중..." : "메모 저장"}</button></div>; }
