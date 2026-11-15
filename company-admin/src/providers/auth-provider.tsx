"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";
import { authApi, LoginPayload } from "@/lib/api/auth";
import { profileApi } from "@/lib/api/profile";
import { getStoredTokens, setStoredTokens } from "@/lib/api/client";
import { CompanyProfile, User } from "@/types";
import { toast } from "sonner";

interface AuthContextType {
  user: User | null;
  profile: CompanyProfile | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (payload: LoginPayload) => Promise<void>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<CompanyProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const router = useRouter();
  const pathname = usePathname();

  const isPublicRoute =
    pathname?.startsWith("/login") ||
    pathname?.startsWith("/forgot-password") ||
    pathname?.startsWith("/reset-password");

  const checkUserIsCompanyAdmin = (u: User): boolean => {
    return u.roles.some((r) =>
      ["COMPANY_ADMIN", "company_admin", "CONTENT_MANAGER", "content_manager", "SUPER_ADMIN", "super_admin"].includes(
        r.name
      )
    );
  };

  const refreshProfile = useCallback(async () => {
    try {
      const tokens = getStoredTokens();
      if (!tokens?.access_token) {
        setUser(null);
        setProfile(null);
        setIsLoading(false);
        return;
      }

      const userProfile = await authApi.getMe();
      if (!checkUserIsCompanyAdmin(userProfile)) {
        toast.error("Access Denied: Company Admin or Content Manager role required.");
        setStoredTokens(null);
        setUser(null);
        setProfile(null);
        router.push("/login");
        return;
      }

      setUser(userProfile);

      // Load company profile if tenant_id exists
      if (userProfile.tenant_id) {
        try {
          const compProfile = await profileApi.getProfile();
          setProfile(compProfile);
        } catch {
          // Non-blocking if profile isn't populated yet
        }
      }
    } catch {
      setUser(null);
      setProfile(null);
      setStoredTokens(null);
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  useEffect(() => {
    refreshProfile();
  }, [refreshProfile]);

  useEffect(() => {
    if (!isLoading) {
      if (!user && !isPublicRoute) {
        router.push("/login");
      } else if (user && isPublicRoute) {
        router.push("/dashboard");
      }
    }
  }, [user, isLoading, isPublicRoute, router]);

  const login = async (payload: LoginPayload) => {
    setIsLoading(true);
    try {
      const tokens = await authApi.login(payload);
      setStoredTokens(tokens);

      const userProfile = await authApi.getMe();
      if (!checkUserIsCompanyAdmin(userProfile)) {
        setStoredTokens(null);
        setUser(null);
        setProfile(null);
        throw new Error("Access Denied: You do not have permissions for this company portal.");
      }

      setUser(userProfile);

      if (userProfile.tenant_id) {
        try {
          const compProfile = await profileApi.getProfile();
          setProfile(compProfile);
        } catch {
          // ignore
        }
      }

      toast.success("Welcome back to your company dashboard!");
      router.push("/dashboard");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Invalid email or password.";
      toast.error(msg);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      const tokens = getStoredTokens();
      if (tokens?.refresh_token) {
        await authApi.logout(tokens.refresh_token);
      }
    } catch {
      // Continue cleanup
    } finally {
      setStoredTokens(null);
      setUser(null);
      setProfile(null);
      toast.info("Logged out successfully.");
      router.push("/login");
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        isLoading,
        isAuthenticated: !!user,
        login,
        logout,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

