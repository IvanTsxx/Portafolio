export interface ExperiencePosition {
  title: string;
  employmentPeriod: { start: string; end?: string };
  employmentType: string;
  skills: string[];
  description: string;
}

export interface Experience {
  id: string;
  companyName: string;
  companyLogo: string;
  companyWebsite?: string;
  isCurrentEmployer?: boolean;
  positions: ExperiencePosition[];
}

export const EXPERIENCES: Experience[] = [
  {
    companyLogo: "/logos/aliva-shop.png",
    companyName: "Aliva Shop",
    companyWebsite: "https://www.linkedin.com/company/alivashop",
    id: "aliva-shop",
    isCurrentEmployer: true,
    positions: [
      {
        description:
          "Led modernization of Q-commerce platform. Migrated legacy Angular codebase to standalone components and Signals, improving performance and maintainability. Built mobile app with Ionic + Capacitor for iOS and Android.",
        employmentPeriod: { start: "06.2025" },
        employmentType: "Full-time",
        skills: [
          "Angular",
          "Ionic",
          "RxJS",
          "Signals",
          "Capacitor",
          "Architecture",
          "Performance",
        ],
        title: "Frontend Developer",
      },
    ],
  },
  {
    companyLogo: "/logos/tensolite.png",
    companyName: "Tensolite SA",
    id: "tensolite",
    positions: [
      {
        description:
          "Developed internal tools for operational management. Built Excel import/export pipelines and PDF generation systems. Automated manual workflows saving significant time for operations team.",
        employmentPeriod: { end: "11.2023", start: "07.2023" },
        employmentType: "Full-time",
        skills: [
          "React",
          "Node.js",
          "Automation",
          "Data Processing",
          "Excel",
          "PDF Generation",
        ],
        title: "Full Stack Developer",
      },
    ],
  },
  {
    companyLogo: "/logos/doctor-qali.png",
    companyName: "Doctor Qali",
    id: "doctor-qali",
    positions: [
      {
        description:
          "Improved performance of a HealthTech platform. Refactored critical rendering bottlenecks, reducing bundle size and improving Lighthouse scores. Introduced modern React patterns across the codebase.",
        employmentPeriod: { end: "06.2023", start: "01.2023" },
        employmentType: "Contract",
        skills: [
          "React",
          "Performance",
          "Refactoring",
          "Frontend Architecture",
        ],
        title: "Frontend Developer",
      },
    ],
  },
];
