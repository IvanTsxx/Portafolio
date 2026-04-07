import type { MDXComponents } from "mdx/types";
import type { ComponentProps } from "react";

import { CopyButton } from "@/app/(app)/(registry)/_components/copy-button";
import { reactToText } from "@/shared/utils/shiki/react-to-text";

import {
  CodeBlock,
  CodeBlockContent,
  CodeBlockGroup,
  CodeBlockHeader,
  CodeBlockIcon,
} from "../code-block";

interface PreProps extends ComponentProps<"pre"> {
  ["data-language"]: string;
  ["data-title"]?: string;
}

const PreShikiComponent: MDXComponents = {
  pre: ({ children, ...props }: PreProps) => {
    const content = reactToText(children);

    const language = props["data-language"];
    const title = props["data-title"];

    return (
      <CodeBlock>
        <CodeBlockHeader>
          <CodeBlockGroup>
            <CodeBlockIcon language={language} />
            <span>{title ?? (language ? `.${language}` : "code")}</span>
          </CodeBlockGroup>
          <CopyButton value={content} />
        </CodeBlockHeader>
        <CodeBlockContent>
          <pre {...props}>{children}</pre>
        </CodeBlockContent>
      </CodeBlock>
    );
  },
};

export { PreShikiComponent };
