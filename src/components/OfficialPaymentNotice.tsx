"use client";

import { useState } from "react";
import { OFFICIAL_BANK_ACCOUNT } from "@/lib/payment";

export default function OfficialPaymentNotice() {
  const [copied, setCopied] = useState(false);

  async function copyAccountNumber() {
    try {
      await navigator.clipboard.writeText(
        OFFICIAL_BANK_ACCOUNT.number.replaceAll("-", ""),
      );
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  }

  return (
    <section
      aria-labelledby="official-payment-title"
      className="overflow-hidden rounded-2xl border border-blue-200 bg-white shadow-sm"
    >
      <div className="p-5 sm:p-6">
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-700">
            <svg
              aria-hidden="true"
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                d="M12 3 5 6v5c0 4.6 2.9 8.7 7 10 4.1-1.3 7-5.4 7-10V6l-7-3Z"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.8"
              />
              <path
                d="m9.5 12 1.6 1.6 3.7-4"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.8"
              />
            </svg>
          </span>
          <div>
            <p className="text-xs font-bold text-blue-700">카이멘토 공식 결제 안내</p>
            <h2
              id="official-payment-title"
              className="mt-1 text-base font-bold text-slate-900 sm:text-lg"
            >
              수업료는 아래 공식 계좌로 결제해 주세요
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              결제 내역을 정확히 확인하고 수업 관련 안내를 계속 도와드릴 수 있도록,
              수업료 결제는 카이멘토 공식 계좌를 통해서만 가능합니다.
            </p>
          </div>
        </div>

        <dl className="mt-5 grid gap-3 rounded-xl bg-slate-50 p-4 text-sm sm:grid-cols-[0.9fr_1.5fr_0.8fr]">
          <BankDetail label="은행" value={OFFICIAL_BANK_ACCOUNT.bank} />
          <BankDetail label="계좌번호" value={OFFICIAL_BANK_ACCOUNT.number} prominent />
          <BankDetail label="예금주" value={OFFICIAL_BANK_ACCOUNT.holder} />
        </dl>

        <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs leading-5 text-slate-500">
            멘토 매칭 후 안내받은 금액과 시점에 맞춰 결제하시면 됩니다.
          </p>
          <button
            type="button"
            onClick={copyAccountNumber}
            className="inline-flex shrink-0 items-center justify-center rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-xs font-bold text-blue-700 transition hover:bg-blue-100"
          >
            {copied ? "복사되었습니다" : "계좌번호 복사"}
          </button>
        </div>
      </div>

      <p className="border-t border-blue-100 bg-blue-50 px-5 py-3 text-xs leading-5 text-blue-800 sm:px-6">
        원활한 결제 확인을 위해 선생님 개인 계좌가 아닌 위 공식 계좌를 이용해 주세요.
      </p>
    </section>
  );
}

function BankDetail({
  label,
  value,
  prominent = false,
}: {
  label: string;
  value: string;
  prominent?: boolean;
}) {
  return (
    <div>
      <dt className="text-xs font-medium text-slate-500">{label}</dt>
      <dd
        className={`mt-1 font-bold text-slate-900 ${
          prominent ? "select-all text-blue-700" : ""
        }`}
      >
        {value}
      </dd>
    </div>
  );
}
