"use client";

import React, { useState } from "react";
import { useAuth } from "@/providers/auth-provider";
import { authApi } from "@/lib/api/auth";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { KeyRound, Globe, ShieldAlert, LogOut, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

export default function SettingsPage() {
  const { user, profile, logout } = useAuth();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [changing, setChanging] = useState(false);

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }
    if (newPassword.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }

    setChanging(true);
    try {
      await authApi.changePassword(currentPassword, newPassword);
      toast.success("Password changed successfully! Please log in again.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      logout();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to change password";
      toast.error(msg);
    } finally {
      setChanging(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl space-y-8">
        <div>
          <h2 className="text-2xl font-black tracking-tight text-slate-900">
            Account & Security Settings
          </h2>
          <p className="text-sm text-slate-500">
            Manage your login credentials, session security, and custom domain connection.
          </p>
        </div>

        {/* Change Password */}
        <Card className="border-slate-200">
          <CardHeader>
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <KeyRound className="w-4 h-4 text-emerald-600" />
              Change Administrator Password
            </CardTitle>
            <CardDescription>
              Update your account password. All other active login sessions will be invalidated.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handlePasswordChange} className="space-y-4 max-w-md">
              <Input
                label="Current Password"
                type="password"
                required
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
              />
              <Input
                label="New Password"
                type="password"
                required
                helperText="Minimum 8 characters"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
              <Input
                label="Confirm New Password"
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />

              <Button type="submit" isLoading={changing} className="gap-2">
                <CheckCircle2 className="w-4 h-4" />
                Update Password
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Custom Domain Connection */}
        <Card className="border-slate-200">
          <CardHeader>
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <Globe className="w-4 h-4 text-blue-600" />
              Custom Domain Connection
            </CardTitle>
            <CardDescription>
              Connect your branded domain (e.g. www.yourbeautycare.com)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-xs text-slate-600 leading-relaxed">
              To point your custom domain name to your business storefront, ensure your subscription
              tier supports custom domains, then add your DNS CNAME / TXT challenge records as
              guided by platform support.
            </p>
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs font-mono text-slate-700">
              Current primary route: <strong>/websites/{profile?.slug || "your-slug"}</strong>
            </div>
          </CardContent>
        </Card>

        {/* Logout Session */}
        <Card className="border-slate-200">
          <CardHeader>
            <CardTitle className="text-base font-bold text-red-600">Active Session</CardTitle>
            <CardDescription>Sign out of this company management portal</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="destructive" size="sm" onClick={logout} className="gap-2">
              <LogOut className="w-4 h-4" />
              Sign Out of Portal
            </Button>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

