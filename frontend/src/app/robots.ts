import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const platformDomain =
    process.env.NEXT_PUBLIC_PLATFORM_DOMAIN || "localhost:3000";

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/_next/", "/api/", "/admin/"],
      },
    ],
    sitemap: `https://${platformDomain}/sitemap.xml`,
  };
}

