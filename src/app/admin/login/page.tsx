"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const json = await res.json();
      if (json.success) {
        const next = new URLSearchParams(window.location.search).get("next");
        router.push(next && /^\/admin\/lesson-reports(?:\?report=[a-f0-9-]{36})?$/.test(next) ? next : "/admin");
        router.refresh();
      } else {
        setError(json.message ?? "비밀번호가 올바르지 않습니다.");
      }
    } catch {
      setError("네트워크 오류. 잠시 후 다시 시도해주세요.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <form
        onSubmit={handleSubmit}
        className="bg-white border border-slate-200 rounded-2xl p-8 w-full max-w-sm shadow-sm"
      >
        <h1 className="text-xl font-bold text-slate-900 mb-1">관리자 로그인</h1>
        <p className="text-sm text-slate-500 mb-6">카이멘토 운영자 전용</p>

        <label className="block text-sm font-medium text-slate-700 mb-1.5">
          비밀번호
        </label>
        <input
          type="password"
          autoFocus
          className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        {error && (
          <div className="mt-3 text-sm text-red-600">{error}</div>
        )}

        <button
          type="submit"
          disabled={loading || !password}
          className="mt-5 w-full bg-blue-600 text-white py-2.5 rounded-lg font-semibold text-sm hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "확인 중..." : "로그인"}
        </button>
      </form>
    </div>
  );
}
