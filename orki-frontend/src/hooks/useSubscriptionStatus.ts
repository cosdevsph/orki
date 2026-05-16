"use client";

import { useEffect, useState } from "react";

type SubscriptionStatus = {
  status: string;
} | null;

type UseSubscriptionStatusReturn = {
  subscription: SubscriptionStatus;
  subLoading: boolean;
  isSubscribed: boolean;
};

/**
 * Fetches the current user's subscription status from the API.
 * Returns the raw `subscription` object, a `subLoading` flag, and a
 * derived `isSubscribed` boolean (true only when status === "active").
 *
 * Pass `userId` (or any truthy/falsy value) to control when the fetch fires.
 * Pass `null` / `undefined` to skip fetching (e.g. while auth is loading).
 */
export function useSubscriptionStatus(
  userId: number | null | undefined,
): UseSubscriptionStatusReturn {
  const [subscription, setSubscription] = useState<SubscriptionStatus>(null);
  const [subLoading, setSubLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      // Don't fetch until we have a user; keep loading state true so callers
      // can distinguish "not yet fetched" from "fetched and not subscribed".
      // (subLoading is already initialised to `true`, so no setState needed.)
      return;
    }

    let cancelled = false;

    async function fetchSubscription() {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}users/subscription/`,
          { credentials: "include" },
        );
        if (!cancelled && res.ok) {
          const data = (await res.json()) as { status: string };
          setSubscription(data);
        }
      } catch {
        // Network error — treat as non-subscribed so the paywall is shown
        // rather than silently letting through unverified users.
      } finally {
        if (!cancelled) setSubLoading(false);
      }
    }

    void fetchSubscription();

    return () => {
      cancelled = true;
    };
  }, [userId]);

  return {
    subscription,
    subLoading,
    isSubscribed: subscription?.status === "active",
  };
}
