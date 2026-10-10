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
  { href: "/", index: "00", jp: "ホーム", label: "Home" },
  { href: "/notes", index: "01", jp: "手記", label: "Notes" },
  { href: "/lab", index: "02", jp: "実験", label: "Lab" },
  { href: "/registry", index: "03", jp: "登録簿", label: "Registry" },
  { href: "/design-system", index: "04", jp: "設計", label: "Design system" },
] as const;

export const homeSections = [
  { id: "experience", index: "GH-03", jp: "経歴", label: "Experience" },
  { id: "pinned", index: "GH-04", jp: "固定標本", label: "Pinned specimens" },
  {
    id: "spectrum",
    index: "GH-05",
    jp: "言語分布",
    label: "Language spectrum",
  },
  {
    id: "matrix",
    index: "GH-06",
    jp: "貢献行列",
    label: "Contribution matrix",
  },
  {
    id: "overview",
    index: "GH-07",
    jp: "活動概要",
    label: "Activity overview",
  },
  {
    id: "timeline",
    index: "GH-08",
    jp: "活動記録",
    label: "Contribution activity",
  },
  { id: "how-i-work", index: "GH-09", jp: "仕事の流儀", label: "How I work" },
  { id: "stack", index: "GH-10", jp: "技術", label: "Stack" },
  { id: "contact", index: "GH-11", jp: "連絡", label: "Contact" },
] as const;

export type Social = (typeof siteConfig.socials)[number];

export type SocialId = Social["id"];

export type PrimaryRoute = (typeof primaryRoutes)[number];
