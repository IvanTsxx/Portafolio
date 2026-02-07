import {
  Briefcase,
  Code,
  FileText,
  FolderKanban,
  FolderTree,
  LayoutDashboard,
  LogOut,
  Tags,
} from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import type React from "react";
import { Button } from "@/components/ui/button";
import { getSession } from "@/lib/dal";

const navigation = [
  { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { name: "Posts", href: "/admin/posts", icon: FileText },
  { name: "Proyectos", href: "/admin/projects", icon: FolderKanban },
  { name: "Experiencia", href: "/admin/experiences", icon: Briefcase },
  { name: "Categorías", href: "/admin/categories", icon: FolderTree },
  { name: "Tags", href: "/admin/tags", icon: Tags },
  { name: "Tecnologías", href: "/admin/technologies", icon: Code },
];

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="sticky top-0 hidden h-screen w-64 flex-col border-border/40 border-r bg-background lg:flex">
        <div className="flex h-16 items-center border-border/40 border-b px-6">
          <Link href="/admin" className="font-bold text-lg">
            Admin Panel
          </Link>
        </div>

        <nav className="flex-1 space-y-1 p-4">
          {navigation.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                href={item.href}
                className="flex items-center gap-3 rounded-lg px-3 py-2 font-medium text-muted-foreground text-sm transition-colors hover:bg-muted hover:text-foreground"
              >
                <Icon className="size-5" />
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="border-border/40 border-t p-4">
          <form action="/api/auth/signout" method="POST">
            <Button
              type="submit"
              variant="ghost"
              className="w-full justify-start"
            >
              <LogOut className="mr-3 size-5" />
              Cerrar sesión
            </Button>
          </form>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1">
        <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-border/40 border-b bg-background/80 px-6 backdrop-blur-md">
          <div>
            <h2 className="font-semibold text-lg">Panel de Administración</h2>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="outline" size="sm">
                Ver sitio
              </Button>
            </Link>
          </div>
        </header>
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}
