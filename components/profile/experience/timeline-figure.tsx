import { Dots, FaceText, Line, Solid } from "@/components/iso/draw";

import type { TimelineBlock, TimelineScene } from "./timeline-geometry";

const BlockItem = ({
  block,
  label,
}: {
  block: TimelineBlock;
  label: string;
}) => (
  <g
    aria-label={label}
    className="iso-item"
    data-item={block.index}
    role="button"
    tabIndex={0}
  >
    <path className="iso-shadow" d={block.shadow} />
    <g className="iso-print">
      <Line d={block.tie} tone="faint" />
      <FaceText size={8} strong transform={block.roleAt}>
        {block.role}
      </FaceText>
      <FaceText size={6.5} tone="lo" transform={block.endsAt}>
        {block.ends}
      </FaceText>
    </g>
    <g className="iso-lift">
      <Solid
        crease="faint"
        inner={
          <>
            <Line d={block.seam} tone="faint" />
            <Line d={block.seams} tone="faint" />
          </>
        }
        paths={block.lift}
        tone="mid"
      />
      <Line d={block.topGroove} tone="faint" />
      <Dots points={block.screws} size={0.5} tone="mid" />
      <g className="iso-print">
        <FaceText size={10} strong transform={block.companyAt}>
          {block.company}
        </FaceText>
        <FaceText anchor="end" size={5.5} tone="lo" transform={block.lengthAt}>
          {block.length}
        </FaceText>
      </g>
      <path className="iso-focus" d={block.lift.fill} />
    </g>
  </g>
);

export const TimelineFigure = ({
  labels,
  scene,
}: {
  labels: readonly string[];
  scene: TimelineScene;
}) => {
  const { base, blocks, growth, now, ruler } = scene;
  return (
    <svg className="iso-svg" role="group" viewBox={scene.viewBox}>
      <path className="iso-halo" d={base.halo} />
      {base.feet.map((foot) => (
        <Solid crease="none" key={foot.outline} paths={foot} tone="lo" />
      ))}
      <Solid
        crease="faint"
        inner={<Line d={base.plateSeam} tone="faint" />}
        paths={base.plate}
        tone="mid"
      />
      <Line d={base.groove} tone="faint" />
      <Line d={base.yearLines} tone="faint" />
      <Line d={base.lanes} tone="faint" />
      <Line d={base.screwRings} tone="lo" />
      <Dots points={base.screws} size={0.55} tone="mid" />
      {base.laneMarks.map((mark) => (
        <FaceText key={mark.label} size={5.5} tone="lo" transform={mark.at}>
          {mark.label}
        </FaceText>
      ))}
      <Solid crease="faint" paths={ruler.strip} tone="lo" />
      <Line d={ruler.minors} tone="lo" />
      <Line d={ruler.majors} tone="hi" />
      {ruler.years.map((year) => (
        <FaceText key={year.label} size={7} tone="mid" transform={year.at}>
          {year.label}
        </FaceText>
      ))}
      {blocks.map((block) => (
        <BlockItem
          block={block}
          key={block.index}
          label={labels[block.index] ?? block.company}
        />
      ))}
      <g className="iso-growth">
        {growth.map((wafer) => (
          <g className="iso-wafer" key={wafer.outline}>
            <Solid crease="none" paths={wafer} tone="lo" />
          </g>
        ))}
      </g>
      <Solid crease="none" paths={now.socket} tone="mid" />
      <Solid crease="none" paths={now.post} tone="mid" />
      <Solid crease="none" paths={now.flag} tone="hi" />
      <FaceText size={6} tone="hi" transform={now.labelAt}>
        Now
      </FaceText>
    </svg>
  );
};
