export type ExamType = "LEPT" | "CSE" | "PmLE" | "CLE";

export interface ExamOption {
  id: ExamType;
  shortName: string;
  fullName: string;
  description: string;
}

export interface PersonalInfo {
  firstName: string;
  lastName: string;
  age: number;
}

export interface OnboardingProfile extends PersonalInfo {
  examType: ExamType;
  onboardingCompleted: boolean;
}
