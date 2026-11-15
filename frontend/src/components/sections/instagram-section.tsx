"use client";

import React, { useState } from "react";
import Image from "next/image";
import { InstagramPost } from "@/types";
import { useTenant } from "@/providers/tenant-provider";
import { ArrowUpRight, Camera, Film, X, ExternalLink } from "lucide-react";
import { motion } from "framer-motion";
import { AnimatedBracket } from "@/components/ui/animated-bracket";

function getInstagramEmbedUrl(url: string): string | null {
  if (!url) return null;
  const match = url.match(/instagram\.com\/(?:p|reel|tv)\/([a-zA-Z0-9_-]+)/);
  return match ? `https://www.instagram.com/p/${match[1]}/embed` : null;
}

export function InstagramSection({
  posts = [],
}: {
  posts?: InstagramPost[];
}) {
  const { company, profile } = useTenant();
  const [activePost, setActivePost] = useState<InstagramPost | null>(null);

  if (!posts || posts.length === 0) {
    return null;
  }

  const businessName = profile?.company_name || company.name;
  const defaultThumbnail =
    "https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=600&q=80";

  return (
    <section className="py-24 sm:py-32 bg-white border-b border-black/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Editorial Heading */}
        <div className="text-center mb-16 sm:mb-20">
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
            className="font-sans text-3xl sm:text-5xl font-extrabold uppercase tracking-tight text-black flex items-center justify-center gap-2"
          >
            <span>FOLLOW</span>
            <AnimatedBracket text="DAILY ATELIER" delay={0.15} />
            <span>INSTAGRAM</span>
          </motion.h2>
          <p className="mt-3 text-xs sm:text-sm text-neutral-500 max-w-md mx-auto">
            Backstage glimpses, skin transformations, and wellness moments from {businessName}.
          </p>
        </div>

        {/* Minimal Photo Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          {posts.map((post) => {
            const isReel = post.post_url.includes("/reel/");
            const thumbUrl = post.thumbnail_url || defaultThumbnail;

            return (
              <div
                key={post.id}
                onClick={() => setActivePost(post)}
                className="group relative aspect-square overflow-hidden bg-neutral-100 border border-black/10 cursor-pointer block"
              >
                <Image
                  src={thumbUrl}
                  alt={post.caption || "Instagram highlight"}
                  fill
                  unoptimized
                  sizes="(max-width: 768px) 50vw, 25vw"
                  className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                />

                {/* Badge for Reel / Post */}
                <div className="absolute top-3 left-3 z-10 bg-black/70 backdrop-blur-xs text-white p-1.5 rounded-full">
                  {isReel ? (
                    <Film className="w-3.5 h-3.5" />
                  ) : (
                    <Camera className="w-3.5 h-3.5" />
                  )}
                </div>

                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-4 text-white">
                  <div className="flex justify-end">
                    <ArrowUpRight className="w-4 h-4 text-white" />
                  </div>
                  {post.caption && (
                    <p className="text-xs line-clamp-2 font-sans font-medium text-white/95">
                      {post.caption}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Interactive Instagram Embed Viewer Modal */}
      {activePost && (
        <div
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 sm:p-6"
          onClick={() => setActivePost(null)}
        >
          <button
            onClick={() => setActivePost(null)}
            className="absolute top-6 right-6 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
            aria-label="Close Instagram viewer"
          >
            <X className="w-6 h-6" />
          </button>

          <div
            className="relative bg-white max-w-lg w-full rounded-2xl overflow-hidden shadow-2xl p-6 space-y-4 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {getInstagramEmbedUrl(activePost.post_url) ? (
              <div className="aspect-[4/5] w-full rounded-xl overflow-hidden border border-neutral-200 bg-neutral-50">
                <iframe
                  src={getInstagramEmbedUrl(activePost.post_url)!}
                  className="w-full h-full border-0"
                  allowFullScreen
                  title="Instagram Post Embed"
                />
              </div>
            ) : (
              <div className="relative aspect-square w-full rounded-xl overflow-hidden">
                <Image
                  src={activePost.thumbnail_url || defaultThumbnail}
                  alt={activePost.caption || "Instagram preview"}
                  fill
                  unoptimized
                  className="object-cover"
                />
              </div>
            )}

            {activePost.caption && (
              <p className="text-xs text-neutral-700 leading-relaxed">
                {activePost.caption}
              </p>
            )}

            <div className="pt-2 flex justify-end">
              <a
                href={activePost.post_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-black hover:bg-neutral-800 text-white text-xs font-bold uppercase tracking-wider transition-colors"
              >
                <span>View on Instagram</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
