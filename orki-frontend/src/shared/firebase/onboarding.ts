import { doc, getDoc, setDoc } from "firebase/firestore";

import { db } from "@/shared/firebase/client";
import type { ExamType, PersonalInfo } from "@/entities/onboarding/types";

export async function isOnboardingComplete(uid: string): Promise<boolean> {
  const ref = doc(db, "users", uid);
  const snap = await getDoc(ref);
  if (!snap.exists()) return false;
  return snap.data()?.onboardingCompleted === true;
}

export async function saveOnboardingProfile(
  uid: string,
  data: PersonalInfo & { examType: ExamType },
): Promise<void> {
  const ref = doc(db, "users", uid);
  await setDoc(
    ref,
    {
      firstName: data.firstName,
      lastName: data.lastName,
      age: data.age,
      examType: data.examType,
      onboardingCompleted: true,
    },
    { merge: true },
  );
}
