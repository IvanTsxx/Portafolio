"use client";

import { ArrowLeft, Home, Search } from "lucide-react";
import Link from "next/link";

export default function NotFoundPage() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-6 py-20">
      <div className="max-w-lg text-center">
        {/* 404 Display */}
        <div className="mb-8">
          <span className="bg-linear-to-br from-primary to-primary/50 bg-clip-text font-bold text-8xl text-transparent">
            404
          </span>
        </div>

        <h1 className="mb-4 font-bold text-2xl">Página no encontrada</h1>
        <p className="mb-8 text-muted-foreground">
          La página que estás buscando no existe o ha sido movida. Revisa la URL
          o navega a otra sección.
        </p>

        {/* Quick Links */}
        <div className="flex flex-wrap justify-center gap-3">
          <Link
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            href="/"
          >
            <Home className="h-4 w-4" />
            Ir al inicio
          </Link>
          <Link
            className="inline-flex items-center gap-2 rounded-lg border border-border px-5 py-2.5 font-medium transition-colors hover:bg-accent"
            href="/projects"
          >
            <Search className="h-4 w-4" />
            Ver proyectos
          </Link>
        </div>

        {/* Back Link */}
        <div className="mt-8">
          <button
            className="inline-flex items-center gap-2 text-muted-foreground text-sm transition-colors hover:text-foreground"
            onClick={() => window.history.back()}
            type="button"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver atrás
          </button>
        </div>
      </div>
    </div>
  );
}
