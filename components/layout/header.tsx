"use client";

import { Command, Download, Menu, Search, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const navigation = [
  { name: "Inicio", href: "/" },
  { name: "Blog", href: "/blog" },
  { name: "Proyectos", href: "/projects" },
  { name: "Experiencia", href: "/experience" },
];

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isMac, setIsMac] = useState(false);

  useEffect(() => {
    setIsMac(navigator.platform.toUpperCase().indexOf("MAC") >= 0);
  }, []);

  const openSearch = () => {
    const event = new KeyboardEvent("keydown", {
      key: "k",
      metaKey: isMac,
      ctrlKey: !isMac,
      bubbles: true,
    });
    document.dispatchEvent(event);
  };

  return (
    <header className="header-glass sticky top-0 z-50 w-full border-border/40 border-b">
      <nav className="mx-auto flex max-w-7xl items-center justify-between gap-x-6 p-4 lg:px-8">
        <div className="flex lg:flex-1">
          <Link href="/" className="-m-1.5 p-1.5">
            <span className="font-bold text-foreground text-lg tracking-tight">
              Iván Bongiovanni
            </span>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden lg:flex lg:gap-x-8">
          {navigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className="font-medium text-muted-foreground text-sm transition-colors hover:text-foreground"
            >
              {item.name}
            </Link>
          ))}
        </div>

        {/* Desktop Search Hint & Download */}
        <div className="hidden items-center gap-3 lg:flex lg:flex-1 lg:justify-end">
          {/* Search button with keyboard shortcut */}
          <button
            type="button"
            onClick={openSearch}
            className="flex items-center gap-2 rounded-md border border-border bg-muted/50 px-3 py-1.5 text-muted-foreground text-sm transition-colors hover:bg-muted hover:text-foreground"
          >
            <Search className="size-4" />
            <span>Buscar</span>
            <span className="flex items-center gap-0.5 rounded border border-border bg-background px-1.5 py-0.5 font-mono text-xs">
              {isMac ? (
                <>
                  <Command className="size-3" />
                  <span>K</span>
                </>
              ) : (
                <>
                  <span>Ctrl</span>
                  <span>+</span>
                  <span>K</span>
                </>
              )}
            </span>
          </button>

          <Button
            size="sm"
            render={
              <a href="/CV.pdf" download>
                <Download className="mr-2 size-4" />
                Descargar CV
              </a>
            }
          />
        </div>

        {/* Mobile buttons */}
        <div className="flex items-center gap-x-2 lg:hidden">
          <button
            type="button"
            onClick={openSearch}
            className="flex size-9 items-center justify-center rounded-md border border-border bg-muted/50 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <Search className="size-4" />
          </button>

          <Button
            size="sm"
            render={
              <a href="/cv.pdf" download>
                <Download className="size-4" />
              </a>
            }
          />
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X className="size-5" />
            ) : (
              <Menu className="size-5" />
            )}
          </Button>
        </div>
      </nav>

      {/* Mobile menu */}
      <div
        className={cn(
          "overflow-hidden border-border/40 border-t transition-all duration-300 ease-in-out lg:hidden",
          mobileMenuOpen ? "max-h-96" : "max-h-0",
        )}
      >
        <div className="space-y-1 px-4 pt-2 pb-4">
          {navigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className="block rounded-md px-3 py-2 font-medium text-base text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              onClick={() => setMobileMenuOpen(false)}
            >
              {item.name}
            </Link>
          ))}
        </div>
      </div>
    </header>
  );
}
