import { ArrowUpRight } from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";
import type { ComponentProps } from "react";

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
  "[&[data-line-numbers]>[data-line]]:before:mr-4 [&[data-line-numbers]>[data-line]]:before:inline-block [&[data-line-numbers]>[data-line]]:before:w-4 [&[data-line-numbers]>[data-line]]:before:text-right [&[data-line-numbers]>[data-line]]:before:text-faint [&[data-line-numbers]>[data-line]]:before:content-[counter(line)] [&[data-line-numbers]>[data-line]]:before:[counter-increment:line] [&[data-line-numbers]]:[counter-reset:line]";

const sectionHeadingClassName = cn(
  "display text-foreground border-rule mt-16 mb-6 scroll-mt-24 border-t pt-6 text-3xl [counter-increment:section] first:mt-0 md:text-4xl",
  "group-data-[numbered]/prose:before:label group-data-[numbered]/prose:before:text-faint group-data-[numbered]/prose:before:mb-4 group-data-[numbered]/prose:before:block group-data-[numbered]/prose:before:content-[counter(section,decimal-leading-zero)]"
);

export const ProseAnchor = ({
  children,
  className,
  href = "",
  ...props
}: ComponentProps<"a">) => {
  const linkClassName = cn(
    "text-foreground decoration-rule-strong hover:decoration-clay hover:text-clay underline underline-offset-4 transition-colors",
    className
  );

  if (isInternalHref(href)) {
    return (
      <Link className={linkClassName} href={href} {...props}>
        {children}
      </Link>
    );
  }

  return (
    <a
      className={linkClassName}
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
      "border-rule-strong text-muted-foreground my-8 border-l pl-6 text-lg italic",
      className
    )}
    {...props}
  />
);

export const ProseCode = ({ className, ...props }: CodeProps) =>
  props["data-language"] === undefined ? (
    <code
      className={cn(
        "bg-graphite text-foreground rounded-sm px-1.5 py-0.5 font-mono text-[0.875em]",
        className
      )}
      {...props}
    />
  ) : (
    <code
      className={cn(
        "grid w-max min-w-full font-mono text-sm/6",
        lineNumberVariant,
        "[&_[data-highlighted-chars]]:bg-accent [&_[data-highlighted-line]]:bg-accent [&_[data-highlighted-chars]]:rounded-sm [&_[data-line]]:px-4",
        className
      )}
      {...props}
    />
  );

export const ProseEmphasis = ({
  className,
  ...props
}: ComponentProps<"em">) => (
  <em className={cn("text-foreground italic", className)} {...props} />
);

export const ProseFigcaption = ({ className, ...props }: CodeTitleProps) =>
  props["data-rehype-pretty-code-title"] === undefined ? (
    <figcaption className={className} {...props} />
  ) : (
    <figcaption
      className={cn(
        "label border-rule text-muted-foreground border-b px-4 py-3 normal-case",
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
        "border-rule bg-card my-8 overflow-hidden rounded-sm border",
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
      "text-foreground mt-10 mb-3 scroll-mt-24 text-xl font-semibold tracking-tight text-balance",
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
    className={cn(
      "label text-muted-foreground mt-8 mb-2 scroll-mt-24",
      className
    )}
    {...props}
  >
    {children}
  </h4>
);

export const ProseRule = ({ className, ...props }: ComponentProps<"hr">) => (
  <hr className={cn("border-rule my-12", className)} {...props} />
);

export const ProseListItem = ({
  className,
  ...props
}: ComponentProps<"li">) => (
  <li className={cn("text-foreground/90 pl-1", className)} {...props} />
);

export const ProseOrderedList = ({
  className,
  ...props
}: ComponentProps<"ol">) => (
  <ol
    className={cn(
      "marker:text-faint my-5 list-decimal space-y-2 pl-6 text-base/7 marker:font-mono md:text-lg/8",
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
      "marker:text-faint my-5 list-disc space-y-2 pl-6 text-base/7 md:text-lg/8",
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
      "text-foreground/90 my-5 text-base/7 text-pretty md:text-lg/8",
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
  <strong
    className={cn("text-foreground font-semibold", className)}
    {...props}
  />
);

export const ProseTable = ({
  className,
  ...props
}: ComponentProps<"table">) => (
  <div className="border-rule my-8 overflow-x-auto border">
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
      "border-rule text-foreground/90 border-b px-4 py-3 align-top tabular-nums",
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
      "label bg-graphite text-muted-foreground border-rule-strong border-b px-4 py-3 font-normal whitespace-nowrap",
      className
    )}
    {...props}
  />
);
