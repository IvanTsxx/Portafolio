import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Calendar } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { getPosts } from "@/app/actions/posts";
import { getCategories } from "@/app/actions/taxonamy";
import { ListFilters } from "@/components/list-filters";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = {
  title: "Blog",
  description:
    "Artículos y reflexiones sobre desarrollo web, tecnología y programación por Iván Bongiovanni.",
};

const sortOptions = [
  { value: "recent", label: "Más recientes" },
  { value: "oldest", label: "Más antiguos" },
];

interface BlogPageProps {
  searchParams: Promise<{ category?: string; sort?: string }>;
}

export default async function BlogPage({ searchParams }: BlogPageProps) {
  const params = await searchParams;
  const [allPosts, categories] = await Promise.all([
    getPosts(true),
    getCategories(),
  ]);

  // Filter by category
  let posts = allPosts;
  if (params.category) {
    posts = posts.filter((p) => p.category?.slug === params.category);
  }

  // Sort
  const sortValue = params.sort || "recent";
  if (sortValue === "oldest") {
    posts = [...posts].sort(
      (a, b) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
    );
  }

  return (
    <main className="min-h-screen">
      <section className="mx-auto max-w-7xl px-4 py-20 lg:px-8 lg:py-28">
        <div className="space-y-12">
          {/* Header */}
          <div className="space-y-4 text-center">
            <h1 className="font-semibold text-4xl text-foreground tracking-tight lg:text-5xl">
              Blog
            </h1>
            <p className="mx-auto max-w-2xl text-balance text-lg text-muted-foreground">
              Artículos y reflexiones sobre desarrollo web, tecnología y
              programación
            </p>
          </div>

          {/* Filters */}
          <ListFilters
            filters={categories}
            filterKey="category"
            filterLabel="Categoría"
            sortOptions={sortOptions}
            currentFilter={params.category}
            currentSort={sortValue}
          />

          {/* Posts Grid */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <Link
                key={post.id}
                href={`/blog/${post.slug}`}
                className="group relative flex flex-col overflow-hidden rounded-2xl border border-border/30 bg-card/80 p-6 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary/20 hover:bg-card hover:shadow-xl"
              >
                {/* Date */}
                <div className="flex items-center gap-2 text-muted-foreground text-xs">
                  <Calendar className="size-3.5" />
                  <time dateTime={post.createdAt.toISOString()}>
                    {format(post.createdAt, "d 'de' MMMM, yyyy", {
                      locale: es,
                    })}
                  </time>
                </div>

                {/* Title */}
                <h2 className="mt-3 font-medium text-foreground text-lg transition-colors group-hover:text-primary">
                  {post.title}
                </h2>

                {/* Description */}
                <p className="mt-2 line-clamp-3 flex-1 text-muted-foreground text-sm leading-relaxed">
                  {post.description}
                </p>

                {/* Tags */}
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {post.category && (
                    <Badge variant="default" className="rounded-lg text-xs">
                      {post.category.name}
                    </Badge>
                  )}
                  {post.tags.slice(0, 2).map((tag) => (
                    <Badge
                      key={tag.id}
                      variant="secondary"
                      className="rounded-lg text-xs"
                    >
                      {tag.name}
                    </Badge>
                  ))}
                  {post.tags.length > 2 && (
                    <Badge variant="secondary" className="rounded-lg text-xs">
                      +{post.tags.length - 2}
                    </Badge>
                  )}
                </div>
              </Link>
            ))}
          </div>

          {posts.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <p className="text-muted-foreground text-xl">
                No hay artículos que coincidan con los filtros.
              </p>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
