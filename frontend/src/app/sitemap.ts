import { MetadataRoute } from "next";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const platformDomain =
    process.env.NEXT_PUBLIC_PLATFORM_DOMAIN || "localhost:3000";
  const defaultSlug =
    process.env.NEXT_PUBLIC_DEFAULT_TENANT_SLUG || "luxe-salon";

  const baseUrl = `https://${platformDomain}`;

  const routes = [
    "",
    "/about",
    "/services",
    "/offers",
    "/gallery",
    "/blog",
    "/contact",
    "/locations",
  ];

  return routes.map((route) => ({
    url: `${baseUrl}/${defaultSlug}${route}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: route === "" ? 1.0 : 0.8,
  }));
}

