import type { Metadata } from "next";
import { Suspense } from "react";

import { SITE } from "@/shared/config/site";
import { Skeleton } from "@/shared/components/ui/skeleton";

import { AboutSection } from "./_components/about-section";
import { BookmarksSection } from "./_components/bookmarks-section";
import { CoverHero } from "./_components/cover-hero";
import { ExperienceSection } from "./_components/experience-section";
import { FeedbacksSection } from "./_components/feedbacks-section";
import { GitHubContributions } from "./_components/github-contributions";
import { GitHubOpenSource } from "./_components/github-opensource";
import { Hero } from "./_components/hero";
import { ProjectsSection } from "./_components/projects-section";
import { ThoughtsPreviewSection } from "./_components/thoughts-preview-section";

export const metadata: Metadata = {
  alternates: {
    canonical: "/",
  },
  description:
    "Full Stack Developer specializing in Next.js. Building fast, typesafe, and beautiful web experiences.",
  openGraph: {
    description:
      "Full Stack Developer specializing in Next.js. Building fast, typesafe, and beautiful web experiences.",
    siteName: SITE.name,
    title: "Ivan Bongiovanni",
    type: "website",
    url: SITE.url,
  },
  title: "Ivan Bongiovanni",
  twitter: {
    card: "summary_large_image",
  },
};

import {
  OrganizationJsonLd,
  WebSiteJsonLd,
} from "@/shared/components/json-ld";

export default async function HomePage() {
  return (
    <section className="flex flex-col gap-1 w-full">
      <OrganizationJsonLd />
      <WebSiteJsonLd />
      <Suspense fallback={<Skeleton className="h-40 w-full" />}>
        <CoverHero />
      </Suspense>
      <Hero />
      <ExperienceSection />
      <AboutSection />
      <GitHubContributions />
      <ProjectsSection />
      <FeedbacksSection />
      <ThoughtsPreviewSection />
      <GitHubOpenSource />
      <BookmarksSection />
    </section>
  );
}
