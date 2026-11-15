"use client";

import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { socialApi, instagramApi, youtubeApi } from "@/lib/api/content";
import { uploadToImgBB } from "@/lib/api/imgbb";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Share2,
  Save,
  PlusCircle,
  Trash2,
  ExternalLink,
  Camera,
  Video,
  Upload,
  Play,
  Eye,
} from "lucide-react";
import { toast } from "sonner";
import { SocialLinks } from "@/types";

function extractYouTubeId(url: string): string | null {
  if (!url) return null;
  const match = url.match(/(?:v=|\/v\/|youtu\.be\/|\/embed\/|\/shorts\/|^)([a-zA-Z0-9_-]{11})(?:[&?\/]|$)/);
  return match ? match[1] : null;
}

export default function SocialMediaPage() {
  const queryClient = useQueryClient();

  const [links, setLinks] = useState<SocialLinks>({
    instagram_url: "",
    facebook_url: "",
    youtube_url: "",
    whatsapp_number: "",
  });

  const [igModal, setIgModal] = useState(false);
  const [newIgUrl, setNewIgUrl] = useState("");
  const [newIgCaption, setNewIgCaption] = useState("");
  const [newIgThumbnail, setNewIgThumbnail] = useState("");
  const [uploadingIgThumb, setUploadingIgThumb] = useState(false);

  const [ytModal, setYtModal] = useState(false);
  const [newYtUrl, setNewYtUrl] = useState("");
  const [newYtTitle, setNewYtTitle] = useState("");

  // Social Links
  const { data: serverLinks, isLoading: linksLoading } = useQuery({
    queryKey: ["social-links"],
    queryFn: () => socialApi.getLinks(),
  });

  // Instagram Posts
  const { data: igPosts } = useQuery({
    queryKey: ["instagram-posts"],
    queryFn: () => instagramApi.list(),
  });

  // YouTube Videos
  const { data: ytVideos } = useQuery({
    queryKey: ["youtube-videos"],
    queryFn: () => youtubeApi.list(),
  });

  useEffect(() => {
    if (serverLinks) {
      setLinks({
        instagram_url: serverLinks.instagram_url || "",
        facebook_url: serverLinks.facebook_url || "",
        youtube_url: serverLinks.youtube_url || "",
        whatsapp_number: serverLinks.whatsapp_number || "",
      });
    }
  }, [serverLinks]);

  const saveLinksMutation = useMutation({
    mutationFn: () => socialApi.updateLinks(links),
    onSuccess: () => {
      toast.success("Social media profiles updated successfully!");
      queryClient.invalidateQueries({ queryKey: ["social-links"] });
    },
    onError: (err: unknown) => {
      const msg = err instanceof Error ? err.message : "Failed to update links";
      toast.error(msg);
    },
  });

  const handleIgThumbnailUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingIgThumb(true);
    try {
      const url = await uploadToImgBB(file);
      setNewIgThumbnail(url);
      toast.success("Thumbnail photo uploaded via ImgBB!");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Upload failed";
      toast.error(msg);
    } finally {
      setUploadingIgThumb(false);
    }
  };

  const addIgMutation = useMutation({
    mutationFn: () =>
      instagramApi.create({
        post_url: newIgUrl,
        caption: newIgCaption,
        thumbnail_url: newIgThumbnail || undefined,
      }),
    onSuccess: () => {
      toast.success("Instagram post added successfully!");
      setIgModal(false);
      setNewIgUrl("");
      setNewIgCaption("");
      setNewIgThumbnail("");
      queryClient.invalidateQueries({ queryKey: ["instagram-posts"] });
    },
    onError: (err: unknown) => {
      const msg = err instanceof Error ? err.message : "Failed to add post";
      toast.error(msg);
    },
  });

  const deleteIgMutation = useMutation({
    mutationFn: (id: string) => instagramApi.delete(id),
    onSuccess: () => {
      toast.success("Instagram post removed");
      queryClient.invalidateQueries({ queryKey: ["instagram-posts"] });
    },
  });

  const addYtMutation = useMutation({
    mutationFn: () => youtubeApi.create({ video_url: newYtUrl, title: newYtTitle }),
    onSuccess: () => {
      toast.success("YouTube video added!");
      setYtModal(false);
      setNewYtUrl("");
      setNewYtTitle("");
      queryClient.invalidateQueries({ queryKey: ["youtube-videos"] });
    },
    onError: (err: unknown) => {
      const msg = err instanceof Error ? err.message : "Failed to add video";
      toast.error(msg);
    },
  });

  const deleteYtMutation = useMutation({
    mutationFn: (id: string) => youtubeApi.delete(id),
    onSuccess: () => {
      toast.success("YouTube video removed");
      queryClient.invalidateQueries({ queryKey: ["youtube-videos"] });
    },
  });

  return (
    <DashboardLayout>
      <div className="max-w-4xl space-y-8">
        <div>
          <h2 className="text-2xl font-black tracking-tight text-slate-900">
            Social Media & Video Channels
          </h2>
          <p className="text-sm text-slate-500">
            Link your brand profiles, WhatsApp direct bookings, and embed Instagram & YouTube feeds.
          </p>
        </div>

        {/* Social Profile Links */}
        <Card className="border-slate-200">
          <CardHeader>
            <CardTitle className="text-base font-bold">Official Profiles</CardTitle>
            <CardDescription>
              Displayed in your website header, footer, and contact section
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Instagram Profile URL"
                placeholder="https://instagram.com/yourbusiness"
                value={links.instagram_url || ""}
                onChange={(e) => setLinks((prev) => ({ ...prev, instagram_url: e.target.value }))}
              />
              <Input
                label="WhatsApp Direct Booking Number"
                placeholder="+91 98765 43210"
                value={links.whatsapp_number || ""}
                onChange={(e) => setLinks((prev) => ({ ...prev, whatsapp_number: e.target.value }))}
              />
              <Input
                label="Facebook Page URL"
                placeholder="https://facebook.com/yourbusiness"
                value={links.facebook_url || ""}
                onChange={(e) => setLinks((prev) => ({ ...prev, facebook_url: e.target.value }))}
              />
              <Input
                label="YouTube Channel URL"
                placeholder="https://youtube.com/@yourbusiness"
                value={links.youtube_url || ""}
                onChange={(e) => setLinks((prev) => ({ ...prev, youtube_url: e.target.value }))}
              />
            </div>
          </CardContent>
          <CardFooter className="flex justify-end p-4 border-t">
            <Button
              isLoading={saveLinksMutation.isPending}
              onClick={() => saveLinksMutation.mutate()}
              className="gap-2"
            >
              <Save className="w-4 h-4" />
              Save Social Profiles
            </Button>
          </CardFooter>
        </Card>

        {/* Instagram Post Highlights */}
        <Card className="border-slate-200">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div>
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <Camera className="w-4 h-4 text-rose-600" />
                Instagram Feed Highlights
              </CardTitle>
              <CardDescription>Featured posts on your public website</CardDescription>
            </div>
            <Button size="sm" onClick={() => setIgModal(true)} className="gap-1.5 text-xs">
              <PlusCircle className="w-3.5 h-3.5" />
              Add Post
            </Button>
          </CardHeader>
          <CardContent>
            {!igPosts || igPosts.length === 0 ? (
              <p className="text-xs text-slate-500 py-3 text-center">
                No Instagram posts configured. Add post links to show in your website feed.
              </p>
            ) : (
              <div className="divide-y divide-slate-100">
                {igPosts.map((post) => (
                  <div key={post.id} className="flex items-center justify-between py-2.5 text-xs gap-3">
                    <div className="flex items-center gap-3 truncate">
                      {post.thumbnail_url ? (
                        <img
                          src={post.thumbnail_url}
                          alt={post.caption || "Instagram thumbnail"}
                          className="h-12 w-12 rounded-lg object-cover border border-slate-200 shrink-0"
                        />
                      ) : (
                        <div className="h-12 w-12 rounded-lg bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-500 shrink-0">
                          <Camera className="w-5 h-5" />
                        </div>
                      )}
                      <div className="truncate">
                        <p className="font-bold text-slate-800 truncate">{post.caption || "Instagram Post"}</p>
                        <a
                          href={post.post_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-mono text-emerald-700 hover:underline truncate block"
                        >
                          {post.post_url}
                        </a>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteIgMutation.mutate(post.id)}
                      className="h-7 w-7 text-slate-400 hover:text-red-600 shrink-0"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* YouTube Video Embeds */}
        <Card className="border-slate-200">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div>
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <Video className="w-4 h-4 text-red-600" />
                YouTube Video Showcase
              </CardTitle>
              <CardDescription>Embed treatment walkthroughs or salon tours</CardDescription>
            </div>
            <Button size="sm" onClick={() => setYtModal(true)} className="gap-1.5 text-xs">
              <PlusCircle className="w-3.5 h-3.5" />
              Add Video
            </Button>
          </CardHeader>
          <CardContent>
            {!ytVideos || ytVideos.length === 0 ? (
              <p className="text-xs text-slate-500 py-3 text-center">
                No YouTube videos added yet. Add video links to play on your website.
              </p>
            ) : (
              <div className="divide-y divide-slate-100">
                {ytVideos.map((vid) => {
                  const ytId = vid.youtube_video_id || extractYouTubeId(vid.video_url);
                  const thumb = vid.thumbnail_url || (ytId ? `https://img.youtube.com/vi/${ytId}/hqdefault.jpg` : null);

                  return (
                    <div key={vid.id} className="flex items-center justify-between py-2.5 text-xs gap-3">
                      <div className="flex items-center gap-3 truncate">
                        {thumb ? (
                          <div className="relative h-12 w-20 rounded-lg overflow-hidden bg-slate-900 border border-slate-200 shrink-0">
                            <img
                              src={thumb}
                              alt={vid.title || "Video"}
                              className="h-full w-full object-cover"
                            />
                            <div className="absolute inset-0 bg-black/25 flex items-center justify-center">
                              <Play className="w-4 h-4 text-white fill-white" />
                            </div>
                          </div>
                        ) : (
                          <div className="h-12 w-12 rounded-lg bg-red-50 border border-red-200 flex items-center justify-center text-red-600 shrink-0">
                            <Video className="w-5 h-5" />
                          </div>
                        )}
                        <div className="truncate">
                          <p className="font-bold text-slate-800 truncate">{vid.title || "Video Showcase"}</p>
                          <a
                            href={vid.video_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-mono text-emerald-700 hover:underline truncate block"
                          >
                            {vid.video_url}
                          </a>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => deleteYtMutation.mutate(vid.id)}
                        className="h-7 w-7 text-slate-400 hover:text-red-600 shrink-0"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Add IG Modal */}
        <Dialog
          open={igModal}
          onOpenChange={setIgModal}
          title="Add Instagram Post"
          description="Enter direct URL of the Instagram post or reel to highlight"
          footer={
            <>
              <Button variant="outline" size="sm" onClick={() => setIgModal(false)}>
                Cancel
              </Button>
              <Button
                size="sm"
                isLoading={addIgMutation.isPending}
                onClick={() => addIgMutation.mutate()}
              >
                Add Post
              </Button>
            </>
          }
        >
          <div className="space-y-4 py-2">
            <Input
              label="Instagram Post / Reel URL"
              placeholder="https://www.instagram.com/p/Cxyz123/ or /reel/..."
              required
              value={newIgUrl}
              onChange={(e) => setNewIgUrl(e.target.value)}
            />
            <Input
              label="Short Caption (Optional)"
              placeholder="Signature bridal styling transformation"
              value={newIgCaption}
              onChange={(e) => setNewIgCaption(e.target.value)}
            />

            {/* Thumbnail Photo Upload */}
            <div className="space-y-2 pt-1 border-t border-slate-100">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                Post Photo / Snapshot
              </label>
              <p className="text-[11px] text-slate-500">
                Upload the photo or video frame to display in the website gallery grid.
              </p>
              <div className="flex items-center gap-3">
                {newIgThumbnail ? (
                  <img
                    src={newIgThumbnail}
                    alt="Thumbnail preview"
                    className="h-16 w-16 rounded-xl object-cover border p-0.5 bg-white shrink-0"
                  />
                ) : (
                  <div className="h-16 w-16 rounded-xl border border-dashed flex items-center justify-center bg-slate-50 text-slate-400 shrink-0">
                    <Camera className="w-6 h-6" />
                  </div>
                )}
                <label className="cursor-pointer inline-flex items-center gap-2 px-3.5 py-2 border rounded-lg text-xs font-semibold hover:bg-slate-50 transition-colors">
                  <Upload className="w-4 h-4 text-slate-500" />
                  {uploadingIgThumb ? "Uploading to ImgBB..." : "Upload Photo with ImgBB"}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleIgThumbnailUpload}
                    className="hidden"
                    disabled={uploadingIgThumb}
                  />
                </label>
              </div>
              <Input
                placeholder="Or paste direct image CDN URL (https://...)"
                value={newIgThumbnail}
                onChange={(e) => setNewIgThumbnail(e.target.value)}
              />
            </div>
          </div>
        </Dialog>

        {/* Add YT Modal */}
        <Dialog
          open={ytModal}
          onOpenChange={setYtModal}
          title="Add YouTube Video"
          description="Enter YouTube video link (watch, youtu.be, or shorts) to play on your website"
          footer={
            <>
              <Button variant="outline" size="sm" onClick={() => setYtModal(false)}>
                Cancel
              </Button>
              <Button
                size="sm"
                isLoading={addYtMutation.isPending}
                onClick={() => addYtMutation.mutate()}
              >
                Add Video
              </Button>
            </>
          }
        >
          <div className="space-y-4 py-2">
            <Input
              label="YouTube Video Link"
              placeholder="https://www.youtube.com/watch?v=... or https://youtu.be/..."
              required
              value={newYtUrl}
              onChange={(e) => setNewYtUrl(e.target.value)}
            />
            <Input
              label="Video Title"
              placeholder="Tour our luxury salon & spa lounge"
              value={newYtTitle}
              onChange={(e) => setNewYtTitle(e.target.value)}
            />

            {/* Live YouTube Preview */}
            {extractYouTubeId(newYtUrl) && (
              <div className="p-3 rounded-xl border border-red-200 bg-red-50/50 space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-red-700">
                  <Play className="w-3.5 h-3.5 fill-red-600 text-red-600" />
                  <span>Video Preview Recognized</span>
                </div>
                <div className="relative aspect-video w-full rounded-lg overflow-hidden bg-black border border-red-200">
                  <img
                    src={`https://img.youtube.com/vi/${extractYouTubeId(newYtUrl)}/hqdefault.jpg`}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/25 flex items-center justify-center">
                    <div className="h-10 w-10 rounded-full bg-red-600 text-white flex items-center justify-center shadow-lg">
                      <Play className="w-5 h-5 fill-current translate-x-0.5" />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
