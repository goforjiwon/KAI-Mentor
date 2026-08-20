import type { ApplicationPayload } from "./email";

/**
 * 카카오톡 "나에게 보내기" 알림.
 *
 * 사용 조건:
 *  - Kakao Developers에서 앱 생성
 *  - "카카오 로그인" 활성화 + 플랫폼에 도메인 등록
 *  - "동의 항목"에서 'talk_message' (카카오톡 메시지 전송) 활성화
 *  - 운영자(나) 본인이 이 앱에 로그인해서 'talk_message' 동의
 *  - 받은 access_token + refresh_token 을 환경변수에 저장
 *
 * 환경변수:
 *  - KAKAO_REST_API_KEY          : 앱의 REST API 키
 *  - KAKAO_ACCESS_TOKEN          : 운영자 access token (6시간 수명)
 *  - KAKAO_REFRESH_TOKEN         : refresh token (약 2달 수명) — 자동 갱신용
 *
 * 토큰이 없거나 만료되면 조용히 실패한다 (이메일·DB 저장은 영향받지 않음).
 */

function formatMessage(payload: ApplicationPayload) {
  const subjects = payload.subjects.length > 0 ? payload.subjects.join(", ") : "-";
  const priority = payload.mentorPriority || "-";

  return [
    "🎓 카이멘토 신규 신청",
    "",
    `👤 ${payload.parentName} (${payload.phone})`,
    `🏫 ${payload.schoolName || "-"} · ${payload.studentGender || "-"} · ${payload.grade}`,
    `📚 ${subjects}`,
    `📊 현재: ${payload.currentLevel || "-"}`,
    `🎯 목표: ${payload.goal || "-"} (${payload.goalDate || "-"})`,
    `💡 바라는 점: ${priority}`,
    `📅 가능 요일: ${payload.preferredDays.length > 0 ? payload.preferredDays.join(", ") : "-"}`,
    `🕒 가능 시간: ${payload.preferredTime || "-"}`,
    `🚀 희망 시작일: ${payload.desiredStartDate || "-"}`,
  ].join("\n");
}

type KakaoTokens = {
  accessToken: string;
  refreshToken?: string;
};

async function refreshAccessToken(
  refreshToken: string,
  restApiKey: string
): Promise<KakaoTokens | null> {
  const res = await fetch("https://kauth.kakao.com/oauth/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      client_id: restApiKey,
      refresh_token: refreshToken,
    }),
  });

  if (!res.ok) {
    console.error("[kakao] refresh token 실패:", res.status, await res.text());
    return null;
  }

  const json = (await res.json()) as {
    access_token: string;
    refresh_token?: string;
  };

  return {
    accessToken: json.access_token,
    refreshToken: json.refresh_token,
  };
}

async function sendMemoMessage(accessToken: string, text: string, linkUrl: string) {
  const template = {
    object_type: "text",
    text,
    link: {
      web_url: linkUrl,
      mobile_web_url: linkUrl,
    },
    button_title: "관리자 페이지 열기",
  };

  const res = await fetch(
    "https://kapi.kakao.com/v2/api/talk/memo/default/send",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        template_object: JSON.stringify(template),
      }),
    }
  );

  return { ok: res.ok, status: res.status, body: await res.text() };
}

export async function sendKakaoSelfMessage(payload: ApplicationPayload) {
  const restApiKey = process.env.KAKAO_REST_API_KEY;
  const accessToken = process.env.KAKAO_ACCESS_TOKEN;
  const refreshToken = process.env.KAKAO_REFRESH_TOKEN;
  const siteUrl = process.env.SITE_URL ?? "https://kmentor-eight.vercel.app";

  if (!restApiKey || !accessToken) {
    console.warn("[kakao] 환경변수 미설정 — 카카오 알림 건너뜀");
    return { sent: false, reason: "env_missing" };
  }

  const text = formatMessage(payload);
  const adminUrl = `${siteUrl}/admin`;

  // 1차 시도
  let result = await sendMemoMessage(accessToken, text, adminUrl);

  // access token 만료(-401) → refresh 후 재시도
  if (!result.ok && result.status === 401 && refreshToken) {
    console.log("[kakao] access token 만료 — refresh 시도");
    const refreshed = await refreshAccessToken(refreshToken, restApiKey);
    if (refreshed) {
      result = await sendMemoMessage(refreshed.accessToken, text, adminUrl);
      // 참고: Vercel 런타임에서는 process.env를 런타임에 덮어써도 다음 invoke에 반영 X.
      // refresh token이 갱신되면 Vercel 환경변수를 수동 업데이트 해야 함 (가이드에 명시).
      if (refreshed.refreshToken && refreshed.refreshToken !== refreshToken) {
        console.warn(
          "[kakao] 새 refresh_token 발급됨 — Vercel 환경변수 KAKAO_REFRESH_TOKEN 업데이트 필요:",
          refreshed.refreshToken
        );
      }
    }
  }

  if (!result.ok) {
    console.error("[kakao] 전송 실패:", result.status, result.body);
    return { sent: false, reason: `http_${result.status}` };
  }

  return { sent: true };
}
