"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import Link from "next/link";
import { authApi } from "@/lib/api/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, CheckCircle2, Mail, Sparkles } from "lucide-react";
import { toast } from "sonner";

const forgotSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

type ForgotFormData = z.infer<typeof forgotSchema>;

export default function ForgotPasswordPage() {
  const [isSuccess, setIsSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotFormData>({
    resolver: zodResolver(forgotSchema),
  });

  const onSubmit = async (data: ForgotFormData) => {
    try {
      await authApi.forgotPassword(data);
      setIsSuccess(true);
      toast.success("Password recovery instructions dispatched.");
    } catch {
      // Security best practice: don't reveal existence
      setIsSuccess(true);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100/80 px-4 py-12">
      <div className="w-full max-w-md space-y-6">
        <div className="flex flex-col items-center text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-500/20 mb-3">
            <Sparkles className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900">
            Account Recovery
          </h1>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mt-1">
            Super Admin Access Restoration
          </p>
        </div>

        <Card className="border-slate-200 shadow-xl bg-white">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-lg">Reset Password</CardTitle>
            <CardDescription>
              Provide your administrator email to receive secure recovery steps
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isSuccess ? (
              <div className="space-y-4 py-2 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-slate-900">Check your inbox</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  If an administrator account matches this email, instructions with a secure reset link have been dispatched.
                </p>
                <div className="pt-2">
                  <Link href="/login">
                    <Button variant="outline" className="w-full">
                      Return to Sign In
                    </Button>
                  </Link>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <Input
                  label="Registered Email"
                  type="email"
                  placeholder="superadmin@example.com"
                  error={errors.email?.message}
                  {...register("email")}
                />

                <Button
                  type="submit"
                  className="w-full mt-2"
                  size="lg"
                  isLoading={isSubmitting}
                >
                  Send Recovery Link
                </Button>

                <div className="pt-2 text-center">
                  <Link
                    href="/login"
                    className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-600 hover:text-slate-900"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    Back to login
                  </Link>
                </div>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

