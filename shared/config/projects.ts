export interface Project {
  id: string;
  title: string;
  period: { start: string; end?: string };
  description: string;
  skills: string[];
  github?: string;
  link?: string;
}

export const PROJECTS: Project[] = [
  {
    description:
      "Personal portfolio and component registry built with Next.js 16, TypeScript, Tailwind CSS v4, and motion/react. Features a GitHub contributions graph, blog, and component showcase.",
    github: "https://github.com/IvanTsxx/ivantsx",
    id: "ivantsx",
    link: "https://ibong.vercel.app",
    period: { start: "2025" },
    skills: [
      "Next.js",
      "TypeScript",
      "Tailwind CSS v4",
      "motion/react",
      "shadcn/ui",
    ],
    title: "ivantsx.vercel.app",
  },
  {
    description:
      "Full-stack e-commerce platform with product catalog, cart, checkout, and admin dashboard. Built with Next.js App Router, Supabase, and Stripe.",
    id: "ecommerce-platform",
    link: "https://ibong.vercel.app",
    period: { end: "2024", start: "2024" },
    skills: ["Next.js", "Supabase", "Stripe", "TypeScript", "Tailwind CSS"],
    title: "E-Commerce Platform",
  },
  {
    description:
      "Automated document generation system for enterprise use. Processes Excel data, applies templates, and generates production-ready PDFs at scale.",
    id: "pdf-gen",
    period: { end: "2023", start: "2023" },
    skills: [
      "Node.js",
      "React",
      "Excel Processing",
      "PDF Generation",
      "REST API",
    ],
    title: "PDF Generation System",
  },
];
