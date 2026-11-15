"use client";

import React, { useState } from "react";
import Link from "next/link";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Palette, ExternalLink, CheckCircle2, Sparkles, Layers } from "lucide-react";
import { toast } from "sonner";

const TEMPLATES = [
  {
    id: "editorial-luxury",
    name: "Editorial Luxury",
    category: "Beauty, Salon & Luxury Spa",
    isDefault: true,
    description:
      "World-class editorial aesthetic featuring oversized bold typography, asymmetric curated gallery, edge-to-edge photographic hero, and dynamic scroll-triggered bracket flourishes.",
    features: [
      "Full-Bleed Photographic Hero",
      "Interactive Scroll Animations",
      "Asymmetric Editorial Gallery",
      "Service & Category Matrix",
      "Promotional Offers Banner",
      "Verified Customer Testimonials",
      "Editorial Journal / Blog",
      "Interactive Booking & Enquiries",
    ],
    previewUrl: "http://localhost:3000/luxe-salon",
    color: "bg-stone-900 text-stone-100",
  },
];

export default function TemplatesPage() {
  const [selectedTemplate] = useState<string>("editorial-luxury");

  const handleApply = (name: string) => {
    toast.success(`${name} is already the active platform default`);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-black tracking-tight text-slate-900">
              Website Template Catalog
            </h2>
            <p className="text-sm text-slate-500">
              Production storefront template engine powering client websites across the multi-tenant SaaS platform.
            </p>
          </div>
          <Badge className="w-fit bg-emerald-50 text-emerald-700 border-emerald-200 px-3 py-1 font-semibold flex items-center gap-1.5 text-xs">
            <CheckCircle2 className="w-3.5 h-3.5" /> 1 Active Production Template
          </Badge>
        </div>

        <div className="max-w-2xl">
          {TEMPLATES.map((tmpl) => (
            <Card
              key={tmpl.id}
              className="border-slate-200 shadow-sm overflow-hidden flex flex-col justify-between"
            >
              <div>
                {/* Visual Header Representation */}
                <div
                  className={`h-48 w-full p-6 flex flex-col justify-between relative overflow-hidden bg-gradient-to-br from-stone-900 via-stone-800 to-stone-900 text-stone-100`}
                >
                  <div className="flex items-center justify-between z-10">
                    <Badge variant="outline" className="text-[11px] text-white border-white/30 uppercase tracking-wider font-semibold">
                      {tmpl.category}
                    </Badge>
                    <span className="inline-flex items-center gap-1 text-[11px] bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 px-2.5 py-0.5 rounded-full font-semibold">
                      <Sparkles className="w-3 h-3" /> Active Default
                    </span>
                  </div>
                  <div className="z-10">
                    <h3 className="font-black text-2xl text-white tracking-tight">{tmpl.name}</h3>
                    <p className="text-xs text-stone-300 mt-1 font-medium">
                      Multi-Tenant Dynamic Next.js Luxury Editorial Storefront
                    </p>
                  </div>
                </div>

                <CardContent className="p-6 space-y-5">
                  <p className="text-sm text-slate-600 leading-relaxed">{tmpl.description}</p>
                  <div className="space-y-2.5 border-t border-slate-100 pt-4">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5 text-slate-400" /> Included Modules & Capabilities
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {tmpl.features.map((feat) => (
                        <span
                          key={feat}
                          className="text-xs bg-slate-100 text-slate-700 px-2.5 py-1 rounded-md font-medium"
                        >
                          {feat}
                        </span>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </div>

              <CardFooter className="p-4 border-t border-slate-100 bg-slate-50/70 flex items-center justify-between">
                <a
                  href={tmpl.previewUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center"
                >
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs gap-1.5 font-semibold"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    Live Demo Preview
                  </Button>
                </a>
                <Button
                  size="sm"
                  className="text-xs gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold cursor-default"
                  onClick={() => handleApply(tmpl.name)}
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Default Template
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}

