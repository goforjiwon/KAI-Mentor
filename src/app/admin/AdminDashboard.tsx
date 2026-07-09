"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type {
  ApplicationRow,
  ApplicationStatus,
  MentorRow,
  MentorStatus,
} from "@/lib/supabase";

const STATUS_LABELS: Record<ApplicationStatus, string> = {
  new: "🆕 신규",
  contacted: "📞 연락 완료",
  matching: "🔎 매칭 중",
  meeting_scheduled: "📅 미팅 예정",
  meeting_done: "✅ 미팅 완료",
  paid: "💰 입금 완료",
  closed: "🔒 종료",
  spam: "🚫 스팸",
};

const STATUS_COLORS: Record<ApplicationStatus, string> = {
  new: "bg-blue-100 text-blue-800",
  contacted: "bg-indigo-100 text-indigo-800",
  matching: "bg-amber-100 text-amber-800",
  meeting_scheduled: "bg-purple-100 text-purple-800",
  meeting_done: "bg-emerald-100 text-emerald-800",
  paid: "bg-green-100 text-green-800",
  closed: "bg-slate-200 text-slate-700",
  spam: "bg-red-100 text-red-800",
};

const MENTOR_STATUS_LABELS: Record<MentorStatus, string> = {
  new: "신규",
  active: "활동 가능",
  inactive: "일시 중지",
  blocked: "제외",
};

const MENTOR_STATUS_COLORS: Record<MentorStatus, string> = {
  new: "bg-blue-100 text-blue-800",
  active: "bg-emerald-100 text-emerald-800",
  inactive: "bg-slate-200 text-slate-700",
  blocked: "bg-red-100 text-red-800",
};

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleString("ko-KR", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function joinValues(values: string[]) {
  return values.length > 0 ? values.join(", ") : "";
}

export default function AdminDashboard({
  initialApplications,
  initialMentors,
}: {
  initialApplications: ApplicationRow[];
  initialMentors: MentorRow[];
}) {
  const router = useRouter();
  const [apps, setApps] = useState<ApplicationRow[]>(initialApplications);
  const [mentors, setMentors] = useState<MentorRow[]>(initialMentors);
  const [view, setView] = useState<"applications" | "mentors">("applications");
  const [filter, setFilter] = useState<ApplicationStatus | "all">("all");
  const [mentorFilter, setMentorFilter] = useState<MentorStatus | "all">("all");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [expandedMentor, setExpandedMentor] = useState<string | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);

  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(async () => {
      try {
        const [applicationsRes, mentorsRes] = await Promise.all([
          fetch("/api/admin/applications", { cache: "no-store" }),
          fetch("/api/admin/mentors", { cache: "no-store" }),
        ]);
        const applicationsJson = await applicationsRes.json();
        const mentorsJson = await mentorsRes.json();
        if (applicationsJson.success) setApps(applicationsJson.applications);
        if (mentorsJson.success) setMentors(mentorsJson.mentors);
      } catch {
        // 무시
      }
    }, 30000);
    return () => clearInterval(interval);
  }, [autoRefresh]);

  const filtered = useMemo(() => {
    if (filter === "all") return apps;
    return apps.filter((a) => a.status === filter);
  }, [apps, filter]);

  const filteredMentors = useMemo(() => {
    if (mentorFilter === "all") return mentors;
    return mentors.filter((m) => m.status === mentorFilter);
  }, [mentors, mentorFilter]);

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: apps.length };
    apps.forEach((a) => {
      c[a.status] = (c[a.status] ?? 0) + 1;
    });
    return c;
  }, [apps]);

  const mentorCounts = useMemo(() => {
    const c: Record<string, number> = { all: mentors.length };
    mentors.forEach((m) => {
      c[m.status] = (c[m.status] ?? 0) + 1;
    });
    return c;
  }, [mentors]);

  async function updateStatus(id: string, status: ApplicationStatus) {
    const prev = apps;
    setApps((list) =>
      list.map((a) => (a.id === id ? { ...a, status } : a))
    );
    const res = await fetch(`/api/admin/applications/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (!res.ok) {
      alert("상태 변경 실패");
      setApps(prev);
    }
  }

  async function updateMemo(id: string, memo: string) {
    await fetch(`/api/admin/applications/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ admin_memo: memo }),
    });
    setApps((list) =>
      list.map((a) => (a.id === id ? { ...a, admin_memo: memo } : a))
    );
  }

  async function updateMentorStatus(id: string, status: MentorStatus) {
    const prev = mentors;
    setMentors((list) =>
      list.map((m) => (m.id === id ? { ...m, status } : m))
    );
    const res = await fetch(`/api/admin/mentors/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (!res.ok) {
      alert("상태 변경 실패");
      setMentors(prev);
    }
  }

  async function updateMentorMemo(id: string, memo: string) {
    await fetch(`/api/admin/mentors/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ memo }),
    });
    setMentors((list) =>
      list.map((m) => (m.id === id ? { ...m, memo } : m))
    );
  }

  async function deleteApp(id: string) {
    if (!confirm("정말 삭제하시겠어요? 되돌릴 수 없습니다.")) return;
    const res = await fetch(`/api/admin/applications/${id}`, { method: "DELETE" });
    if (res.ok) {
      setApps((list) => list.filter((a) => a.id !== id));
    } else {
      alert("삭제 실패");
    }
  }

  async function deleteMentor(id: string) {
    if (!confirm("정말 삭제하시겠어요? 되돌릴 수 없습니다.")) return;
    const res = await fetch(`/api/admin/mentors/${id}`, { method: "DELETE" });
    if (res.ok) {
      setMentors((list) => list.filter((m) => m.id !== id));
    } else {
      alert("삭제 실패");
    }
  }

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b bg-white sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-base font-bold text-slate-900">카이멘토 관리자</span>
            <span className="text-xs text-slate-400">
              신청 {apps.length}건 · 선생님 {mentors.length}명
            </span>
          </div>
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-1.5 text-xs text-slate-600 cursor-pointer">
              <input
                type="checkbox"
                checked={autoRefresh}
                onChange={(e) => setAutoRefresh(e.target.checked)}
                className="w-3.5 h-3.5 accent-blue-600"
              />
              30초 자동 새로고침
            </label>
            <button
              onClick={logout}
              className="text-xs text-slate-500 hover:text-slate-800"
            >
              로그아웃
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
        <div className="flex gap-2 mb-5">
          <ViewTab
            label="학부모 신청"
            count={apps.length}
            active={view === "applications"}
            onClick={() => setView("applications")}
          />
          <ViewTab
            label="선생님 목록"
            count={mentors.length}
            active={view === "mentors"}
            onClick={() => setView("mentors")}
          />
        </div>

        {view === "applications" ? (
          <>
            <div className="flex flex-wrap gap-2 mb-5">
              <FilterChip
                label="전체"
                count={counts.all ?? 0}
                active={filter === "all"}
                onClick={() => setFilter("all")}
              />
              {(Object.keys(STATUS_LABELS) as ApplicationStatus[]).map((s) => (
                <FilterChip
                  key={s}
                  label={STATUS_LABELS[s]}
                  count={counts[s] ?? 0}
                  active={filter === s}
                  onClick={() => setFilter(s)}
                />
              ))}
            </div>

            {filtered.length === 0 ? (
              <EmptyState text="해당 상태의 신청이 없습니다." />
            ) : (
              <div className="space-y-3">
                {filtered.map((app) => {
                  const isOpen = expanded === app.id;
                  return (
                    <div
                      key={app.id}
                      className="bg-white border border-slate-200 rounded-xl overflow-hidden"
                    >
                      <button
                        onClick={() => setExpanded(isOpen ? null : app.id)}
                        className="w-full text-left p-4 hover:bg-slate-50 transition-colors"
                      >
                        <div className="flex flex-wrap items-center gap-2 mb-1.5">
                          <span
                            className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[app.status as ApplicationStatus] ?? "bg-slate-100 text-slate-700"}`}
                          >
                            {STATUS_LABELS[app.status as ApplicationStatus] ?? app.status}
                          </span>
                          <span className="text-xs text-slate-400">
                            {formatDate(app.created_at)}
                          </span>
                        </div>
                        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                          <span className="font-semibold text-slate-900">
                            {app.parent_name}
                          </span>
                          <a
                            href={`tel:${app.phone}`}
                            onClick={(e) => e.stopPropagation()}
                            className="text-sm text-blue-600 hover:underline"
                          >
                            {app.phone}
                          </a>
                          <span className="text-sm text-slate-600">
                            · {app.grade}
                          </span>
                          <span className="text-sm text-slate-600">
                            · {joinValues(app.subjects)}
                          </span>
                        </div>
                      </button>

                      {isOpen && (
                        <div className="border-t border-slate-200 bg-slate-50 p-4 space-y-4">
                          <DetailRow label="현재 성적·수준" value={app.current_level} />
                          <DetailRow label="어려워하는 부분" value={app.difficulties} />
                          <DetailRow label="목표" value={app.goal} />
                          <DetailRow label="목표 시점" value={app.goal_date} />
                          <DetailRow
                            label="자녀 성향"
                            value={joinValues(app.child_personality)}
                          />
                          <DetailRow
                            label="멘토에게 바라는 점"
                            value={app.mentor_priority}
                          />
                          <DetailRow label="기타" value={app.extra_note} />

                          <StatusButtonGroup
                            title="상태 변경"
                            labels={STATUS_LABELS}
                            colors={STATUS_COLORS}
                            current={app.status}
                            onChange={(status) => updateStatus(app.id, status)}
                          />

                          <div>
                            <div className="text-xs font-semibold text-slate-500 mb-1.5">
                              운영 메모
                            </div>
                            <MemoEditor
                              initial={app.admin_memo ?? ""}
                              placeholder="예: 1차 연락 완료. 화요일 오후 6시 첫 미팅 예정. 김멘토에게 소개."
                              onSave={(memo) => updateMemo(app.id, memo)}
                            />
                          </div>

                          <DeleteRow onDelete={() => deleteApp(app.id)} />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </>
        ) : (
          <>
            <div className="flex flex-wrap gap-2 mb-5">
              <FilterChip
                label="전체"
                count={mentorCounts.all ?? 0}
                active={mentorFilter === "all"}
                onClick={() => setMentorFilter("all")}
              />
              {(Object.keys(MENTOR_STATUS_LABELS) as MentorStatus[]).map((s) => (
                <FilterChip
                  key={s}
                  label={MENTOR_STATUS_LABELS[s]}
                  count={mentorCounts[s] ?? 0}
                  active={mentorFilter === s}
                  onClick={() => setMentorFilter(s)}
                />
              ))}
            </div>

            {filteredMentors.length === 0 ? (
              <EmptyState text="해당 상태의 선생님이 없습니다." />
            ) : (
              <div className="space-y-3">
                {filteredMentors.map((mentor) => {
                  const isOpen = expandedMentor === mentor.id;
                  const status = mentor.status as MentorStatus;
                  return (
                    <div
                      key={mentor.id}
                      className="bg-white border border-slate-200 rounded-xl overflow-hidden"
                    >
                      <button
                        onClick={() => setExpandedMentor(isOpen ? null : mentor.id)}
                        className="w-full text-left p-4 hover:bg-slate-50 transition-colors"
                      >
                        <div className="flex flex-wrap items-center gap-2 mb-1.5">
                          <span
                            className={`text-xs px-2 py-0.5 rounded-full font-medium ${MENTOR_STATUS_COLORS[status] ?? "bg-slate-100 text-slate-700"}`}
                          >
                            {MENTOR_STATUS_LABELS[status] ?? mentor.status}
                          </span>
                          <span className="text-xs text-slate-400">
                            {formatDate(mentor.created_at)}
                          </span>
                        </div>
                        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                          <span className="font-semibold text-slate-900">
                            {mentor.name}
                          </span>
                          <a
                            href={`tel:${mentor.phone}`}
                            onClick={(e) => e.stopPropagation()}
                            className="text-sm text-blue-600 hover:underline"
                          >
                            {mentor.phone}
                          </a>
                          <span className="text-sm text-slate-600">
                            · {mentor.major}
                          </span>
                          <span className="text-sm text-slate-600">
                            · {mentor.subjects}
                          </span>
                          <span className="text-sm text-slate-600">
                            · {mentor.teaching_mode}
                          </span>
                        </div>
                      </button>

                      {isOpen && (
                        <div className="border-t border-slate-200 bg-slate-50 p-4 space-y-4">
                          <DetailRow label="이름" value={mentor.name} />
                          <DetailRow label="연락처" value={mentor.phone} />
                          <DetailRow label="전공" value={mentor.major} />
                          <DetailRow label="가능 과목" value={mentor.subjects} />
                          <DetailRow label="가능 방식" value={mentor.teaching_mode} />

                          <StatusButtonGroup
                            title="상태 변경"
                            labels={MENTOR_STATUS_LABELS}
                            colors={MENTOR_STATUS_COLORS}
                            current={status}
                            onChange={(nextStatus) => updateMentorStatus(mentor.id, nextStatus)}
                          />

                          <div>
                            <div className="text-xs font-semibold text-slate-500 mb-1.5">
                              메모
                            </div>
                            <MemoEditor
                              initial={mentor.memo ?? ""}
                              placeholder="예: 주말 가능. 중등 수학 선호. 온라인 우선."
                              onSave={(memo) => updateMentorMemo(mentor.id, memo)}
                            />
                          </div>

                          <DeleteRow onDelete={() => deleteMentor(mentor.id)} />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}

function ViewTab({
  label,
  count,
  active,
  onClick,
}: {
  label: string;
  count: number;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`text-sm px-4 py-2 rounded-lg border font-semibold transition-colors ${
        active
          ? "bg-slate-900 text-white border-slate-900"
          : "bg-white text-slate-700 border-slate-300 hover:bg-slate-100"
      }`}
    >
      {label} <span className="opacity-60">{count}</span>
    </button>
  );
}

function FilterChip({
  label,
  count,
  active,
  onClick,
}: {
  label: string;
  count: number;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
        active
          ? "bg-slate-900 text-white border-slate-900"
          : "bg-white text-slate-700 border-slate-300 hover:bg-slate-100"
      }`}
    >
      {label} <span className="opacity-60">{count}</span>
    </button>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-10 text-center text-sm text-slate-500">
      {text}
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-xs font-semibold text-slate-500 mb-0.5">{label}</div>
      <div className="text-sm text-slate-800 whitespace-pre-line">
        {value || <span className="text-slate-400">(미입력)</span>}
      </div>
    </div>
  );
}

function StatusButtonGroup<TStatus extends string>({
  title,
  labels,
  colors,
  current,
  onChange,
}: {
  title: string;
  labels: Record<TStatus, string>;
  colors: Record<TStatus, string>;
  current: TStatus;
  onChange: (status: TStatus) => void;
}) {
  return (
    <div>
      <div className="text-xs font-semibold text-slate-500 mb-1.5">
        {title}
      </div>
      <div className="flex flex-wrap gap-1.5">
        {(Object.keys(labels) as TStatus[]).map((status) => (
          <button
            key={status}
            onClick={() => onChange(status)}
            className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${
              current === status
                ? `${colors[status]} border-transparent font-semibold`
                : "bg-white text-slate-600 border-slate-300 hover:bg-slate-100"
            }`}
          >
            {labels[status]}
          </button>
        ))}
      </div>
    </div>
  );
}

function MemoEditor({
  initial,
  placeholder,
  onSave,
}: {
  initial: string;
  placeholder: string;
  onSave: (memo: string) => Promise<void> | void;
}) {
  const [memo, setMemo] = useState(initial);
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<number | null>(null);

  async function save() {
    setSaving(true);
    await onSave(memo);
    setSaving(false);
    setSavedAt(Date.now());
  }

  return (
    <div>
      <textarea
        rows={3}
        value={memo}
        onChange={(e) => setMemo(e.target.value)}
        placeholder={placeholder}
        className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
      />
      <div className="flex items-center gap-2 mt-1.5">
        <button
          onClick={save}
          disabled={saving || memo === initial}
          className="text-xs bg-slate-900 text-white px-3 py-1.5 rounded-md font-medium disabled:opacity-40 hover:bg-slate-700"
        >
          {saving ? "저장 중..." : "메모 저장"}
        </button>
        {savedAt && !saving && (
          <span className="text-xs text-emerald-600">저장됨</span>
        )}
      </div>
    </div>
  );
}

function DeleteRow({ onDelete }: { onDelete: () => void }) {
  return (
    <div className="pt-2 border-t border-slate-200 flex justify-end">
      <button
        onClick={onDelete}
        className="text-xs text-red-600 hover:text-red-800"
      >
        삭제
      </button>
    </div>
  );
}
