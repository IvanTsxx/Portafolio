"use client";

import { Dialog } from "@base-ui/react/dialog";
import { BookBookmarkIcon, GitForkIcon, StarIcon } from "@phosphor-icons/react";
import { cva } from "class-variance-authority";
import type { MouseEvent } from "react";

import type { DossierFile } from "@/components/profile/dossier-file";
import { FileModal, FileTrigger } from "@/components/profile/file-modal";
import type { FileModalHandle } from "@/components/profile/file-modal";
import { FileTip, FileTipProvider } from "@/components/profile/file-tip";

import type { RepositorySpecimen } from "./repositories";

const repositoryFiles = Dialog.createHandle<DossierFile>();

const swatchVariants = cva("border-ink size-2 shrink-0 border", {
  variants: {
    tone: {
      graphite: "bg-graphite",
      hollow: "bg-paper",
      ink: "bg-ink",
      mist: "bg-mist",
    },
  },
});

const opensInNewTab = (event: MouseEvent) =>
  event.metaKey || event.ctrlKey || event.shiftKey || event.button !== 0;

const RepositoryCard = ({
  modal,
  specimen,
}: {
  modal: FileModalHandle;
  specimen: RepositorySpecimen;
}) => (
  <li className="border-rule min-w-0 border-r border-b" data-build-block>
    <FileTip
      content="Click opens the file · ⌘ or Ctrl click opens GitHub"
      size="hint"
    >
      <FileTrigger
        aria-label={`${specimen.spoken}. Open file.`}
        className="group/ink after:border-ink after:ease-out-quart relative flex h-full min-h-44 flex-col gap-3 p-4 after:pointer-events-none after:absolute after:-inset-px after:z-10 after:border after:opacity-0 after:transition-opacity after:duration-150 hover:after:opacity-100 focus-visible:-outline-offset-4 focus-visible:after:opacity-100 data-popup-open:after:opacity-100"
        handle={modal}
        nativeButton={false}
        onClick={(event) => {
          if (opensInNewTab(event)) {
            event.preventBaseUIHandler();
            return;
          }
          event.preventDefault();
        }}
        payload={specimen.file}
        render={({ children, ...props }) => (
          <a {...props} href={specimen.url} rel="noreferrer" target="_blank">
            {children}
          </a>
        )}
      >
        <span className="flex items-start justify-between gap-3">
          <span className="flex min-w-0 items-center gap-2 font-mono text-sm">
            <BookBookmarkIcon
              aria-hidden
              className="text-graphite size-4 shrink-0"
            />
            <span className="min-w-0 truncate">
              <span className="text-mist">{specimen.owner}/</span>
              <span className="text-ink ink-underline">{specimen.name}</span>
            </span>
          </span>
          <span className="label border-rule-strong text-graphite shrink-0 border px-1.5 py-0.5">
            {specimen.visibility}
          </span>
        </span>
        <span className="text-graphite line-clamp-2 text-sm text-pretty">
          {specimen.description ?? "No description."}
        </span>
        {specimen.topics.length > 0 ? (
          <span className="flex flex-wrap gap-1.5">
            {specimen.topics.map((topic) => (
              <span
                className="label border-rule text-graphite border px-1.5 py-0.5"
                key={topic}
              >
                {topic}
              </span>
            ))}
            {specimen.topicsLeft > 0 ? (
              <span className="label text-mist px-1 py-0.5 tabular-nums">
                +{specimen.topicsLeft}
              </span>
            ) : null}
          </span>
        ) : null}
        <span className="label text-graphite mt-auto flex flex-wrap items-center gap-x-4 gap-y-1 tabular-nums">
          <span className="flex items-center gap-1.5">
            <span
              aria-hidden
              className={swatchVariants({ tone: specimen.swatch })}
            />
            <span className="text-ink">{specimen.language}</span>
          </span>
          <span className="flex items-center gap-1">
            <StarIcon aria-hidden className="size-3" />
            {specimen.stars}
          </span>
          <span className="flex items-center gap-1">
            <GitForkIcon aria-hidden className="size-3" />
            {specimen.forks}
          </span>
          <span className="text-mist">Pushed {specimen.pushed}</span>
        </span>
      </FileTrigger>
    </FileTip>
  </li>
);

export const RepositoryGrid = ({
  specimens,
}: {
  specimens: readonly RepositorySpecimen[];
}) => (
  <FileTipProvider>
    <ul className="border-rule grid grid-cols-1 border-t border-l sm:grid-cols-2">
      {specimens.map((specimen) => (
        <RepositoryCard
          key={specimen.id}
          modal={repositoryFiles}
          specimen={specimen}
        />
      ))}
    </ul>
    <FileModal handle={repositoryFiles} />
  </FileTipProvider>
);
