"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

import { isAdminRole } from "@/config/site";
import {
  api,
  apiRequest,
  clearTokens,
  getTokens,
  getUserEmail,
  setTokens,
  setUserEmail,
  refreshSession,
  type CustomerLoginResponse,
  type StaffLoginResponse,
} from "@/lib/api";

export interface Profile {
  id: string;
  full_name: string | null;
  phone: string | null;
  avatar_url: string | null;
  has_pin: boolean;
  /** User-editable notification preferences (order updates, promotions…). */
  preferences: Record<string, boolean> | null;
  /** customer / owner / manager / supervisor / cashier / pharmacist / stock_officer */
  role: string | null;
}

interface AuthUser {
  id: string;
  email: string;
  type: "customer" | "staff";
}

interface AuthResult {
  error: string | null;
}

interface AuthContextValue {
  user: AuthUser | null;
  profile: Profile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<AuthResult>;
  signInWithPin: (email: string, pin: string) => Promise<AuthResult>;
  signUp: (name: string, email: string, password: string) => Promise<AuthResult>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<AuthResult>;
  updateProfile: (data: Partial<Profile>) => Promise<AuthResult>;
  setPin: (pin: string) => Promise<AuthResult>;
  updatePreferences: (prefs: Record<string, boolean>) => Promise<AuthResult>;
  changePassword: (
    currentPassword: string,
    newPassword: string,
  ) => Promise<AuthResult>;
  deleteAccount: () => Promise<AuthResult>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const PREFS_KEY = "jx_preferences";

function loadPreferences(userId: string): Record<string, boolean> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(PREFS_KEY);
    const map = raw ? (JSON.parse(raw) as Record<string, Record<string, boolean>>) : {};
    return map[userId] ?? {};
  } catch {
    return {};
  }
}

function savePreferences(userId: string, prefs: Record<string, boolean>) {
  if (typeof window === "undefined") return;
  try {
    const raw = localStorage.getItem(PREFS_KEY);
    const map = raw ? (JSON.parse(raw) as Record<string, Record<string, boolean>>) : {};
    map[userId] = prefs;
    localStorage.setItem(PREFS_KEY, JSON.stringify(map));
  } catch {
    /* ignore */
  }
}

function buildFullName(firstName: string, lastName: string | null) {
  return `${firstName} ${lastName ?? ""}`.trim() || null;
}

function splitName(fullName: string) {
  const parts = fullName.trim().split(/\s+/);
  const firstName = parts[0] ?? "";
  const lastName = parts.slice(1).join(" ") || firstName;
  return { firstName, lastName };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const applyCustomer = useCallback((res: CustomerLoginResponse) => {
    const { customer, accessToken, refreshToken } = res;
    setTokens(accessToken, refreshToken, "customer");
    setUserEmail(customer.email ?? "");
    setUser({
      id: customer.id,
      email: customer.email ?? "",
      type: "customer",
    });
    setProfile({
      id: customer.id,
      full_name: buildFullName(customer.firstName, customer.lastName),
      phone: customer.phone,
      avatar_url: customer.avatarUrl,
      has_pin: false,
      preferences: loadPreferences(customer.id),
      role: customer.role ?? "customer",
    });
  }, []);

  const applyStaff = useCallback((res: StaffLoginResponse, email: string) => {
    const { staff, accessToken, refreshToken } = res;
    setTokens(accessToken, refreshToken, "staff");
    setUserEmail(email);
    setUser({
      id: staff.id,
      email,
      type: "staff",
    });
    setProfile({
      id: staff.id,
      full_name: buildFullName(staff.firstName, staff.lastName),
      phone: staff.phone,
      avatar_url: staff.avatarUrl,
      has_pin: !staff.requiresPinChange,
      preferences: loadPreferences(staff.id),
      role: staff.role,
    });
  }, []);

  const signIn = useCallback(
    async (email: string, password: string) => {
      try {
        const res = await apiRequest<CustomerLoginResponse>(
          "POST",
          "storefront/auth/login",
          { email, password },
          { skipAuth: true },
        );
        applyCustomer(res);
        return { error: null };
      } catch (e) {
        const err = e as { status?: number; message?: string };
        if (err?.status === 401) {
          try {
            const res = await apiRequest<StaffLoginResponse>(
              "POST",
              "auth/login",
              { email, password },
              { skipAuth: true },
            );
            applyStaff(res, email);
            return { error: null };
          } catch (e2) {
            return { error: (e2 as Error).message ?? "Invalid email or password." };
          }
        }
        return { error: err?.message ?? "Could not sign in." };
      }
    },
    [applyCustomer, applyStaff],
  );

  const signInWithPin = useCallback(async (_email: string, _pin: string) => {
    return { error: "PIN login is not available for customer accounts." };
  }, []);

  const signUp = useCallback(
    async (name: string, email: string, password: string) => {
      const { firstName, lastName } = splitName(name);
      try {
        const res = await apiRequest<CustomerLoginResponse>(
          "POST",
          "storefront/auth/register",
          { firstName, lastName, email, password },
          { skipAuth: true },
        );
        applyCustomer(res);
        return { error: null };
      } catch (e) {
        return { error: (e as Error).message ?? "Could not create account." };
      }
    },
    [applyCustomer],
  );

  const signOut = useCallback(async () => {
    const stored = getTokens();
    if (stored) {
      const endpoint = stored.type === "customer" ? "storefront/auth/logout" : "auth/logout";
      try {
        await apiRequest("POST", endpoint, { refreshToken: stored.refreshToken }, { skipAuth: true });
      } catch {
        /* ignore network/logout errors */
      }
    }
    clearTokens();
    setUser(null);
    setProfile(null);
  }, []);

  const resetPassword = useCallback(async (_email: string) => {
    return { error: "Password reset is not available for customer accounts yet." };
  }, []);

  const updateProfile = useCallback(
    async (data: Partial<Profile>) => {
      if (!user || !profile) return { error: "Not signed in." };
      const { firstName, lastName } = splitName(data.full_name ?? profile.full_name ?? "");
      const payload = {
        firstName,
        lastName,
        phone: data.phone,
        avatarUrl: data.avatar_url,
      };

      try {
        if (user.type === "customer") {
          const res = await api.put<CustomerLoginResponse["customer"]>("storefront/auth/me", payload);
          setProfile({
            ...profile,
            full_name: buildFullName(res.firstName, res.lastName),
            phone: res.phone,
            avatar_url: res.avatarUrl,
          });
        } else {
          const res = await api.put<StaffLoginResponse["staff"]>(`staff/${profile.id}`, payload);
          setProfile({
            ...profile,
            full_name: buildFullName(res.firstName, res.lastName),
            phone: res.phone ?? profile.phone,
            avatar_url: res.avatarUrl,
          });
        }
        return { error: null };
      } catch (e) {
        return { error: (e as Error).message ?? "Could not update profile." };
      }
    },
    [user, profile],
  );

  const setPin = useCallback(async (_pin: string) => {
    return { error: "PIN management is not available for customer accounts." };
  }, []);

  const updatePreferences = useCallback(
    async (prefs: Record<string, boolean>) => {
      if (!user) return { error: "Not signed in." };
      const next = { ...profile?.preferences, ...prefs };
      savePreferences(user.id, next);
      setProfile((p) => (p ? { ...p, preferences: next } : p));
      return { error: null };
    },
    [user, profile],
  );

  const changePassword = useCallback(
    async (currentPassword: string, newPassword: string) => {
      if (!user || user.type !== "customer") return { error: "Not signed in or not supported." };
      try {
        await api.put("storefront/auth/me/password", { currentPassword, newPassword });
        return { error: null };
      } catch (e) {
        return { error: (e as Error).message ?? "Could not change password." };
      }
    },
    [user],
  );

  const deleteAccount = useCallback(async () => {
    return { error: "Account deletion is not available through the API." };
  }, []);

  useEffect(() => {
    const stored = getTokens();
    if (!stored) {
      setLoading(false);
      return;
    }
    const email = getUserEmail() ?? "";

    refreshSession(stored.refreshToken, stored.type)
      .then((res) => {
        if (stored.type === "customer") {
          applyCustomer(res as CustomerLoginResponse);
        } else {
          applyStaff(res as StaffLoginResponse, email);
        }
      })
      .catch(() => {
        clearTokens();
        setUser(null);
        setProfile(null);
      })
      .finally(() => setLoading(false));

    const interval = setInterval(() => {
      const s = getTokens();
      if (!s) return;
      refreshSession(s.refreshToken, s.type)
        .then((res) => {
          if (s.type === "customer") {
            applyCustomer(res as CustomerLoginResponse);
          } else {
            applyStaff(res as StaffLoginResponse, getUserEmail() ?? "");
          }
        })
        .catch(() => {
          clearTokens();
          setUser(null);
          setProfile(null);
        });
    }, 10 * 60 * 1000);

    return () => clearInterval(interval);
  }, [applyCustomer, applyStaff]);

  const value: AuthContextValue = {
    user,
    profile,
    loading,
    signIn,
    signInWithPin,
    signUp,
    signOut,
    resetPassword,
    updateProfile,
    setPin,
    updatePreferences,
    changePassword,
    deleteAccount,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/** Convenience selector for admin-gated UI. */
export function useAdmin() {
  const { user, profile, loading } = useAuth();
  return {
    user,
    role: profile?.role ?? null,
    isAdmin: isAdminRole(profile?.role),
    loading,
  };
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
