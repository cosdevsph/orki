import { NextResponse } from "next/server";

/**
 * Serves the Firebase Cloud Messaging service worker with the Firebase
 * project config injected at runtime.
 *
 * The service worker must be served from the origin root so it can control
 * the entire application scope.  Because Next.js cannot interpolate
 * `process.env` into files in /public, we use an API route instead and
 * set the `Service-Worker-Allowed: /` header to allow root-scope control.
 *
 * SETUP — add to .env.local:
 *   NEXT_PUBLIC_FIREBASE_VAPID_KEY=<your Web Push certificate VAPID key>
 *   (Generate in Firebase Console → Project Settings → Cloud Messaging → Web Push certificates)
 */
export const dynamic = "force-dynamic";

export function GET(): NextResponse {
  const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY ?? "",
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ?? "",
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ?? "",
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ?? "",
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ?? "",
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID ?? "",
  };

  // language=javascript
  const serviceWorkerScript = `
importScripts("https://www.gstatic.com/firebasejs/11.0.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/11.0.0/firebase-messaging-compat.js");

firebase.initializeApp(${JSON.stringify(firebaseConfig)});

const messaging = firebase.messaging();

/**
 * Handle background push messages when the page is not in focus.
 * Foreground messages are handled by the app itself via the useFCM hook.
 */
messaging.onBackgroundMessage(function (payload) {
  const title = payload?.notification?.title ?? "Orki";
  const body  = payload?.notification?.body  ?? "";

  self.registration.showNotification(title, {
    body,
    icon:  "/mascott/OrkiLogoFront.webp",
    badge: "/mascott/OrkiLogoFront.webp",
    data:  payload?.data ?? {},
  });
});

self.addEventListener("notificationclick", function (event) {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then(function (clientList) {
      for (const client of clientList) {
        if (client.url && "focus" in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow("/");
      }
    })
  );
});
`.trim();

  return new NextResponse(serviceWorkerScript, {
    headers: {
      "Content-Type": "application/javascript; charset=utf-8",
      /** Allow the SW (served from /api/…) to control the entire origin */
      "Service-Worker-Allowed": "/",
      "Cache-Control": "no-store, no-cache, must-revalidate",
    },
  });
}
