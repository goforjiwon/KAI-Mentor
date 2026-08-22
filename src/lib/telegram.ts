import type { ApplicationPayload } from "./email";

/**
 * 텔레그램 봇 알림.
 *
 * 환경변수:
 *  - TELEGRAM_BOT_TOKEN  : BotFather에서 발급받은 봇 토큰
 *  - TELEGRAM_CHAT_ID    : 알림을 받을 채팅 ID (본인 텔레그램 유저 ID)
 *
 * 토큰이 없으면 조용히 실패한다 (DB 저장은 영향받지 않음).
 */

function emptyFallback(value: string) {
  return value.trim() || "-";
}

function joinOrDash(values: string[]) {
  return values.length > 0 ? values.join(", ") : "-";
}

function formatMessage(payload: ApplicationPayload, siteUrl: string) {
  // 텔레그램 MarkdownV2는 특수문자 이스케이프가 까다로우니 HTML 모드 사용.
  const escape = (s: string) =>
    s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

  const adminUrl = `${siteUrl}/admin`;

  return [
    "🎓 <b>카이멘토 신규 신청</b>",
    "",
    `👤 <b>${escape(emptyFallback(payload.parentName))}</b>`,
    `📞 <code>${escape(emptyFallback(payload.phone))}</code>`,
    `🏫 ${escape(emptyFallback(payload.schoolName))} · ${escape(emptyFallback(payload.studentGender))} · ${escape(emptyFallback(payload.grade))}`,
    `📚 ${escape(joinOrDash(payload.subjects))}`,
    "",
    `📊 <b>현재 수준</b>: ${escape(emptyFallback(payload.currentLevel))}`,
    `😓 <b>어려운 점</b>: ${escape(emptyFallback(payload.difficulties))}`,
    `🎯 <b>목표</b>: ${escape(emptyFallback(payload.goal))} (${escape(emptyFallback(payload.goalDate))})`,
    `🧠 <b>성향</b>: ${escape(joinOrDash(payload.childPersonality))}`,
    `💡 <b>바라는 점</b>: ${escape(emptyFallback(payload.mentorPriority))}`,
    `📅 <b>가능 요일</b>: ${escape(joinOrDash(payload.preferredDays))}`,
    `🕒 <b>가능 시간</b>: ${escape(emptyFallback(payload.preferredTime))}`,
    `🚀 <b>희망 시작일</b>: ${escape(emptyFallback(payload.desiredStartDate))}`,
    payload.extraNote.trim()
      ? `📝 <b>기타</b>: ${escape(payload.extraNote)}`
      : "",
    "",
    `<a href="${adminUrl}">🔗 관리자 페이지 열기</a>`,
  ]
    .filter(Boolean)
    .join("\n");
}

export async function sendTelegramNotification(payload: ApplicationPayload) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  const siteUrl = process.env.SITE_URL ?? "https://eaureca.com";

  if (!token || !chatId) {
    return { sent: false, reason: "env_missing" };
  }

  const text = formatMessage(payload, siteUrl);

  const res = await fetch(
    `https://api.telegram.org/bot${token}/sendMessage`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: "HTML",
        disable_web_page_preview: true,
      }),
      signal: AbortSignal.timeout(8_000),
    }
  );

  if (!res.ok) {
    const errorText = await res.text();
    console.error("[telegram] 전송 실패:", res.status, errorText);
    return { sent: false, reason: `http_${res.status}` };
  }

  return { sent: true };
}
