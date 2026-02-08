import { format } from "date-fns";
import { es } from "date-fns/locale";
import { ArrowLeft, Calendar } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getPost, getPosts } from "@/app/actions/posts";
import { MDXRenderer } from "@/components/mdx-renderer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface BlogPostPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const posts = await getPosts({ limit: 100 });
  return posts.map((post) => ({
    slug: post.slug,
  }));
}

export async function generateMetadata({
  params,
}: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);

  if (!post) {
    return {
      title: "Artículo no encontrado",
    };
  }

  const publishedAt = post.createdAt.toISOString();
  const modifiedAt = post.updatedAt.toISOString();
  const authors = ["Iván Bongiovanni"];

  return {
    title: post.title,
    description: post.description,
    keywords: post.tags.map((tag) => tag.name),
    alternates: {
      canonical: `https://ivantsx.dev/blog/${post.slug}`,
    },
    authors: authors.map((author) => ({ name: author })),
    openGraph: {
      title: post.title,
      description: post.description || "",
      type: "article",
      publishedTime: publishedAt,
      modifiedTime: modifiedAt,
      authors: authors,
      url: `https://ivantsx.dev/blog/${post.slug}`,
      siteName: "Iván Bongiovanni",
      images: post.coverImage ? [post.coverImage] : [],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.description || "",
      images: post.coverImage ? [post.coverImage] : [],
    },
  };
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const post = await getPost(slug);

  if (!post || !post.published) {
    notFound();
  }

  return (
    <main className="min-h-screen">
      <article className="relative mx-auto max-w-4xl px-4 py-20 lg:px-8">
        <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute top-1/5 right-0 h-[200px] w-[200px] -translate-y-1/2 rounded-full bg-linear-to-tr from-primary/60 via-primary/40 to-transparent blur-3xl" />
        </div>
        <div className="space-y-8">
          <div className="space-y-4">
            <Button
              variant="ghost"
              size="sm"
              nativeButton={false}
              render={
                <Link href="/blog">
                  <ArrowLeft className="mr-2 size-4" />
                  Volver al blog
                </Link>
              }
            />

            <div className="flex items-center gap-2 text-muted-foreground text-sm">
              <Calendar className="size-4" />
              <time dateTime={post.createdAt.toISOString()}>
                {format(post.createdAt, "d 'de' MMMM, yyyy", { locale: es })}
              </time>
            </div>

            <h1 className="font-bold text-4xl text-foreground tracking-tight lg:text-5xl">
              {post.title}
            </h1>

            <p className="text-muted-foreground text-xl">{post.description}</p>

            <div className="flex flex-wrap items-center gap-2">
              {post.category && (
                <Badge variant="default">{post.category.name}</Badge>
              )}
              {post.tags.map((tag) => (
                <Badge key={tag.id} variant="secondary">
                  {tag.name}
                </Badge>
              ))}
            </div>
          </div>

          {/*   {post.coverImage && (
            <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-muted shadow-lg">
              <img
                src={post.coverImage || "/placeholder.svg"}
                alt={post.title}
                className="size-full object-cover"
              />
            </div>
          )} */}

          <div className="prose prose-slate max-w-none">
            <MDXRenderer content={post.content} />
          </div>
        </div>
      </article>
    </main>
  );
}
