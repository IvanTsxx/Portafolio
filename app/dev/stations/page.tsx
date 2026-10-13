import type { Metadata } from "next";

import { DocumentSection } from "@/components/site/document-section";
import { SectionRail } from "@/components/site/section-rail";

import { StubStation } from "./stub-station";

export const metadata: Metadata = {
  robots: { follow: false, index: false },
  title: "Station bench",
};

const benchSections = [
  { id: "before", index: "DV-01", jp: "前", label: "Before" },
  { id: "bench", index: "DV-02", jp: "台", label: "Station" },
  { id: "after", index: "DV-03", jp: "後", label: "After" },
] as const;

const scriptFor = (lines: readonly string[]) =>
  ({ lines, reveal: "static" }) as const;

const filler =
  "Scroll on. This section only exists to give the page some length, so the rail has distance to cover and the station has somewhere to scroll into and out of view.";

const StationBenchPage = () => (
  <div className="w-full flex-1 px-4 pt-12 pb-32 md:px-8 md:pt-20">
    <div
      className="max-w-column relative mx-auto flex flex-col gap-24"
      data-reading-column=""
    >
      <header className="flex flex-col gap-3">
        <p className="label text-clay">Dev · Companion operator</p>
        <h1 className="display text-5xl md:text-7xl">Station bench</h1>
        <p className="text-muted-foreground max-w-prose text-sm">
          A stub figure registers a station. When it is mostly in view the
          companion leaves the rail, stands on its console and presses its
          controls. Hover the figure and it waits.
        </p>
      </header>
      <SectionRail sections={benchSections} />
      <DocumentSection
        id="before"
        index="DV-01"
        jp="前"
        label="Before"
        script={scriptFor(["Nothing to operate up here yet."])}
      >
        <p className="text-graphite max-w-prose text-sm">{filler}</p>
        <div className="min-h-svh" />
      </DocumentSection>
      <DocumentSection
        id="bench"
        index="DV-02"
        jp="台"
        label="Station"
        script={scriptFor(["A machine. Let me get my hands on it."])}
      >
        <StubStation />
      </DocumentSection>
      <DocumentSection
        id="after"
        index="DV-03"
        jp="後"
        label="After"
        script={scriptFor(["Back on the rail."])}
      >
        <p className="text-graphite max-w-prose text-sm">{filler}</p>
        <div className="min-h-svh" />
      </DocumentSection>
    </div>
  </div>
);

export default StationBenchPage;
