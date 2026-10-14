import { Dots, FaceText, IsoItem, Line, Solid } from "@/components/iso/draw";
import type { IsoLink } from "@/components/iso/draw";

import type { TowerCrane, TowerFloor, TowerScene } from "./tower-geometry";

const FloorItem = ({
  floor,
  link,
  type,
}: {
  floor: TowerFloor;
  link: IsoLink | undefined;
  type: number;
}) => (
  <IsoItem className="iso-floor" index={floor.index} link={link}>
    <g className="iso-lift">
      <Solid crease="faint" paths={floor.slab} tone="mid" />
      <Line d={floor.slabSeams} tone="faint" />
      <Solid crease="none" paths={floor.sign} tone="lo" />
      <g className="iso-print">
        <FaceText size={5.4} strong transform={floor.signAt}>
          {floor.company}
        </FaceText>
      </g>
      <Solid
        crease="none"
        inner={<Line d={floor.wallSeams} tone="faint" />}
        paths={floor.wallBack}
        tone="lo"
      />
      <Solid crease="none" paths={floor.wallLeft} tone="lo" />
      {floor.desks.map((desk) => (
        <g key={desk.desk.outline}>
          <Solid crease="none" paths={desk.chair} tone="lo" />
          <Solid crease="faint" paths={desk.desk} tone="mid" />
          <g className="iso-screen">
            <Solid crease="none" paths={desk.screen} tone="mid" />
          </g>
        </g>
      ))}
      <Line d={floor.mullions} tone="faint" />
      {floor.columns.map((column) => (
        <Solid crease="none" key={column.outline} paths={column} tone="mid" />
      ))}
      <path className="iso-focus" d={floor.slab.fill} />
    </g>
    <g className="iso-print iso-callout">
      <path className="iso-line" d={floor.callout.leader} data-tone="faint" />
      <path className="iso-line" d={floor.callout.tick} data-tone="mid" />
      <text
        className="iso-text"
        data-tone="lo"
        fontSize={7 * type}
        x={floor.callout.levelAt[0]}
        y={floor.callout.levelAt[1]}
      >
        {floor.callout.level}
      </text>
      <text
        className="iso-text"
        data-strong
        data-tone="mid"
        fontSize={(type > 1 ? 13 : 11) * type}
        x={floor.callout.companyAt[0]}
        y={floor.callout.companyAt[1]}
      >
        {floor.callout.company}
      </text>
      {floor.callout.notes.map((note) => (
        <text
          className="iso-text"
          data-tone="lo"
          fontSize={7.5 * type}
          key={note.text}
          x={note.at[0]}
          y={note.at[1]}
        >
          {note.text}
        </text>
      ))}
    </g>
  </IsoItem>
);

const Crane = ({ crane }: { crane: TowerCrane }) => (
  <g className="iso-above">
    <Solid
      crease="faint"
      inner={<Line d={crane.deckSeams} tone="faint" />}
      paths={crane.deck}
      tone="mid"
    />
    {crane.rails.map((rail) => (
      <Solid crease="none" key={rail.outline} paths={rail} tone="mid" />
    ))}
    {crane.pallet.map((board) => (
      <Solid crease="faint" key={board.outline} paths={board} tone="lo" />
    ))}
    <Solid crease="none" paths={crane.counterweight} tone="mid" />
    <Solid crease="none" paths={crane.counterJib} tone="mid" />
    <Solid crease="none" paths={crane.mast} tone="mid" />
    <Line d={crane.mastLattice} tone="lo" />
    <Solid crease="none" paths={crane.cab} tone="mid" />
    <Solid crease="none" paths={crane.boom} tone="mid" />
    <Line d={crane.boomLattice} tone="lo" />
    <Solid crease="none" paths={crane.trolley} tone="hi" />
    <g className="iso-bob">
      <Line d={crane.hoist} tone="mid" />
      <Solid crease="none" paths={crane.hook} tone="hi" />
      <Solid
        crease="faint"
        inner={<Line d={crane.loadSeams} tone="faint" />}
        paths={crane.load}
        tone="hi"
      />
    </g>
  </g>
);

export const TowerFigure = ({
  links,
  scene,
}: {
  links: readonly IsoLink[];
  scene: TowerScene;
}) => {
  const { crane, floors, ground, roof } = scene;
  return (
    <svg className="iso-svg" viewBox={scene.viewBox}>
      <path className="iso-halo" d={ground.halo} />
      <Solid
        crease="faint"
        inner={<Line d={ground.plateSeam} tone="faint" />}
        paths={ground.plate}
        tone="mid"
      />
      <Line d={ground.curb} tone="faint" />
      <Dots points={ground.screws} size={0.55} tone="mid" />
      <Solid crease="none" paths={ground.walk} tone="lo" />
      <Line d={ground.walkSeams} tone="faint" />
      {floors.map((floor) => (
        <FloorItem
          floor={floor}
          key={floor.index}
          link={links[floor.index]}
          type={scene.type}
        />
      ))}
      {roof ? (
        <g className="iso-above">
          <Solid crease="faint" paths={roof} tone="mid" />
        </g>
      ) : null}
      {crane ? <Crane crane={crane} /> : null}
    </svg>
  );
};
