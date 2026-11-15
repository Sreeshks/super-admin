import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hostHeader = request.headers.get("host") || "";
  const host = hostHeader.split(":")[0].toLowerCase().trim();

  // Exclude static assets, Next.js internals, and system files
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/static") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  const platformDomain = (
    process.env.NEXT_PUBLIC_PLATFORM_DOMAIN || "localhost:3000"
  )
    .split(":")[0]
    .toLowerCase()
    .trim();

  const isLocalOrPlatform =
    host === "localhost" ||
    host === "127.0.0.1" ||
    host === platformDomain ||
    host.endsWith(`.${platformDomain}`);

  // Custom Domain Resolution
  if (!isLocalOrPlatform) {
    try {
      const apiBase =
        process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000/api/v1";
      const res = await fetch(
        `${apiBase}/public/websites/resolve/domain?domain=${encodeURIComponent(host)}`,
        {
          headers: { "Content-Type": "application/json" },
          cache: "no-store",
        }
      );

      if (res.ok) {
        const json = await res.json();
        const tenantSlug = json.data?.slug;
        if (tenantSlug) {
          // Rewrite internally to /[slug]/... without changing browser URL
          const rewriteUrl = new URL(
            `/${tenantSlug}${pathname === "/" ? "" : pathname}`,
            request.url
          );
          const response = NextResponse.rewrite(rewriteUrl);
          response.headers.set("x-tenant-slug", tenantSlug);
          response.headers.set("x-custom-domain", "true");
          return response;
        }
      }
    } catch {
      // Fall through to default routing
    }
  }

  // Root platform path handling: if visiting "/" on platform domain, redirect or rewrite to default tenant
  if (pathname === "/") {
    const defaultSlug =
      process.env.NEXT_PUBLIC_DEFAULT_TENANT_SLUG || "luxe-salon";
    const redirectUrl = new URL(`/${defaultSlug}`, request.url);
    return NextResponse.redirect(redirectUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};

