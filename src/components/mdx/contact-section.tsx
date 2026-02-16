import { Mail } from "lucide-react";
import { GithubIcon, LinkedInIcon, XIcon } from "@/components/icons";

interface ContactSectionProps {
  title?: string;
  subtitle?: string;
}

const email = "bongiovannidev@gmail.com";
const github = "https://github.com/IvanTsxx";
const linkedin = "https://www.linkedin.com/in/bongiovanni-ivan45";
const x = "https://x.com/ivantsxx";

export function ContactSection({
  title = "¿Trabajamos juntos?",
  subtitle = "Estoy disponible para proyectos freelance y oportunidades full-time. Si buscás un developer que entregue valor desde el día uno, hablemos.",
}: ContactSectionProps) {
  return (
    <div className="not-prose mt-2 rounded-xl border border-fd-border bg-fd-card p-6">
      <h3 className="font-semibold text-fd-foreground text-lg">{title}</h3>
      <p className="mt-1.5 text-fd-muted-foreground text-sm">{subtitle}</p>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <a
          className="inline-flex items-center gap-1.5 rounded-lg bg-brand px-4 py-2 font-medium text-brand-foreground text-sm transition-colors hover:bg-brand/90"
          href={`mailto:${email}`}
        >
          <Mail className="h-3.5 w-3.5" />
          Enviar email
        </a>

        <a
          className="inline-flex items-center gap-1.5 rounded-lg border border-fd-border px-4 py-2 font-medium text-fd-muted-foreground text-sm transition-colors hover:bg-fd-secondary hover:text-fd-foreground"
          href={github}
          rel="noopener noreferrer"
          target="_blank"
        >
          <GithubIcon className="h-3.5 w-3.5" />
          GitHub
        </a>

        {linkedin && (
          <a
            className="inline-flex items-center gap-1.5 rounded-lg border border-fd-border px-4 py-2 font-medium text-fd-muted-foreground text-sm transition-colors hover:bg-fd-secondary hover:text-fd-foreground"
            href={linkedin}
            rel="noopener noreferrer"
            target="_blank"
          >
            <LinkedInIcon className="h-3.5 w-3.5" />
            LinkedIn
          </a>
        )}

        {x && (
          <a
            className="inline-flex items-center gap-1.5 rounded-lg border border-fd-border px-4 py-2 font-medium text-fd-muted-foreground text-sm transition-colors hover:bg-fd-secondary hover:text-fd-foreground"
            href={x}
            rel="noopener noreferrer"
            target="_blank"
          >
            <XIcon className="h-3.5 w-3.5" />X
          </a>
        )}
      </div>
    </div>
  );
}
