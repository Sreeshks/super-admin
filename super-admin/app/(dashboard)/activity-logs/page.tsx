"use client";

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { dashboardApi } from "@/lib/api/dashboard";
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
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { History, RotateCcw, Activity } from "lucide-react";
import { formatDate } from "@/lib/utils";

export default function ActivityLogsPage() {
  const [limit, setLimit] = useState(50);

  const { data: logs, isLoading, refetch } = useQuery({
    queryKey: ["activity-logs", limit],
    queryFn: () => dashboardApi.getRecentActivity(limit),
  });

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-black tracking-tight text-slate-900">
              Audit & Security Logs
            </h2>
            <p className="text-sm text-slate-500">
              Immutable platform audit trail tracking administrative actions and system events.
            </p>
          </div>
          <Button variant="outline" size="md" onClick={() => refetch()} className="gap-2">
            <RotateCcw className="w-4 h-4" />
            Refresh Logs
          </Button>
        </div>

        <Card className="border-slate-200 shadow-xs overflow-hidden">
          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-6 space-y-4">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            ) : !logs || logs.length === 0 ? (
              <EmptyState
                icon={<History className="w-8 h-8" />}
                title="No Audit Logs Recorded"
                description="Platform administrative actions will appear here automatically."
              />
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Timestamp</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead>Target Entity</TableHead>
                    <TableHead>Actor / User ID</TableHead>
                    <TableHead>Tenant ID</TableHead>
                    <TableHead>Event Details</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {logs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell className="text-xs text-slate-500 whitespace-nowrap">
                        {formatDate(log.created_at)}
                      </TableCell>
                      <TableCell>
                        <Badge variant="default" className="font-mono">
                          {log.action}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs font-semibold text-slate-800">
                        {log.entity_name}
                      </TableCell>
                      <TableCell className="font-mono text-xs text-slate-500 truncate max-w-[120px]">
                        {log.user_id || "System"}
                      </TableCell>
                      <TableCell className="font-mono text-xs text-slate-500 truncate max-w-[120px]">
                        {log.tenant_id || "-"}
                      </TableCell>
                      <TableCell className="text-xs text-slate-600 font-mono max-w-xs truncate">
                        {log.details ? JSON.stringify(log.details) : "-"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

