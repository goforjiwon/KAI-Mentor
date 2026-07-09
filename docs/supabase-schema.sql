-- =========================================================================
-- 카이멘토 (KAIMentor) Supabase 스키마
-- 사용 방법: Supabase 프로젝트 > SQL Editor > 이 파일 전체를 붙여넣고 "Run"
-- =========================================================================

-- 1) 신청 테이블
create table if not exists public.applications (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),

  -- 학부모 제출 데이터
  parent_name text not null,
  phone text not null,
  grade text not null,
  subjects text[] not null default '{}',
  current_level text not null default '',
  difficulties text not null default '',
  goal text not null default '',
  goal_date text not null default '',
  child_personality text[] not null default '{}',
  mentor_priority text not null default '',
  extra_note text not null default '',

  -- 운영자 관리용
  status text not null default 'new',
  admin_memo text
);

-- 2) 인덱스 (최신 순 조회 최적화)
create index if not exists applications_created_at_idx
  on public.applications (created_at desc);

create index if not exists applications_status_idx
  on public.applications (status);

-- 3) 선생님 등록 테이블
create table if not exists public.mentors (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),

  -- 선생님 제출 데이터
  name text not null,
  phone text not null,
  major text not null,
  subjects text not null,
  teaching_mode text not null,
  memo text not null default '',

  -- 운영자 관리용
  status text not null default 'new'
);

create index if not exists mentors_created_at_idx
  on public.mentors (created_at desc);

create index if not exists mentors_status_idx
  on public.mentors (status);

-- 4) RLS (Row Level Security) 활성화
--    서비스 롤 키(Service Role)는 RLS를 무시하므로 서버 API에서는 모든 작업 가능.
--    anon 키는 아무것도 못 하도록 정책을 아예 만들지 않는다 = default deny.
alter table public.applications enable row level security;
alter table public.mentors enable row level security;

-- (정책을 굳이 안 만들어도 서비스 롤은 통과한다. anon에는 안전하게 접근 차단.)

-- =========================================================================
-- 참고: status 값 규칙 (어플리케이션 코드와 동기화)
--   new                => 접수됨 (미처리)
--   contacted          => 학부모 연락 완료
--   matching           => 멘토 매칭 중
--   meeting_scheduled  => 첫 미팅 예정
--   meeting_done       => 첫 미팅 완료 (강사 소개비 대상)
--   paid               => 강사 1만원 입금 완료
--   closed             => 종료 (매칭 불발/거절 등)
--   spam               => 스팸/테스트
-- =========================================================================
