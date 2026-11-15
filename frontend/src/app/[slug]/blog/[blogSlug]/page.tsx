import React from "react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { publicApi } from "@/lib/api";
import { generateBlogSchema, generateTenantMetadata } from "@/lib/seo";
import { formatDate, sanitizeHtml } from "@/lib/utils";
import { ArrowLeft, ArrowRight } from "lucide-react";

interface PageProps {
  params: Promise<{ slug: string; blogSlug: string }>;
}

export async function generateMetadata(props: PageProps) {
  const { slug, blogSlug } = await props.params;
  try {
    const [data, blog] = await Promise.all([
      publicApi.getWebsiteData(slug),
      publicApi.getBlogBySlug(slug, blogSlug),
    ]);
    return generateTenantMetadata({
      company: data.company,
      profile: data.profile,
      pageTitle: blog.seo_title || blog.title,
      pageDescription: blog.seo_description || blog.short_description || undefined,
      canonicalPath: `/${slug}/blog/${blogSlug}`,
      image: blog.featured_image,
    });
  } catch {
    return { title: "Blog Article" };
  }
}

export default async function BlogDetailPage(props: PageProps) {
  const { slug, blogSlug } = await props.params;

  let websiteData;
  let blog;

  try {
    [websiteData, blog] = await Promise.all([
      publicApi.getWebsiteData(slug),
      publicApi.getBlogBySlug(slug, blogSlug),
    ]);
  } catch {
    notFound();
  }

  const { company, profile, blogs } = websiteData;
  const businessName = profile?.company_name || company.name;

  const jsonLd = generateBlogSchema(blog, company, profile);

  const defaultBlogCover =
    "https://images.unsplash.com/photo-1512290900672-1f028479e491?auto=format&fit=crop&w=1200&q=85";

  const relatedArticles = (blogs || [])
    .filter((b) => b.id !== blog.id)
    .slice(0, 3);

  const cleanContent = sanitizeHtml(blog.full_content);

  return (
    <article className="bg-white min-h-screen py-16 lg:py-24">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        {/* Back Link */}
        <Link
          href={`/${slug}/blog`}
          className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-black hover:text-neutral-500 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Journal</span>
        </Link>

        {/* Title & Metadata */}
        <header className="space-y-4">
          {blog.published_date && (
            <p className="text-xs font-mono text-neutral-400">
              {formatDate(blog.published_date)}
            </p>
          )}

          <h1 className="font-sans text-3xl sm:text-5xl font-extrabold uppercase tracking-tight text-black leading-tight">
            {blog.title}
          </h1>

          {blog.author && (
            <div className="pt-2 text-xs text-neutral-500 uppercase tracking-wider font-sans border-b border-black/10 pb-6">
              Written by <span className="text-black font-bold">{blog.author}</span> • Published for {businessName}
            </div>
          )}
        </header>

        {/* Featured Image */}
        <div className="relative aspect-16/10 w-full overflow-hidden bg-neutral-100 border border-black/10">
          <Image
            src={blog.featured_image || defaultBlogCover}
            alt={blog.title}
            fill
            priority
            sizes="(max-width: 1024px) 100vw, 896px"
            className="object-cover"
          />
        </div>

        {/* Short Description Lead */}
        {blog.short_description && (
          <p className="text-base sm:text-lg font-sans font-medium text-black leading-relaxed border-l-2 border-black pl-6 py-1">
            {blog.short_description}
          </p>
        )}

        {/* Article Body */}
        <div
          className="prose prose-neutral max-w-none text-neutral-800 leading-relaxed text-sm sm:text-base space-y-5 pt-4 font-sans"
          dangerouslySetInnerHTML={{ __html: cleanContent }}
        />

        {/* Editorial Consultation Callout Banner */}
        <div className="p-8 sm:p-12 bg-[#35251D] text-white flex flex-col sm:flex-row items-center justify-between gap-8 my-16">
          <div className="space-y-2 text-center sm:text-left">
            <h3 className="font-sans text-xl font-bold uppercase tracking-tight text-white">
              Inspired by this ritual?
            </h3>
            <p className="text-xs text-[#E8DED1] max-w-md leading-relaxed">
              Book a bespoke skin analysis and treatment consultation with our specialists at {businessName}.
            </p>
          </div>
          <Link
            href={`/${slug}/contact`}
            className="inline-flex items-center gap-2 px-8 py-3.5 bg-white text-black text-xs font-bold uppercase tracking-widest hover:bg-neutral-100 transition-colors whitespace-nowrap"
          >
            <span>Book Consultation</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Related Articles */}
        {relatedArticles.length > 0 && (
          <div className="pt-16 border-t border-black/10 space-y-8">
            <h3 className="font-sans text-xl font-bold uppercase tracking-wider text-black">
              More Editorial Research
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {relatedArticles.map((rel) => (
                <Link
                  key={rel.id}
                  href={`/${slug}/blog/${rel.slug}`}
                  className="group block space-y-3"
                >
                  <div className="relative aspect-4/3 w-full overflow-hidden bg-neutral-100 border border-black/10">
                    <Image
                      src={rel.featured_image || defaultBlogCover}
                      alt={rel.title}
                      fill
                      sizes="33vw"
                      className="object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                  </div>
                  <h4 className="font-sans text-xs font-bold uppercase tracking-wide text-black group-hover:text-neutral-600 transition-colors line-clamp-2">
                    {rel.title}
                  </h4>
                  <span className="text-[10px] font-mono text-neutral-400 block">
                    {formatDate(rel.published_date)}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </article>
  );
}
