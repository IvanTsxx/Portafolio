export const siteConfig = {
  description:
    "Ivan Bongiovanni, frontend engineer at Basement Studio. Interfaces, motion, 3D on the web, and AI-assisted development orchestrated with Conductor, git worktrees, skills and MCPs.",
  email: "ivan@basement.studio",
  handle: "IvanTsxx",
  location: "Tucumán, AR",
  name: "Ivan Bongiovanni",
  registryNamespace: "@ivan",
  role: "Creative frontend engineer",
  shortName: "Ivan",
  socials: [
    { href: "https://github.com/IvanTsxx", label: "GitHub" },
    { href: "https://x.com/IvanTsxx", label: "X" },
    {
      href: "https://www.linkedin.com/in/bongiovanni-ivan45",
      label: "LinkedIn",
    },
  ],
  studio: "Basement Studio",
  url: "https://bongi.dev",
} as const;

export const primaryRoutes = [
  { href: "/", index: "00", label: "Home" },
  { href: "/work", index: "01", label: "Work" },
  { href: "/lab", index: "02", label: "Lab" },
  { href: "/registry", index: "03", label: "Registry" },
  { href: "/blog", index: "04", label: "Field notes" },
] as const;

export type PrimaryRoute = (typeof primaryRoutes)[number];
