# 카이멘토 설정 가이드 (Supabase + 관리자 페이지 + 카카오 알림)

이 업데이트에서 추가된 것들을 실제로 돌리려면 아래 3가지를 순서대로 세팅하면 됩니다.

---

## 1) Supabase 프로젝트 만들기 (필수)

### 1-1. 프로젝트 생성
1. https://supabase.com 접속 → 구글 로그인
2. **New Project** 클릭
3. 프로젝트 정보 입력:
   - **Name**: `kaimentor` (자유)
   - **Database Password**: 아무거나 강한 비밀번호 (어딘가 저장해두세요)
   - **Region**: `Northeast Asia (Seoul)` 선택
   - **Plan**: Free
4. "Create new project" → 2분쯤 기다리면 프로젝트 준비 완료

### 1-2. 테이블 만들기
1. 왼쪽 사이드바에서 **SQL Editor** 클릭
2. **New query** 클릭
3. 이 리포의 `docs/supabase-schema.sql` 파일 내용을 **전체 복사해서 붙여넣기**
4. 오른쪽 위 **Run** (또는 Ctrl/Cmd+Enter) 클릭
5. "Success. No rows returned" 나오면 성공

### 1-3. 연결 정보 확인 (나중에 Vercel에 넣을 값)
1. 왼쪽 사이드바 **Project Settings** (톱니바퀴) → **API**
2. 두 값을 복사해둡니다:
   - **Project URL** → `SUPABASE_URL`
   - **Project API Keys > service_role** (🔒 비밀키, 절대 코드에 올리지 말 것) → `SUPABASE_SERVICE_ROLE_KEY`

---

## 2) Vercel 환경변수 설정 (필수)

1. https://vercel.com/dashboard → `kmentor` 프로젝트 → **Settings** → **Environment Variables**
2. 아래 값들을 하나씩 추가 (Environment: **Production, Preview, Development** 모두 체크):

| Name | Value | 설명 |
|---|---|---|
| `SUPABASE_URL` | 1-3에서 복사한 Project URL | 필수 |
| `SUPABASE_SERVICE_ROLE_KEY` | 1-3에서 복사한 service_role key | 필수 |
| `ADMIN_PASSWORD` | 원하는 비밀번호 (예: `kmentor-admin-2026!`) | `/admin` 로그인용 |
| `ADMIN_SESSION_SECRET` | 32자 이상의 별도 무작위 문자열 | 관리자 세션 서명용 |
| `MENTOR_SESSION_SECRET` | 32자 이상의 무작위 문자열 | 선생님 로그인 세션 서명용 |
| `RESEND_API_KEY` | Resend API Key | 이메일 알림 (선택, 없으면 이메일만 건너뜀) |
| `APPLICATION_EMAIL_FROM` | 인증된 발신 주소 | 이메일 발신 주소 (선택, 없으면 이메일만 건너뜀) |
| `SITE_URL` | `https://kmentor-eight.vercel.app` | 카톡 메시지 링크용 |

3. 저장 후 **Deployments** 탭 → 최신 배포 우측 `⋯` → **Redeploy** (환경변수는 재배포해야 적용됨)

---

## 3) 카카오톡 "나에게 보내기" 알림 (선택 — 나중에 해도 됨)

⚠️ 이게 설정이 제일 번거롭습니다. **안 해도 DB 저장 + 이메일 알림은 정상 작동**하니, 먼저 1·2번만 끝내고 동작 확인한 뒤에 붙여도 됩니다.

### 3-1. 카카오 개발자 앱 생성
1. https://developers.kakao.com → 로그인
2. **내 애플리케이션** → **애플리케이션 추가하기**
3. 앱 이름 `카이멘토`, 사업자명 아무거나 입력
4. 생성된 앱 클릭 → **앱 설정 > 앱 키** 에서 **REST API 키** 복사 → `KAKAO_REST_API_KEY`

### 3-2. 카카오 로그인 활성화
1. 왼쪽 메뉴 **제품 설정 > 카카오 로그인**
2. **활성화 설정** ON
3. **Redirect URI** 추가: `https://kmentor-eight.vercel.app/oauth/kakao/callback`
   (지금은 설정만 — 실제 콜백 페이지는 안 만들고, 수동 토큰 발급으로 끝낼 거예요)

### 3-3. 동의항목 설정
1. **제품 설정 > 카카오 로그인 > 동의항목**
2. **카카오톡 메시지 전송 (`talk_message`)** → 설정 → **선택 동의** 으로 바꿈

### 3-4. 토큰 수동 발급 (한 번만)
브라우저에서 아래 URL에 접속 (your_rest_api_key 부분만 바꿔서):

```
https://kauth.kakao.com/oauth/authorize?client_id=YOUR_REST_API_KEY&redirect_uri=https://kmentor-eight.vercel.app/oauth/kakao/callback&response_type=code&scope=talk_message
```

→ 카카오 로그인 → 동의 → 페이지가 에러 나더라도 **주소창의 URL에 `code=xxxxx` 부분을 복사**

이 `code` 를 다음 터미널 명령에 넣어 실행 (또는 Postman 등):

```bash
curl -X POST https://kauth.kakao.com/oauth/token \
  -d "grant_type=authorization_code" \
  -d "client_id=YOUR_REST_API_KEY" \
  -d "redirect_uri=https://kmentor-eight.vercel.app/oauth/kakao/callback" \
  -d "code=여기에_복사한_code"
```

응답으로 오는 JSON에서:
- `access_token` → Vercel 환경변수 `KAKAO_ACCESS_TOKEN`
- `refresh_token` → Vercel 환경변수 `KAKAO_REFRESH_TOKEN`

### 3-5. Vercel에 토큰 추가

| Name | Value |
|---|---|
| `KAKAO_REST_API_KEY` | 3-1의 REST API 키 |
| `KAKAO_ACCESS_TOKEN` | 3-4의 access_token |
| `KAKAO_REFRESH_TOKEN` | 3-4의 refresh_token |

추가 후 **Redeploy**.

### 3-6. 주의사항
- access_token 은 **6시간** 지나면 만료됩니다. 코드에 자동 갱신 로직이 들어있어서 refresh_token 이 유효한 동안은 자동으로 갱신됩니다.
- refresh_token 은 **약 2달** 유효합니다. 중간에 새 refresh_token 이 발급되면 서버 로그에 경고로 찍히니, 가끔 Vercel 환경변수를 업데이트해주세요.
- refresh_token 이 만료되면 3-4 과정을 다시 해야 합니다.

**📌 더 간단한 대안**: 카카오 설정이 너무 번거롭다면, 대신 **텔레그램 봇**이나 **Slack 웹훅**으로 바꾸는 게 훨씬 쉬워요. 원하시면 말씀해주세요.

---

## 4) 동작 확인

1. https://kmentor-eight.vercel.app/apply 에서 테스트 신청 한 건 제출
2. Supabase 대시보드 → **Table Editor > applications** 테이블에 새 행이 들어왔는지 확인
3. 이메일 알림을 설정했다면 `goforjiwon@gmail.com` 으로 이메일 도착 확인
4. 카카오 설정했으면 내 카톡 "나와의 채팅"에 알림 도착 확인
5. https://kmentor-eight.vercel.app/admin 접속 → `ADMIN_PASSWORD` 입력 → 대시보드에 방금 제출한 신청이 보이는지 확인
6. `/mentor-signup`에서 선생님 계정을 만들고 `/teacher` 화면 진입 확인
7. 첫 매칭 1회 이용권을 선택해 입금자명으로 확인 요청 생성
8. `/admin`의 **입금·이용권** 탭에서 실제 입금 확인 후 **입금 확인·충전** 클릭
9. 선생님 화면을 새로고침해 잔여 이용권이 1회 증가했는지 확인

> 현재 계좌이체는 초기 운영용 수동 확인 방식입니다. 주문번호·입금자명·금액·상태가 저장되며,
> 관리자가 확인한 주문만 데이터베이스 함수에서 한 번 충전됩니다. 거래량이 늘면 같은
> `purchase_orders` 구조를 유지한 채 가상계좌 입금 웹훅으로 자동화할 수 있습니다.

---

## 5) 이전 Google Sheets 데이터는?

이 업데이트로 **새 신청은 Google Sheets에 더 이상 안 쌓입니다.** 기존 시트 데이터가 있다면:
- 그대로 보관만 해두거나
- 필요하면 CSV로 다운로드해서 Supabase에 수동 import 가능 (Table Editor > Insert > Import data from CSV)
