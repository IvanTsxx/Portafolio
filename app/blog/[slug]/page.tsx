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
  const posts = await getPosts(true);
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

  return {
    title: post.title,
    description: post.description,
    openGraph: {
      title: post.title,
      description: post.description || "",
      /* images: post.coverImage ? [post.coverImage] : [], */
      type: "article",
      publishedTime: post.createdAt.toISOString(),
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
      <article className="mx-auto max-w-4xl px-4 py-20 lg:px-8">
        <div className="space-y-8">
          <div className="space-y-4">
            <Button
              variant="ghost"
              size="sm"
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
