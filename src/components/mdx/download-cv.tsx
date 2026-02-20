"use client";

import { Download, Eye } from "lucide-react";
import { type ReactElement, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface DownloadCVButtonProps {
  children?: ReactElement;
}

export function DownloadCVButton({ children }: DownloadCVButtonProps) {
  const [lang, setLang] = useState<"es" | "en">("es");

  const cvUrl = lang === "es" ? "/CV-ES.pdf" : "/CV-EN.pdf";
  const fileName = lang === "es" ? "CV-ES.pdf" : "CV-EN.pdf";

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
            <div className="flex items-center gap-4">
              <div className="flex rounded-lg bg-fd-secondary/50 p-1">
                <button
                  className={`cursor-pointer rounded-md px-3 py-1 font-medium text-xs transition-colors ${
                    lang === "es"
                      ? "bg-fd-background text-fd-foreground shadow-sm"
                      : "text-fd-muted-foreground hover:text-fd-foreground"
                  }`}
                  onClick={() => setLang("es")}
                  type="button"
                >
                  Español
                </button>
                <button
                  className={`cursor-pointer rounded-md px-3 py-1 font-medium text-xs transition-colors ${
                    lang === "en"
                      ? "bg-fd-background text-fd-foreground shadow-sm"
                      : "text-fd-muted-foreground hover:text-fd-foreground"
                  }`}
                  onClick={() => setLang("en")}
                  type="button"
                >
                  English
                </button>
              </div>
              <button
                className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg bg-fd-primary px-3 py-1.5 font-medium text-fd-primary-foreground text-sm transition-colors hover:bg-fd-primary/90"
                onClick={handleDownload}
                type="button"
              >
                <Download className="h-3.5 w-3.5" />
                Descargar
              </button>
            </div>
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

export function CVSection() {
  return (
    <div className="not-prose flex items-start gap-3 rounded-xl border border-fd-border bg-fd-card p-5">
      <div className="flex-1">
        <DownloadCVButton />
      </div>
    </div>
  );
}
