import { redirect } from "next/navigation";
import { getAuthedMentor } from "@/lib/mentorAuth";
import { supabaseAdmin, type PurchaseOrderRow } from "@/lib/supabase";
import TeacherDashboard from "./TeacherDashboard";

export const dynamic = "force-dynamic";

export default async function TeacherPage() {
  const mentor = await getAuthedMentor();
  if (!mentor) redirect("/teacher/login");

  const { data, error } = await supabaseAdmin
    .from("purchase_orders")
    .select("*")
    .eq("mentor_id", mentor.id)
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) {
    console.error("[teacher] 구매 내역 조회 실패:", error.message);
  }

  return (
    <TeacherDashboard
      mentor={mentor}
      initialOrders={(data ?? []) as PurchaseOrderRow[]}
    />
  );
}
