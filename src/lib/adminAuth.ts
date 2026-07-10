import { cookies } from "next/headers";

const COOKIE_NAME = "kmentor_admin";

export async function isAdminAuthed(): Promise<boolean> {
  const jar = await cookies();
  const token = jar.get(COOKIE_NAME)?.value;
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) return false;
  return !!token && token === expected;
}

export async function setAdminAuthed(password: string): Promise<boolean> {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected || password !== expected) return false;

  const jar = await cookies();
  jar.set(COOKIE_NAME, password, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 14, // 14일
  });
  return true;
}

export async function clearAdminAuth() {
  const jar = await cookies();
  jar.delete(COOKIE_NAME);
}
