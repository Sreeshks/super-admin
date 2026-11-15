"use client";

import React, { useState } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { LifeBuoy, Mail, MessageSquare, CheckCircle, Clock } from "lucide-react";
import { toast } from "sonner";

interface Ticket {
  id: string;
  tenantName: string;
  subject: string;
  category: string;
  priority: "low" | "medium" | "high" | "urgent";
  status: "open" | "in_progress" | "resolved";
  date: string;
}

const INITIAL_TICKETS: Ticket[] = [
  {
    id: "TCK-8091",
    tenantName: "Nofa Luxury Spa & Salon",
    subject: "Custom domain DNS TXT record propagation inquiry",
    category: "Domain Configuration",
    priority: "medium",
    status: "open",
    date: "10 mins ago",
  },
  {
    id: "TCK-8088",
    tenantName: "Aura Wellness Studio",
    subject: "Requesting plan upgrade to Enterprise tier",
    category: "Subscription Billing",
    priority: "high",
    status: "in_progress",
    date: "2 hours ago",
  },
  {
    id: "TCK-8072",
    tenantName: "Glow & Glam Beauty Parlour",
    subject: "Media banner upload format assistance",
    category: "Media Storage",
    priority: "low",
    status: "resolved",
    date: "Yesterday",
  },
];

export default function SupportPage() {
  const [tickets, setTickets] = useState<Ticket[]>(INITIAL_TICKETS);

  const resolveTicket = (id: string) => {
    setTickets((prev) =>
      prev.map((t) => (t.id === id ? { ...t, status: "resolved" } : t))
    );
    toast.success(`Ticket ${id} marked as resolved`);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-black tracking-tight text-slate-900">
            Tenant Support & Helpdesk
          </h2>
          <p className="text-sm text-slate-500">
            Assist company administrators with domain setups, quotas, and technical inquiries.
          </p>
        </div>

        <Card className="border-slate-200 shadow-xs overflow-hidden">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Ticket ID</TableHead>
                  <TableHead>Company Tenant</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Received</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tickets.map((t) => (
                  <TableRow key={t.id}>
                    <TableCell className="font-mono text-xs font-bold text-slate-900">
                      {t.id}
                    </TableCell>
                    <TableCell className="text-xs font-semibold text-slate-800">
                      {t.tenantName}
                    </TableCell>
                    <TableCell className="text-xs text-slate-700 max-w-sm">
                      {t.subject}
                    </TableCell>
                    <TableCell className="text-xs text-slate-500">
                      {t.category}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          t.priority === "urgent"
                            ? "destructive"
                            : t.priority === "high"
                            ? "warning"
                            : "secondary"
                        }
                      >
                        {t.priority}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          t.status === "resolved"
                            ? "success"
                            : t.status === "in_progress"
                            ? "default"
                            : "outline"
                        }
                      >
                        {t.status.replace("_", " ")}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs text-slate-400 whitespace-nowrap">
                      {t.date}
                    </TableCell>
                    <TableCell className="text-right">
                      {t.status !== "resolved" ? (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => resolveTicket(t.id)}
                          className="text-xs text-emerald-700 hover:bg-emerald-50"
                        >
                          Resolve
                        </Button>
                      ) : (
                        <span className="text-xs text-slate-400 font-medium">Closed</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

