import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Calendar } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { getPosts } from "@/app/actions/posts";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Blog",
  description:
    "Artículos y reflexiones sobre desarrollo web, tecnología y programación por Iván Bongiovanni.",
};

export default async function BlogPage() {
  const posts = await getPosts(true);

  return (
    <main className="min-h-screen">
      <section className="mx-auto max-w-7xl px-4 py-20 lg:px-8">
        <div className="space-y-12">
          <div className="space-y-4 text-center">
            <h1 className="font-bold text-4xl text-foreground tracking-tight lg:text-5xl">
              Blog
            </h1>
            <p className="mx-auto max-w-2xl text-balance text-lg text-muted-foreground">
              Artículos y reflexiones sobre desarrollo web, tecnología y
              programación
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <Card
                key={post.id}
                className="group flex flex-col transition-all hover:shadow-lg hover:shadow-primary/10"
              >
                {/*  {post.coverImage && (
                  <div className="relative aspect-video w-full overflow-hidden rounded-t-lg bg-muted">
                    <img
                      src={post.coverImage || "/placeholder.svg"}
                      alt={post.title}
                      className="size-full object-cover transition-transform group-hover:scale-105"
                    />
                  </div>
                )} */}
                <CardHeader>
                  <div className="flex items-center gap-2 text-muted-foreground text-sm">
                    <Calendar className="size-4" />
                    <time dateTime={post.createdAt.toISOString()}>
                      {format(post.createdAt, "d 'de' MMMM, yyyy", {
                        locale: es,
                      })}
                    </time>
                  </div>
                  <CardTitle className="line-clamp-2">
                    <Link
                      href={`/blog/${post.slug}`}
                      className="hover:text-primary"
                    >
                      {post.title}
                    </Link>
                  </CardTitle>
                  <CardDescription className="line-clamp-3">
                    {post.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-1 flex-col justify-end gap-4">
                  <div className="flex flex-wrap gap-2">
                    {post.category && (
                      <Badge variant="default">{post.category.name}</Badge>
                    )}
                    {post.tags.slice(0, 3).map((tag) => (
                      <Badge key={tag.id} variant="secondary">
                        {tag.name}
                      </Badge>
                    ))}
                    {post.tags.length > 3 && (
                      <Badge variant="secondary">+{post.tags.length - 3}</Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {posts.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <p className="text-muted-foreground text-xl">
                No hay artículos publicados aún.
              </p>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
