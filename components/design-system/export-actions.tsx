import { DownloadSimpleIcon } from "@phosphor-icons/react/dist/ssr";

import { CopyButton } from "@/components/site/copy-button";
import { technicalButtonVariants } from "@/components/site/styles";

export const ExportActions = ({
  filename,
  href,
  markdown,
}: {
  filename: string;
  href: string;
  markdown: string;
}) => (
  <div className="flex flex-wrap gap-3">
    <CopyButton label="Copy design.md" text={markdown} />
    <a
      className={technicalButtonVariants({ tone: "outline" })}
      download={filename}
      href={href}
    >
      <DownloadSimpleIcon aria-hidden className="size-4" />
      Download
    </a>
  </div>
);
