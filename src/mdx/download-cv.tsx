import { Download, FileText } from "lucide-react";

interface DownloadCVButtonProps {
  cvUrl?: string;
  fileName?: string;
}

export function DownloadCVButton({
  cvUrl = "/cv-ivan-bongiovanni.pdf",
  fileName = "CV-Ivan-Bongiovanni.pdf",
}: DownloadCVButtonProps) {
  return (
    <a
      className="not-prose inline-flex items-center gap-1.5 rounded-lg border border-fd-border px-3.5 py-1.5 font-medium text-fd-muted-foreground text-sm transition-colors hover:bg-fd-secondary hover:text-fd-foreground"
      download={fileName}
      href={cvUrl}
    >
      <Download className="h-3.5 w-3.5" />
      Descargar CV
    </a>
  );
}

interface CVSectionProps {
  title?: string;
  description?: string;
  cvUrl?: string;
}

export function CVSection({
  title = "¿Querés mi CV?",
  description = "Descargá mi curriculum completo en PDF con toda mi experiencia, proyectos y stack tecnológico detallado.",
  cvUrl,
}: CVSectionProps) {
  return (
    <div className="not-prose flex items-start gap-3 rounded-xl border border-fd-border bg-fd-card p-5">
      <FileText className="mt-0.5 h-5 w-5 shrink-0 text-brand" />
      <div className="flex-1">
        <h3 className="font-semibold text-fd-foreground">{title}</h3>
        <p className="mt-1 text-fd-muted-foreground text-sm">{description}</p>
        <div className="mt-3">
          <DownloadCVButton cvUrl={cvUrl} />
        </div>
      </div>
    </div>
  );
}
