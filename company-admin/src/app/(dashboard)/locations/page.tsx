"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { locationsApi } from "@/lib/api/locations";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { MapPin, PlusCircle, Edit2, Trash2, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { Location, LocationCreate } from "@/types";

export default function LocationsPage() {
  const queryClient = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingLocation, setEditingLocation] = useState<Location | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Location | null>(null);

  const [formData, setFormData] = useState<LocationCreate>({
    name: "",
    address: "",
    city: "",
    state: "",
    postal_code: "",
    country: "India",
    phone: "",
    email: "",
    map_url: "",
    is_primary: false,
    is_active: true,
  });

  const { data: locations, isLoading } = useQuery({
    queryKey: ["company-locations"],
    queryFn: () => locationsApi.list(),
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (editingLocation) {
        return locationsApi.update(editingLocation.id, formData);
      } else {
        return locationsApi.create(formData);
      }
    },
    onSuccess: () => {
      toast.success(editingLocation ? "Location updated" : "New outlet added");
      setModalOpen(false);
      setEditingLocation(null);
      queryClient.invalidateQueries({ queryKey: ["company-locations"] });
    },
    onError: (err: unknown) => {
      const msg = err instanceof Error ? err.message : "Failed to save location";
      toast.error(msg);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => locationsApi.delete(id),
    onSuccess: () => {
      toast.success("Location deleted");
      setDeleteTarget(null);
      queryClient.invalidateQueries({ queryKey: ["company-locations"] });
    },
  });

  const openCreateModal = () => {
    setEditingLocation(null);
    setFormData({
      name: "",
      address: "",
      city: "",
      state: "",
      postal_code: "",
      country: "India",
      phone: "",
      email: "",
      map_url: "",
      is_primary: (locations?.length || 0) === 0,
      is_active: true,
    });
    setModalOpen(true);
  };

  const openEditModal = (loc: Location) => {
    setEditingLocation(loc);
    setFormData({
      name: loc.name,
      address: loc.address,
      city: loc.city || "",
      state: loc.state || "",
      postal_code: loc.postal_code || "",
      country: loc.country || "India",
      phone: loc.phone || "",
      email: loc.email || "",
      map_url: loc.map_url || "",
      is_primary: loc.is_primary,
      is_active: loc.is_active,
    });
    setModalOpen(true);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-black tracking-tight text-slate-900">
              Business Outlets & Locations
            </h2>
            <p className="text-sm text-slate-500">
              Manage multi-branch salon locations, addresses, contact info, and Google Maps links.
            </p>
          </div>

          <Button size="md" onClick={openCreateModal} className="gap-2 shadow-sm">
            <PlusCircle className="w-4 h-4" />
            Add Location
          </Button>
        </div>

        <Card className="border-slate-200 shadow-xs overflow-hidden">
          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-6 space-y-4">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
              </div>
            ) : !locations || locations.length === 0 ? (
              <EmptyState
                icon={<MapPin className="w-8 h-8" />}
                title="No Physical Locations Listed"
                description="Add your first outlet location to help clients find your salons."
                action={<Button onClick={openCreateModal}>Add First Location</Button>}
              />
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Outlet Name</TableHead>
                    <TableHead>Address</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Primary</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {locations.map((loc) => (
                    <TableRow key={loc.id}>
                      <TableCell>
                        <div className="flex items-center gap-2.5">
                          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-50 text-violet-700 font-bold text-xs">
                            <MapPin className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="font-bold text-xs text-slate-900">{loc.name}</p>
                            {loc.map_url && (
                              <a
                                href={loc.map_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-[11px] text-emerald-700 hover:underline"
                              >
                                View on Map <ExternalLink className="w-2.5 h-2.5" />
                              </a>
                            )}
                          </div>
                        </div>
                      </TableCell>

                      <TableCell className="text-xs text-slate-600">
                        <p>{loc.address}</p>
                        <p className="text-slate-400">
                          {loc.city ? `${loc.city}, ` : ""}
                          {loc.state} {loc.postal_code}
                        </p>
                      </TableCell>

                      <TableCell className="text-xs text-slate-600">
                        {loc.phone && <p>{loc.phone}</p>}
                        {loc.email && <p className="text-slate-400">{loc.email}</p>}
                      </TableCell>

                      <TableCell>
                        {loc.is_primary ? (
                          <Badge variant="default">Primary HQ</Badge>
                        ) : (
                          <span className="text-slate-400 text-xs">Branch</span>
                        )}
                      </TableCell>

                      <TableCell>
                        <Badge variant={loc.is_active ? "success" : "secondary"}>
                          {loc.is_active ? "Active" : "Closed"}
                        </Badge>
                      </TableCell>

                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openEditModal(loc)}
                            title="Edit"
                            className="h-8 w-8 text-slate-600 hover:text-emerald-700"
                          >
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setDeleteTarget(loc)}
                            title="Delete"
                            className="h-8 w-8 text-slate-400 hover:text-red-600"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Modal */}
        <Dialog
          open={modalOpen}
          onOpenChange={setModalOpen}
          title={editingLocation ? "Edit Location" : "Add New Location"}
          description="Physical outlet information and customer navigation"
          footer={
            <>
              <Button variant="outline" size="sm" onClick={() => setModalOpen(false)}>
                Cancel
              </Button>
              <Button
                size="sm"
                isLoading={saveMutation.isPending}
                onClick={() => saveMutation.mutate()}
              >
                {editingLocation ? "Save Location" : "Add Location"}
              </Button>
            </>
          }
        >
          <div className="space-y-4 py-2">
            <Input
              label="Outlet Name"
              placeholder="e.g. Bandra Flagship Salon"
              required
              value={formData.name}
              onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
            />

            <Input
              label="Street Address"
              placeholder="e.g. 104 Linking Road, Bandra West"
              required
              value={formData.address}
              onChange={(e) => setFormData((prev) => ({ ...prev, address: e.target.value }))}
            />

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="City"
                placeholder="Mumbai"
                value={formData.city || ""}
                onChange={(e) => setFormData((prev) => ({ ...prev, city: e.target.value }))}
              />
              <Input
                label="State"
                placeholder="Maharashtra"
                value={formData.state || ""}
                onChange={(e) => setFormData((prev) => ({ ...prev, state: e.target.value }))}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Phone Number"
                placeholder="+91 98765 43210"
                value={formData.phone || ""}
                onChange={(e) => setFormData((prev) => ({ ...prev, phone: e.target.value }))}
              />
              <Input
                label="Google Maps URL"
                placeholder="https://maps.google.com/..."
                value={formData.map_url || ""}
                onChange={(e) => setFormData((prev) => ({ ...prev, map_url: e.target.value }))}
              />
            </div>

            <div className="flex items-center gap-6 pt-2">
              <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.is_primary}
                  onChange={(e) => setFormData((prev) => ({ ...prev, is_primary: e.target.checked }))}
                  className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                />
                Primary / Main Headquarters
              </label>

              <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.is_active}
                  onChange={(e) => setFormData((prev) => ({ ...prev, is_active: e.target.checked }))}
                  className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                />
                Active (Open)
              </label>
            </div>
          </div>
        </Dialog>

        {/* Delete Modal */}
        <Dialog
          open={!!deleteTarget}
          onOpenChange={(open) => !open && setDeleteTarget(null)}
          title="Delete Location"
          description={`Delete "${deleteTarget?.name}"?`}
          footer={
            <>
              <Button variant="outline" size="sm" onClick={() => setDeleteTarget(null)}>
                Cancel
              </Button>
              <Button
                variant="destructive"
                size="sm"
                isLoading={deleteMutation.isPending}
                onClick={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)}
              >
                Delete
              </Button>
            </>
          }
        >
          <p className="text-xs text-slate-600 py-2">
            This location will be removed from your website contact section.
          </p>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}

