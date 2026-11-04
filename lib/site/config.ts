const email = "bongiovannidev@gmail.com";

export const siteConfig = {
  description:
    "Ivo, frontend developer. Thoughtful interfaces, real-time rendering and a lab of installable creative-code experiments.",
  email,
  github: "IvanTsxx",
  handle: "IvanTsxx",
  location: "Tucumán, Argentina",
  name: "Ivan Bongiovanni",
  nickname: "Ivo",
  registryNamespace: "@ivan",
  repository: "IvanTsxx/Portafolio",
  role: "Frontend Developer",
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
  statement: {
    accent: "learn",
    closing: ".",
    lead: "I build interfaces, experiment with the browser, and write about what I",
  },
  url: "https://bongi.dev",
} as const;

export const primaryRoutes = [
  { href: "/experiments", index: "01", label: "Lab" },
  { href: "/skills", index: "02", label: "Skills" },
  { href: "/notes", index: "03", label: "Writing" },
  { href: "/design-system", index: "04", label: "System" },
] as const;

export const secondaryRoutes = [
  { href: "/registry", label: "Registry" },
] as const;

export const homeSections = [
  { id: "work", index: "01", label: "Work" },
  { id: "lab", index: "02", label: "Lab" },
  { id: "writing", index: "03", label: "Writing" },
  { id: "skills", index: "04", label: "Skills" },
] as const;

export type Social = (typeof siteConfig.socials)[number];

export type SocialId = Social["id"];

export type PrimaryRoute = (typeof primaryRoutes)[number];
