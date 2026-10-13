import { Dots, Line, Solid } from "@/components/iso/draw";

import type { CatalogArt } from "./catalog-geometry";

type CardArt = CatalogArt["cards"][number];

const cardPart = (card: CardArt, key: string) => (
  <g key={key}>
    <path className="iso-halo" d={card.halo} />
    <Solid
      crease="faint"
      inner={
        <>
          <Line d={card.face.margin} tone="faint" />
          <Line d={card.face.rule} tone="faint" />
          <Line d={card.face.nameRule} free tone="mid" />
          <Line d={card.face.typedRules} free tone="lo" />
          <Line d={card.face.holes} tone="lo" />
          <Line d={card.face.notched} tone="mid" />
        </>
      }
      paths={card.sheet}
      tone="hi"
    />
    <Solid crease="faint" paths={card.tab} tone="hi" />
    {card.clip ? <Solid crease="faint" paths={card.clip} tone="mid" /> : null}
  </g>
);

export const catalogParts = (art: CatalogArt) => {
  const { base, reader, tray } = art;
  return {
    base: (
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
        {base.rails.map((rail) => (
          <g key={rail.rail.outline}>
            <Solid crease="faint" paths={rail.rail} tone="mid" />
            <Solid crease="faint" paths={rail.stop} tone="mid" />
            <Dots points={rail.stopScrews} size={0.4} tone="mid" />
          </g>
        ))}
        <Solid crease="none" paths={base.strip} tone="lo" />
        {base.stripStops.map((paths) => (
          <Solid crease="none" key={paths.outline} paths={paths} tone="mid" />
        ))}
        <Line d={base.ticksMinor} tone="lo" />
        <Line d={base.ticksMajor} tone="mid" />
        <Solid crease="none" paths={base.label} tone="lo" />
        <Line d={base.labelLine} tone="faint" />
        <Line d={base.labelRule} free tone="lo" />
        <Dots points={base.labelScrews} size={0.42} tone="mid" />
      </g>
    ),
    cards: art.cards.map((card, slot) => cardPart(card, `card-${slot}`)),
    key: (
      <g key="key">
        <Solid crease="faint" paths={reader.key.guard} tone="mid" />
        <Dots points={reader.key.guardScrews} size={0.4} tone="mid" />
        <Solid
          crease="none"
          inner={<Line d={reader.key.stemSeam} tone="faint" />}
          paths={reader.key.stem}
          tone="mid"
        />
        <Solid crease="faint" paths={reader.key.cap} tone="hi" />
        <Line d={reader.key.capKnurl} tone="lo" />
        <Line d={reader.key.capRing} tone="faint" />
      </g>
    ),
    lamp: (
      <g key="lamp">
        <Solid crease="faint" paths={reader.lamp.base} tone="mid" />
        <Solid crease="faint" paths={reader.lamp.lens} tone="hi" />
        <Line d={reader.lamp.lensRing} tone="faint" />
      </g>
    ),
    reader: (
      <g key="reader">
        <path className="iso-halo" d={reader.plinth.fill} />
        <Solid crease="faint" paths={reader.plinth} tone="lo" />
        <Solid
          crease="faint"
          inner={<Line d={reader.bodySeam} tone="faint" />}
          paths={reader.body}
          tone="mid"
        />
        <path className="iso-shade" d={reader.slotWell} data-shade={0} />
        <Line d={reader.slot} tone="mid" />
        {reader.lips.map((paths) => (
          <Solid crease="faint" key={paths.outline} paths={paths} tone="mid" />
        ))}
        <Dots points={reader.topScrews} size={0.45} tone="mid" />
        <Line d={reader.vents} tone="lo" />
        <Line d={reader.counter.bezel} tone="lo" />
        <path
          className="iso-shade"
          d={reader.counter.well}
          data-shade={0}
        />
        <Line d={reader.counter.well} tone="mid" />
        <Line d={reader.counter.split} tone="lo" />
        <Dots points={reader.counter.bezelScrews} size={0.4} tone="mid" />
      </g>
    ),
    trayBack: (
      <g key="tray-back">
        <path className="iso-halo" d={tray.floor.fill} />
        <Solid crease="faint" paths={tray.floor} tone="mid" />
        <Solid crease="faint" paths={tray.back} tone="mid" />
        <Solid crease="faint" paths={tray.far} tone="mid" />
        <Solid crease="faint" paths={tray.follower} tone="mid" />
        <Dots points={tray.followerScrews} size={0.4} tone="mid" />
        <Solid crease="faint" paths={tray.followerKnob} tone="mid" />
        <Line d={tray.followerKnurl} tone="lo" />
      </g>
    ),
    trayFront: (
      <g key="tray-front">
        <Solid
          crease="faint"
          inner={<Line d={tray.nearSeam} tone="faint" />}
          paths={tray.near}
          tone="mid"
        />
        {tray.caps.map((paths) => (
          <Solid crease="faint" key={paths.outline} paths={paths} tone="mid" />
        ))}
        <Dots points={tray.capScrews} size={0.4} tone="mid" />
        <Solid
          crease="faint"
          inner={<Line d={tray.panelSeam} tone="faint" />}
          paths={tray.panel}
          tone="mid"
        />
        <Solid crease="none" paths={tray.holder} tone="mid" />
        <Line d={tray.holderCard} tone="faint" />
        <Line d={tray.holderRule} free tone="lo" />
        <Dots points={tray.holderRivets} size={0.4} tone="mid" />
        {tray.pullPosts.map((paths) => (
          <Solid crease="none" key={paths.outline} paths={paths} tone="mid" />
        ))}
        <Solid crease="faint" paths={tray.pullBar} tone="mid" />
      </g>
    ),
  };
};

export type CatalogParts = ReturnType<typeof catalogParts>;
