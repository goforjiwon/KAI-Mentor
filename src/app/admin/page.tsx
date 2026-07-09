import { redirect } from "next/navigation";
import { isAdminAuthed } from "@/lib/adminAuth";
import { supabaseAdmin, type ApplicationRow, type MentorRow } from "@/lib/supabase";
import AdminDashboard from "./AdminDashboard";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  if (!(await isAdminAuthed())) {
    redirect("/admin/login");
  }

  const [applicationsResult, mentorsResult] = await Promise.all([
    supabaseAdmin
    .from("applications")
    .select("*")
    .order("created_at", { ascending: false })
      .limit(500),
    supabaseAdmin
      .from("mentors")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(500),
  ]);

  if (applicationsResult.error || mentorsResult.error) {
    return (
      <div className="p-8 text-red-600">
        DB 조회 오류: {applicationsResult.error?.message ?? mentorsResult.error?.message}
      </div>
    );
  }

  return (
    <AdminDashboard
      initialApplications={(applicationsResult.data ?? []) as ApplicationRow[]}
      initialMentors={(mentorsResult.data ?? []) as MentorRow[]}
    />
  );
}
