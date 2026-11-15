"use client";

import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { settingsApi } from "@/lib/api/settings";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Settings, Save, ShieldCheck, Database, KeyRound } from "lucide-react";
import { toast } from "sonner";

export default function SettingsPage() {
  const queryClient = useQueryClient();

  const [platformName, setPlatformName] = useState("Nofa Multi-Tenant Website Platform");
  const [supportEmail, setSupportEmail] = useState("support@nofasalon.com");
  const [maxLoginAttempts, setMaxLoginAttempts] = useState(5);
  const [lockoutMinutes, setLockoutMinutes] = useState(15);
  const [tokenExpiryMinutes, setTokenExpiryMinutes] = useState(15);

  const { data: settingsList, isLoading } = useQuery({
    queryKey: ["platform-settings"],
    queryFn: () => settingsApi.list(),
  });

  useEffect(() => {
    if (settingsList) {
      settingsList.forEach((s) => {
        if (s.key === "general_config") {
          const val = s.value as { platform_name?: string; support_email?: string };
          if (val.platform_name) setPlatformName(val.platform_name);
          if (val.support_email) setSupportEmail(val.support_email);
        } else if (s.key === "security_policy") {
          const val = s.value as { max_login_attempts?: number; lockout_minutes?: number };
          if (val.max_login_attempts) setMaxLoginAttempts(val.max_login_attempts);
          if (val.lockout_minutes) setLockoutMinutes(val.lockout_minutes);
        }
      });
    }
  }, [settingsList]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      await settingsApi.save(
        "general_config",
        { platform_name: platformName, support_email: supportEmail },
        "Global platform identity"
      );
      await settingsApi.save(
        "security_policy",
        { max_login_attempts: maxLoginAttempts, lockout_minutes: lockoutMinutes },
        "Rate limiting and account lockout parameters"
      );
    },
    onSuccess: () => {
      toast.success("Platform settings saved successfully");
      queryClient.invalidateQueries({ queryKey: ["platform-settings"] });
    },
    onError: (err: unknown) => {
      const msg = err instanceof Error ? err.message : "Failed to update settings";
      toast.error(msg);
    },
  });

  return (
    <DashboardLayout>
      <div className="max-w-4xl space-y-6">
        <div>
          <h2 className="text-2xl font-black tracking-tight text-slate-900">
            Platform Settings
          </h2>
          <p className="text-sm text-slate-500">
            Configure system-wide identity, security policies, and multi-tenancy safeguards.
          </p>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-60 w-full" />
            <Skeleton className="h-60 w-full" />
          </div>
        ) : (
          <div className="space-y-6">
            {/* General Identity */}
            <Card className="border-slate-200">
              <CardHeader>
                <CardTitle className="text-base">Platform Identity</CardTitle>
                <CardDescription>Branding displayed across email notifications and portals</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Platform Title"
                    value={platformName}
                    onChange={(e) => setPlatformName(e.target.value)}
                  />
                  <Input
                    label="Global Support Email"
                    type="email"
                    value={supportEmail}
                    onChange={(e) => setSupportEmail(e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Security Policies */}
            <Card className="border-slate-200">
              <CardHeader>
                <CardTitle className="text-base">Authentication & Rate Limiting</CardTitle>
                <CardDescription>
                  Defense against brute-force attacks and token compromise
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Max Failed Attempts Before Lockout"
                    type="number"
                    value={maxLoginAttempts}
                    onChange={(e) => setMaxLoginAttempts(parseInt(e.target.value) || 5)}
                  />
                  <Input
                    label="Lockout Duration (Minutes)"
                    type="number"
                    value={lockoutMinutes}
                    onChange={(e) => setLockoutMinutes(parseInt(e.target.value) || 15)}
                  />
                  <Input
                    label="Access Token Expiry (Minutes)"
                    type="number"
                    value={tokenExpiryMinutes}
                    onChange={(e) => setTokenExpiryMinutes(parseInt(e.target.value) || 15)}
                  />
                </div>

                <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2 mt-4">
                  <ShieldCheck className="w-4 h-4 shrink-0 text-emerald-600" />
                  Argon2id password hashing is enforced with cryptographic salt per user.
                </div>
              </CardContent>
              <CardFooter className="flex justify-end p-4 border-t">
                <Button
                  isLoading={saveMutation.isPending}
                  onClick={() => saveMutation.mutate()}
                  className="gap-2"
                >
                  <Save className="w-4 h-4" />
                  Save Platform Settings
                </Button>
              </CardFooter>
            </Card>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

