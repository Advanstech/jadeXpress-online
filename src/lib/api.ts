"use client";

const API_BASE = (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001/api/v1").replace(/\/$/, "");

const TOKEN_KEY = "jx_access_token";
const REFRESH_KEY = "jx_refresh_token";
const TYPE_KEY = "jx_auth_type";
const USER_EMAIL_KEY = "jx_user_email";

export interface StoredTokens {
  accessToken: string;
  refreshToken: string;
  type: "customer" | "staff";
}

export function getTokens(): StoredTokens | null {
  if (typeof window === "undefined") return null;
  const accessToken = localStorage.getItem(TOKEN_KEY);
  const refreshToken = localStorage.getItem(REFRESH_KEY);
  const type = localStorage.getItem(TYPE_KEY) as "customer" | "staff" | null;
  if (!accessToken || !refreshToken || !type) return null;
  return { accessToken, refreshToken, type };
}

export function setTokens(accessToken: string, refreshToken: string, type: "customer" | "staff") {
  if (typeof window === "undefined") return;
  localStorage.setItem(TOKEN_KEY, accessToken);
  localStorage.setItem(REFRESH_KEY, refreshToken);
  localStorage.setItem(TYPE_KEY, type);
}

export function clearTokens() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_KEY);
  localStorage.removeItem(TYPE_KEY);
  localStorage.removeItem(USER_EMAIL_KEY);
}

export function getUserEmail(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(USER_EMAIL_KEY);
}

export function setUserEmail(email: string) {
  if (typeof window === "undefined") return;
  localStorage.setItem(USER_EMAIL_KEY, email);
}

function base64UrlDecode(input: string) {
  let output = input.replace(/-/g, "+").replace(/_/g, "/");
  switch (output.length % 4) {
    case 0:
      break;
    case 2:
      output += "==";
      break;
    case 3:
      output += "=";
      break;
    default:
      throw new Error("Invalid base64url token");
  }
  return atob(output);
}

export interface JwtPayload {
  sub: string;
  role: string;
  type?: "customer" | "staff";
  storeId?: string;
  exp?: number;
  iat?: number;
}

export function decodeJwt(token: string): JwtPayload | null {
  try {
    const [, payload] = token.split(".");
    if (!payload) return null;
    return JSON.parse(base64UrlDecode(payload)) as JwtPayload;
  } catch {
    return null;
  }
}

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

async function parseError(res: Response): Promise<ApiError> {
  let message = `Request failed with ${res.status}`;
  try {
    const body = (await res.json()) as { message?: string | string[]; error?: string };
    if (Array.isArray(body.message)) message = body.message.join(". ");
    else if (typeof body.message === "string") message = body.message;
    else if (typeof body.error === "string") message = body.error;
  } catch {
    /* ignore */
  }
  return new ApiError(message, res.status);
}

let isRefreshing = false;
let refreshPromise: Promise<unknown> | null = null;

export async function apiRequest<T>(
  method: string,
  path: string,
  body?: unknown,
  { skipAuth, isRetry }: { skipAuth?: boolean; isRetry?: boolean } = {},
): Promise<T> {
  const url = path.startsWith("http") ? path : `${API_BASE}/${path.replace(/^\//, "")}`;
  const headers: Record<string, string> = {};

  if (body !== undefined) {
    headers["Content-Type"] = "application/json";
  }

  if (!skipAuth) {
    const stored = getTokens();
    if (stored?.accessToken) {
      headers["Authorization"] = `Bearer ${stored.accessToken}`;
    }
  }

  const res = await fetch(url, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    // If 401 Unauthorized and not already retrying or skipping auth, attempt token refresh
    if (res.status === 401 && !skipAuth && !isRetry) {
      const stored = getTokens();
      if (stored?.refreshToken) {
        try {
          if (!isRefreshing) {
            isRefreshing = true;
            refreshPromise = refreshSession(stored.refreshToken, stored.type).finally(() => {
              isRefreshing = false;
              refreshPromise = null;
            });
          }
          await refreshPromise;
          // Retry original request with new token
          return apiRequest<T>(method, path, body, { skipAuth: false, isRetry: true });
        } catch {
          clearTokens();
        }
      }
    }
    throw await parseError(res);
  }

  if (res.status === 204 || res.headers.get("content-length") === "0") {
    return undefined as T;
  }

  const json = (await res.json()) as { data?: T } | T;
  if (json && typeof json === "object" && "data" in json) {
    return (json as { data: T }).data;
  }
  return json as T;
}

export const api = {
  get: <T>(path: string) => apiRequest<T>("GET", path),
  post: <T>(path: string, body?: unknown) => apiRequest<T>("POST", path, body),
  put: <T>(path: string, body?: unknown) => apiRequest<T>("PUT", path, body),
  patch: <T>(path: string, body?: unknown) => apiRequest<T>("PATCH", path, body),
  delete: <T>(path: string) => apiRequest<T>("DELETE", path),
};

export interface CustomerLoginResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: string;
  customer: {
    id: string;
    firstName: string;
    lastName: string | null;
    phone: string | null;
    email: string | null;
    avatarUrl: string | null;
    role: string;
  };
}

export interface StaffLoginResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: string;
  staff: {
    id: string;
    firstName: string;
    lastName: string | null;
    email: string | null;
    phone: string | null;
    role: string;
    storeId: string;
    avatarUrl: string | null;
    requiresPinChange: boolean;
    requiresPasswordChange: boolean;
  };
}

export async function refreshSession<T extends "customer" | "staff">(
  refreshToken: string,
  type: T,
): Promise<T extends "customer" ? CustomerLoginResponse : StaffLoginResponse> {
  const endpoint = type === "customer" ? "storefront/auth/refresh" : "auth/refresh";
  const res = await apiRequest<CustomerLoginResponse | StaffLoginResponse>("POST", endpoint, { refreshToken }, { skipAuth: true });
  if (type === "customer") {
    const r = res as CustomerLoginResponse;
    setTokens(r.accessToken, r.refreshToken, "customer");
    return r as T extends "customer" ? CustomerLoginResponse : StaffLoginResponse;
  }
  const r = res as StaffLoginResponse;
  setTokens(r.accessToken, r.refreshToken, "staff");
  return r as T extends "customer" ? CustomerLoginResponse : StaffLoginResponse;
}
