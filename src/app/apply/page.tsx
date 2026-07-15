"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import OfficialPaymentNotice from "@/components/OfficialPaymentNotice";

const GRADES = [
  "초등학교 1학년", "초등학교 2학년", "초등학교 3학년",
  "초등학교 4학년", "초등학교 5학년", "초등학교 6학년",
  "중학교 1학년", "중학교 2학년", "중학교 3학년",
  "고등학교 1학년", "고등학교 2학년", "고등학교 3학년",
];

// 체크박스/라디오 선택지는 전부 한국어 라벨을 그대로 저장한다 (id/label 분리 X).
// 짧은 키(예: 수학)는 화면 표시용 간결한 이름,
// 전체 라벨(예: "수학 (기초 연산부터 심화까지)")은 '폼에서만' 안내용으로 쓰는 방식도 가능하지만
// DB에 들어가는 값은 짧은 한국어 쪽을 선택.
const SUBJECTS = [
  { value: "수학", hint: "" },
  { value: "과학", hint: "(물리·화학·생명과학·지구과학 포함)" },
];

const PERSONALITIES = [
  "내성적인 편",
  "외향적인 편",
  "쉽게 지치는 편",
  "완벽주의 성향",
  "말이 많은 편",
  "조용한 편",
];

const MENTOR_PRIORITIES = [
  "수학·과학 개념 설명·문제풀이",
  "공부 방법·루틴 잡기",
  "멘탈 관리·동기 부여",
  "진로·대학(이공계) 이야기",
];

type FormState = {
  parentName: string;
  phone: string;
  studentGender: string;
  schoolName: string;
  grade: string;
  subjects: string[];
  currentLevel: string;
  difficulties: string;
  goal: string;
  goalDate: string;
  childPersonality: string[];
  mentorPriority: string;
  extraNote: string;
};

const INPUT_CLASS =
  "w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white";

export default function ApplyPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState<FormState>({
    parentName: "", phone: "", studentGender: "", schoolName: "", grade: "",
    subjects: [], currentLevel: "", difficulties: "",
    goal: "", goalDate: "", childPersonality: [],
    mentorPriority: "", extraNote: "",
  });

  function toggleArray(field: "subjects" | "childPersonality", value: string) {
    setForm((prev) => ({
      ...prev,
      [field]: prev[field].includes(value)
        ? prev[field].filter((v) => v !== value)
        : [...prev[field], value],
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (
      !form.parentName.trim() ||
      !form.phone.trim() ||
      !form.studentGender ||
      !form.schoolName.trim() ||
      !form.grade
    ) {
      setError("학부모님 성함, 연락처, 학생 성별, 학교명, 학년을 입력해주세요.");
      return;
    }
    if (form.subjects.length === 0) {
      setError("도움이 필요한 과목을 최소 1개 선택해주세요.");
      return;
    }
    if (!form.mentorPriority) {
      setError("멘토에게 바라는 점을 선택해주세요.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const json = await res.json();
      if (json.success) {
        router.push("/thanks");
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
      {/* 헤더 */}
      <header className="border-b bg-white sticky top-0 z-50">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 h-14 flex items-center gap-3">
          <Link href="/" className="text-sm text-slate-500 hover:text-slate-800 transition-colors flex items-center gap-1">
            ← 홈으로
          </Link>
          <span className="text-slate-300">·</span>
          <span className="text-sm font-semibold text-slate-800">멘토 추천 신청</span>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 sm:px-6 py-10 pb-20">
        {/* 안내 박스 */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-8">
          <p className="text-sm text-blue-900 font-medium mb-1">
            자녀 이름 없이, 학교·학년과 수학·과학 관련 상황만으로 멘토를 추천해드립니다.
          </p>
          <p className="text-xs text-blue-700">
            작성해주신 내용은 검증된 KAIST 재학생 멘토들만 참고하며, 멘토 추천·매칭 수수료는 없습니다.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">

          {/* 연락처 */}
          <section>
            <h2 className="font-semibold text-slate-800 text-base mb-4 pb-2 border-b border-slate-200">
              연락처 정보
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  학부모님 성함 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="예: 홍길동"
                  className={INPUT_CLASS}
                  value={form.parentName}
                  onChange={(e) => setForm({ ...form, parentName: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  연락 가능한 휴대폰 번호 <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  placeholder="예: 010-1234-5678"
                  className={INPUT_CLASS}
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                />
              </div>
            </div>
          </section>

          {/* 자녀 학습 정보 */}
          <section>
            <h2 className="font-semibold text-slate-800 text-base mb-4 pb-2 border-b border-slate-200">
              자녀 학습 정보
            </h2>
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  학생 성별 <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-5">
                  {["남학생", "여학생"].map((gender) => (
                    <label key={gender} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="studentGender"
                        className="w-4 h-4 accent-blue-600"
                        checked={form.studentGender === gender}
                        onChange={() => setForm({ ...form, studentGender: gender })}
                      />
                      <span className="text-sm text-slate-700">{gender}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  학교명 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="예: 세종중학교"
                  className={INPUT_CLASS}
                  value={form.schoolName}
                  onChange={(e) => setForm({ ...form, schoolName: e.target.value })}
                />
                <p className="mt-1.5 text-xs text-slate-500">
                  통학 가능한 선생님을 찾는 용도로만 사용합니다.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  자녀 학년 <span className="text-red-500">*</span>
                </label>
                <select
                  className={INPUT_CLASS}
                  value={form.grade}
                  onChange={(e) => setForm({ ...form, grade: e.target.value })}
                >
                  <option value="">학년을 선택해주세요</option>
                  {GRADES.map((g) => (
                    <option key={g} value={g}>{g}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  도움이 필요한 과목 <span className="text-red-500">*</span>{" "}
                  <span className="text-xs font-normal text-slate-500">(복수 선택 가능)</span>
                </label>
                <div className="space-y-2">
                  {SUBJECTS.map((s) => (
                    <label key={s.value} className="flex items-center gap-2.5 cursor-pointer">
                      <input
                        type="checkbox"
                        className="w-4 h-4 rounded accent-blue-600"
                        checked={form.subjects.includes(s.value)}
                        onChange={() => toggleArray("subjects", s.value)}
                      />
                      <span className="text-sm text-slate-700">
                        {s.value}
                        {s.hint && (
                          <span className="text-slate-500"> {s.hint}</span>
                        )}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  현재 해당 과목의 성적·수준 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="예: 중학교 수학 80점대, 고등 수학 3등급"
                  className={INPUT_CLASS}
                  value={form.currentLevel}
                  onChange={(e) => setForm({ ...form, currentLevel: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  특히 어려워하는 부분 <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={3}
                  placeholder="예: 함수 단원에서 그래프 해석이 약하고, 서술형 문제를 어려워함"
                  className={INPUT_CLASS}
                  value={form.difficulties}
                  onChange={(e) => setForm({ ...form, difficulties: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  목표 <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={2}
                  placeholder="예: 고1 내신 2등급 이내, 이공계 수시 준비"
                  className={INPUT_CLASS}
                  value={form.goal}
                  onChange={(e) => setForm({ ...form, goal: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  목표 시점 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="예: 2026년 1학기 중간고사까지, 올해 수능"
                  className={INPUT_CLASS}
                  value={form.goalDate}
                  onChange={(e) => setForm({ ...form, goalDate: e.target.value })}
                />
              </div>
            </div>
          </section>

          {/* 자녀 성향 */}
          <section>
            <h2 className="font-semibold text-slate-800 text-base mb-4 pb-2 border-b border-slate-200">
              자녀 성향
            </h2>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                자녀 성향 <span className="text-red-500">*</span>{" "}
                <span className="text-xs font-normal text-slate-500">(복수 선택 가능)</span>
              </label>
              <div className="grid grid-cols-2 gap-2">
                {PERSONALITIES.map((p) => (
                  <label key={p} className="flex items-center gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      className="w-4 h-4 rounded accent-blue-600"
                      checked={form.childPersonality.includes(p)}
                      onChange={() => toggleArray("childPersonality", p)}
                    />
                    <span className="text-sm text-slate-700">{p}</span>
                  </label>
                ))}
              </div>
            </div>
          </section>

          {/* 멘토 선호 */}
          <section>
            <h2 className="font-semibold text-slate-800 text-base mb-4 pb-2 border-b border-slate-200">
              멘토 선호사항
            </h2>
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  멘토에게 가장 바라는 점 <span className="text-red-500">*</span>
                </label>
                <div className="space-y-2">
                  {MENTOR_PRIORITIES.map((mp) => (
                    <label key={mp} className="flex items-center gap-2.5 cursor-pointer">
                      <input
                        type="radio"
                        name="mentorPriority"
                        className="w-4 h-4 accent-blue-600"
                        value={mp}
                        checked={form.mentorPriority === mp}
                        onChange={() => setForm({ ...form, mentorPriority: mp })}
                      />
                      <span className="text-sm text-slate-700">{mp}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  멘토가 알아두면 좋을 자녀의 특징·상황{" "}
                  <span className="text-xs font-normal text-slate-500">(선택)</span>
                </label>
                <textarea
                  rows={3}
                  placeholder="예: 시험 불안이 있어서 긍정적인 피드백을 잘 받아들임. 예시로 설명해주면 이해가 빠름."
                  className={INPUT_CLASS}
                  value={form.extraNote}
                  onChange={(e) => setForm({ ...form, extraNote: e.target.value })}
                />
              </div>
            </div>
          </section>

          {/* 결제 안내 */}
          <OfficialPaymentNotice />

          {/* 에러 메시지 */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {/* 제출 버튼 */}
          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-4 rounded-xl font-semibold text-base hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? "신청 중..." : "신청하기"}
            </button>
            <p className="text-xs text-slate-400 text-center mt-2">
              멘토 추천·매칭 수수료는 없습니다
            </p>
          </div>
        </form>
      </main>

      <footer className="border-t py-5 px-4 text-center text-xs text-slate-400">
        © 2026 카이멘토 (KAIMentor)
      </footer>
    </div>
  );
}
