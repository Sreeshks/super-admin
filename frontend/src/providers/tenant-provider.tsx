"use client";

import React, { createContext, useContext, useMemo } from "react";
import { CompanyInfo, CompanyProfile, DynamicBrandTheme, WebsiteSection } from "@/types";
import { generateCssVariables, getCompanyBrandTheme } from "@/lib/branding";

interface TenantContextType {
  slug: string;
  company: CompanyInfo;
  profile?: CompanyProfile | null;
  sections: WebsiteSection[];
  theme: DynamicBrandTheme;
  isSectionEnabled: (sectionKey: string) => boolean;
  makeUrl: (path: string) => string;
}

const TenantContext = createContext<TenantContextType | null>(null);

export function TenantProvider({
  slug,
  company,
  profile,
  sections,
  isCustomDomain = false,
  children,
}: {
  slug: string;
  company: CompanyInfo;
  profile?: CompanyProfile | null;
  sections?: WebsiteSection[];
  isCustomDomain?: boolean;
  children: React.ReactNode;
}) {
  const theme = useMemo(
    () => getCompanyBrandTheme(company, profile),
    [company, profile]
  );

  const cssVars = useMemo(() => generateCssVariables(theme), [theme]);

  const enabledMap = useMemo(() => {
    const map = new Map<string, boolean>();
    (sections || []).forEach((s) => {
      map.set(s.section_key, s.enabled);
    });
    return map;
  }, [sections]);

  const isSectionEnabled = (sectionKey: string): boolean => {
    if (!sections || sections.length === 0) return true;
    return enabledMap.has(sectionKey) ? !!enabledMap.get(sectionKey) : true;
  };

  const makeUrl = (path: string): string => {
    const cleanPath = path.startsWith("/") ? path : `/${path}`;
    if (isCustomDomain) {
      return cleanPath;
    }
    return cleanPath === "/" ? `/${slug}` : `/${slug}${cleanPath}`;
  };

  return (
    <TenantContext.Provider
      value={{
        slug,
        company,
        profile,
        sections: sections || [],
        theme,
        isSectionEnabled,
        makeUrl,
      }}
    >
      <div style={cssVars as React.CSSProperties} className="min-h-screen flex flex-col font-sans">
        {children}
      </div>
    </TenantContext.Provider>
  );
}

export function useTenant() {
  const context = useContext(TenantContext);
  if (!context) {
    throw new Error("useTenant must be used within a TenantProvider");
  }
  return context;
}

