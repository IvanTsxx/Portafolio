import { absoluteUrl } from "@/lib/site/seo";

export type OpenInTargetId = "chatgpt" | "claude" | "perplexity";

export interface OpenInTarget {
  href: string;
  id: OpenInTargetId;
  label: string;
}

const assistants = [
  {
    base: "https://chatgpt.com/?hints=search&q=",
    id: "chatgpt",
    label: "ChatGPT",
  },
  { base: "https://claude.ai/new?q=", id: "claude", label: "Claude" },
  {
    base: "https://www.perplexity.ai/search?q=",
    id: "perplexity",
    label: "Perplexity",
  },
] as const satisfies readonly {
  base: string;
  id: OpenInTargetId;
  label: string;
}[];

export const assistantPrompt = (markdownPath: `/${string}.md`) =>
  `Read ${absoluteUrl(markdownPath)} and help me with it`;

export const openInTargets = (
  markdownPath: `/${string}.md`
): OpenInTarget[] => {
  const prompt = encodeURIComponent(assistantPrompt(markdownPath));
  return assistants.map(({ base, id, label }) => ({
    href: `${base}${prompt}`,
    id,
    label,
  }));
};
