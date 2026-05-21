"use client";

import { useCallback, useState } from "react";

import { auth } from "@/shared/firebase/client";
import { saveFCMToken } from "@/shared/firebase/preferences";

export type FCMPermissionState = "default" | "granted" | "denied" | "unsupported";

export function useFCM() {
  // Initialise directly from the Notification API so no synchronous effect is needed
  const [permission, setPermission] = useState<FCMPermissionState>(() => {
    if (typeof window === "undefined" || !("Notification" in window)) {
      return "unsupported";
    }
    return Notification.permission as FCMPermissionState;
  });
  const [isLoading, setIsLoading] = useState(false);
  const [token, setToken] = useState<string | null>(null);

  /**
   * Request browser notification permission, obtain the FCM token,
   * register the service worker and persist the token to Firestore.
   */
  const requestPermissionAndRegister = useCallback(async () => {
    if (typeof window === "undefined" || !("Notification" in window)) return;

    setIsLoading(true);
    try {
      const result = await Notification.requestPermission();
      setPermission(result as FCMPermissionState);

      if (result !== "granted") return;

      const firebaseUser = auth.currentUser;
      if (!firebaseUser) return;

      // Dynamic import to prevent SSR bundling of firebase/messaging
      const [{ getApp }, { getMessaging, getToken }] = await Promise.all([
        import("firebase/app"),
        import("firebase/messaging"),
      ]);

      const messaging = getMessaging(getApp());
      const vapidKey = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY;

      // Register the custom service worker so FCM works in the background
      let swRegistration: ServiceWorkerRegistration | undefined;
      if ("serviceWorker" in navigator) {
        swRegistration = await navigator.serviceWorker.register(
          "/api/firebase-messaging-sw",
          { scope: "/" }
        );
      }

      const fcmToken = await getToken(messaging, {
        vapidKey,
        serviceWorkerRegistration: swRegistration,
      });

      if (fcmToken) {
        setToken(fcmToken);
        await saveFCMToken(firebaseUser.uid, fcmToken);
      }
    } catch (err) {
      console.error("[useFCM] setup error:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Fire an immediate local browser notification (foreground only).
   * The service worker handles background messages via FCM.
   */
  const sendLocalNotification = useCallback((title: string, body: string) => {
    if (typeof window === "undefined") return;
    if (Notification.permission !== "granted") return;
    new Notification(title, {
      body,
      icon: "/mascott/OrkiLogoFront.webp",
      badge: "/mascott/OrkiLogoFront.webp",
    });
  }, []);

  return {
    permission,
    token,
    isLoading,
    requestPermissionAndRegister,
    sendLocalNotification,
  };
}
