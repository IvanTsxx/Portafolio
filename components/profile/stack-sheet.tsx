import {
  PanelCount,
  DocumentSection,
} from "@/components/site/document-section";
import { practiceNotes, stack } from "@/lib/site/practice";

import { TickMark } from "./module";

export const StackSheet = () => (
  <DocumentSection
    aside={<PanelCount current={stack.length} total={stack.length} />}
    id="stack"
    index="GH-11"
    waypoint={{ action: "carry", role: "builder", side: "right" }}
    jp="技術"
    label="Stack"
  >
    <div className="relative">
      <ul className="border-rule grid grid-cols-2 border-t border-l sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
        {stack.map((item, index) => (
          <li
            className="border-rule relative flex flex-col gap-3 border-r border-b p-4"
            key={item.code}
          >
            <span className="label text-mist flex items-baseline justify-between tabular-nums">
              <span>T-{String(index + 1).padStart(2, "0")}</span>
              <span className="jp">{item.jp}</span>
            </span>
            <span className="text-ink font-mono text-3xl font-light tracking-tight">
              {item.code}
            </span>
            <span className="label text-graphite normal-case">{item.name}</span>
          </li>
        ))}
      </ul>
    </div>
    {practiceNotes.map((note) => (
      <p
        className="border-rule-strong relative flex flex-wrap items-baseline gap-x-4 gap-y-1 border border-dashed p-4"
        key={note}
      >
        <TickMark />
        <span className="label text-mist">
          Note <span className="jp">注記</span>
        </span>
        <span className="text-ink text-sm leading-relaxed text-pretty">
          {note}
        </span>
      </p>
    ))}
  </DocumentSection>
);
