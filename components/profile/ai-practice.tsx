import { AgentScene } from "@/components/scene/agent-scene";
import type { AgentSceneId } from "@/lib/agents/scenes";
import { aiPractice } from "@/lib/site/practice";
import { cn } from "@/lib/utils";

import { TickMark } from "./module";
import { PanelCount, SectionFrame } from "./section-frame";

type PracticeId = (typeof aiPractice)[number]["id"];

type PracticeTile =
  | { kind: "cell"; id: PracticeId; span: string }
  | {
      kind: "scene";
      scene: AgentSceneId;
      code: string;
      label: string;
      jp: string;
      span: string;
      frame?: string;
    };

const practiceTiles: readonly PracticeTile[] = [
  { id: "conductor", kind: "cell", span: "lg:col-span-4" },
  { id: "agents", kind: "cell", span: "lg:col-span-3" },
  {
    code: "SC-01",
    frame: "lg:aspect-video",
    jp: "機能",
    kind: "scene",
    label: "Feature",
    scene: "feature",
    span: "lg:col-span-5",
  },
  {
    code: "SC-02",
    frame: "lg:aspect-video",
    jp: "探索",
    kind: "scene",
    label: "Code search",
    scene: "code-search",
    span: "lg:col-span-5",
  },
  { id: "skills", kind: "cell", span: "lg:col-span-3" },
  { id: "mcp", kind: "cell", span: "lg:col-span-4" },
  { id: "design-to-code", kind: "cell", span: "lg:col-span-3" },
  {
    code: "SC-03",
    jp: "変換",
    kind: "scene",
    label: "Figma to code",
    scene: "figma-to-code",
    span: "lg:col-span-3",
  },
  { id: "judgment", kind: "cell", span: "lg:col-span-3" },
  {
    code: "SC-04",
    jp: "調査",
    kind: "scene",
    label: "Debugging",
    scene: "debugging",
    span: "lg:col-span-3",
  },
];

const practiceById = new Map(
  aiPractice.map((entry, index) => [entry.id, { ...entry, index }])
);

const PracticeCell = ({ id, span }: { id: PracticeId; span: string }) => {
  const entry = practiceById.get(id);
  if (!entry) {
    return null;
  }
  return (
    <li
      className={cn(
        "border-rule relative flex min-h-56 flex-col gap-3 border-r border-b p-4 md:p-5",
        span
      )}
    >
      <TickMark />
      <p className="label flex items-baseline justify-between">
        <span className="text-mist tabular-nums">
          AI-{String(entry.index + 1).padStart(2, "0")}
        </span>
        <span className="jp text-mist">{entry.jp}</span>
      </p>
      <h3 className="text-ink text-xl leading-tight font-light tracking-tight text-balance">
        {entry.title}
      </h3>
      <p className="text-graphite max-w-xs text-sm leading-relaxed text-pretty">
        {entry.summary}
      </p>
      <span
        aria-hidden
        className="jp text-graphite/25 mt-auto text-6xl leading-none font-light select-none"
      >
        {entry.jp}
      </span>
    </li>
  );
};

const SceneTile = ({
  tile,
}: {
  tile: Extract<PracticeTile, { kind: "scene" }>;
}) => (
  <li
    className={cn(
      "border-rule bg-paper-deep/40 relative flex flex-col border-r border-b",
      tile.span
    )}
  >
    <AgentScene
      className={tile.frame}
      label={`${tile.label} scene: agents at work`}
      scene={tile.scene}
    />
    <p className="label border-rule mt-auto flex items-baseline justify-between border-t px-4 py-2">
      <span className="flex items-baseline gap-2">
        <span className="text-mist tabular-nums">{tile.code}</span>
        <span className="text-ink">{tile.label}</span>
      </span>
      <span className="jp text-mist">{tile.jp}</span>
    </p>
  </li>
);

export const AiPractice = () => (
  <SectionFrame
    aside={<PanelCount current={aiPractice.length} total={aiPractice.length} />}
    id="ai-practice"
    index="GH-08"
    jp="AI実務"
    label="AI practice"
  >
    <ul className="border-rule grid border-t border-l md:grid-cols-2 lg:grid-cols-12">
      {practiceTiles.map((tile) =>
        tile.kind === "cell" ? (
          <PracticeCell id={tile.id} key={tile.id} span={tile.span} />
        ) : (
          <SceneTile key={tile.scene} tile={tile} />
        )
      )}
    </ul>
  </SectionFrame>
);
