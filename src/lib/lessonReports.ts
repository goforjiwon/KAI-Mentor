export const REPORT_STATUSES = { new: "미확인", reviewed: "확인 완료", follow_up: "후속 상담 필요" } as const;
export type LessonReport = {
  id: string; created_at: string; mentor_id: string; student_name: string;
  lesson_date: string; subject: string; summary: string; progress: string; comment: string;
  status: keyof typeof REPORT_STATUSES; admin_memo?: string;
  notification_status?: "pending" | "sent" | "failed";
  mentor?: { name: string };
};
export const TEACHER_REPORT_FIELDS = "id,created_at,mentor_id,student_name,lesson_date,subject,summary,progress,comment,status";
export function koreaToday() {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Seoul", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());
}
