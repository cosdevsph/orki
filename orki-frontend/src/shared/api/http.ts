import { env } from "@/shared/config/env";
import type { ApiErrorResponse } from "@/shared/types/api";

type RequestInitWithBody = Omit<RequestInit, "body"> & {
  body?: unknown;
};

export class ApiError extends Error {
  status: number;
  payload?: ApiErrorResponse;

  constructor(message: string, status: number, payload?: ApiErrorResponse) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.payload = payload;
  }
}

/**
 * Read the Django CSRF token from the `csrftoken` cookie.
 * Returns an empty string in SSR contexts where `document` is unavailable.
 */
function getCsrfToken(): string {
  if (typeof document === "undefined") return "";
  const match = document.cookie.match(/(?:^|;\s*)csrftoken=([^;]+)/);
  return match ? match[1] : "";
}

export async function http<T>(path: string, init: RequestInitWithBody = {}): Promise<T> {
  const method = (init.method ?? "GET").toUpperCase();
  const isMutation = ["POST", "PUT", "PATCH", "DELETE"].includes(method);

  const response = await fetch(`${env.NEXT_PUBLIC_API_URL}${path}`, {
    ...init,
    credentials: "include",        // Send session cookie on every request
    headers: {
      "Content-Type": "application/json",
      ...(isMutation ? { "X-CSRFToken": getCsrfToken() } : {}),
      ...(init.headers ?? {}),
    },
    body: init.body ? JSON.stringify(init.body) : undefined,
    cache: "no-store",
  });

  if (!response.ok) {
    let payload: ApiErrorResponse | undefined;
    try {
      payload = (await response.json()) as ApiErrorResponse;
    } catch {
      payload = undefined;
    }

    throw new ApiError(payload?.detail ?? "Request failed.", response.status, payload);
  }

  // 204 No Content — return undefined cast to T
  if (response.status === 204) return undefined as T;

  return (await response.json()) as T;
}

