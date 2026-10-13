"use client";

import { Dialog } from "@base-ui/react/dialog";
import { cva } from "class-variance-authority";

import type { DossierFile, FileField } from "@/components/profile/dossier-file";
import { CornerMarks } from "@/components/site/corner-marks";
import { technicalButtonVariants } from "@/components/site/styles";
import { cn } from "@/lib/utils";

export type FileModalHandle = Dialog.Handle<DossierFile>;

export const FileTrigger = Dialog.Trigger<DossierFile>;

const fileCellVariants = cva("bg-paper flex flex-col gap-1 p-4", {
  defaultVariants: { span: "half" },
  variants: {
    span: {
      full: "col-span-2",
      half: "col-span-1",
    },
  },
});

const FileCell = ({ field }: { field: FileField }) => (
  <div className={fileCellVariants({ span: field.span })}>
    <dt className="label text-mist">{field.label}</dt>
    <dd className="text-ink text-sm tabular-nums">{field.value}</dd>
  </div>
);

const FileBody = ({ file }: { file: DossierFile }) => (
  <>
    <header className="border-rule-strong flex flex-col gap-3 border-b px-6 pt-6 pb-5">
      <div className="flex items-center justify-between gap-4">
        <p className="label text-mist tabular-nums">{file.code}</p>
        <Dialog.Close
          className={technicalButtonVariants({ size: "sm", tone: "outline" })}
        >
          Close
        </Dialog.Close>
      </div>
      <Dialog.Title className="display text-ink text-4xl wrap-break-word">
        {file.title}
      </Dialog.Title>
      <Dialog.Description className="label text-graphite wrap-break-word">
        {file.kicker}
      </Dialog.Description>
    </header>
    <dl className="bg-rule border-rule grid grid-cols-2 gap-px border-b">
      {file.fields.map((field) => (
        <FileCell field={field} key={field.label} />
      ))}
    </dl>
    {file.note ? (
      <section className="border-rule flex flex-col gap-2 border-b px-6 py-5">
        <h3 className="label text-mist">{file.note.label}</h3>
        <p className="text-graphite text-base text-pretty">{file.note.text}</p>
      </section>
    ) : null}
    {file.chips ? (
      <section className="border-rule flex flex-col gap-3 border-b px-6 py-5">
        <h3 className="label text-mist">{file.chips.label}</h3>
        <ul className="flex flex-wrap gap-2">
          {file.chips.items.map((item) => (
            <li
              className="label border-rule-strong text-ink border px-2 py-1"
              key={item}
            >
              {item}
            </li>
          ))}
        </ul>
      </section>
    ) : null}
    {file.links.length > 0 ? (
      <nav
        aria-label="Links"
        className="flex flex-col gap-2 px-6 py-6 sm:flex-row sm:flex-wrap"
      >
        {file.links.map((link, index) => (
          <a
            className={technicalButtonVariants({
              tone: index === 0 ? "solid" : "outline",
            })}
            href={link.href}
            key={link.href}
            rel="noreferrer"
            target="_blank"
          >
            {link.label} ↗
          </a>
        ))}
      </nav>
    ) : null}
  </>
);

export const FileModal = ({ handle }: { handle: FileModalHandle }) => (
  <Dialog.Root handle={handle}>
    {({ payload }) => (
      <Dialog.Portal>
        <Dialog.Backdrop className="bg-paper-deep/80 ease-out-quart fixed inset-0 z-50 transition-opacity duration-250 data-ending-style:opacity-0 data-ending-style:duration-150 data-starting-style:opacity-0" />
        <Dialog.Popup
          className={cn(
            "bg-paper text-ink border-rule-strong fixed inset-x-4 top-1/2 z-50 mx-auto flex max-h-5/6 max-w-lg -translate-y-1/2 flex-col overflow-y-auto overscroll-contain border outline-none",
            "ease-out-quart transition-[scale,opacity] duration-250 data-ending-style:duration-150",
            "data-ending-style:opacity-0 data-starting-style:opacity-0",
            "motion-safe:data-ending-style:scale-98 motion-safe:data-starting-style:scale-98"
          )}
        >
          <CornerMarks />
          {payload ? <FileBody file={payload} /> : null}
        </Dialog.Popup>
      </Dialog.Portal>
    )}
  </Dialog.Root>
);
