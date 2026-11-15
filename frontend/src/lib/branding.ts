import { CompanyInfo, CompanyProfile, DynamicBrandTheme } from "@/types";

// Curated luxury presets tailored to business categories
const PALETTES: Record<string, DynamicBrandTheme> = {
  salon: {
    primary: "#18181b", // Obsidian Black
    primaryHover: "#27272a",
    secondary: "#b45309", // Warm Amber Gold
    accent: "#fef3c7",
    background: "#ffffff",
    surface: "#fafafa",
    text: "#09090b",
    textMuted: "#71717a",
    border: "#e4e4e7",
  },
  spa: {
    primary: "#064e3b", // Emerald Forest
    primaryHover: "#047857",
    secondary: "#059669",
    accent: "#a7f3d0",
    background: "#ffffff",
    surface: "#f0fdf4",
    text: "#064e3b",
    textMuted: "#6b7280",
    border: "#d1fae5",
  },
  beauty: {
    primary: "#4c0519", // Deep Rose Wine
    primaryHover: "#881337",
    secondary: "#e11d48",
    accent: "#fce7f3",
    background: "#ffffff",
    surface: "#fff1f2",
    text: "#4c0519",
    textMuted: "#6b7280",
    border: "#ffe4e6",
  },
  wellness: {
    primary: "#064e3b",
    primaryHover: "#047857",
    secondary: "#059669",
    accent: "#a7f3d0",
    background: "#ffffff",
    surface: "#f0fdf4",
    text: "#064e3b",
    textMuted: "#6b7280",
    border: "#d1fae5",
  },
  default: {
    primary: "#0f172a", // Slate Navy
    primaryHover: "#1e293b",
    secondary: "#d97706",
    accent: "#fef3c7",
    background: "#ffffff",
    surface: "#f8fafc",
    text: "#0f172a",
    textMuted: "#64748b",
    border: "#e2e8f0",
  },
};

export function getCompanyBrandTheme(
  company: CompanyInfo,
  _profile?: CompanyProfile | null
): DynamicBrandTheme {
  const typeSlug = company.business_type?.slug?.toLowerCase() || "";
  const name = company.name.toLowerCase();

  if (typeSlug.includes("salon") || name.includes("salon")) {
    return PALETTES.salon;
  }
  if (typeSlug.includes("spa") || typeSlug.includes("wellness") || name.includes("spa") || name.includes("wellness")) {
    return PALETTES.spa;
  }
  if (typeSlug.includes("beauty") || typeSlug.includes("nail") || name.includes("beauty")) {
    return PALETTES.beauty;
  }

  return PALETTES.default;
}

export function generateCssVariables(theme: DynamicBrandTheme): Record<string, string> {
  return {
    "--brand-primary": theme.primary,
    "--brand-primary-hover": theme.primaryHover,
    "--brand-secondary": theme.secondary,
    "--brand-accent": theme.accent,
    "--brand-background": theme.background,
    "--brand-surface": theme.surface,
    "--brand-text": theme.text,
    "--brand-text-muted": theme.textMuted,
    "--brand-border": theme.border,
  };
}
