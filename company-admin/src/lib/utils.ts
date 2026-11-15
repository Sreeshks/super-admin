import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatBytes(bytes: number, decimals = 2) {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
}

export function formatDate(dateStr: string | Date | null | undefined): string {
  if (!dateStr) return "-";
  try {
    const d = typeof dateStr === "string" ? new Date(dateStr) : dateStr;
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "numeric",
    }).format(d);
  } catch {
    return String(dateStr);
  }
}

export function formatCurrency(amount: number | null | undefined, currency = "OMR"): string {
  if (amount === null || amount === undefined || isNaN(amount)) return "-";
  const curr = (currency || "OMR").toUpperCase().trim();
  
  switch (curr) {
    case "OMR":
      return `${amount.toLocaleString("en-US", { minimumFractionDigits: amount % 1 === 0 ? 0 : 3, maximumFractionDigits: 3 })} OMR`;
    case "AED":
      return `${amount.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 2 })} AED`;
    case "SAR":
      return `${amount.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 2 })} SAR`;
    case "KWD":
      return `${amount.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 3 })} KWD`;
    case "BHD":
      return `${amount.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 3 })} BHD`;
    case "QAR":
      return `${amount.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 2 })} QAR`;
    case "USD":
      return `$${amount.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
    case "INR":
      return `₹${amount.toLocaleString("en-IN", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
    case "EUR":
      return `€${amount.toLocaleString("de-DE", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
    case "GBP":
      return `£${amount.toLocaleString("en-GB", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
    default:
      return `${amount.toLocaleString("en-US")} ${curr}`;
  }
}

export function getMediaUrl(url?: string | null): string {
  if (!url) return "";
  if (url.startsWith("/storage/")) {
    const apiBase =
      process.env.NEXT_PUBLIC_API_URL?.replace(/\/api\/v1\/?$/, "") ||
      "https://nofa.api.pixelbusiness.si";
    return `${apiBase}${url}`;
  }
  return url;
}

