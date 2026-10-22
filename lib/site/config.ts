const email = "bongiovannidev@gmail.com";

export const siteConfig = {
  description:
    "Ivo, frontend engineer. Interfaces, motion, real-time 3D and AI-assisted development with Conductor, git worktrees, agents, skills and MCPs.",
  email,
  github: "IvanTsxx",
  handle: "IvanTsxx",
  location: "Tucumán, Argentina",
  name: "Ivan Bongiovanni",
  nickname: "Ivo",
  nicknameKana: "イヴォ",
  registryNamespace: "@ivan",
  repository: "IvanTsxx/Portafolio",
  role: "Frontend engineer",
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
      handle: email,
      href: `mailto:${email}`,
      id: "email",
      label: "Email",
    },
  ],
  url: "https://bongi.dev",
} as const;

export const primaryRoutes = [
  { href: "/", index: "00", jp: "ホーム", label: "Home" },
  { href: "/notes", index: "01", jp: "手記", label: "Notes" },
  { href: "/experiments", index: "02", jp: "実験", label: "Experiments" },
  { href: "/registry", index: "03", jp: "登録簿", label: "Registry" },
  { href: "/design-system", index: "04", jp: "設計", label: "Design system" },
] as const;

export const homeSections = [
  { id: "experience", index: "GH-02", label: "Experience" },
  {
    id: "matrix",
    index: "GH-03",
    label: "Contribution matrix",
  },
  { id: "experiments", index: "GH-04", label: "Experiments" },
  { id: "how-i-work", index: "GH-05", label: "How I work" },
  { id: "repos", index: "GH-06", label: "Repos" },
  { id: "registry", index: "GH-07", label: "Registry" },
  { id: "workshop", index: "GH-08", label: "Workshop" },
  { id: "contact", index: "GH-09", label: "Contact" },
] as const;

export type Social = (typeof siteConfig.socials)[number];

export type SocialId = Social["id"];

export type PrimaryRoute = (typeof primaryRoutes)[number];
