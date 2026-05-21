import { doc, getDoc, setDoc } from "firebase/firestore";

import { db } from "./client";

export const DEFAULT_AVATAR = "/avatars/avatar-1.webp";

const userDocRef = (uid: string) => doc(db, "users", uid);

/**
 * Fetch the user's saved avatar from Firestore.
 * Returns the stored path, or the default avatar if none is set.
 */
export async function getUserAvatar(uid: string): Promise<string> {
  const snap = await getDoc(userDocRef(uid));
  if (snap.exists()) {
    const data = snap.data();
    if (typeof data.avatar === "string" && data.avatar) {
      return data.avatar;
    }
  }
  return DEFAULT_AVATAR;
}

/**
 * Persist the selected avatar path to Firestore.
 * Merges into the existing document so no other fields are affected.
 */
export async function saveUserAvatar(uid: string, avatar: string): Promise<void> {
  await setDoc(userDocRef(uid), { avatar }, { merge: true });
}
