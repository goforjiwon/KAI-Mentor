"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const SUBJECTS = ["수학", "과학", "수학+과학"];
const TEACHING_MODES = ["대면", "온라인", "둘 다"];

type FormState = {
  email: string;
  password: string;
  passwordConfirm: string;
  name: string;
  phone: string;
  major: string;
  subjects: string;
  teachingMode: string;
  memo: string;
};

const INPUT_CLASS =
  "w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white";

export default function MentorSignupPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState<FormState>({
    email: "",
    password: "",
    passwordConfirm: "",
    name: "",
    phone: "",
    major: "",
    subjects: "",
    teachingMode: "",
    memo: "",
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (
      !form.name.trim() ||
      !form.email.trim() ||
      !form.password ||
      !form.phone.trim() ||
      !form.major.trim() ||
      !form.subjects ||
      !form.teachingMode
    ) {
      setError("이메일, 비밀번호, 이름, 연락처, 전공과 과외 정보를 모두 입력해주세요.");
      return;
    }
    if (form.password.length < 8) {
      setError("비밀번호는 8자 이상으로 입력해주세요.");
      return;
    }
    if (form.password !== form.passwordConfirm) {
      setError("비밀번호 확인이 일치하지 않습니다.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/mentors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const json = await res.json();
      if (json.success) {
        router.push("/teacher");
      } else {
        setError(json.message ?? "오류가 발생했습니다. 다시 시도해주세요.");
      }
    } catch {
      setError("네트워크 오류가 발생했습니다. 잠시 후 다시 시도해주세요.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b bg-white sticky top-0 z-50">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 h-14 flex items-center gap-3">
          <Link href="/" className="text-sm text-slate-500 hover:text-slate-800 transition-colors flex items-center gap-1">
            ← 홈으로
          </Link>
          <span className="text-slate-300">·</span>
          <span className="text-sm font-semibold text-slate-800">선생님 등록</span>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 sm:px-6 py-10 pb-20">
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-3">
            카이멘토 선생님 등록
          </h1>
          <p className="text-sm text-slate-600">
            계정을 만들고 상담 매칭 이용권과 연결 현황을 한곳에서 관리하세요.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <section>
            <h2 className="font-semibold text-slate-800 text-base mb-4 pb-2 border-b border-slate-200">
              기본 정보
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  로그인 이메일 <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  autoComplete="email"
                  placeholder="예: mentor@kaist.ac.kr"
                  className={INPUT_CLASS}
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    비밀번호 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="password"
                    autoComplete="new-password"
                    placeholder="8자 이상"
                    className={INPUT_CLASS}
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    비밀번호 확인 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="password"
                    autoComplete="new-password"
                    placeholder="한 번 더 입력"
                    className={INPUT_CLASS}
                    value={form.passwordConfirm}
                    onChange={(e) => setForm({ ...form, passwordConfirm: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  이름 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="예: 김지원"
                  className={INPUT_CLASS}
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  연락처 <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  placeholder="예: 010-1234-5678"
                  className={INPUT_CLASS}
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  전공 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="예: 전산학부, 기계공학과"
                  className={INPUT_CLASS}
                  value={form.major}
                  onChange={(e) => setForm({ ...form, major: e.target.value })}
                />
              </div>
            </div>
          </section>

          <section>
            <h2 className="font-semibold text-slate-800 text-base mb-4 pb-2 border-b border-slate-200">
              과외 정보
            </h2>
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  가능 과목 <span className="text-red-500">*</span>
                </label>
                <div className="space-y-2">
                  {SUBJECTS.map((subject) => (
                    <label key={subject} className="flex items-center gap-2.5 cursor-pointer">
                      <input
                        type="radio"
                        name="subjects"
                        className="w-4 h-4 accent-blue-600"
                        value={subject}
                        checked={form.subjects === subject}
                        onChange={() => setForm({ ...form, subjects: subject })}
                      />
                      <span className="text-sm text-slate-700">{subject}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  가능 방식 <span className="text-red-500">*</span>
                </label>
                <div className="space-y-2">
                  {TEACHING_MODES.map((mode) => (
                    <label key={mode} className="flex items-center gap-2.5 cursor-pointer">
                      <input
                        type="radio"
                        name="teachingMode"
                        className="w-4 h-4 accent-blue-600"
                        value={mode}
                        checked={form.teachingMode === mode}
                        onChange={() => setForm({ ...form, teachingMode: mode })}
                      />
                      <span className="text-sm text-slate-700">{mode}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  간단 메모 <span className="text-xs font-normal text-slate-500">(선택)</span>
                </label>
                <textarea
                  rows={4}
                  placeholder="예: 가능한 요일, 선호 학년, 과외 경험 등"
                  className={INPUT_CLASS}
                  value={form.memo}
                  onChange={(e) => setForm({ ...form, memo: e.target.value })}
                />
              </div>
            </div>
          </section>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-4 rounded-xl font-semibold text-base hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? "등록 중..." : "등록하기"}
            </button>
          </div>
          <p className="text-center text-sm text-slate-500">
            이미 계정이 있으신가요?{" "}
            <Link href="/teacher/login" className="font-semibold text-blue-700 hover:underline">
              선생님 로그인
            </Link>
          </p>
        </form>
      </main>

      <footer className="border-t py-5 px-4 text-center text-xs text-slate-400">
        © 2026 카이멘토 (KAIMentor)
      </footer>
    </div>
  );
}
