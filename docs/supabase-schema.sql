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
  student_gender text not null default '',
  school_name text not null default '',
  grade text not null,
  subjects text[] not null default '{}',
  current_level text not null default '',
  difficulties text not null default '',
  goal text not null default '',
  goal_date text not null default '',
  child_personality text[] not null default '{}',
  mentor_priority text not null default '',
  preferred_days text[] not null default '{}',
  preferred_time text not null default '',
  desired_start_date text not null default '',
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
  auth_user_id uuid references auth.users(id) on delete set null,
  email text,
  name text not null,
  phone text not null,
  major text not null,
  subjects text not null,
  teaching_mode text not null,
  memo text not null default '',

  -- 운영자 관리용
  status text not null default 'new',
  credit_balance integer not null default 0 check (credit_balance >= 0),
  total_credits_purchased integer not null default 0 check (total_credits_purchased >= 0),
  total_credits_used integer not null default 0 check (total_credits_used >= 0)
);

-- 기존 프로젝트에 이 파일을 다시 실행해도 신규 필드가 추가되도록 보강
alter table public.applications
  add column if not exists student_gender text not null default '',
  add column if not exists school_name text not null default '',
  add column if not exists preferred_days text[] not null default '{}',
  add column if not exists preferred_time text not null default '',
  add column if not exists desired_start_date text not null default '';

alter table public.mentors
  add column if not exists auth_user_id uuid references auth.users(id) on delete set null,
  add column if not exists email text,
  add column if not exists credit_balance integer not null default 0,
  add column if not exists total_credits_purchased integer not null default 0,
  add column if not exists total_credits_used integer not null default 0;

create index if not exists mentors_created_at_idx
  on public.mentors (created_at desc);

create index if not exists mentors_status_idx
  on public.mentors (status);

create unique index if not exists mentors_auth_user_id_uidx
  on public.mentors (auth_user_id)
  where auth_user_id is not null;

create unique index if not exists mentors_email_uidx
  on public.mentors (lower(email))
  where email is not null;

-- 4) 선생님 이용권 구매/입금 확인 요청
create table if not exists public.purchase_orders (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  order_number text not null unique,
  mentor_id uuid not null references public.mentors(id) on delete cascade,
  plan_code text not null,
  plan_name text not null,
  credit_count integer not null check (credit_count > 0),
  amount integer not null check (amount > 0),
  depositor_name text not null,
  status text not null default 'pending'
    check (status in ('pending', 'paid', 'mismatch', 'cancelled')),
  confirmed_at timestamptz,
  admin_note text
);

create index if not exists purchase_orders_created_at_idx
  on public.purchase_orders (created_at desc);

create index if not exists purchase_orders_status_idx
  on public.purchase_orders (status, created_at desc);

create index if not exists purchase_orders_mentor_id_idx
  on public.purchase_orders (mentor_id, created_at desc);

-- 첫 상담 프로모션은 선생님당 처리 중/완료 주문 1건만 허용
create unique index if not exists purchase_orders_first_promo_uidx
  on public.purchase_orders (mentor_id, plan_code)
  where plan_code = 'first' and status in ('pending', 'paid');

-- 이용권 증감 감사 원장
create table if not exists public.credit_transactions (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  mentor_id uuid not null references public.mentors(id) on delete cascade,
  order_id uuid references public.purchase_orders(id) on delete set null,
  transaction_type text not null
    check (transaction_type in ('purchase', 'use', 'adjustment')),
  credit_delta integer not null check (credit_delta <> 0),
  balance_after integer not null check (balance_after >= 0),
  note text
);

create unique index if not exists credit_transactions_purchase_order_uidx
  on public.credit_transactions (order_id)
  where transaction_type = 'purchase' and order_id is not null;

create index if not exists credit_transactions_mentor_id_idx
  on public.credit_transactions (mentor_id, created_at desc);

-- 운영자 입금 승인: 주문 잠금 → 잔액 충전 → 주문 완료 → 원장 기록을 한 트랜잭션으로 처리
create or replace function public.approve_purchase_order(
  p_order_id uuid,
  p_admin_note text default null
) returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_order public.purchase_orders%rowtype;
  v_balance integer;
begin
  select * into v_order
  from public.purchase_orders
  where id = p_order_id
  for update;

  if not found then
    raise exception 'order not found';
  end if;

  if v_order.status <> 'pending' then
    raise exception 'already processed';
  end if;

  update public.mentors
  set credit_balance = credit_balance + v_order.credit_count,
      total_credits_purchased = total_credits_purchased + v_order.credit_count
  where id = v_order.mentor_id
  returning credit_balance into v_balance;

  if not found then
    raise exception 'mentor not found';
  end if;

  update public.purchase_orders
  set status = 'paid',
      confirmed_at = now(),
      admin_note = p_admin_note
  where id = v_order.id;

  insert into public.credit_transactions (
    mentor_id,
    order_id,
    transaction_type,
    credit_delta,
    balance_after,
    note
  ) values (
    v_order.mentor_id,
    v_order.id,
    'purchase',
    v_order.credit_count,
    v_balance,
    '계좌이체 입금 확인'
  );

  return jsonb_build_object(
    'order_id', v_order.id,
    'mentor_id', v_order.mentor_id,
    'credits_added', v_order.credit_count,
    'balance_after', v_balance
  );
end;
$$;

revoke all on function public.approve_purchase_order(uuid, text) from public;
revoke all on function public.approve_purchase_order(uuid, text) from anon;
revoke all on function public.approve_purchase_order(uuid, text) from authenticated;
grant execute on function public.approve_purchase_order(uuid, text) to service_role;

-- 5) RLS (Row Level Security) 활성화
--    서비스 롤 키(Service Role)는 RLS를 무시하므로 서버 API에서는 모든 작업 가능.
--    anon 키는 아무것도 못 하도록 정책을 아예 만들지 않는다 = default deny.
alter table public.applications enable row level security;
alter table public.mentors enable row level security;
alter table public.purchase_orders enable row level security;
alter table public.credit_transactions enable row level security;

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
--
-- 참고: mentors.status 값 규칙
--   new      => 신규 등록
--   active   => 활동 가능
--   inactive => 일시 중지
--   blocked  => 제외
--
-- 참고: purchase_orders.status 값 규칙
--   pending   => 입금 확인 대기
--   paid      => 입금 확인 및 이용권 충전 완료
--   mismatch  => 입금자명/금액 불일치
--   cancelled => 취소
-- =========================================================================
