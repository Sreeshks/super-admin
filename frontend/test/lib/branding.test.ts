import { describe, it, expect } from "vitest";
import { generateCssVariables, getCompanyBrandTheme } from "@/lib/branding";
import { CompanyInfo } from "@/types";

describe("Dynamic Branding System", () => {
  it("resolves luxury obsidian/gold palette for salon business types", () => {
    const salonCompany: CompanyInfo = {
      id: "1",
      name: "Velvet Crown Salon",
      slug: "velvet-crown",
      business_type: { id: "bt1", name: "Salon", slug: "salon" },
      website_status: "active",
      account_status: "active",
    };

    const theme = getCompanyBrandTheme(salonCompany);
    expect(theme.primary).toBe("#18181b");
    expect(theme.secondary).toBe("#b45309");

    const cssVars = generateCssVariables(theme);
    expect(cssVars["--brand-primary"]).toBe("#18181b");
    expect(cssVars["--brand-secondary"]).toBe("#b45309");
  });

  it("resolves tranquil emerald jade palette for spa & wellness businesses", () => {
    const spaCompany: CompanyInfo = {
      id: "2",
      name: "Serenity Retreat Spa",
      slug: "serenity-retreat",
      business_type: { id: "bt2", name: "Spa", slug: "spa" },
      website_status: "active",
      account_status: "active",
    };

    const theme = getCompanyBrandTheme(spaCompany);
    expect(theme.primary).toBe("#064e3b");
    expect(theme.surface).toBe("#f0fdf4");
  });

  it("resolves crimson rose palette for beauty parlours and nail studios", () => {
    const beautyCompany: CompanyInfo = {
      id: "3",
      name: "Glamour Rose Aesthetics",
      slug: "glamour-rose",
      business_type: { id: "bt3", name: "Beauty Parlour", slug: "beauty-parlour" },
      website_status: "active",
      account_status: "active",
    };

    const theme = getCompanyBrandTheme(beautyCompany);
    expect(theme.primary).toBe("#4c0519");
    expect(theme.secondary).toBe("#e11d48");
  });

  it("falls back to default luxury slate theme for unknown business types", () => {
    const genericCompany: CompanyInfo = {
      id: "4",
      name: "Zenith Studio",
      slug: "zenith-studio",
      website_status: "active",
      account_status: "active",
    };

    const theme = getCompanyBrandTheme(genericCompany);
    expect(theme.primary).toBe("#0f172a");
  });
});

