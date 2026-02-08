import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Eye, EyeOff, Plus } from "lucide-react";
import Link from "next/link";
import { getPosts } from "@/app/actions/posts";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function AdminPostsPage() {
  const posts = await getPosts(false);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-bold text-3xl tracking-tight">Posts</h1>
          <p className="text-muted-foreground">
            Administra los artículos de tu blog
          </p>
        </div>
        <Button
          render={
            <Link href="/admin/posts/new">
              <Plus className="mr-2 size-4" />
              Nuevo post
            </Link>
          }
        />
      </div>

      <div className="grid gap-6">
        {posts.map((post) => (
          <Card key={post.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1 space-y-2">
                  <CardTitle className="flex items-center gap-2">
                    <Link
                      href={`/admin/posts/${post.id}`}
                      className="hover:text-primary"
                    >
                      {post.title}
                    </Link>
                    {post.published ? (
                      <Badge variant="default" className="gap-1">
                        <Eye className="size-3" />
                        Publicado
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="gap-1">
                        <EyeOff className="size-3" />
                        Borrador
                      </Badge>
                    )}
                  </CardTitle>
                  <p className="text-muted-foreground text-sm">
                    {post.description}
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap items-center gap-4 text-muted-foreground text-sm">
                <span>
                  {format(post.createdAt, "d 'de' MMMM, yyyy", { locale: es })}
                </span>
                {post.category && (
                  <Badge variant="outline">{post.category.name}</Badge>
                )}
                {post.tags.slice(0, 3).map((tag) => (
                  <Badge key={tag.id} variant="secondary">
                    {tag.name}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}

        {posts.length === 0 && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-20">
              <p className="text-muted-foreground">
                No hay posts aún. Crea tu primer artículo.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
