import "server-only";
import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";

const COOKIE_NAME = "kmentor_admin";
const SESSION_SECONDS = 24 * 60 * 60;

function getPassword() {
  return process.env.ADMIN_PASSWORD;
}

function getSessionSecret() {
  const secret =
    process.env.ADMIN_SESSION_SECRET ??
    process.env.MENTOR_SESSION_SECRET ??
    process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!secret) throw new Error("관리자 세션 서명 환경변수가 설정되지 않았습니다.");
  return secret;
}

function safeEqual(left: string, right: string) {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);
  return leftBuffer.length === rightBuffer.length && timingSafeEqual(leftBuffer, rightBuffer);
}

function sign(payload: string, password: string) {
  return createHmac("sha256", getSessionSecret())
    .update(password)
    .update("\0")
    .update(payload)
    .digest("base64url");
}

function makeToken(password: string) {
  const payload = Buffer.from(
    JSON.stringify({ expiresAt: Date.now() + SESSION_SECONDS * 1000 })
  ).toString("base64url");
  return `${payload}.${sign(payload, password)}`;
}

function verifyToken(token: string | undefined, password: string) {
  if (!token) return false;
  const [payload, signature] = token.split(".");
  if (!payload || !signature || !safeEqual(signature, sign(payload, password))) return false;
  try {
    const parsed = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as {
      expiresAt?: number;
    };
    return !!parsed.expiresAt && parsed.expiresAt > Date.now();
  } catch {
    return false;
  }
}

export async function isAdminAuthed(): Promise<boolean> {
  const jar = await cookies();
  const token = jar.get(COOKIE_NAME)?.value;
  const expected = getPassword();
  if (!expected) return false;
  return verifyToken(token, expected);
}

export async function setAdminAuthed(password: string): Promise<boolean> {
  const expected = getPassword();
  if (!expected || !safeEqual(password, expected)) return false;

  const jar = await cookies();
  jar.set(COOKIE_NAME, makeToken(expected), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_SECONDS,
  });
  return true;
}

export async function clearAdminAuth() {
  const jar = await cookies();
  jar.delete(COOKIE_NAME);
}
