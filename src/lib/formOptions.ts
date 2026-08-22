export const GRADES = [
  "초등학교 1학년", "초등학교 2학년", "초등학교 3학년",
  "초등학교 4학년", "초등학교 5학년", "초등학교 6학년",
  "중학교 1학년", "중학교 2학년", "중학교 3학년",
  "고등학교 1학년", "고등학교 2학년", "고등학교 3학년",
] as const;

export const STUDENT_GENDERS = ["남학생", "여학생"] as const;
export const APPLICATION_SUBJECTS = ["수학", "과학"] as const;
export const CHILD_PERSONALITIES = [
  "내성적인 편",
  "외향적인 편",
  "쉽게 지치는 편",
  "완벽주의 성향",
  "말이 많은 편",
  "조용한 편",
] as const;
export const MENTOR_PRIORITIES = [
  "수학·과학 개념 설명·문제풀이",
  "공부 방법·루틴 잡기",
  "멘탈 관리·동기 부여",
  "진로·대학(이공계) 이야기",
] as const;
export const WEEKDAYS = ["월", "화", "수", "목", "금", "토", "일"] as const;

export const MENTOR_SUBJECTS = ["수학", "과학", "수학+과학"] as const;
export const TEACHING_MODES = ["대면", "온라인", "둘 다"] as const;

export function isAllowedOption(value: string, options: readonly string[]) {
  return options.includes(value);
}

export function hasOnlyAllowedOptions(values: string[], options: readonly string[]) {
  return values.every((value) => isAllowedOption(value, options));
}

export function sortByOptionOrder(values: string[], options: readonly string[]): string[] {
  const uniqueValues = [...new Set(values)];
  const optionSet = new Set(options);
  return [
    ...options.filter((option) => uniqueValues.includes(option)),
    ...uniqueValues.filter((value) => !optionSet.has(value)),
  ];
}
