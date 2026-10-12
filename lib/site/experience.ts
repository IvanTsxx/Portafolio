export interface Experience {
  id: string;
  company: string;
  role: string;
  start: string;
  end: string | null;
  type: "Full-time" | "Contract";
  summary: string | null;
  stack: readonly string[];
  website: string | null;
  logo: string;
}

export const experience = [
  {
    company: "basement studio",
    end: null,
    id: "basement-studio",
    logo: "/logos/basement.webp",
    role: "Frontend Developer",
    stack: [],
    start: "2026-04",
    summary: null,
    type: "Full-time",
    website: "https://basement.studio",
  },
  {
    company: "Aliva Shop",
    end: "2026-04",
    id: "aliva-shop",
    logo: "/logos/aliva-shop.webp",
    role: "Frontend Developer",
    stack: ["Angular", "Ionic", "Signals", "Capacitor"],
    start: "2025-06",
    summary:
      "Led Q-commerce modernization: Angular to standalone + Signals, Ionic + Capacitor for iOS and Android.",
    type: "Full-time",
    website: "https://www.linkedin.com/company/alivashop",
  },
  {
    company: "Tensolite SA",
    end: "2023-11",
    id: "tensolite",
    logo: "/logos/tensolite.webp",
    role: "Full Stack Developer",
    stack: ["React", "Node.js", "Automation"],
    start: "2023-07",
    summary:
      "Internal ops tools: Excel import and export, PDF generation, workflow automation.",
    type: "Full-time",
    website: "https://tensolite.com",
  },
  {
    company: "Doctor Qali",
    end: "2023-06",
    id: "doctor-qali",
    logo: "/logos/doctor-qali.webp",
    role: "Frontend Developer",
    stack: ["React", "Performance", "Architecture"],
    start: "2023-01",
    summary:
      "HealthTech performance: render bottlenecks, bundle size, Lighthouse, modern React patterns.",
    type: "Contract",
    website: null,
  },
] as const satisfies readonly Experience[];

const monthNames = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
] as const;

export const formatMonth = (stamp: string) => {
  const [year = "", month = "1"] = stamp.split("-");
  return `${monthNames[Number(month) - 1] ?? ""} ${year}`.trim();
};
