import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(
  amount: number | string | null | undefined,
  currency = "OMR"
): string {
  if (amount === null || amount === undefined) return "-";
  const num = typeof amount === "string" ? parseFloat(amount) : amount;
  if (isNaN(num)) return "-";

  const curr = (currency || "OMR").toUpperCase().trim();

  switch (curr) {
    case "OMR":
      return `${num.toLocaleString("en-US", {
        minimumFractionDigits: num % 1 === 0 ? 0 : 3,
        maximumFractionDigits: 3,
      })} OMR`;
    case "AED":
      return `${num.toLocaleString("en-US", {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
      })} AED`;
    case "SAR":
      return `${num.toLocaleString("en-US", {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
      })} SAR`;
    case "KWD":
      return `${num.toLocaleString("en-US", {
        minimumFractionDigits: 0,
        maximumFractionDigits: 3,
      })} KWD`;
    case "BHD":
      return `${num.toLocaleString("en-US", {
        minimumFractionDigits: 0,
        maximumFractionDigits: 3,
      })} BHD`;
    case "QAR":
      return `${num.toLocaleString("en-US", {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
      })} QAR`;
    case "USD":
      return `$${num.toLocaleString("en-US", {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
      })}`;
    case "INR":
      return `₹${num.toLocaleString("en-IN", {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
      })}`;
    case "EUR":
      return `€${num.toLocaleString("de-DE", {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
      })}`;
    case "GBP":
      return `£${num.toLocaleString("en-GB", {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
      })}`;
    default:
      return `${num.toLocaleString("en-US")} ${curr}`;
  }
}

export function formatDate(dateStr: string | Date | null | undefined): string {
  if (!dateStr) return "-";
  try {
    const d = typeof dateStr === "string" ? new Date(dateStr) : dateStr;
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(d);
  } catch {
    return String(dateStr);
  }
}

export function formatDuration(minutes: number | null | undefined): string {
  if (!minutes) return "";
  if (minutes < 60) return `${minutes} mins`;
  const hrs = Math.floor(minutes / 60);
  const remaining = minutes % 60;
  return remaining > 0 ? `${hrs}h ${remaining}m` : `${hrs} hr${hrs > 1 ? "s" : ""}`;
}

export function sanitizeHtml(html: string): string {
  if (!html) return "";
  // Strip out dangerous tags such as script, iframe, object, embed
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, "")
    .replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, "")
    .replace(/<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi, "")
    .replace(/javascript:/gi, "");
}

