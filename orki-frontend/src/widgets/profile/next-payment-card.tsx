"use client";

import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

import { useAuth } from "@/hooks/useAuth";
import { getSubscriptionDetail, type SubscriptionDetail } from "@/shared/api/profile";
import { routes } from "@/shared/config/routes";

function formatDate(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export function NextPaymentCard() {
  const { user } = useAuth();
  const router = useRouter();

  const { data, isLoading } = useQuery<SubscriptionDetail>({
    queryKey: ["subscription-detail", user?.uid],
    queryFn: getSubscriptionDetail,
    enabled: !!user,
    staleTime: 5 * 60 * 1000,
  });

  if (isLoading) {
    return (
      <div className="space-y-2">
        <h3 className="px-1 text-xs font-semibold uppercase tracking-widest text-muted">
          Subscription
        </h3>
        <div className="glass overflow-hidden rounded-2xl p-5 animate-pulse">
          <div className="h-16 rounded-xl bg-overlay-hover" />
        </div>
      </div>
    );
  }

  const isActive = data?.is_active ?? false;
  const daysRemaining = data?.days_remaining ?? null;
  const expiresAt = data?.expires_at ?? null;
  const subStatus = data?.status ?? "no_subscription";
  const planName = data?.plan ?? "Orki Basic ₱49";

  const isExpiringSoon = isActive && daysRemaining !== null && daysRemaining <= 7;

  return (
    <div className="space-y-2">
      <h3 className="px-1 text-xs font-semibold uppercase tracking-widest text-muted">
        Subscription
      </h3>
      <div className="glass overflow-hidden rounded-2xl">
        {/* Status header */}
        <div
          className="border-b border-border/50 px-4 py-3 md:px-5 md:py-4"
          style={{
            background: isActive
              ? "linear-gradient(135deg, rgba(47,162,226,0.06) 0%, rgba(56,189,248,0.04) 100%)"
              : "linear-gradient(135deg, rgba(239,68,68,0.06) 0%, rgba(239,68,68,0.03) 100%)",
          }}
        >
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <p className="text-sm font-semibold text-foreground">{planName}</p>
              <p className="text-xs text-muted">
                {isActive && expiresAt
                  ? `Valid until ${formatDate(expiresAt)}`
                  : subStatus === "no_subscription"
                  ? "No active subscription"
                  : "Subscription expired"}
              </p>
            </div>
            <span
              className={[
                "rounded-full px-2.5 py-1 text-[11px] font-semibold",
                isActive && !isExpiringSoon
                  ? "bg-success/10 text-success"
                  : isExpiringSoon
                  ? "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                  : "bg-destructive/10 text-destructive",
              ].join(" ")}
            >
              {isActive && !isExpiringSoon
                ? "Active"
                : isExpiringSoon
                ? "Expiring Soon"
                : subStatus === "no_subscription"
                ? "Inactive"
                : "Expired"}
            </span>
          </div>
        </div>

        {/* Stats row — only when active */}
        {isActive && (
          <div className="grid grid-cols-2 divide-x divide-border/50">
            <div className="px-4 py-3 md:px-5 md:py-4">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-muted">
                Days Remaining
              </p>
              <p
                className={[
                  "mt-1 font-heading text-xl md:text-2xl font-bold",
                  isExpiringSoon ? "text-amber-500" : "text-foreground",
                ].join(" ")}
              >
                {daysRemaining ?? "—"}
              </p>
            </div>
            <div className="px-4 py-3 md:px-5 md:py-4">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-muted">
                Renewal Date
              </p>
              <p className="mt-1 text-sm font-semibold text-foreground">
                {formatDate(expiresAt)}
              </p>
            </div>
          </div>
        )}

        {/* Inactive / expired CTA */}
        {!isActive && (
          <div className="flex items-center justify-between px-4 py-3 md:px-5 md:py-4">
            <p className="text-sm text-muted">
              {subStatus === "no_subscription"
                ? "Unlock all premium features."
                : "Renew to continue your studies."}
            </p>
            <button
              type="button"
              onClick={() => router.push(routes.subscribe)}
              className="rounded-xl bg-primary px-4 py-2 text-xs font-semibold text-white transition hover:opacity-90"
            >
              Subscribe
            </button>
          </div>
        )}

        {/* Expiring soon warning */}
        {isExpiringSoon && (
          <div className="border-t border-amber-500/20 bg-amber-500/5 px-4 py-3 md:px-5">
            <p className="text-[11px] font-medium text-amber-600 dark:text-amber-400">
              ⚠ Your subscription expires in {daysRemaining} day
              {daysRemaining !== 1 ? "s" : ""}. Renew now to avoid interruption.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
