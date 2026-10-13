"use client";

import { Menu } from "@base-ui/react/menu";
import {
  ArrowUpRightIcon,
  AsteriskIcon,
  CaretDownIcon,
  CheckIcon,
  CopyIcon,
  MagnifyingGlassIcon,
  MarkdownLogoIcon,
  OpenAiLogoIcon,
  WarningIcon,
} from "@phosphor-icons/react";
import type { Icon } from "@phosphor-icons/react";
import { useEffect, useRef, useState } from "react";

import { technicalButtonVariants } from "@/components/site/styles";
import { openInTargets } from "@/lib/markdown/open-in";
import type { OpenInTargetId } from "@/lib/markdown/open-in";
import { cn } from "@/lib/utils";

type CopyStatus = "copied" | "failed" | "idle";

const statusDuration = 2000;

const triggerLabels = {
  copied: "Copied",
  failed: "Copy failed",
  idle: "Open in",
} as const satisfies Record<CopyStatus, string>;

const triggerIcons = {
  copied: CheckIcon,
  failed: WarningIcon,
  idle: CaretDownIcon,
} as const satisfies Record<CopyStatus, Icon>;

const targetIcons = {
  chatgpt: OpenAiLogoIcon,
  claude: AsteriskIcon,
  perplexity: MagnifyingGlassIcon,
} as const satisfies Record<OpenInTargetId, Icon>;

const itemClassName =
  "label text-ink data-highlighted:bg-ink data-highlighted:text-paper ease-mechanical flex min-h-11 cursor-pointer items-center gap-3 px-3 transition-colors duration-100 outline-none select-none";

const readMarkdown = async (markdownPath: string) => {
  const response = await fetch(markdownPath);
  if (!response.ok) {
    throw new Error(`${markdownPath} returned ${response.status}`);
  }
  return response.text();
};

const readMarkdownBlob = async (markdownPath: string) =>
  new Blob([await readMarkdown(markdownPath)], { type: "text/plain" });

const copyMarkdown = async (markdownPath: string) => {
  if (typeof ClipboardItem === "undefined") {
    await navigator.clipboard.writeText(await readMarkdown(markdownPath));
    return;
  }
  await navigator.clipboard.write([
    new ClipboardItem({ "text/plain": readMarkdownBlob(markdownPath) }),
  ]);
};

export const OpenInMenu = ({
  markdownPath,
}: {
  markdownPath: `/${string}.md`;
}) => {
  const [status, setStatus] = useState<CopyStatus>("idle");
  const timeoutRef = useRef(0);

  useEffect(() => () => window.clearTimeout(timeoutRef.current), []);

  const copy = async () => {
    try {
      await copyMarkdown(markdownPath);
      setStatus("copied");
    } catch {
      setStatus("failed");
    }
    window.clearTimeout(timeoutRef.current);
    timeoutRef.current = window.setTimeout(
      () => setStatus("idle"),
      statusDuration
    );
  };

  const TriggerIcon = triggerIcons[status];

  return (
    <Menu.Root>
      <Menu.Trigger
        className={cn(
          technicalButtonVariants({ tone: "outline" }),
          "data-popup-open:bg-ink data-popup-open:text-paper min-w-36"
        )}
        data-status={status}
      >
        {triggerLabels[status]}
        <TriggerIcon aria-hidden className="size-4" />
      </Menu.Trigger>
      <output aria-live="polite" className="sr-only">
        {status === "idle" ? "" : triggerLabels[status]}
      </output>
      <Menu.Portal>
        <Menu.Positioner align="start" className="z-50" sideOffset={4}>
          <Menu.Popup className="border-ink bg-paper ease-mechanical min-w-64 border py-1 transition-[opacity,translate] duration-150 outline-none data-ending-style:opacity-0 data-starting-style:opacity-0 motion-safe:data-ending-style:-translate-y-1 motion-safe:data-starting-style:-translate-y-1">
            <Menu.Item className={itemClassName} onClick={copy}>
              <CopyIcon aria-hidden className="size-4 shrink-0" />
              Copy page as Markdown
            </Menu.Item>
            <Menu.LinkItem
              className={itemClassName}
              href={markdownPath}
              rel="noopener"
              target="_blank"
            >
              <MarkdownLogoIcon aria-hidden className="size-4 shrink-0" />
              View as Markdown
            </Menu.LinkItem>
            <Menu.Separator className="border-rule my-1 border-t" />
            {openInTargets(markdownPath).map((target) => {
              const TargetIcon = targetIcons[target.id];
              return (
                <Menu.LinkItem
                  className={itemClassName}
                  href={target.href}
                  key={target.id}
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  <TargetIcon aria-hidden className="size-4 shrink-0" />
                  <span className="grow">Open in {target.label}</span>
                  <ArrowUpRightIcon
                    aria-hidden
                    className="text-mist size-3.5 shrink-0"
                  />
                </Menu.LinkItem>
              );
            })}
          </Menu.Popup>
        </Menu.Positioner>
      </Menu.Portal>
    </Menu.Root>
  );
};
