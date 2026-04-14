import type { Route } from "next";
import Link from "next/link";

import { SITE } from "@/shared/config/site";

import { Icons } from "./icons";
import { Button } from "./ui/button";

const socialLinks = [
  {
    href: SITE.github,
    icon: Icons.Github,
    label: "GitHub",
  },
  {
    href: SITE.twitter,
    icon: Icons.Twitter,
    label: "Twitter",
  },
  {
    href: SITE.linkedin,
    icon: Icons.Linkedin,
    label: "LinkedIn",
  },
];

const inspiredByLinks = [
  {
    href: "https://tailwindcss.com",
    label: "tailwindcss.com",
  },
  {
    href: "https://ui.shadcn.com",
    label: "ui.shadcn.com",
  },
  {
    href: "https://vercel.com",
    label: "vercel.com",
  },
  {
    href: "https://chanhdai.com",
    label: "chanhdai.com",
  },
  {
    href: "https://www.kartikk.tech",
    label: "kartikk.tech",
  },
];

export function Footer() {
  return (
    <footer className="border-t border-border bg-background/85 dark:bg-transparent max-w-3xl mx-auto">
      <div className="mx-auto flex max-w-4xl flex-col items-center justify-center gap-4 px-4 py-10 text-center md:px-6">
        <p className="max-w-md text-sm text-muted-foreground">
          Inspired by{" "}
          {inspiredByLinks.map((link, index) => (
            <Link
              prefetch={false}
              key={link.label}
              href={link.href}
              target="_blank"
              rel="noopener"
              className="underline underline-offset-4 hover:text-brand-green"
            >
              {link.label}
              {index !== inspiredByLinks.length - 1 && " / "}
            </Link>
          ))}
        </p>

        <p className="text-sm text-muted-foreground">
          Built by{" "}
          <Link
            href="https://github.com/IvanTsxx"
            target="_blank"
            rel="noopener"
            className="font-medium underline underline-offset-4 hover:text-brand-green"
          >
            Ivan Bongiovanni
          </Link>
          . The source code is available on{" "}
          <Link
            href="https://github.com/ivantsxx/portafolio"
            target="_blank"
            rel="noopener"
            className="font-medium underline underline-offset-4 hover:text-brand-green"
          >
            GitHub
          </Link>
          .
        </p>

        <div className="flex items-center gap-1">
          {socialLinks.map((link) => (
            <Button
              key={link.href}
              variant="ghost"
              size="icon"
              nativeButton={false}
              render={
                <Link
                  href={link.href as Route}
                  target={link.href.startsWith("http") ? "_blank" : undefined}
                  rel={
                    link.href.startsWith("http")
                      ? "noopener noreferrer"
                      : undefined
                  }
                  aria-label={link.label}
                />
              }
            >
              <link.icon className="size-4" />
            </Button>
          ))}
        </div>
      </div>
    </footer>
  );
}
