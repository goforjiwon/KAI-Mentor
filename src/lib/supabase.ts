import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// 서버 전용 Supabase 클라이언트 (lazy 초기화).
// - Service Role Key는 절대 브라우저로 노출되면 안 되므로 서버에서만 import 해야 한다.
// - 빌드 타임에는 환경변수가 없을 수 있으므로, 실제 쿼리 시점에만 클라이언트를 생성한다.

let cached: SupabaseClient | null = null;

function getClient(): SupabaseClient {
  if (cached) return cached;

  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error(
      "SUPABASE_URL 또는 SUPABASE_SERVICE_ROLE_KEY 환경변수가 설정되지 않았습니다."
    );
  }

  cached = createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  return cached;
}

// 기존 코드가 supabaseAdmin.from(...) 형태로 쓰기 때문에 Proxy로 호환성 유지.
export const supabaseAdmin = new Proxy({} as SupabaseClient, {
  get(_target, prop, receiver) {
    const client = getClient();
    const value = Reflect.get(client, prop, receiver);
    return typeof value === "function" ? value.bind(client) : value;
  },
});

export type ApplicationStatus =
  | "new"
  | "contacted"
  | "matching"
  | "meeting_scheduled"
  | "meeting_done"
  | "paid"
  | "closed"
  | "spam";

export type ApplicationRow = {
  id: string;
  created_at: string;
  parent_name: string;
  phone: string;
  grade: string;
  subjects: string[];
  current_level: string;
  difficulties: string;
  goal: string;
  goal_date: string;
  child_personality: string[];
  mentor_priority: string;
  extra_note: string;
  status: ApplicationStatus;
  admin_memo: string | null;
};

export type MentorStatus = "new" | "active" | "inactive" | "blocked";

export type MentorRow = {
  id: string;
  created_at: string;
  name: string;
  phone: string;
  major: string;
  subjects: string;
  teaching_mode: string;
  memo: string;
  status: MentorStatus;
};
