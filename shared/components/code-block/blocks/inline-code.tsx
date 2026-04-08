"use client";

import type { Languages } from "@/shared/utils/shiki/highlight";

import { CopyButton } from "../../copy-button";
import { CodeblockShiki } from "../client/shiki";
import { CodeBlock, CodeBlockContent } from "../code-block";

interface InlineCodeProps {
  code: string;
  language?: Languages;
}

const InlineCode = ({ code, language = "bash" }: InlineCodeProps) => (
  <CodeBlock>
    <CodeBlockContent className="flex w-full items-center justify-between">
      <CodeblockShiki language={language} code={code} />
      <CopyButton className="px-3" text={code} />
    </CodeBlockContent>
  </CodeBlock>
);

export default InlineCode;
