export type ApplicationPayload = {
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
  preferredDays: string[];
  preferredTime: string;
  desiredStartDate: string;
  extraNote: string;
};

const RESEND_API_URL = "https://api.resend.com/emails";
const EMAIL_TO = "goforjiwon@gmail.com";
const EMAIL_SUBJECT = "[카이멘토 | KAIMentor] 신규 신청";

function emptyFallback(value: string) {
  return value.trim() || "(미입력)";
}

function joinOrEmpty(values: string[], emptyText = "(미선택)") {
  return values.length > 0 ? values.join(", ") : emptyText;
}

function makeTextBody(payload: ApplicationPayload) {
  return [
    "카이멘토(KAIMentor) 신규 신청이 접수되었습니다.",
    "",
    `- 학부모님 성함: ${emptyFallback(payload.parentName)}`,
    `- 연락처: ${emptyFallback(payload.phone)}`,
    `- 학생 성별: ${emptyFallback(payload.studentGender)}`,
    `- 학교명: ${emptyFallback(payload.schoolName)}`,
    `- 학년: ${emptyFallback(payload.grade)}`,
    `- 도움이 필요한 과목: ${joinOrEmpty(payload.subjects)}`,
    `- 현재 성적·수준: ${emptyFallback(payload.currentLevel)}`,
    `- 어려워하는 부분: ${emptyFallback(payload.difficulties)}`,
    `- 목표: ${emptyFallback(payload.goal)}`,
    `- 목표 시점: ${emptyFallback(payload.goalDate)}`,
    `- 자녀 성향: ${joinOrEmpty(payload.childPersonality)}`,
    `- 멘토에게 바라는 점: ${emptyFallback(payload.mentorPriority)}`,
    `- 가능한 요일: ${joinOrEmpty(payload.preferredDays)}`,
    `- 가능한 시간: ${emptyFallback(payload.preferredTime)}`,
    `- 희망 시작일: ${emptyFallback(payload.desiredStartDate)}`,
    `- 기타 참고사항: ${emptyFallback(payload.extraNote)}`,
  ].join("\n");
}

function makeHtmlBody(payload: ApplicationPayload) {
  const rows = [
    ["학부모님 성함", emptyFallback(payload.parentName)],
    ["연락처", emptyFallback(payload.phone)],
    ["학생 성별", emptyFallback(payload.studentGender)],
    ["학교명", emptyFallback(payload.schoolName)],
    ["학년", emptyFallback(payload.grade)],
    ["도움이 필요한 과목", joinOrEmpty(payload.subjects)],
    ["현재 성적·수준", emptyFallback(payload.currentLevel)],
    ["어려워하는 부분", emptyFallback(payload.difficulties)],
    ["목표", emptyFallback(payload.goal)],
    ["목표 시점", emptyFallback(payload.goalDate)],
    ["자녀 성향", joinOrEmpty(payload.childPersonality)],
    ["멘토에게 바라는 점", emptyFallback(payload.mentorPriority)],
    ["가능한 요일", joinOrEmpty(payload.preferredDays)],
    ["가능한 시간", emptyFallback(payload.preferredTime)],
    ["희망 시작일", emptyFallback(payload.desiredStartDate)],
    ["기타 참고사항", emptyFallback(payload.extraNote)],
  ];

  return `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #0f172a;">
      <h2 style="margin-bottom: 16px;">카이멘토 (KAIMentor) 신규 신청</h2>
      <table style="border-collapse: collapse; width: 100%; max-width: 720px;">
        ${rows
          .map(
            ([label, value]) => `
              <tr>
                <th style="text-align: left; vertical-align: top; border: 1px solid #cbd5e1; padding: 8px; width: 180px; background: #f8fafc;">${label}</th>
                <td style="border: 1px solid #cbd5e1; padding: 8px; white-space: pre-line;">${value}</td>
              </tr>
            `
          )
          .join("")}
      </table>
    </div>
  `;
}

export async function sendApplicationEmail(payload: ApplicationPayload) {
  const resendApiKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.APPLICATION_EMAIL_FROM;

  if (!resendApiKey || !fromEmail) {
    console.warn("[email] 환경변수 미설정 — 이메일 알림 건너뜀");
    return { sent: false, reason: "env_missing" };
  }

  const res = await fetch(RESEND_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${resendApiKey}`,
    },
    body: JSON.stringify({
      from: fromEmail,
      to: EMAIL_TO,
      subject: EMAIL_SUBJECT,
      text: makeTextBody(payload),
      html: makeHtmlBody(payload),
    }),
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Resend API 오류(${res.status}): ${errorText}`);
  }

  return { sent: true };
}
