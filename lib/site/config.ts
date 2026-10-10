const email = "bongiovannidev@gmail.com";

export const siteConfig = {
  description:
    "Ivan Bongiovanni, frontend engineer. Interfaces, motion, real-time 3D and AI-assisted development with Conductor, git worktrees, agents, skills and MCPs.",
  email,
  github: "IvanTsxx",
  handle: "IvanTsxx",
  location: "Tucumán, Argentina",
  name: "Ivan Bongiovanni",
  registryNamespace: "@ivan",
  role: "Frontend engineer",
  shortName: "Ivan",
  socials: [
    {
      handle: "IvanTsxx",
      href: "https://github.com/IvanTsxx",
      id: "github",
      label: "GitHub",
    },
    {
      handle: "@IvanTsxx",
      href: "https://x.com/IvanTsxx",
      id: "x",
      label: "X",
    },
    {
      handle: "bongiovanni-ivan45",
      href: "https://www.linkedin.com/in/bongiovanni-ivan45",
      id: "linkedin",
      label: "LinkedIn",
    },
    {
      handle: email,
      href: `mailto:${email}`,
      id: "email",
      label: "Email",
    },
  ],
  url: "https://bongi.dev",
} as const;

export const primaryRoutes = [
  { href: "/", index: "00", label: "Home" },
  { href: "/notes", index: "01", label: "Notes" },
  { href: "/lab", index: "02", label: "Lab" },
  { href: "/registry", index: "03", label: "Registry" },
  { href: "/design-system", index: "04", label: "Design system" },
] as const;

export type Social = (typeof siteConfig.socials)[number];

export type SocialId = Social["id"];

export type PrimaryRoute = (typeof primaryRoutes)[number];
