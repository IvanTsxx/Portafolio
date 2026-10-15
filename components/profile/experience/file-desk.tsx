"use client";

import { Dialog } from "@base-ui/react/dialog";
import { createContext, use, useMemo } from "react";
import type { ReactNode } from "react";

import type { DossierFile } from "@/components/profile/dossier-file";
import { FileModal } from "@/components/profile/file-modal";
import type { FileModalHandle } from "@/components/profile/file-modal";

const DeskHandle = createContext<FileModalHandle | undefined>(undefined);

export const FileDesk = ({ children }: { children: ReactNode }) => {
  const handle = useMemo(() => Dialog.createHandle<DossierFile>(), []);
  return (
    <DeskHandle value={handle}>
      {children}
      <FileModal handle={handle} />
    </DeskHandle>
  );
};

export const OpenFile = ({
  children,
  className,
  file,
  label,
}: {
  children: ReactNode;
  className?: string;
  file: DossierFile;
  label?: string;
}) => (
  <Dialog.Trigger
    aria-label={label}
    className={className}
    handle={use(DeskHandle)}
    payload={file}
  >
    {children}
  </Dialog.Trigger>
);
