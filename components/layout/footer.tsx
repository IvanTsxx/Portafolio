import { Github, Linkedin, Mail } from "lucide-react";
import Link from "next/link";

const socials = [
  {
    name: "GitHub",
    href: "https://github.com/IvanTsxx",
    icon: Github,
  },
  {
    name: "LinkedIn",
    href: "https://www.linkedin.com/in/bongiovanni-ivan45",
    icon: Linkedin,
  },
  {
    name: "Email",
    href: "mailto:bongiovannidev@gmail.com",
    icon: Mail,
  },
];

export function Footer() {
  return (
    <footer className="border-border/40 border-t bg-background/80">
      <div className="mx-auto max-w-7xl px-4 py-12 lg:px-8">
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <p className="text-muted-foreground text-sm">
            © {new Date().getFullYear()} Iván Bongiovanni. Todos los derechos
            reservados.
          </p>

          <div className="flex items-center gap-4">
            {socials.map((social) => {
              const Icon = social.icon;
              return (
                <Link
                  key={social.name}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground transition-colors hover:text-foreground"
                  aria-label={social.name}
                >
                  <Icon className="size-5" />
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </footer>
  );
}
