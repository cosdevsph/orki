"use client";

/**
 * Firebase Auth helpers — client-side ONLY.
 *
 * These functions perform the initial credential sign-in via Firebase and
 * return a Firebase ID token.  The caller MUST immediately exchange that
 * token with the backend (`loginWithBackend`) to open a server session.
 *
 * No Firebase auth state is persisted by the frontend.  After the token
 * exchange the backend session cookie is the single source of truth.
 */
import {
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
} from "firebase/auth";

import { auth } from "@/shared/firebase/client";

const googleProvider = new GoogleAuthProvider();

/** Sign in with Google popup and return the Firebase UserCredential. */
export async function signInWithGoogle() {
  return signInWithPopup(auth, googleProvider);
}

/** Sign in with email/password and return the Firebase UserCredential. */
export async function signInWithEmail(email: string, password: string) {
  return signInWithEmailAndPassword(auth, email, password);
}

/** Register a new user, set their display name, and return the credential. */
export async function signUpWithEmail(name: string, email: string, password: string) {
  const credential = await createUserWithEmailAndPassword(auth, email, password);
  await updateProfile(credential.user, { displayName: name });
  return credential;
}

/**
 * Sign out from Firebase client.
 * The backend session is invalidated separately via `logoutFromBackend()`.
 */
export async function signOutFirebase() {
  return signOut(auth);
}

