import { NextResponse } from "next/server";
import { clearMentorSession } from "@/lib/mentorAuth";

export async function POST() {
  await clearMentorSession();
  return NextResponse.json({ success: true });
}
