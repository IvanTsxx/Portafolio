"use client";

import { Dialog } from "@base-ui/react/dialog";
import { useEffect, useMemo, useRef } from "react";
import type { ReactNode } from "react";

import type { DossierFile } from "@/components/profile/dossier-file";
import { FileModal } from "@/components/profile/file-modal";

import { opensElsewhere } from "./opens-elsewhere";

const fileLinkOf = (target: EventTarget | null) =>
  target instanceof Element
    ? target.closest<HTMLAnchorElement>("a[data-file]")
    : null;

export const RepositoryFiles = ({
  children,
  files,
}: {
  children: ReactNode;
  files: readonly DossierFile[];
}) => {
  const root = useRef<HTMLDivElement>(null);
  const handle = useMemo(() => Dialog.createHandle<DossierFile>(), []);

  useEffect(() => {
    const element = root.current;
    if (!element) {
      return;
    }
    const open = (event: MouseEvent) => {
      if (event.defaultPrevented || opensElsewhere(event)) {
        return;
      }
      const file = files[Number(fileLinkOf(event.target)?.dataset.file)];
      if (!file) {
        return;
      }
      event.preventDefault();
      handle.openWithPayload(file);
    };
    element.addEventListener("click", open);
    return () => element.removeEventListener("click", open);
  }, [files, handle]);

  return (
    <>
      <div ref={root}>{children}</div>
      <FileModal handle={handle} />
    </>
  );
};
