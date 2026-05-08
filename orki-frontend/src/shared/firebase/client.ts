/**
 * Firebase CLIENT — minimal initialisation.
 *
 * This file exists solely to provide the Firebase Auth instance needed for
 * client-side OAuth flows (Google Sign-In popup, email/password sign-in).
 *
 * ALL auth-state management, user profiles, and onboarding data are handled
 * by the Django backend.  Firestore is NOT used from the frontend.
 *
 * Firebase web API keys are designed to be public (they identify the project,
 * not grant admin access).  Backend secrets (service account) never leave the
 * server.
 */
import { getApp, getApps, initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

import { env } from "@/shared/config/env";

const firebaseConfig = {
  apiKey: env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

/** Firebase Auth instance — used ONLY to perform the initial sign-in and
 *  retrieve a short-lived ID token that is immediately exchanged with the
 *  backend for a secure server session. */
export const auth = getAuth(app);

