import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";
import { supabaseAdmin, type MentorRow } from "@/lib/supabase";

const COOKIE_NAME = "kmentor_teacher";
const SESSION_DAYS = 14;

function getSecret() {
  const secret =
    process.env.MENTOR_SESSION_SECRET ?? process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!secret) {
    throw new Error("MENTOR_SESSION_SECRET 환경변수가 설정되지 않았습니다.");
  }
  return secret;
}

function sign(value: string) {
  return createHmac("sha256", getSecret()).update(value).digest("base64url");
}

function makeToken(userId: string) {
  const expiresAt = Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000;
  const payload = Buffer.from(
    JSON.stringify({ userId, expiresAt }),
    "utf8"
  ).toString("base64url");
  return `${payload}.${sign(payload)}`;
}

function verifyToken(token?: string) {
  if (!token) return null;
  const [payload, signature] = token.split(".");
  if (!payload || !signature) return null;

  const expected = sign(payload);
  const actualBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expected);
  if (
    actualBuffer.length !== expectedBuffer.length ||
    !timingSafeEqual(actualBuffer, expectedBuffer)
  ) {
    return null;
  }

  try {
    const parsed = JSON.parse(
      Buffer.from(payload, "base64url").toString("utf8")
    ) as { userId?: string; expiresAt?: number };
    if (!parsed.userId || !parsed.expiresAt || parsed.expiresAt < Date.now()) {
      return null;
    }
    return parsed.userId;
  } catch {
    return null;
  }
}

export async function setMentorSession(userId: string) {
  const jar = await cookies();
  jar.set(COOKIE_NAME, makeToken(userId), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_DAYS * 24 * 60 * 60,
  });
}

export async function clearMentorSession() {
  const jar = await cookies();
  jar.delete(COOKIE_NAME);
}

export async function getMentorUserId() {
  const jar = await cookies();
  return verifyToken(jar.get(COOKIE_NAME)?.value);
}

export async function getAuthedMentor(): Promise<MentorRow | null> {
  const userId = await getMentorUserId();
  if (!userId) return null;

  const { data, error } = await supabaseAdmin
    .from("mentors")
    .select("*")
    .eq("auth_user_id", userId)
    .maybeSingle();

  if (error) {
    console.error("[mentor-auth] 선생님 조회 실패:", error.message);
    return null;
  }
  return (data as MentorRow | null) ?? null;
}
