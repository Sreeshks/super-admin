"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";
import { authApi, LoginPayload } from "@/lib/api/auth";
import { getStoredTokens, setStoredTokens } from "@/lib/api/client";
import { User } from "@/types";
import { toast } from "sonner";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (payload: LoginPayload) => Promise<void>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const router = useRouter();
  const pathname = usePathname();

  const isPublicRoute =
    pathname?.startsWith("/login") ||
    pathname?.startsWith("/forgot-password") ||
    pathname?.startsWith("/reset-password");

  const checkUserIsSuperAdmin = (u: User): boolean => {
    return u.roles.some((r) => r.name === "SUPER_ADMIN" || r.name === "super_admin");
  };

  const refreshProfile = useCallback(async () => {
    try {
      const tokens = getStoredTokens();
      if (!tokens?.access_token) {
        setUser(null);
        setIsLoading(false);
        return;
      }

      const profile = await authApi.getMe();
      if (!checkUserIsSuperAdmin(profile)) {
        toast.error("Access Denied: Super Admin role required.");
        setStoredTokens(null);
        setUser(null);
        router.push("/login");
        return;
      }
      setUser(profile);
    } catch {
      setUser(null);
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
      const profile = await authApi.getMe();

      if (!checkUserIsSuperAdmin(profile)) {
        setStoredTokens(null);
        setUser(null);
        throw new Error("Access Denied: You do not have Super Admin permissions.");
      }

      setUser(profile);
      toast.success("Welcome back, Administrator!");
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
      // Continue cleanup on fail
    } finally {
      setStoredTokens(null);
      setUser(null);
      toast.info("Logged out successfully.");
      router.push("/login");
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
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

