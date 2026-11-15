import { describe, it, expect } from "vitest";
import { cn, formatBytes, formatDate, formatCurrency } from "@/lib/utils";

describe("Company Admin Utility Functions", () => {
  it("cn merges class names properly", () => {
    expect(cn("px-4", "py-2", { "bg-emerald-600": true })).toBe("px-4 py-2 bg-emerald-600");
    expect(cn("p-4", "p-2")).toBe("p-2");
  });

  it("formatBytes formats file sizes correctly", () => {
    expect(formatBytes(0)).toBe("0 Bytes");
    expect(formatBytes(1024)).toBe("1 KB");
    expect(formatBytes(1048576)).toBe("1 MB");
  });

  it("formatDate handles date objects and strings", () => {
    expect(formatDate(null)).toBe("-");
    expect(formatDate(undefined)).toBe("-");
    const d = new Date("2026-11-14T12:00:00Z");
    expect(formatDate(d)).toContain("2026");
  });

  it("formatCurrency formats INR amounts cleanly", () => {
    const formatted = formatCurrency(2500, "INR");
    expect(formatted).toContain("2,500");
  });
});

