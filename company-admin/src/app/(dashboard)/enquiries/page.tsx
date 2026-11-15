"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { contactApi, EnquiryListParams } from "@/lib/api/contact";
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
import { Pagination } from "@/components/ui/pagination";
import { Dialog } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import {
  Inbox,
  Search,
  RotateCcw,
  Eye,
  Mail,
  Phone,
  Calendar,
  CheckCircle2,
} from "lucide-react";
import { formatDate } from "@/lib/utils";
import { toast } from "sonner";
import { ContactEnquiry } from "@/types";

export default function EnquiriesPage() {
  const queryClient = useQueryClient();
  const [params, setParams] = useState<EnquiryListParams>({
    page: 1,
    page_size: 10,
    search: "",
    status: "",
  });

  const [selectedEnquiry, setSelectedEnquiry] = useState<ContactEnquiry | null>(null);

  const { data: response, isLoading, refetch } = useQuery({
    queryKey: ["company-enquiries-list", params],
    queryFn: () => contactApi.listEnquiries(params),
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      contactApi.updateEnquiryStatus(id, status),
    onSuccess: (updated) => {
      toast.success(`Enquiry marked as ${updated.status}`);
      setSelectedEnquiry(updated);
      queryClient.invalidateQueries({ queryKey: ["company-enquiries-list"] });
    },
    onError: (err: unknown) => {
      const msg = err instanceof Error ? err.message : "Failed to update status";
      toast.error(msg);
    },
  });

  const enquiries = response?.data || [];
  const pagination = response?.pagination;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-black tracking-tight text-slate-900">
              Customer Enquiries & Leads
            </h2>
            <p className="text-sm text-slate-500">
              Inquiries and appointment requests submitted through your website contact section.
            </p>
          </div>
        </div>

        {/* Filters */}
        <Card className="border-slate-200 shadow-xs">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row items-center gap-3">
              <div className="relative flex-1 w-full">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search by customer name or email..."
                  value={params.search || ""}
                  onChange={(e) =>
                    setParams((prev) => ({ ...prev, search: e.target.value, page: 1 }))
                  }
                  className="h-10 w-full rounded-lg border border-slate-300 bg-white pl-9 pr-3 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>

              <div className="w-full md:w-48">
                <select
                  value={params.status || ""}
                  onChange={(e) =>
                    setParams((prev) => ({
                      ...prev,
                      status: e.target.value || undefined,
                      page: 1,
                    }))
                  }
                  className="h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-700 focus:outline-none"
                >
                  <option value="">All Statuses</option>
                  <option value="new">New</option>
                  <option value="in_progress">In Progress</option>
                  <option value="resolved">Resolved</option>
                  <option value="closed">Closed</option>
                </select>
              </div>

              <Button
                variant="outline"
                size="md"
                onClick={() => refetch()}
                className="w-full md:w-auto"
              >
                <RotateCcw className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Table */}
        <Card className="border-slate-200 shadow-xs overflow-hidden">
          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-6 space-y-4">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
              </div>
            ) : enquiries.length === 0 ? (
              <EmptyState
                icon={<Inbox className="w-8 h-8" />}
                title="No Inquiries Received"
                description="When visitors submit questions or requests on your storefront, they will be listed here."
              />
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Customer</TableHead>
                    <TableHead>Contact Info</TableHead>
                    <TableHead>Subject / Note</TableHead>
                    <TableHead>Received</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {enquiries.map((enq) => (
                    <TableRow key={enq.id}>
                      <TableCell className="font-bold text-xs text-slate-900">
                        {enq.name}
                      </TableCell>

                      <TableCell className="text-xs text-slate-600">
                        <p>{enq.email}</p>
                        {enq.phone && <p className="text-slate-400">{enq.phone}</p>}
                      </TableCell>

                      <TableCell className="text-xs text-slate-700 max-w-sm truncate">
                        {enq.subject ? (
                          <span className="font-semibold text-slate-900">{enq.subject}: </span>
                        ) : null}
                        {enq.message}
                      </TableCell>

                      <TableCell className="text-xs text-slate-500 whitespace-nowrap">
                        {formatDate(enq.created_at)}
                      </TableCell>

                      <TableCell>
                        <Badge
                          variant={
                            enq.status === "new"
                              ? "default"
                              : enq.status === "resolved"
                              ? "success"
                              : "secondary"
                          }
                        >
                          {enq.status.replace("_", " ")}
                        </Badge>
                      </TableCell>

                      <TableCell className="text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedEnquiry(enq)}
                          className="text-xs gap-1"
                        >
                          <Eye className="w-3.5 h-3.5 text-slate-500" />
                          View Details
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}

            {pagination && (
              <div className="border-t border-slate-100 px-4">
                <Pagination
                  meta={pagination}
                  onPageChange={(page) => setParams((prev) => ({ ...prev, page }))}
                />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Enquiry Detail Modal */}
        <Dialog
          open={!!selectedEnquiry}
          onOpenChange={(open) => !open && setSelectedEnquiry(null)}
          title="Customer Inquiry Details"
          description={`From ${selectedEnquiry?.name} on ${selectedEnquiry ? formatDate(selectedEnquiry.created_at) : ""}`}
          footer={
            <Button variant="outline" size="sm" onClick={() => setSelectedEnquiry(null)}>
              Close
            </Button>
          }
        >
          {selectedEnquiry && (
            <div className="space-y-4 py-2 text-xs">
              <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-lg border border-slate-100">
                <div>
                  <span className="font-bold text-slate-400 uppercase">Customer Email</span>
                  <a
                    href={`mailto:${selectedEnquiry.email}`}
                    className="block text-emerald-700 font-semibold hover:underline mt-0.5"
                  >
                    {selectedEnquiry.email}
                  </a>
                </div>
                <div>
                  <span className="font-bold text-slate-400 uppercase">Phone Number</span>
                  <p className="font-semibold text-slate-800 mt-0.5">
                    {selectedEnquiry.phone || "Not provided"}
                  </p>
                </div>
              </div>

              {selectedEnquiry.subject && (
                <div>
                  <span className="font-bold text-slate-400 uppercase">Subject</span>
                  <p className="font-bold text-sm text-slate-900 mt-0.5">
                    {selectedEnquiry.subject}
                  </p>
                </div>
              )}

              <div>
                <span className="font-bold text-slate-400 uppercase">Message Content</span>
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 mt-1 text-slate-700 leading-relaxed whitespace-pre-wrap">
                  {selectedEnquiry.message}
                </div>
              </div>

              {/* Status Update Dropdown */}
              <div className="pt-2 border-t flex items-center justify-between">
                <span className="font-bold text-slate-700">Update Lead Status</span>
                <select
                  value={selectedEnquiry.status}
                  onChange={(e) =>
                    statusMutation.mutate({
                      id: selectedEnquiry.id,
                      status: e.target.value,
                    })
                  }
                  className="h-8 rounded-lg border border-slate-300 bg-white px-3 text-xs font-semibold text-slate-700 focus:outline-none"
                >
                  <option value="new">New Lead</option>
                  <option value="in_progress">In Progress</option>
                  <option value="resolved">Resolved</option>
                  <option value="closed">Closed</option>
                </select>
              </div>
            </div>
          )}
        </Dialog>
      </div>
    </DashboardLayout>
  );
}

