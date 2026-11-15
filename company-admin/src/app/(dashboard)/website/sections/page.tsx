"use client";

import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { sectionsApi, SectionBatchItem } from "@/lib/api/sections";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Sliders,
  ArrowUp,
  ArrowDown,
  Eye,
  EyeOff,
  Save,
  CheckCircle2,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { WebsiteSection } from "@/types";

export default function WebsiteSectionsPage() {
  const queryClient = useQueryClient();
  const [sections, setSections] = useState<WebsiteSection[]>([]);

  const { data: serverSections, isLoading } = useQuery({
    queryKey: ["website-sections"],
    queryFn: () => sectionsApi.list(),
  });

  useEffect(() => {
    if (serverSections) {
      // Sort by display_order and normalize enabled / is_enabled
      const sorted = [...serverSections]
        .map((s) => ({
          ...s,
          is_enabled: s.is_enabled ?? s.enabled ?? true,
          enabled: s.enabled ?? s.is_enabled ?? true,
        }))
        .sort((a, b) => a.display_order - b.display_order);
      setSections(sorted);
    }
  }, [serverSections]);

  const batchMutation = useMutation({
    mutationFn: (items: SectionBatchItem[]) => sectionsApi.batchUpdate(items),
    onSuccess: (updated) => {
      toast.success("Website section layout and visibility saved!");
      queryClient.setQueryData(["website-sections"], updated);
    },
    onError: (err: unknown) => {
      const msg = err instanceof Error ? err.message : "Failed to save sections";
      toast.error(msg);
    },
  });

  const toggleSection = (index: number) => {
    setSections((prev) => {
      const copy = [...prev];
      const current = copy[index].is_enabled ?? copy[index].enabled ?? false;
      copy[index] = {
        ...copy[index],
        is_enabled: !current,
        enabled: !current,
      };
      return copy;
    });
  };

  const moveUp = (index: number) => {
    if (index === 0) return;
    setSections((prev) => {
      const copy = [...prev];
      const temp = copy[index - 1];
      copy[index - 1] = copy[index];
      copy[index] = temp;
      return copy.map((item, idx) => ({ ...item, display_order: idx + 1 }));
    });
  };

  const moveDown = (index: number) => {
    if (index === sections.length - 1) return;
    setSections((prev) => {
      const copy = [...prev];
      const temp = copy[index + 1];
      copy[index + 1] = copy[index];
      copy[index] = temp;
      return copy.map((item, idx) => ({ ...item, display_order: idx + 1 }));
    });
  };

  const handleSave = () => {
    const payload: SectionBatchItem[] = sections.map((s, index) => {
      const active = s.is_enabled ?? s.enabled ?? true;
      return {
        section_key: s.section_key,
        enabled: active,
        is_enabled: active,
        display_order: index + 1,
        configuration: s.configuration || s.settings || undefined,
        settings: s.settings || s.configuration || undefined,
      };
    });
    batchMutation.mutate(payload);
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-black tracking-tight text-slate-900">
              Website Sections Manager
            </h2>
            <p className="text-sm text-slate-500">
              Control which sections appear on your public website and arrange their display order.
            </p>
          </div>

          <Button
            size="md"
            isLoading={batchMutation.isPending}
            onClick={handleSave}
            className="gap-2 shadow-sm"
          >
            <Save className="w-4 h-4" />
            Save Layout Changes
          </Button>
        </div>

        <Card className="border-slate-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-bold">Storefront Page Structure</CardTitle>
            <CardDescription>
              Disabled sections will not render on the public website. Use the arrow buttons to
              reorder content vertically.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-6 space-y-3">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {sections.map((section, index) => (
                  <div
                    key={section.section_key}
                    className={`flex items-center justify-between p-4 transition-colors ${
                      section.is_enabled ? "bg-white" : "bg-slate-50/70 opacity-70"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-100 text-xs font-bold text-slate-500">
                        {index + 1}
                      </span>
                      <div>
                        <h4 className="text-xs font-bold text-slate-900">
                          {section.display_name}
                        </h4>
                        <p className="text-[11px] font-mono text-slate-400">
                          Key: {section.section_key}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        variant={(section.is_enabled ?? section.enabled) ? "outline" : "secondary"}
                        size="sm"
                        onClick={() => toggleSection(index)}
                        className="text-xs gap-1"
                      >
                        {(section.is_enabled ?? section.enabled) ? (
                          <>
                            <Eye className="w-3.5 h-3.5 text-emerald-600" />
                            Enabled
                          </>
                        ) : (
                          <>
                            <EyeOff className="w-3.5 h-3.5 text-slate-400" />
                            Disabled
                          </>
                        )}
                      </Button>

                      <div className="flex items-center gap-1 border-l pl-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          disabled={index === 0}
                          onClick={() => moveUp(index)}
                          className="h-8 w-8 text-slate-500 hover:text-slate-900"
                        >
                          <ArrowUp className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          disabled={index === sections.length - 1}
                          onClick={() => moveDown(index)}
                          className="h-8 w-8 text-slate-500 hover:text-slate-900"
                        >
                          <ArrowDown className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
          <CardFooter className="flex justify-between items-center p-4 border-t bg-slate-50/50">
            <span className="text-xs text-slate-500">
              Total sections: <strong>{sections.length}</strong> (
              {sections.filter((s) => s.is_enabled).length} active)
            </span>
            <Button
              size="sm"
              isLoading={batchMutation.isPending}
              onClick={handleSave}
              className="gap-2"
            >
              <Save className="w-4 h-4" />
              Save Layout
            </Button>
          </CardFooter>
        </Card>
      </div>
    </DashboardLayout>
  );
}

