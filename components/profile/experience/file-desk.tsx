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
  file,
  label,
  ...trigger
}: Omit<Dialog.Trigger.Props<DossierFile>, "handle" | "payload"> & {
  children: ReactNode;
  file: DossierFile;
  label?: string;
}) => (
  <Dialog.Trigger
    {...trigger}
    aria-label={label}
    handle={use(DeskHandle)}
    payload={file}
  >
    {children}
  </Dialog.Trigger>
);
