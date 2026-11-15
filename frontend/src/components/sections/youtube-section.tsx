"use client";

import React, { useState } from "react";
import Image from "next/image";
import { YouTubeVideo } from "@/types";
import { Play, X, Video } from "lucide-react";

export function YouTubeSection({
  videos = [],
}: {
  videos?: YouTubeVideo[];
}) {
  const [activeEmbed, setActiveEmbed] = useState<string | null>(null);

  if (!videos || videos.length === 0) {
    return null;
  }

  return (
    <section className="py-20 bg-slate-900 text-white border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto space-y-3 mb-12">
          <span className="text-xs font-bold uppercase tracking-widest text-red-500 flex items-center justify-center gap-1.5">
            <Video className="w-3.5 h-3.5" />
            Video Showcase
          </span>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-white">
            Watch Our Treatment Walkthroughs
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">
            Step inside our treatment suites and explore transformation techniques.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {videos.map((vid) => {
            const thumb =
              vid.thumbnail_url ||
              (vid.youtube_video_id
                ? `https://img.youtube.com/vi/${vid.youtube_video_id}/hqdefault.jpg`
                : "https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=800&q=80");

            return (
              <div
                key={vid.id}
                onClick={() => setActiveEmbed(vid.embed_url || `https://www.youtube.com/embed/${vid.youtube_video_id}`)}
                className="group relative rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 hover:border-slate-700 cursor-pointer transition-all shadow-md"
              >
                <div className="relative h-52 w-full overflow-hidden">
                  <Image
                    src={thumb}
                    alt={vid.title || "YouTube Video"}
                    fill
                    unoptimized
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-slate-950/40 group-hover:bg-slate-950/20 transition-colors flex items-center justify-center">
                    <div className="h-14 w-14 rounded-full bg-red-600 text-white flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform">
                      <Play className="w-6 h-6 fill-current translate-x-0.5" />
                    </div>
                  </div>
                </div>
                <div className="p-4">
                  <h4 className="text-sm font-bold text-white group-hover:text-brand-secondary transition-colors line-clamp-2">
                    {vid.title || "Treatment Highlights"}
                  </h4>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Video Modal Player */}
      {activeEmbed && (
        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4"
          onClick={() => setActiveEmbed(null)}
        >
          <button
            onClick={() => setActiveEmbed(null)}
            className="absolute top-6 right-6 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
            aria-label="Close video player"
          >
            <X className="w-6 h-6" />
          </button>
          <div
            className="relative max-w-4xl w-full aspect-video rounded-xl overflow-hidden shadow-2xl bg-black"
            onClick={(e) => e.stopPropagation()}
          >
            <iframe
              src={`${activeEmbed}?autoplay=1`}
              title="YouTube video player"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="w-full h-full border-0"
            />
          </div>
        </div>
      )}
    </section>
  );
}

