import { Dots, Line, Solid } from "@/components/iso/draw";

import type { CardArt, ClockArt, RackArt } from "./clock-geometry";

const baseOf = ({ base, board }: ClockArt) => (
  <g key="base">
    <path className="iso-halo" d={base.halo} />
    {base.feet.map(([flange, foot]) =>
      flange && foot ? (
        <g key={flange.outline}>
          <Solid crease="faint" paths={flange} tone="lo" />
          <Solid crease="faint" paths={foot} tone="mid" />
        </g>
      ) : null
    )}
    <Solid
      crease="faint"
      inner={<Line d={base.seam} tone="faint" />}
      paths={base.slab}
      tone="mid"
    />
    <Line d={base.groove} tone="faint" />
    <Line d={base.screwRings} tone="lo" />
    <Dots points={base.screws} size={0.5} tone="mid" />
    <Solid crease="none" paths={base.label} tone="lo" />
    <Line d={base.labelLine} tone="faint" />
    <Line d={base.labelRules} free tone="lo" />
    <Dots points={base.labelScrews} size={0.42} tone="mid" />
    <path className="iso-halo" d={board.halo} />
  </g>
);

const boardOf = ({ board }: ClockArt) => (
  <g key="board">
    {board.brackets.map((paths) => (
      <Solid crease="faint" key={paths.outline} paths={paths} tone="lo" />
    ))}
    <Solid crease="faint" paths={board.slab} tone="lo" />
    <Dots points={board.screws} size={0.45} tone="mid" />
  </g>
);

const rackOf = (rack: RackArt, key: string) => ({
  cheekLeft: (
    <Solid
      crease="faint"
      key={`${key}-cheek-left`}
      paths={rack.cheekLeft}
      tone="mid"
    />
  ),
  cheekRight: (
    <Solid
      crease="faint"
      key={`${key}-cheek-right`}
      paths={rack.cheekRight}
      tone="mid"
    />
  ),
  dividers: rack.dividers.map((paths) => (
    <Solid crease="faint" key={paths.outline} paths={paths} tone="mid" />
  )),
  front: (
    <g key={`${key}-front`}>
      <Solid
        crease="faint"
        inner={<Line d={rack.lipSeam} tone="faint" />}
        paths={rack.lip}
        tone="mid"
      />
      {rack.holders.map((holder) => (
        <Solid
          crease="none"
          inner={
            <>
              <Line d={holder.window} tone="faint" />
              <Line d={holder.rule} free tone="lo" />
            </>
          }
          key={holder.holder.outline}
          paths={holder.holder}
          tone="lo"
        />
      ))}
      <Dots points={rack.rivets} size={0.42} tone="mid" />
    </g>
  ),
  under: (
    <g key={`${key}-under`}>
      {rack.feet.map((paths) => (
        <Solid crease="faint" key={paths.outline} paths={paths} tone="lo" />
      ))}
      <Solid crease="faint" paths={rack.header} tone="mid" />
      <Dots points={rack.headerScrews} size={0.45} tone="mid" />
      <Solid crease="none" paths={rack.back} tone="lo" />
      <Solid crease="faint" paths={rack.shelf} tone="mid" />
    </g>
  ),
});

const cardOf = (card: CardArt) => (
  <Solid
    crease="none"
    inner={
      <>
        <Line d={card.grid} tone="faint" />
        <Line d={card.title} free tone="mid" />
        <Line d={card.stamps} free tone="lo" />
      </>
    }
    key={card.id}
    paths={card.slab}
    tone="hi"
  />
);

const clockOf = ({ clock }: ClockArt) => {
  const { dial, front, side } = clock;
  return (
    <g key="clock">
      <Solid crease="faint" paths={clock.plinth} tone="mid" />
      <Dots points={clock.plinthScrews} size={0.42} tone="mid" />
      <Solid
        crease="faint"
        inner={
          <>
            <Line d={clock.caseSeam} tone="faint" />
            <Line d={front.door} tone="lo" />
            <Line d={front.window} tone="lo" />
            <Line d={front.windowInner} tone="faint" />
            <Line d={front.ribbon} tone="faint" />
            <Line d={front.keyhole} tone="lo" />
            <Line d={side.vents} tone="lo" />
          </>
        }
        paths={clock.case}
        tone="mid"
      />
      <Dots points={[front.keyholeDot]} size={0.5} tone="hi" />
      {front.hinges.map((paths) => (
        <Solid crease="none" key={paths.outline} paths={paths} tone="lo" />
      ))}
      <Solid
        crease="none"
        inner={<Line d={front.plateRules} free tone="lo" />}
        paths={front.plate}
        tone="lo"
      />
      <Dots points={front.plateScrews} size={0.36} tone="mid" />
      <Solid crease="faint" paths={side.housing} tone="mid" />
      <Dots points={side.housingScrews} size={0.42} tone="mid" />
      <Solid crease="faint" paths={side.hub} tone="mid" />
      <Solid crease="faint" paths={clock.cap} tone="mid" />
      <Dots points={clock.capScrews} size={0.45} tone="mid" />
      <Solid crease="faint" paths={clock.throat} tone="mid" />
      <Line d={clock.slot} tone="hi" />
      <Dots points={clock.throatScrews} size={0.4} tone="mid" />
      <Solid
        crease="lo"
        inner={
          <>
            <Line d={dial.bezel} tone="lo" />
            <Line d={dial.ticksMinor} tone="lo" />
            <Line d={dial.ticksMajor} tone="mid" />
            <Line d={dial.zero} tone="hi" />
          </>
        }
        paths={dial.drum}
        tone="mid"
      />
    </g>
  );
};

export const clockParts = (art: ClockArt) => ({
  base: baseOf(art),
  board: boardOf(art),
  cards: art.cards.map(cardOf),
  clock: clockOf(art),
  dialHub: (
    <Solid crease="none" key="dial-hub" paths={art.clock.dial.hub} tone="hi" />
  ),
  racks: [rackOf(art.racks[0], "out"), rackOf(art.racks[1], "in")] as const,
});

export type ClockParts = ReturnType<typeof clockParts>;
