import { Download } from "lucide-react";

interface DownloadCVButtonProps {
  cvUrl?: string;
  fileName?: string;
}

export function DownloadCVButton({
  cvUrl = "/CV.pdf",
  fileName = "CV.pdf",
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
  cvUrl?: string;
}

export function CVSection({ cvUrl }: CVSectionProps) {
  return (
    <div className="not-prose flex items-start gap-3 rounded-xl border border-fd-border bg-fd-card p-5">
      <div className="flex-1">
        <DownloadCVButton cvUrl={cvUrl} />
      </div>
    </div>
  );
}
