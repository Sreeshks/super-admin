import { describe, it, expect } from "vitest";
import { cn, formatBytes, formatDate, formatCurrency } from "@/lib/utils";

describe("Utility functions", () => {
  it("cn merges class names correctly", () => {
    expect(cn("px-2", "py-1", { "bg-blue-500": true, "text-red-500": false })).toBe(
      "px-2 py-1 bg-blue-500"
    );
    expect(cn("p-4", "p-2")).toBe("p-2"); // tailwind-merge resolves conflict
  });

  it("formatBytes formats byte sizes accurately", () => {
    expect(formatBytes(0)).toBe("0 Bytes");
    expect(formatBytes(1024)).toBe("1 KB");
    expect(formatBytes(1048576)).toBe("1 MB");
    expect(formatBytes(1073741824)).toBe("1 GB");
  });

  it("formatDate handles valid ISO dates and nulls", () => {
    expect(formatDate(null)).toBe("-");
    expect(formatDate(undefined)).toBe("-");
    const d = new Date("2026-11-14T10:30:00Z");
    expect(formatDate(d)).toContain("2026");
  });

  it("formatCurrency formats INR appropriately", () => {
    const formatted = formatCurrency(1500, "INR");
    expect(formatted).toContain("1,500");
  });
});

