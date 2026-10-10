export const siteConfig = {
  description:
    "Ivan Bongiovanni, frontend engineer. Interfaces, motion, real-time 3D and AI-assisted development with Conductor, git worktrees, agents, skills and MCPs.",
  email: "bongiovannidev@gmail.com",
  github: "IvanTsxx",
  handle: "IvanTsxx",
  location: "Tucumán, Argentina",
  name: "Ivan Bongiovanni",
  registryNamespace: "@ivan",
  role: "Frontend engineer",
  shortName: "Ivan",
  socials: [
    { href: "https://github.com/IvanTsxx", label: "GitHub" },
    { href: "https://x.com/IvanTsxx", label: "X" },
    {
      href: "https://www.linkedin.com/in/bongiovanni-ivan45",
      label: "LinkedIn",
    },
  ],
  url: "https://bongi.dev",
} as const;

export const primaryRoutes = [
  { href: "/", index: "00", label: "Home" },
  { href: "/notes", index: "01", label: "Notes" },
  { href: "/lab", index: "02", label: "Lab" },
  { href: "/registry", index: "03", label: "Registry" },
] as const;

export type PrimaryRoute = (typeof primaryRoutes)[number];
