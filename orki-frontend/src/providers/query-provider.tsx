"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";

/**
 * App-wide React Query provider.
 *
 * A single QueryClient is created once per browser session (useState ensures
 * no new instance is created on re-renders). All hooks that use useQuery share
 * the same cache, so navigating between pages never triggers duplicate fetches
 * for data that is still fresh.
 *
 * Default cache policy:
 *   staleTime  5 min — data is considered fresh for 5 minutes after fetch
 *   gcTime    10 min — unused cache entries are garbage-collected after 10 min
 *   retry      1    — one retry on transient network errors
 *   refetchOnWindowFocus false — no background refetch when the tab regains focus
 */
export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [client] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 5 * 60 * 1000,
            gcTime: 10 * 60 * 1000,
            retry: 1,
            refetchOnWindowFocus: false,
          },
        },
      }),
  );

  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}
