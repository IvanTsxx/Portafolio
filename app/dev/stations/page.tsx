import type { Metadata } from "next";

import { DocumentSection } from "@/components/site/document-section";
import { Dossier } from "@/components/site/dossier";
import { ThumbIndex } from "@/components/site/thumb-index";

import { StubStation } from "./stub-station";

export const metadata: Metadata = {
  robots: { follow: false, index: false },
  title: "Station bench",
};

const benchSections = [
  { id: "before", index: "DV-01", label: "Before" },
  { id: "bench", index: "DV-02", label: "Station" },
  { id: "after", index: "DV-03", label: "After" },
] as const;

const scriptFor = (lines: readonly string[]) =>
  ({ lines, reveal: "static" }) as const;

const filler =
  "Scroll on. This section only exists to give the page some length, so the rail has distance to cover and the station has somewhere to scroll into and out of view.";

const StationBenchPage = () => (
  <Dossier size="document">
    <header className="flex flex-col gap-3">
      <p className="label text-clay">Dev · Companion operator</p>
      <h1 className="display text-5xl md:text-7xl">Station bench</h1>
      <p className="text-muted-foreground max-w-prose text-sm">
        A stub figure registers a station. When it is mostly in view the
        companion leaves the rail, stands on its console and presses its
        controls. Hover the figure and it waits.
      </p>
    </header>
    <ThumbIndex sections={benchSections} />
    <DocumentSection
      id="before"
      index="DV-01"
      label="Before"
      script={scriptFor(["Nothing to operate up here yet."])}
    >
      <p className="text-graphite max-w-prose text-sm">{filler}</p>
      <div className="min-h-svh" />
    </DocumentSection>
    <DocumentSection
      id="bench"
      index="DV-02"
      label="Station"
      script={scriptFor(["A machine. Let me get my hands on it."])}
    >
      <StubStation />
    </DocumentSection>
    <DocumentSection
      id="after"
      index="DV-03"
      label="After"
      script={scriptFor(["Back on the rail."])}
    >
      <p className="text-graphite max-w-prose text-sm">{filler}</p>
      <div className="min-h-svh" />
    </DocumentSection>
  </Dossier>
);

export default StationBenchPage;
