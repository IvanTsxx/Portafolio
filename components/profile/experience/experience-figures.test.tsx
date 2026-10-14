import { describe, expect, test } from "bun:test";

import { renderToStaticMarkup } from "react-dom/server";

import type { Experience } from "@/lib/site/experience";

import { ledgerOf } from "./ledger";
import { TimelineFigure } from "./timeline-figure";
import { timelineFrames, timelineSceneOf } from "./timeline-geometry";
import { TowerFigure } from "./tower-figure";
import { towerFrames, towerSceneOf } from "./tower-geometry";

const jobs: Experience[] = [
  {
    company: "basement studio",
    end: null,
    id: "basement-studio",
    logo: "/logos/basement.webp",
    role: "Frontend Developer",
    stack: ["Three.js"],
    start: "2026-04",
    summary: "Built the client site for a secret launch.",
    type: "Full-time",
    website: "https://basement.studio",
  },
  {
    company: "Doctor Qali",
    end: "2023-06",
    id: "doctor-qali",
    logo: "/logos/doctor-qali.webp",
    role: "Frontend Developer",
    stack: ["React"],
    start: "2023-01",
    summary: "HealthTech performance.",
    type: "Contract",
    website: null,
  },
];

const ledger = ledgerOf(jobs, "2026-10", "GH-02");
const links = ledger.entries.toReversed().map((entry) => ({
  href: entry.file.links[0]?.href ?? "#experience",
  label: entry.spoken,
}));

const figures = {
  timeline: (frame: "tall" | "wide") => (
    <TimelineFigure
      links={links}
      scene={timelineSceneOf(ledger, timelineFrames[frame])}
    />
  ),
  tower: (frame: "tall" | "wide") => (
    <TowerFigure
      links={links}
      scene={towerSceneOf(ledger, towerFrames[frame])}
    />
  ),
};

describe.each(Object.entries(figures))("%s figure", (_name, figureOf) => {
  test.each(["tall", "wide"] as const)(
    "draws one link per job with only employer facts at %s",
    (frame) => {
      const markup = renderToStaticMarkup(figureOf(frame));
      expect(markup.match(/<a [^>]*data-item=/gu)).toHaveLength(2);
      expect(markup).toContain('href="https://basement.studio"');
      expect(markup).toContain("basement studio");
      expect(markup).toContain("Apr 2026");
      expect(markup).not.toContain("secret");
      expect(markup).not.toContain("Three.js");
    }
  );
});
