"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { domainsApi } from "@/lib/api/domains";
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
import { Dialog } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { Globe2, ShieldCheck, CheckCircle2, AlertTriangle, Copy, ExternalLink } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { toast } from "sonner";
import { CustomDomain } from "@/types";

export default function DomainsPage() {
  const queryClient = useQueryClient();
  const [selectedDomain, setSelectedDomain] = useState<CustomDomain | null>(null);

  const { data: domains, isLoading } = useQuery({
    queryKey: ["domains-list"],
    queryFn: () => domainsApi.list(),
  });

  const verifyMutation = useMutation({
    mutationFn: (id: string) => domainsApi.verify(id),
    onSuccess: (data) => {
      toast.success(
        data.verified
          ? `Domain ${data.domain} verified successfully!`
          : `DNS verification pending. Please verify TXT record.`
      );
      queryClient.invalidateQueries({ queryKey: ["domains-list"] });
    },
    onError: (err: unknown) => {
      const msg = err instanceof Error ? err.message : "Verification check failed";
      toast.error(msg);
    },
  });

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-black tracking-tight text-slate-900">
              Custom Domains Directory
            </h2>
            <p className="text-sm text-slate-500">
              Platform-wide custom domain routing, SSL status, and automated DNS TXT verification.
            </p>
          </div>
        </div>

        {/* Info Banner */}
        <div className="p-4 rounded-xl bg-blue-50 border border-blue-200 text-blue-900 text-xs flex items-center gap-3">
          <Globe2 className="w-5 h-5 text-blue-600 shrink-0" />
          <span>
            Custom domains allow tenants on eligible subscription tiers to brand their public website
            (e.g., <code>salon.example.com</code>) instead of the default platform path.
          </span>
        </div>

        {/* Domains Table */}
        <Card className="border-slate-200 shadow-xs overflow-hidden">
          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-6 space-y-4">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
              </div>
            ) : !domains || domains.length === 0 ? (
              <EmptyState
                icon={<Globe2 className="w-8 h-8" />}
                title="No Custom Domains Configured"
                description="When tenants on eligible plans register custom domains, they will appear here for DNS verification."
              />
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Domain FQDN</TableHead>
                    <TableHead>Tenant ID</TableHead>
                    <TableHead>Routing Type</TableHead>
                    <TableHead>Verification</TableHead>
                    <TableHead>Added On</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {domains.map((dom) => (
                    <TableRow key={dom.id}>
                      <TableCell className="font-bold text-slate-900 font-mono text-xs">
                        {dom.domain}
                      </TableCell>
                      <TableCell className="font-mono text-xs text-slate-500 truncate max-w-xs">
                        {dom.tenant_id}
                      </TableCell>
                      <TableCell>
                        <Badge variant={dom.is_primary ? "default" : "secondary"}>
                          {dom.is_primary ? "Primary" : "Secondary"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            dom.verification_status === "verified"
                              ? "success"
                              : dom.verification_status === "pending"
                              ? "warning"
                              : "destructive"
                          }
                        >
                          {dom.verification_status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs text-slate-500">
                        {formatDate(dom.created_at)}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedDomain(dom)}
                          className="text-xs gap-1"
                        >
                          <ShieldCheck className="w-3.5 h-3.5" />
                          DNS Details
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* DNS Instructions Modal */}
        <Dialog
          open={!!selectedDomain}
          onOpenChange={(open) => !open && setSelectedDomain(null)}
          title="DNS Verification Configuration"
          description={`Domain: ${selectedDomain?.domain}`}
          footer={
            <>
              <Button variant="outline" size="sm" onClick={() => setSelectedDomain(null)}>
                Close
              </Button>
              <Button
                size="sm"
                isLoading={verifyMutation.isPending}
                onClick={() => selectedDomain && verifyMutation.mutate(selectedDomain.id)}
              >
                Run DNS TXT Verification
              </Button>
            </>
          }
        >
          <div className="space-y-4 py-2 text-xs">
            <p className="text-slate-600">
              To verify ownership, add the following TXT record to your domain DNS provider:
            </p>

            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-2">
              <div className="flex justify-between items-center">
                <span className="font-bold text-slate-500 uppercase">Record Type</span>
                <span className="font-mono font-bold text-slate-800">TXT</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-bold text-slate-500 uppercase">Host / Name</span>
                <span className="font-mono text-slate-800">@ or _nofa-challenge</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-bold text-slate-500 uppercase">Value / Content</span>
                <div className="flex items-center gap-1.5 font-mono text-blue-700 bg-white px-2 py-0.5 rounded border">
                  <span>nofa-domain-verify={selectedDomain?.id}</span>
                  <button
                    onClick={() =>
                      copyToClipboard(`nofa-domain-verify=${selectedDomain?.id}`)
                    }
                  >
                    <Copy className="w-3 h-3 text-slate-400 hover:text-slate-600" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}

