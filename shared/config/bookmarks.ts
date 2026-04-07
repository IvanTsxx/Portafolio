export interface Bookmark {
  id: string;
  title: string;
  author: string;
  url: string;
  bookmarkedAt: string;
}

export const BOOKMARKS: Bookmark[] = [
  {
    author: "Vercel",
    bookmarkedAt: "2025-12-01",
    id: "design-engineering-vercel",
    title: "Design Engineering at Vercel",
    url: "https://vercel.com/blog/design-engineering-at-vercel",
  },
  {
    author: "Emil Kowalski",
    bookmarkedAt: "2025-12-01",
    id: "developing-taste",
    title: "Developing Taste",
    url: "https://emilkowal.ski/ui/developing-taste",
  },
  {
    author: "Rauno Freiberg",
    bookmarkedAt: "2025-12-01",
    id: "web-interface-guidelines",
    title: "Web Interface Guidelines",
    url: "https://rauno.me/craft/web-interface-guidelines",
  },
  {
    author: "Emil Kowalski",
    bookmarkedAt: "2025-12-01",
    id: "animation-tips",
    title: "7 Practical Animation Tips",
    url: "https://emilkowal.ski/ui/7-practical-animation-tips",
  },
  {
    author: "Emil Kowalski",
    bookmarkedAt: "2025-12-01",
    id: "no-animations",
    title: "You Don't Need Animations",
    url: "https://emilkowal.ski/ui/you-dont-need-animations",
  },
  {
    author: "Hayden Bleasel & shadcn",
    bookmarkedAt: "2025-12-11",
    id: "components-build",
    title: "components.build",
    url: "https://www.components.build",
  },
  {
    author: "Guillermo Rauch",
    bookmarkedAt: "2025-12-16",
    id: "rich-web-apps",
    title: "7 Principles of Rich Web Applications",
    url: "https://rauchg.com/2014/7-principles-of-rich-web-applications",
  },
];
