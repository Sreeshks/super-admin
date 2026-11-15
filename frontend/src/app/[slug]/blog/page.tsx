import React from "react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { publicApi } from "@/lib/api";
import { generateTenantMetadata } from "@/lib/seo";
import { formatDate } from "@/lib/utils";
import { ArrowRight } from "lucide-react";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata(props: PageProps) {
  const { slug } = await props.params;
  try {
    const data = await publicApi.getWebsiteData(slug);
    return generateTenantMetadata({
      company: data.company,
      profile: data.profile,
      pageTitle: "Wellness & Beauty Journal",
      pageDescription: `Read expert wellness advice, beauty regimes, and skincare notes from specialists at ${data.company.name}.`,
      canonicalPath: `/${slug}/blog`,
    });
  } catch {
    return { title: "Journal" };
  }
}

export default async function BlogListingPage(props: PageProps) {
  const { slug } = await props.params;

  let websiteData;
  let blogs;
  try {
    [websiteData, blogs] = await Promise.all([
      publicApi.getWebsiteData(slug),
      publicApi.getBlogs(slug),
    ]);
  } catch {
    notFound();
  }

  const { company, profile } = websiteData;
  const businessName = profile?.company_name || company.name;

  const defaultBlogCover =
    "https://images.unsplash.com/photo-1512290900672-1f028479e491?auto=format&fit=crop&w=1000&q=85";

  return (
    <div className="bg-white min-h-screen py-24 sm:py-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Editorial Heading */}
        <div className="text-center mb-16 sm:mb-24">
          <h1 className="font-sans text-4xl sm:text-6xl font-extrabold uppercase tracking-tight text-black flex items-center justify-center gap-3">
            <span>EDITORIAL</span>
            <span className="editorial-bracket text-xs sm:text-sm font-semibold tracking-wider text-black">
              RESEARCH & PROTOCOLS
            </span>
            <span>JOURNAL</span>
          </h1>
          <p className="mt-3 text-xs sm:text-sm text-neutral-500 max-w-md mx-auto">
            Deep-dive skincare insights, aesthetic innovations, and restorative self-care practices from {businessName}.
          </p>
        </div>

        {/* Blog Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 max-w-6xl mx-auto">
          {blogs.map((blog) => (
            <Link
              key={blog.id}
              href={`/${slug}/blog/${blog.slug}`}
              className="group block border border-black/10 bg-white hover:border-black/30 transition-colors"
            >
              <div className="relative aspect-4/3 w-full overflow-hidden bg-neutral-100">
                <Image
                  src={blog.featured_image || defaultBlogCover}
                  alt={blog.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                />
              </div>

              <div className="p-6 sm:p-8 space-y-3">
                {blog.published_date && (
                  <p className="text-[11px] font-mono text-neutral-400">
                    {formatDate(blog.published_date)}
                  </p>
                )}

                <h2 className="font-sans text-sm font-bold uppercase tracking-wide text-black group-hover:text-neutral-600 transition-colors leading-snug">
                  {blog.title}
                </h2>

                {blog.short_description && (
                  <p className="text-xs text-neutral-600 font-sans line-clamp-3 leading-relaxed">
                    {blog.short_description}
                  </p>
                )}

                <div className="pt-4 border-t border-black/5 flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-black underline">
                  <span>Read Story</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>
            </Link>
          ))}
        </div>

      </div>
    </div>
  );
}
