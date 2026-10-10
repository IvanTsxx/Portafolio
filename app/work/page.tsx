import type { Metadata } from "next";

import { WorkArchive } from "@/components/content/work-archive";
import { PageHeader } from "@/components/site/page-header";
import {
  getProjects,
  getProjectTechnologies,
  toWorkIndexItem,
} from "@/lib/content/work";
import { siteConfig } from "@/lib/site/config";

const filterFacetLimit = 8;

const description = "Case studies by year.";

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
    <>
      <PageHeader
        code="WK-00"
        jp="作品"
        lede="Case studies, newest first"
        meta={[
          { label: "Entries", value: String(projects.length).padStart(2, "0") },
        ]}
        title="Work"
      />
      <WorkArchive
        projects={projects.map(toWorkIndexItem)}
        technologies={technologies.slice(0, filterFacetLimit)}
      />
    </>
  );
};

export default WorkPage;
