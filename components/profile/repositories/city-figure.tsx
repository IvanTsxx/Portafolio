import { Dots, FaceText, IsoItem, Line, Solid } from "@/components/iso/draw";
import type { IsoLink } from "@/components/iso/draw";

import type { CityScene, CityTower } from "./city-geometry";

const TowerItem = ({
  link,
  tower,
}: {
  link: IsoLink | undefined;
  tower: CityTower;
}) => (
  <IsoItem index={tower.index} link={link}>
    <path className="iso-shadow" d={tower.shadow} />
    <g className="iso-lift">
      <Solid crease="faint" paths={tower.lobby} tone="mid" />
      <path className="iso-door" d={tower.door} />
      {tower.floors.map((floor) => (
        <Solid crease="faint" key={floor.outline} paths={floor} tone="mid" />
      ))}
      {tower.windows.map((pane) => (
        <path
          className="iso-window"
          d={pane.d}
          key={pane.d}
          style={{ transitionDelay: `${pane.storey * 50}ms` }}
        />
      ))}
      <Solid crease="faint" paths={tower.parapet} tone="mid" />
      <Line d={tower.roofDeck} tone="faint" />
      <Solid crease="none" paths={tower.tank} tone="lo" />
      <Solid crease="none" paths={tower.antenna} tone="mid" />
      <path className="iso-focus" d={tower.lobby.fill} />
    </g>
    <Solid crease="none" paths={tower.post} tone="mid" />
    <Solid crease="none" paths={tower.sign} tone="hi" />
    <path
      className="iso-swatch"
      d={tower.swatch}
      data-swatch={tower.swatchTone}
    />
    <g className="iso-print">
      <FaceText size={5} tone="lo" transform={tower.ownerAt}>
        {tower.owner}
      </FaceText>
      <FaceText size={8} strong transform={tower.nameAt}>
        {tower.name}
      </FaceText>
      <FaceText size={5.5} tone="mid" transform={tower.languageAt}>
        {tower.language}
      </FaceText>
      <FaceText anchor="end" size={6} strong transform={tower.starsAt}>
        {tower.stars}
      </FaceText>
    </g>
  </IsoItem>
);

export const CityFigure = ({
  links,
  scene,
}: {
  links: readonly IsoLink[];
  scene: CityScene;
}) => {
  const { plate, towers } = scene;
  return (
    <svg className="iso-svg" viewBox={scene.viewBox}>
      <path className="iso-halo" d={plate.halo} />
      {plate.feet.map((foot) => (
        <Solid crease="none" key={foot.outline} paths={foot} tone="lo" />
      ))}
      <Solid crease="faint" paths={plate.slab} tone="mid" />
      <Line d={plate.groove} tone="faint" />
      <Line d={plate.dashes} tone="faint" />
      <Dots points={plate.screws} size={0.55} tone="mid" />
      {plate.blocks.map((block) => (
        <Solid crease="faint" key={block.outline} paths={block} tone="lo" />
      ))}
      {towers.map((tower) => (
        <TowerItem key={tower.index} link={links[tower.index]} tower={tower} />
      ))}
    </svg>
  );
};
