import type { Metadata } from "next";

import { WorkArchive } from "@/components/content/work-archive";
import {
  getProjects,
  getProjectTechnologies,
  toWorkIndexItem,
} from "@/lib/content/work";
import { siteConfig } from "@/lib/site/config";

const filterFacetLimit = 8;

const description =
  "Archive of projects by year. Each entry opens a case study covering context, contribution, motion and how AI agents were used under review.";

export const metadata: Metadata = {
  alternates: { canonical: "/work" },
  description,
  openGraph: {
    description,
    siteName: siteConfig.name,
    title: `Work · ${siteConfig.shortName}`,
    type: "website",
    url: "/work",
  },
  title: "Work",
};

const WorkPage = async () => {
  const [projects, technologies] = await Promise.all([
    getProjects(),
    getProjectTechnologies(),
  ]);

  return (
    <div className="mx-auto w-full max-w-screen-2xl pb-24">
      <header className="blueprint-grid border-rule mask-b-from-70% px-4 pt-16 pb-12 md:px-6 md:pt-24 md:pb-16">
        <h1 className="display text-7xl md:text-8xl">Work</h1>
        <p className="text-muted-foreground mt-6 max-w-xl text-lg text-pretty">
          {description}
        </p>
        <p className="label text-muted-foreground mt-8 tabular-nums">
          {projects.length} entries
        </p>
      </header>
      <WorkArchive
        projects={projects.map(toWorkIndexItem)}
        technologies={technologies.slice(0, filterFacetLimit)}
      />
    </div>
  );
};

export default WorkPage;
