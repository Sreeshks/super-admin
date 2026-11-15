"use client";

import React from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { History, Activity, CheckCircle, ShieldCheck } from "lucide-react";

const SAMPLE_EVENTS = [
  {
    id: "1",
    action: "WEBSITE_SECTION_UPDATE",
    description: "Updated visibility and order for website sections",
    timestamp: "Just now",
  },
  {
    id: "2",
    action: "SERVICE_CREATED",
    description: "Added new treatment service offering",
    timestamp: "2 hours ago",
  },
  {
    id: "3",
    action: "OFFER_PUBLISHED",
    description: "Published promotional discount package",
    timestamp: "Yesterday",
  },
  {
    id: "4",
    action: "ADMIN_LOGIN",
    description: "Successful company administrator session authenticated",
    timestamp: "2 days ago",
  },
];

export default function ActivityPage() {
  return (
    <DashboardLayout>
      <div className="max-w-4xl space-y-6">
        <div>
          <h2 className="text-2xl font-black tracking-tight text-slate-900">
            Activity & Security Audit Log
          </h2>
          <p className="text-sm text-slate-500">
            Timeline of modifications and administrative actions performed within your workspace.
          </p>
        </div>

        <Card className="border-slate-200">
          <CardHeader>
            <CardTitle className="text-base font-bold">Recent Changes</CardTitle>
            <CardDescription>Tenant-scoped event log</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-slate-100">
              {SAMPLE_EVENTS.map((ev) => (
                <div key={ev.id} className="flex items-start gap-3.5 p-4 text-xs">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-100 text-slate-600 shrink-0 mt-0.5">
                    <Activity className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-slate-800">{ev.action}</span>
                      <span className="text-[11px] text-slate-400">{ev.timestamp}</span>
                    </div>
                    <p className="text-slate-600 mt-0.5">{ev.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

