"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { blogsApi } from "@/lib/api/content";
import { mediaApi } from "@/lib/api/media";
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
import { BookOpen, PlusCircle, Edit2, Trash2, Upload, Calendar } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { toast } from "sonner";
import { Blog, BlogCreate } from "@/types";

export default function BlogsPage() {
  const queryClient = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingBlog, setEditingBlog] = useState<Blog | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Blog | null>(null);

  const [formData, setFormData] = useState<BlogCreate>({
    title: "",
    slug: "",
    short_description: "",
    content: "",
    featured_image: "",
    author: "Editorial Team",
    is_published: true,
    seo_title: "",
    seo_description: "",
  });

  const [uploading, setUploading] = useState(false);

  const { data: blogs, isLoading } = useQuery({
    queryKey: ["company-blogs"],
    queryFn: () => blogsApi.list(),
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (editingBlog) {
        return blogsApi.update(editingBlog.id, formData);
      } else {
        return blogsApi.create(formData);
      }
    },
    onSuccess: () => {
      toast.success(editingBlog ? "Article updated successfully" : "New article published");
      setModalOpen(false);
      setEditingBlog(null);
      queryClient.invalidateQueries({ queryKey: ["company-blogs"] });
    },
    onError: (err: unknown) => {
      const msg = err instanceof Error ? err.message : "Failed to save blog post";
      toast.error(msg);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => blogsApi.delete(id),
    onSuccess: () => {
      toast.success("Blog post deleted");
      setDeleteTarget(null);
      queryClient.invalidateQueries({ queryKey: ["company-blogs"] });
    },
  });

  const openCreateModal = () => {
    setEditingBlog(null);
    setFormData({
      title: "",
      slug: "",
      short_description: "",
      content: "",
      featured_image: "",
      author: "Editorial Team",
      is_published: true,
      seo_title: "",
      seo_description: "",
    });
    setModalOpen(true);
  };

  const openEditModal = (b: Blog) => {
    setEditingBlog(b);
    setFormData({
      title: b.title,
      slug: b.slug,
      short_description: b.short_description || "",
      content: b.content,
      featured_image: b.featured_image || "",
      author: b.author || "Editorial Team",
      is_published: b.is_published,
      seo_title: b.seo_title || "",
      seo_description: b.seo_description || "",
    });
    setModalOpen(true);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const res = await mediaApi.upload(file, "blogs");
      setFormData((prev) => ({ ...prev, featured_image: res.file_url }));
      toast.success("Article cover image uploaded!");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Upload failed";
      toast.error(msg);
    } finally {
      setUploading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-black tracking-tight text-slate-900">
              Blog & Articles CMS
            </h2>
            <p className="text-sm text-slate-500">
              Publish beauty guides, wellness tips, styling trends, and salon news.
            </p>
          </div>

          <Button size="md" onClick={openCreateModal} className="gap-2 shadow-sm">
            <PlusCircle className="w-4 h-4" />
            Write New Article
          </Button>
        </div>

        <Card className="border-slate-200 shadow-xs overflow-hidden">
          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-6 space-y-4">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
              </div>
            ) : !blogs || blogs.length === 0 ? (
              <EmptyState
                icon={<BookOpen className="w-8 h-8" />}
                title="No Articles Published"
                description="Write wellness articles and beauty tips to boost SEO and customer interest."
                action={<Button onClick={openCreateModal}>Write First Article</Button>}
              />
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Article</TableHead>
                    <TableHead>Slug</TableHead>
                    <TableHead>Author</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {blogs.map((b) => (
                    <TableRow key={b.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          {b.featured_image ? (
                            <img
                              src={b.featured_image}
                              alt={b.title}
                              className="h-10 w-14 rounded-lg object-cover border"
                            />
                          ) : (
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-rose-50 text-rose-700 font-bold text-xs">
                              <BookOpen className="w-4 h-4" />
                            </div>
                          )}
                          <div>
                            <p className="font-bold text-xs text-slate-900">{b.title}</p>
                            <p className="text-[11px] text-slate-400 max-w-sm truncate">
                              {b.short_description || "-"}
                            </p>
                          </div>
                        </div>
                      </TableCell>

                      <TableCell className="font-mono text-xs text-slate-500">
                        {b.slug}
                      </TableCell>

                      <TableCell className="text-xs font-semibold text-slate-700">
                        {b.author || "Editorial"}
                      </TableCell>

                      <TableCell>
                        <Badge variant={b.is_published ? "success" : "secondary"}>
                          {b.is_published ? "Published" : "Draft"}
                        </Badge>
                      </TableCell>

                      <TableCell className="text-xs text-slate-500">
                        {formatDate(b.created_at)}
                      </TableCell>

                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openEditModal(b)}
                            title="Edit"
                            className="h-8 w-8 text-slate-600 hover:text-emerald-700"
                          >
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setDeleteTarget(b)}
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

        {/* Create/Edit Modal */}
        <Dialog
          open={modalOpen}
          onOpenChange={setModalOpen}
          title={editingBlog ? "Edit Article" : "Write Blog Post"}
          description="Content publication and SEO configuration"
          maxWidth="2xl"
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
                {editingBlog ? "Save Article" : "Publish Article"}
              </Button>
            </>
          }
        >
          <div className="space-y-4 py-2">
            <Input
              label="Article Title"
              placeholder="e.g. 5 Essential Winter Hair Care Rituals"
              required
              value={formData.title}
              onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
            />

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Custom Slug"
                placeholder="winter-hair-care-rituals"
                value={formData.slug || ""}
                onChange={(e) => setFormData((prev) => ({ ...prev, slug: e.target.value }))}
              />
              <Input
                label="Author"
                placeholder="Senior Stylist Maya"
                value={formData.author || ""}
                onChange={(e) => setFormData((prev) => ({ ...prev, author: e.target.value }))}
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                Summary / Teaser
              </label>
              <textarea
                rows={2}
                placeholder="Short overview shown on blog listings..."
                className="w-full rounded-lg border border-slate-300 p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                value={formData.short_description || ""}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, short_description: e.target.value }))
                }
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                Full Article Content <span className="text-red-500">*</span>
              </label>
              <textarea
                rows={6}
                placeholder="Write the full content of your article..."
                required
                className="w-full rounded-lg border border-slate-300 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                value={formData.content}
                onChange={(e) => setFormData((prev) => ({ ...prev, content: e.target.value }))}
              />
            </div>

            {/* Featured Image */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                Featured Cover Image
              </label>
              <div className="flex items-center gap-3">
                {formData.featured_image && (
                  <img
                    src={formData.featured_image}
                    alt="Cover"
                    className="h-12 w-20 rounded-lg object-cover border"
                  />
                )}
                <label className="cursor-pointer inline-flex items-center gap-2 px-3 py-2 border rounded-lg text-xs font-semibold hover:bg-slate-50">
                  <Upload className="w-4 h-4 text-slate-500" />
                  {uploading ? "Uploading..." : "Upload Cover Image"}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    disabled={uploading}
                  />
                </label>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.is_published}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, is_published: e.target.checked }))
                  }
                  className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                />
                Published (Live on Website)
              </label>
            </div>
          </div>
        </Dialog>

        {/* Delete Modal */}
        <Dialog
          open={!!deleteTarget}
          onOpenChange={(open) => !open && setDeleteTarget(null)}
          title="Delete Article"
          description={`Delete "${deleteTarget?.title}"?`}
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
            This article will be permanently removed from your website blog.
          </p>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}

