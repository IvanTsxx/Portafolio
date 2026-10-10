import { ArrowUpRight } from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";
import type { ComponentProps } from "react";

import { linkClassName } from "@/components/site/styles";
import { cn } from "@/lib/utils";

type CodeFigureProps = ComponentProps<"figure"> & {
  "data-rehype-pretty-code-figure"?: string;
};

type CodeTitleProps = ComponentProps<"figcaption"> & {
  "data-rehype-pretty-code-title"?: string;
};

type CodeProps = ComponentProps<"code"> & {
  "data-language"?: string;
};

const isInternalHref = (href: string) =>
  href.startsWith("/") || href.startsWith("#");

const lineNumberVariant =
  "[&[data-line-numbers]>[data-line]]:before:mr-4 [&[data-line-numbers]>[data-line]]:before:inline-block [&[data-line-numbers]>[data-line]]:before:w-4 [&[data-line-numbers]>[data-line]]:before:text-right [&[data-line-numbers]>[data-line]]:before:text-mist [&[data-line-numbers]>[data-line]]:before:content-[counter(line)] [&[data-line-numbers]>[data-line]]:before:[counter-increment:line] [&[data-line-numbers]]:[counter-reset:line]";

const sectionHeadingClassName = cn(
  "text-ink border-rule-strong mt-16 mb-6 scroll-mt-24 border-t pt-4 text-3xl leading-tight font-light tracking-tight text-balance [counter-increment:section] first:mt-0 md:text-4xl",
  "group-data-[numbered]/prose:before:label group-data-[numbered]/prose:before:text-mist group-data-[numbered]/prose:before:mb-3 group-data-[numbered]/prose:before:block group-data-[numbered]/prose:before:tabular-nums group-data-[numbered]/prose:before:content-['[_'_counter(section,decimal-leading-zero)_'_]']"
);

export const ProseAnchor = ({
  children,
  className,
  href = "",
  ...props
}: ComponentProps<"a">) => {
  const anchorClassName = cn(linkClassName, "text-ink", className);

  if (isInternalHref(href)) {
    return (
      <Link className={anchorClassName} href={href} {...props}>
        {children}
      </Link>
    );
  }

  return (
    <a
      className={anchorClassName}
      href={href}
      rel="noopener noreferrer"
      target="_blank"
      {...props}
    >
      {children}
      <ArrowUpRight
        aria-hidden
        className="ml-0.5 inline size-3.5 align-baseline"
      />
    </a>
  );
};

export const ProseBlockquote = ({
  className,
  ...props
}: ComponentProps<"blockquote">) => (
  <blockquote
    className={cn(
      "border-ink text-graphite my-8 border-l-2 pl-6 text-lg italic",
      className
    )}
    {...props}
  />
);

export const ProseCode = ({ className, ...props }: CodeProps) =>
  props["data-language"] === undefined ? (
    <code
      className={cn(
        "border-rule bg-paper-deep text-ink border px-1.5 py-0.5 font-mono text-[0.875em]",
        className
      )}
      {...props}
    />
  ) : (
    <code
      className={cn(
        "grid w-max min-w-full font-mono text-sm/6",
        lineNumberVariant,
        "[&_[data-highlighted-chars]]:bg-ink/10 [&_[data-highlighted-line]]:bg-ink/5 [&_[data-line]]:px-4",
        className
      )}
      {...props}
    />
  );

export const ProseEmphasis = ({
  className,
  ...props
}: ComponentProps<"em">) => (
  <em className={cn("text-ink italic", className)} {...props} />
);

export const ProseFigcaption = ({ className, ...props }: CodeTitleProps) =>
  props["data-rehype-pretty-code-title"] === undefined ? (
    <figcaption className={className} {...props} />
  ) : (
    <figcaption
      className={cn(
        "label border-rule-strong bg-paper-deep text-graphite border-b px-4 py-3 normal-case",
        className
      )}
      {...props}
    />
  );

export const ProseFigure = ({ className, ...props }: CodeFigureProps) =>
  props["data-rehype-pretty-code-figure"] === undefined ? (
    <figure className={className} {...props} />
  ) : (
    <figure
      className={cn(
        "border-rule-strong bg-popover my-8 overflow-hidden border",
        className
      )}
      {...props}
    />
  );

export const ProseH2 = ({
  children,
  className,
  ...props
}: ComponentProps<"h2">) => (
  <h2 className={cn(sectionHeadingClassName, className)} {...props}>
    {children}
  </h2>
);

export const ProseH3 = ({
  children,
  className,
  ...props
}: ComponentProps<"h3">) => (
  <h3
    className={cn(
      "text-ink mt-10 mb-3 scroll-mt-24 text-xl font-medium tracking-tight text-balance",
      className
    )}
    {...props}
  >
    {children}
  </h3>
);

export const ProseH4 = ({
  children,
  className,
  ...props
}: ComponentProps<"h4">) => (
  <h4
    className={cn("label text-graphite mt-8 mb-2 scroll-mt-24", className)}
    {...props}
  >
    {children}
  </h4>
);

export const ProseRule = ({ className, ...props }: ComponentProps<"hr">) => (
  <hr
    className={cn("border-rule-strong my-12 border-dotted", className)}
    {...props}
  />
);

export const ProseListItem = ({
  className,
  ...props
}: ComponentProps<"li">) => (
  <li className={cn("text-ink pl-1", className)} {...props} />
);

export const ProseOrderedList = ({
  className,
  ...props
}: ComponentProps<"ol">) => (
  <ol
    className={cn(
      "marker:text-mist my-5 list-decimal space-y-2 pl-6 text-base/7 marker:font-mono md:text-lg/8",
      className
    )}
    {...props}
  />
);

export const ProseUnorderedList = ({
  className,
  ...props
}: ComponentProps<"ul">) => (
  <ul
    className={cn(
      "marker:text-ink my-5 list-disc space-y-2 pl-6 text-base/7 md:text-lg/8",
      className
    )}
    {...props}
  />
);

export const ProseParagraph = ({
  className,
  ...props
}: ComponentProps<"p">) => (
  <p
    className={cn(
      "text-ink my-5 text-base/7 text-pretty md:text-lg/8",
      className
    )}
    {...props}
  />
);

export const ProsePre = ({ className, ...props }: ComponentProps<"pre">) => (
  <pre
    className={cn(
      "overflow-x-auto py-4 focus-visible:-outline-offset-2",
      className
    )}
    {...props}
  />
);

export const ProseStrong = ({
  className,
  ...props
}: ComponentProps<"strong">) => (
  <strong className={cn("text-ink font-medium", className)} {...props} />
);

export const ProseTable = ({
  className,
  ...props
}: ComponentProps<"table">) => (
  <div className="border-rule-strong my-8 overflow-x-auto border">
    <table
      className={cn(
        "w-full border-collapse text-left text-sm [&_tbody_tr:last-child_td]:border-b-0",
        className
      )}
      {...props}
    />
  </div>
);

export const ProseTableCell = ({
  className,
  ...props
}: ComponentProps<"td">) => (
  <td
    className={cn(
      "border-rule text-ink border-b px-4 py-3 align-top tabular-nums",
      className
    )}
    {...props}
  />
);

export const ProseTableHeading = ({
  className,
  ...props
}: ComponentProps<"th">) => (
  <th
    className={cn(
      "label bg-paper-deep text-graphite border-rule-strong border-b px-4 py-3 font-normal whitespace-nowrap",
      className
    )}
    {...props}
  />
);
