export interface TechStackItem {
  key: string;
  title: string;
  href: string;
  categories: string[];
  /** svgl.app CDN icon URL */
  iconUrl?: string;
}

export const TECH_STACK: TechStackItem[] = [
  {
    categories: ["Language"],
    href: "https://typescriptlang.org",
    iconUrl: "https://svgl.app/library/typescript.svg",
    key: "typescript",
    title: "TypeScript",
  },
  {
    categories: ["Language"],
    href: "https://developer.mozilla.org/en-US/docs/Web/JavaScript",
    iconUrl: "https://svgl.app/library/javascript.svg",
    key: "js",
    title: "JavaScript",
  },
  {
    categories: ["Runtime"],
    href: "https://nodejs.org",
    iconUrl: "https://svgl.app/library/nodejs.svg",
    key: "nodejs",
    title: "Node.js",
  },
  {
    categories: ["Runtime"],
    href: "https://bun.sh",
    iconUrl: "https://svgl.app/library/bun.svg",
    key: "bun",
    title: "Bun",
  },
  {
    categories: ["Library"],
    href: "https://react.dev",
    iconUrl: "https://svgl.app/library/react.svg",
    key: "react",
    title: "React",
  },
  {
    categories: ["Framework"],
    href: "https://nextjs.org",
    iconUrl: "https://svgl.app/library/nextjs.svg",
    key: "nextjs2",
    title: "Next.js",
  },
  {
    categories: ["Framework"],
    href: "https://tailwindcss.com",
    iconUrl: "https://svgl.app/library/tailwindcss.svg",
    key: "tailwindcss",
    title: "Tailwind CSS",
  },
  {
    categories: ["Component Library"],
    href: "https://ui.shadcn.com",
    iconUrl: "https://svgl.app/library/shadcnui.svg",
    key: "shadcn-ui",
    title: "shadcn/ui",
  },
  {
    categories: ["Animation"],
    href: "https://motion.dev",
    iconUrl: "https://svgl.app/library/framer-motion.svg",
    key: "motion",
    title: "Motion",
  },
  {
    categories: ["Library"],
    href: "https://tanstack.com",
    iconUrl: "https://svgl.app/library/tanstack.svg",
    key: "tanstack",
    title: "TanStack",
  },
  {
    categories: ["State Management"],
    href: "https://redux.js.org",
    iconUrl: "https://svgl.app/library/redux.svg",
    key: "redux",
    title: "Redux",
  },
  {
    categories: ["Version Control"],
    href: "https://git-scm.com",
    iconUrl: "https://svgl.app/library/git.svg",
    key: "git",
    title: "Git",
  },
  {
    categories: ["Containerization"],
    href: "https://docker.com",
    iconUrl: "https://svgl.app/library/docker.svg",
    key: "docker",
    title: "Docker",
  },
  {
    categories: ["AI"],
    href: "https://claude.ai",
    iconUrl: "https://svgl.app/library/anthropic.svg",
    key: "claude",
    title: "Claude",
  },
  {
    categories: ["Tools"],
    href: "https://cursor.sh",
    iconUrl: "https://svgl.app/library/cursor.svg",
    key: "cursor",
    title: "Cursor",
  },
  {
    categories: ["AI"],
    href: "https://chat.openai.com",
    iconUrl: "https://svgl.app/library/chatgpt.svg",
    key: "chatgpt",
    title: "ChatGPT",
  },
];
