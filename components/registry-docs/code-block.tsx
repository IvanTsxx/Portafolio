import { Fragment } from "react";

import type {
  HighlightedLine,
  HighlightedToken,
} from "@/lib/registry/highlight";
import { cn } from "@/lib/utils";

const keyboardScrollableProps = { tabIndex: 0 } as const;

const tokenClassName = (token: HighlightedToken) =>
  cn(
    token.italic && "italic",
    token.bold && "font-bold",
    token.underline && "underline"
  );

export const CodeBlock = ({
  className,
  lines,
}: {
  className?: string;
  lines: readonly HighlightedLine[];
}) => (
  <div className={cn("overflow-x-auto font-mono text-xs leading-6", className)}>
    <pre
      className="min-w-max p-4 outline-offset-[-2px]"
      {...keyboardScrollableProps}
    >
      <code className="font-mono">
        {lines.map((line, lineNumber) => (
          <Fragment key={lineNumber}>
            <span>
              {line.map((token, tokenNumber) => (
                <span
                  className={tokenClassName(token)}
                  key={tokenNumber}
                  style={token.color ? { color: token.color } : undefined}
                >
                  {token.content}
                </span>
              ))}
            </span>
            {"\n"}
          </Fragment>
        ))}
      </code>
    </pre>
  </div>
);
