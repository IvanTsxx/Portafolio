"use client";

import { Download, Eye, X } from "lucide-react";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

interface DownloadCVButtonProps {
  cvUrl?: string;
  fileName?: string;
}

export function DownloadCVButton({
  cvUrl = "/CV.pdf",
  fileName = "CV.pdf",
}: DownloadCVButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  const handleDownload = () => {
    const link = document.createElement("a");
    link.href = cvUrl;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <>
      <button
        className="not-prose inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-fd-border px-3.5 py-1.5 font-medium text-fd-muted-foreground text-sm transition-colors hover:bg-fd-secondary hover:text-fd-foreground"
        onClick={() => setIsOpen(true)}
        type="button"
      >
        <Eye className="h-3.5 w-3.5" />
        Ver y Descargar CV
      </button>

      {mounted &&
        isOpen &&
        createPortal(
          <div className="fade-in fixed inset-0 z-50 flex animate-in items-center justify-center bg-black/60 p-4 backdrop-blur-sm duration-200">
            <div
              aria-modal="true"
              className="zoom-in-95 relative flex h-[90vh] w-full max-w-5xl animate-in flex-col overflow-hidden rounded-xl border border-fd-border bg-fd-card shadow-2xl duration-200"
              role="dialog"
            >
              <div className="flex items-center justify-between border-fd-border border-b px-4 py-3">
                <h3 className="font-semibold text-lg">Vista Previa del CV</h3>
                <div className="flex items-center gap-2">
                  <button
                    className="inline-flex items-center gap-1.5 rounded-lg bg-fd-primary px-3 py-1.5 font-medium text-fd-primary-foreground text-sm transition-colors hover:bg-fd-primary/90"
                    onClick={handleDownload}
                    type="button"
                  >
                    <Download className="h-3.5 w-3.5" />
                    Descargar
                  </button>
                  <button
                    aria-label="Cerrar"
                    className="rounded-lg p-1.5 text-fd-muted-foreground transition-colors hover:bg-fd-secondary hover:text-fd-foreground"
                    onClick={() => setIsOpen(false)}
                    type="button"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-hidden bg-fd-secondary/20 p-4">
                <iframe
                  className="h-full w-full rounded-lg border border-fd-border bg-white"
                  src={`${cvUrl}#toolbar=0`}
                  title="CV Preview"
                />
              </div>
            </div>

            <div
              className="absolute inset-0 -z-10"
              onClick={() => setIsOpen(false)}
            />
          </div>,
          document.body
        )}
    </>
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
