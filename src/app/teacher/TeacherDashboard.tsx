"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { MATCHING_PLANS, formatWon } from "@/lib/pricing";
import type { MentorRow, PurchaseOrderRow } from "@/lib/supabase";

const BANK = {
  name: "농협 (지역농협)",
  account: "352-0308-0089-93",
  holder: "박지원",
};

const STATUS_LABEL: Record<PurchaseOrderRow["status"], string> = {
  pending: "입금 확인 중",
  paid: "충전 완료",
  mismatch: "확인 필요",
  cancelled: "취소",
};

export default function TeacherDashboard({
  mentor,
  initialOrders,
}: {
  mentor: MentorRow;
  initialOrders: PurchaseOrderRow[];
}) {
  const router = useRouter();
  const [orders, setOrders] = useState(initialOrders);
  const [selectedCode, setSelectedCode] = useState<string | null>(null);
  const [depositorName, setDepositorName] = useState(mentor.name);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const selectedPlan = MATCHING_PLANS.find((plan) => plan.code === selectedCode);

  async function logout() {
    await fetch("/api/teacher/logout", { method: "POST" });
    router.push("/teacher/login");
    router.refresh();
  }

  async function createOrder(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedPlan) return;
    setSubmitting(true);
    setMessage("");
    try {
      const response = await fetch("/api/teacher/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planCode: selectedPlan.code, depositorName }),
      });
      const json = await response.json();
      if (!response.ok) {
        setMessage(json.message ?? "입금 신청을 만들지 못했습니다.");
        return;
      }
      setOrders((current) => [json.order as PurchaseOrderRow, ...current]);
      setMessage("입금 신청이 접수되었습니다. 입금 후 영업일 기준 최대 1시간 이내 확인됩니다.");
      setSelectedCode(null);
    } catch {
      setMessage("네트워크 오류가 발생했습니다. 잠시 후 다시 시도해주세요.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-950">
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
          <Link href="/" className="text-xl font-bold tracking-tight text-blue-700">카이멘토</Link>
          <nav className="flex items-center gap-4 text-sm sm:gap-8">
            <a href="#home" className="font-semibold text-blue-700">선생님 홈</a>
            <a href="#pricing" className="hidden text-slate-600 hover:text-slate-950 sm:block">이용권 구매</a>
            <button onClick={logout} className="text-slate-600 hover:text-slate-950">로그아웃</button>
          </nav>
        </div>
      </header>

      <main id="home" className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{mentor.name} 선생님, 반갑습니다</h1>

        <section className="mt-7 grid gap-4 lg:grid-cols-[1.35fr_1fr]">
          <div className="grid overflow-hidden rounded-2xl border border-slate-200 bg-white sm:grid-cols-3">
            <Metric label="남은 상담 매칭 이용권" value={`${mentor.credit_balance ?? 0}회`} />
            <Metric label="누적 구매" value={`${mentor.total_credits_purchased ?? 0}회`} />
            <Metric label="사용 완료" value={`${mentor.total_credits_used ?? 0}회`} />
          </div>
          <div className="rounded-2xl border border-amber-200 bg-amber-50 px-6 py-5">
            <p className="font-bold text-slate-900">과외 시급은 40,000원으로 고정됩니다</p>
            <p className="mt-1.5 text-sm leading-6 text-slate-600">
              학부모 화면에는 표시되지 않는 선생님 전용 안내입니다.
            </p>
          </div>
        </section>

        <section id="pricing" className="scroll-mt-24 pt-14">
          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
            <div>
              <h2 className="text-2xl font-bold tracking-tight">상담 매칭 이용권</h2>
              <p className="mt-2 text-sm text-slate-600">기본 1회 20,000원, 많이 구매할수록 회당 가격이 낮아집니다.</p>
            </div>
            <p className="text-xs text-slate-500">결제 수단 · 계좌이체</p>
          </div>

          <div className="mt-7 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {MATCHING_PLANS.map((plan) => {
              const selected = selectedCode === plan.code;
              return (
                <article
                  key={plan.code}
                  className={`relative flex min-h-[330px] flex-col rounded-2xl border bg-white p-6 transition ${
                    selected
                      ? "border-blue-600 shadow-[0_12px_35px_rgba(37,99,235,0.12)] ring-1 ring-blue-600"
                      : "border-slate-200 hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-lg"
                  }`}
                >
                  {plan.code === "starter" && (
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-blue-600 px-3 py-1 text-xs font-bold text-white">인기</span>
                  )}
                  <h3 className="text-lg font-bold">{plan.name}</h3>
                  {"originalPrice" in plan ? (
                    <p className="mt-4 text-sm text-slate-400 line-through">{formatWon(plan.originalPrice)}</p>
                  ) : (
                    <div className="mt-4 h-5" />
                  )}
                  <p className="mt-1 text-3xl font-bold tracking-tight text-blue-700">{formatWon(plan.price)}</p>
                  <p className="mt-3 text-sm text-slate-600">회당 {formatWon(plan.unitPrice)}</p>
                  <div className="mt-5 text-sm font-semibold text-emerald-700">{plan.savingRate}% 절약</div>
                  <p className="mt-2 text-xs text-slate-500">{plan.description}</p>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedCode(plan.code);
                      setMessage("");
                    }}
                    className={`mt-auto rounded-xl px-4 py-3 text-sm font-bold transition ${
                      selected
                        ? "bg-blue-600 text-white hover:bg-blue-700"
                        : "border border-blue-600 text-blue-700 hover:bg-blue-50"
                    }`}
                  >
                    {selected ? "선택됨" : "이용권 선택"}
                  </button>
                </article>
              );
            })}
          </div>

          {selectedPlan && (
            <form onSubmit={createOrder} className="mt-6 grid gap-6 rounded-2xl border border-blue-200 bg-white p-6 shadow-sm lg:grid-cols-[1fr_1.15fr] lg:p-8">
              <div>
                <p className="text-sm font-semibold text-blue-700">선택한 이용권</p>
                <h3 className="mt-2 text-2xl font-bold">{selectedPlan.name} · {formatWon(selectedPlan.price)}</h3>
                <p className="mt-3 text-sm leading-6 text-slate-600">
                  아래 계좌로 정확한 금액을 입금한 뒤 입금자명을 남겨주세요.
                </p>
                <dl className="mt-5 space-y-3 rounded-xl bg-slate-50 p-4 text-sm">
                  <BankRow label="은행" value={BANK.name} />
                  <BankRow label="계좌번호" value={BANK.account} />
                  <BankRow label="예금주" value={BANK.holder} />
                </dl>
                <button
                  type="button"
                  onClick={() => navigator.clipboard.writeText(BANK.account.replaceAll("-", ""))}
                  className="mt-3 text-xs font-semibold text-blue-700 hover:underline"
                >
                  계좌번호 복사
                </button>
              </div>
              <div className="flex flex-col justify-center">
                <label className="text-sm font-semibold text-slate-700">입금자명</label>
                <input
                  value={depositorName}
                  onChange={(e) => setDepositorName(e.target.value)}
                  className="mt-2 rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
                  placeholder="통장에 표시되는 입금자명"
                  maxLength={30}
                  required
                />
                <p className="mt-2 text-xs leading-5 text-slate-500">가입자 이름과 달라도 괜찮습니다. 실제 통장에 표시되는 이름을 입력해주세요.</p>
                <button
                  type="submit"
                  disabled={submitting}
                  className="mt-5 rounded-xl bg-blue-600 px-5 py-3.5 text-sm font-bold text-white hover:bg-blue-700 disabled:opacity-50"
                >
                  {submitting ? "신청 중..." : "입금 확인 요청"}
                </button>
              </div>
            </form>
          )}

          {message && (
            <p className={`mt-4 rounded-xl border px-4 py-3 text-sm ${message.includes("접수") ? "border-emerald-200 bg-emerald-50 text-emerald-800" : "border-red-200 bg-red-50 text-red-700"}`}>
              {message}
            </p>
          )}
        </section>

        <section className="pt-14">
          <h2 className="text-xl font-bold">입금 확인 현황</h2>
          <div className="mt-5 overflow-hidden rounded-2xl border border-slate-200 bg-white">
            {orders.length === 0 ? (
              <p className="px-6 py-12 text-center text-sm text-slate-500">아직 이용권 구매 내역이 없습니다.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[760px] text-left text-sm">
                  <thead className="border-b border-slate-200 bg-slate-50 text-xs text-slate-500">
                    <tr>
                      <th className="px-5 py-3.5 font-semibold">주문일시</th>
                      <th className="px-5 py-3.5 font-semibold">이용권</th>
                      <th className="px-5 py-3.5 font-semibold">금액</th>
                      <th className="px-5 py-3.5 font-semibold">입금자명</th>
                      <th className="px-5 py-3.5 font-semibold">상태</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {orders.map((order) => (
                      <tr key={order.id}>
                        <td className="px-5 py-4 text-slate-600">{new Date(order.created_at).toLocaleString("ko-KR")}</td>
                        <td className="px-5 py-4 font-semibold">{order.plan_name}</td>
                        <td className="px-5 py-4">{formatWon(order.amount)}</td>
                        <td className="px-5 py-4">{order.depositor_name}</td>
                        <td className="px-5 py-4"><OrderStatus status={order.status} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
          <p className="mt-3 text-xs text-slate-500">입금 확인은 영업일 기준 최대 1시간 이내에 완료됩니다.</p>
        </section>
      </main>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-b border-slate-200 px-6 py-5 last:border-0 sm:border-b-0 sm:border-r">
      <p className="text-xs font-semibold text-slate-500">{label}</p>
      <p className="mt-2 text-2xl font-bold text-blue-700">{value}</p>
    </div>
  );
}

function BankRow({ label, value }: { label: string; value: string }) {
  return <div className="flex justify-between gap-4"><dt className="text-slate-500">{label}</dt><dd className="font-semibold text-slate-900">{value}</dd></div>;
}

function OrderStatus({ status }: { status: PurchaseOrderRow["status"] }) {
  const color = status === "paid"
    ? "bg-emerald-50 text-emerald-700 ring-emerald-200"
    : status === "pending"
      ? "bg-amber-50 text-amber-700 ring-amber-200"
      : "bg-red-50 text-red-700 ring-red-200";
  return <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${color}`}>{STATUS_LABEL[status]}</span>;
}
