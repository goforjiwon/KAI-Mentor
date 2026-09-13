export const MATCH_STATUSES = { active: "진행 중", paused: "일시 중지", ended: "계약 종료" } as const;
export type TutoringMatch = {
  id: string; created_at: string; updated_at: string; version: number;
  mentor_id: string; application_id: string; student_name: string;
  status: keyof typeof MATCH_STATUSES; started_on: string | null; ended_on: string | null;
  admin_memo: string;
  mentor: { name: string };
  application: { parent_name: string; school_name: string; grade: string };
};
export type MatchChoices = {
  mentors: { id: string; name: string; has_login: boolean }[];
  applications: { id: string; parent_name: string; school_name: string; grade: string }[];
};
