export const MATCHING_PLANS = [
  {
    code: "first",
    name: "첫 매칭 1회",
    credits: 1,
    price: 10_000,
    originalPrice: 20_000,
    unitPrice: 10_000,
    savingRate: 50,
    description: "기간 한정 · 선생님당 1회",
  },
  {
    code: "starter",
    name: "3회 이용권",
    credits: 3,
    price: 54_000,
    unitPrice: 18_000,
    savingRate: 10,
    description: "부담 없이 시작하기",
  },
  {
    code: "standard",
    name: "5회 이용권",
    credits: 5,
    price: 85_000,
    unitPrice: 17_000,
    savingRate: 15,
    description: "꾸준히 매칭 받기",
  },
  {
    code: "growth",
    name: "10회 이용권",
    credits: 10,
    price: 160_000,
    unitPrice: 16_000,
    savingRate: 20,
    description: "가장 낮은 회당 가격",
  },
] as const;

export type MatchingPlanCode = (typeof MATCHING_PLANS)[number]["code"];

export function getMatchingPlan(code: string) {
  return MATCHING_PLANS.find((plan) => plan.code === code);
}

export function formatWon(value: number) {
  return `${value.toLocaleString("ko-KR")}원`;
}
