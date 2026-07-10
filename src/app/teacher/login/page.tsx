"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

const INPUT_CLASS =
  "w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-600 focus:ring-4 focus:ring-blue-100";

export default function TeacherLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/teacher/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const json = await response.json();
      if (!response.ok) {
        setError(json.message ?? "로그인하지 못했습니다.");
        return;
      }
      router.push("/teacher");
      router.refresh();
    } catch {
      setError("네트워크 오류가 발생했습니다. 잠시 후 다시 시도해주세요.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link href="/" className="text-xl font-bold tracking-tight text-blue-700">
            카이멘토
          </Link>
          <Link href="/mentor-signup" className="text-sm font-semibold text-blue-700 hover:underline">
            선생님 회원가입
          </Link>
        </div>
      </header>

      <main className="mx-auto flex max-w-md flex-col justify-center px-4 py-16 sm:min-h-[calc(100vh-65px)] sm:px-6">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <h1 className="text-2xl font-bold tracking-tight text-slate-950">선생님 로그인</h1>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            이용권과 상담 매칭 현황은 로그인 후 확인할 수 있습니다.
          </p>

          <form onSubmit={submit} className="mt-8 space-y-5">
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">이메일</label>
              <input
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={INPUT_CLASS}
                placeholder="mentor@kaist.ac.kr"
                required
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">비밀번호</label>
              <input
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={INPUT_CLASS}
                placeholder="비밀번호 입력"
                required
              />
            </div>
            {error && (
              <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </p>
            )}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-blue-600 px-5 py-3.5 text-sm font-bold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? "로그인 중..." : "로그인"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-500">
            아직 계정이 없으신가요?{" "}
            <Link href="/mentor-signup" className="font-semibold text-blue-700 hover:underline">
              선생님 회원가입
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
