import NextImage from "next/image";
import {
  GithubIcon,
  GmailIcon,
  LinkedinIcon,
  XTwitterIcon,
} from "@/components/icons";

interface HeroProps {
  name?: string;
  role?: string;

  description?: string;
  available?: boolean;
}

export function Hero({
  name = "Ivan Bongiovanni",
  role = "Full Stack Developer",

  description = "Especializado en Next.js y React. Construyo aplicaciones web rápidas, escalables y orientadas al negocio.",
  available = true,
}: HeroProps) {
  return (
    <section className="not-prose fade-in slide-in-from-bottom-8 mb-8 animate-in border-fd-border border-b pb-8 duration-1000">
      <div className="flex flex-col gap-5">
        {/* Avatar + Badge row */}
        <div className="flex items-center gap-4">
          <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-2xl shadow-brand/10 shadow-lg ring-2 ring-brand/20 ring-offset-2 ring-offset-fd-background sm:h-20 sm:w-20">
            <NextImage
              alt={`${name} avatar`}
              className="h-full w-full object-cover"
              height={80}
              src="/avatar.webp"
              width={80}
            />
          </div>
          <div className="flex flex-col gap-1">
            {available && (
              <span className="fade-in zoom-in inline-flex w-fit animate-in items-center gap-1.5 rounded-md border border-brand/30 bg-brand/10 px-2.5 py-0.5 font-medium text-brand text-xs delay-100 duration-700">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-brand" />
                </span>
                Disponible para trabajar
              </span>
            )}
            <h1 className="fade-in slide-in-from-bottom-4 animate-in font-extrabold text-3xl text-fd-foreground tracking-tight delay-200 duration-700 sm:text-4xl">
              {name}
            </h1>
            <p className="fade-in slide-in-from-bottom-4 animate-in font-medium text-brand text-lg delay-300 duration-700">
              {role}
            </p>
          </div>
        </div>

        <p className="fade-in slide-in-from-bottom-4 max-w-2xl animate-in text-fd-muted-foreground text-lg leading-relaxed delay-400 duration-700">
          {description}
        </p>

        <div className="fade-in slide-in-from-bottom-4 flex animate-in flex-wrap items-center gap-x-6 gap-y-3 text-fd-muted-foreground text-sm delay-500 duration-700">
          <a
            className="inline-flex items-center gap-1.5 underline-offset-4 transition-colors hover:text-brand hover:underline"
            href="mailto:contacto@ivanbongiovanni.com"
          >
            <GmailIcon className="h-4 w-4" />
            Contactar
          </a>
          <a
            className="inline-flex items-center gap-1.5 underline-offset-4 transition-colors hover:text-brand hover:underline"
            href="https://github.com/IvanTsxx"
            rel="noopener noreferrer"
            target="_blank"
          >
            <GithubIcon className="h-4 w-4" />
            GitHub
          </a>
          <a
            className="inline-flex items-center gap-1.5 underline-offset-4 transition-colors hover:text-brand hover:underline"
            href="https://www.linkedin.com/in/bongiovanni-ivan45"
            rel="noopener noreferrer"
            target="_blank"
          >
            <LinkedinIcon className="h-4 w-4" />
            LinkedIn
          </a>
          <a
            className="inline-flex items-center gap-1.5 underline-offset-4 transition-colors hover:text-brand hover:underline"
            href="https://x.com/IvanTsxx"
            rel="noopener noreferrer"
            target="_blank"
          >
            <XTwitterIcon className="h-4 w-4" />
            Twitter
          </a>
        </div>
      </div>
    </section>
  );
}
