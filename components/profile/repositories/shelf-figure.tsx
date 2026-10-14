import type { CSSProperties } from "react";

import { Dots, FaceText, Line, Solid } from "@/components/iso/draw";

import type { ShelfBox, ShelfScene } from "./shelf-geometry";

const BoxItem = ({
  box,
  clipId,
  label,
}: {
  box: ShelfBox;
  clipId: string;
  label: string;
}) => (
  <g
    aria-label={label}
    className="iso-item"
    data-item={box.index}
    role="button"
    style={
      {
        "--lid-x": `${box.lidOpen[0].toFixed(1)}px`,
        "--lid-y": `${box.lidOpen[1].toFixed(1)}px`,
      } as CSSProperties
    }
    tabIndex={0}
  >
    <path className="iso-shadow" d={box.shadow} />
    <Solid
      crease="faint"
      inner={<Line d={box.bodySeam} tone="faint" />}
      paths={box.body}
      tone="mid"
    />
    {box.corners.map((corner) => (
      <Solid crease="none" key={corner.outline} paths={corner} tone="lo" />
    ))}
    <Line d={box.label} tone="faint" />
    <path className="iso-swatch" d={box.swatch} data-swatch={box.swatchTone} />
    <g className="iso-print">
      <FaceText size={6.5} transform={box.languageAt}>
        {box.language}
      </FaceText>
      <FaceText anchor="end" size={7} strong transform={box.starsAt}>
        {box.stars}
      </FaceText>
    </g>
    <path className="iso-recess" d={box.recess} />
    <clipPath id={clipId}>
      <path d={box.mouth} />
    </clipPath>
    <g clipPath={`url(#${clipId})`}>
      <g className="iso-sheets">
        {box.sheets.map((sheet) => (
          <Solid
            crease="none"
            inner={<Line d={sheet.rules} free tone="faint" />}
            key={sheet.sheet.outline}
            paths={sheet.sheet}
            tone="mid"
          />
        ))}
      </g>
    </g>
    <g className="iso-lid">
      <Solid crease="faint" paths={box.lid} tone="mid" />
      <Line d={box.lidGroove} tone="faint" />
      <Line d={box.tape} tone="faint" />
      <g className="iso-print">
        <FaceText size={6} tone="lo" transform={box.ownerAt}>
          {box.owner}
        </FaceText>
        <FaceText size={10} strong transform={box.nameAt}>
          {box.name}
        </FaceText>
        {box.tags.map((tag) => (
          <g key={tag.text}>
            <path className="iso-line" d={tag.outline} data-tone="faint" />
            <FaceText size={5} tone="lo" transform={tag.at}>
              {tag.text}
            </FaceText>
          </g>
        ))}
      </g>
      <path className="iso-focus" d={box.lid.fill} />
    </g>
  </g>
);

export const ShelfFigure = ({
  idPrefix,
  labels,
  scene,
}: {
  idPrefix: string;
  labels: readonly string[];
  scene: ShelfScene;
}) => {
  const { boxes, plate } = scene;
  return (
    <svg className="iso-svg" role="group" viewBox={scene.viewBox}>
      <path className="iso-halo" d={plate.halo} />
      {plate.feet.map((foot) => (
        <Solid crease="none" key={foot.outline} paths={foot} tone="lo" />
      ))}
      <Solid
        crease="faint"
        inner={<Line d={plate.seam} tone="faint" />}
        paths={plate.slab}
        tone="mid"
      />
      <Line d={plate.groove} tone="faint" />
      <Line d={plate.rules} tone="faint" />
      <Dots points={plate.screws} size={0.55} tone="mid" />
      {boxes.map((box) => (
        <BoxItem
          box={box}
          clipId={`${idPrefix}-mouth-${box.index}`}
          key={box.index}
          label={labels[box.index] ?? box.name}
        />
      ))}
    </svg>
  );
};
