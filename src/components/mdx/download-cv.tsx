"use client";

import { Download, Eye } from "lucide-react";
import type { ReactElement } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface DownloadCVButtonProps {
  cvUrl?: string;
  fileName?: string;
  children?: ReactElement;
}

export function DownloadCVButton({
  cvUrl = "/CV.pdf",
  fileName = "CV.pdf",
  children,
}: DownloadCVButtonProps) {
  const handleDownload = () => {
    const link = document.createElement("a");
    link.href = cvUrl;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Dialog>
      <DialogTrigger
        render={
          children || (
            <button
              className="not-prose inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-fd-border px-3.5 py-1.5 font-medium text-fd-muted-foreground text-sm transition-colors hover:bg-fd-secondary hover:text-fd-foreground"
              type="button"
            >
              <Eye className="h-3.5 w-3.5" />
              Ver y Descargar CV
            </button>
          )
        }
      />
      <DialogContent className="flex h-[90vh] flex-col gap-0 overflow-hidden p-0 md:max-w-5xl">
        <DialogHeader className="border-fd-border border-b bg-fd-card p-4">
          <div className="mr-8 flex items-center justify-between">
            <DialogTitle>Vista Previa del CV</DialogTitle>
            <button
              className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg bg-fd-primary px-3 py-1.5 font-medium text-fd-primary-foreground text-sm transition-colors hover:bg-fd-primary/90"
              onClick={handleDownload}
              type="button"
            >
              <Download className="h-3.5 w-3.5" />
              Descargar
            </button>
          </div>
        </DialogHeader>
        <div className="h-full flex-1 overflow-hidden bg-fd-secondary/20 p-4">
          <iframe
            className="h-full w-full rounded-lg border border-fd-border bg-white"
            src={`${cvUrl}#toolbar=0`}
            title="CV Preview"
          />
        </div>
      </DialogContent>
    </Dialog>
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
