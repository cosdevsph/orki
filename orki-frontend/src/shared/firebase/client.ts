/**
 * Firebase CLIENT — initialisation for Auth + Firestore.
 *
 * Auth:      Used for OAuth/email sign-in; ID token is exchanged with Django
 *            for a secure server session cookie.
 * Firestore: Single source of truth for exam questions, subjects, and
 *            exam-attempt analytics.  Django handles user auth state only.
 *
 * Firebase web API keys are public by design (they identify the project,
 * not grant admin access).  Service-account secrets never leave the server.
 */
import { getApp, getApps, initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

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

/** Firebase Auth instance — used to perform the initial sign-in and retrieve
 *  the ID token that is exchanged with Django for a secure session cookie. */
export const auth = getAuth(app);

/** Firestore database — single source of truth for subjects, questions, and
 *  exam-attempt analytics. */
export const db = getFirestore(app);

