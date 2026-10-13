import { Ball, Dots, Line, Solid } from "@/components/iso/draw";

import type { GaugeArt } from "./gauge-geometry";

const Clamps = ({ side }: { side: GaugeArt["railBack"] }) => (
  <>
    {side.clamps.map((paths) => (
      <Solid crease="faint" key={paths.outline} paths={paths} tone="lo" />
    ))}
    <Dots points={side.clampScrews} size={0.4} tone="mid" />
  </>
);

const rail = (side: GaugeArt["railBack"], key: string, isFront: boolean) => (
  <g key={key}>
    {isFront ? null : <Clamps side={side} />}
    <Solid crease="faint" paths={side.rail} tone="mid" />
    <Dots points={side.screws} size={0.45} tone="mid" />
    {side.stops.map((paths) => (
      <Solid crease="faint" key={paths.outline} paths={paths} tone="mid" />
    ))}
    {isFront ? <Clamps side={side} /> : null}
  </g>
);

const bearing = (side: GaugeArt["bearingBack"]) => (
  <>
    <Solid crease="faint" paths={side.bearing} tone="mid" />
    {side.reader ? (
      <Solid crease="none" paths={side.reader} tone="mid" />
    ) : null}
    <Solid crease="none" paths={side.lockBack} tone="mid" />
    <Line d={side.lockBackKnurl} tone="lo" />
    <Solid
      crease="faint"
      inner={<Line d={side.legSeams} tone="faint" />}
      paths={side.leg}
      tone="mid"
    />
    <Solid crease="none" paths={side.lockFront} tone="mid" />
    <Line d={side.lockFrontKnurl} tone="lo" />
  </>
);

export const gaugeParts = (art: GaugeArt) => {
  const { base, beam, carriage, console: panel, now, plate, ram } = art;
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
        {base.handlePosts.map((paths) => (
          <Solid crease="none" key={paths.outline} paths={paths} tone="mid" />
        ))}
        {base.handleBars.map((paths) => (
          <Solid crease="faint" key={paths.outline} paths={paths} tone="mid" />
        ))}
        <Line d={base.screwRings} tone="lo" />
        <Dots points={base.screws} size={0.5} tone="mid" />
        <Solid crease="none" paths={base.label} tone="lo" />
        <Line d={base.labelLine} tone="faint" />
        <Line d={base.labelRule} free tone="lo" />
        <Dots points={base.labelScrews} size={0.42} tone="mid" />
      </g>
    ),
    blocks: art.blocks.map((block, index) => (
      <g data-job={index} key={block.slab.outline}>
        <path className="iso-halo" d={block.halo} />
        <Solid
          crease="faint"
          inner={<Line d={block.engraving} free tone="lo" />}
          paths={block.slab}
          tone="hi"
        />
      </g>
    )),
    bridgeBack: <g key="bridge-back">{bearing(art.bearingBack)}</g>,
    bridgeFront: (
      <g key="bridge-front">
        {bearing(art.bearingFront)}
        <Solid crease="faint" paths={beam.beam} tone="mid" />
        <Line d={beam.ticksMinor} tone="lo" />
        <Line d={beam.ticksMajor} tone="mid" />
        {beam.caps.map((paths) => (
          <Solid crease="faint" key={paths.outline} paths={paths} tone="mid" />
        ))}
        <Dots points={beam.capScrews} size={0.42} tone="mid" />
      </g>
    ),
    console: (
      <g key="console">
        {panel.rack.map((paths) => (
          <Solid crease="faint" key={paths.outline} paths={paths} tone="mid" />
        ))}
        <path className="iso-halo" d={panel.box.fill} />
        <Solid crease="faint" paths={panel.box} tone="mid" />
        <Line d={panel.panel} tone="faint" />
        <Dots points={panel.screws} size={0.42} tone="mid" />
        {panel.estop.map((paths, index) => (
          <Solid
            crease="faint"
            key={paths.outline}
            paths={paths}
            tone={index ? "hi" : "mid"}
          />
        ))}
        {panel.knobs.map((paths) => (
          <Solid crease="faint" key={paths.outline} paths={paths} tone="mid" />
        ))}
        <Line d={panel.knobKnurls} tone="lo" />
        <Line d={panel.knobPointers} tone="hi" />
        <Solid crease="faint" paths={panel.stickBase} tone="mid" />
        <Line d={panel.stickBoot} tone="lo" />
        <Solid crease="none" paths={panel.stickShaft} tone="mid" />
        <Solid crease="faint" paths={panel.stickKnob} tone="hi" />
      </g>
    ),
    housing: (
      <g key="housing">
        <Solid
          crease="faint"
          inner={<Line d={carriage.housingSeams} tone="faint" />}
          paths={carriage.housing}
          tone="mid"
        />
        <Solid crease="faint" paths={carriage.cap} tone="mid" />
        {carriage.brackets.map((paths) => (
          <Solid crease="none" key={paths.outline} paths={paths} tone="mid" />
        ))}
        <Solid
          crease="none"
          inner={<Line d={carriage.balancerBands} tone="faint" />}
          paths={carriage.balancer}
          tone="mid"
        />
        <Dots points={carriage.capScrews} size={0.4} tone="mid" />
      </g>
    ),
    plate: (
      <g key="plate">
        <path className="iso-halo" d={plate.slab.fill} />
        <Solid
          crease="faint"
          inner={<Line d={plate.seam} tone="faint" />}
          paths={plate.slab}
          tone="mid"
        />
        <Line d={plate.groove} tone="faint" />
        <Line d={plate.lanes} tone="faint" />
        <Line d={plate.insertRings} tone="lo" />
        <Dots points={plate.insertDots} size={0.45} tone="mid" />
        <Solid crease="none" paths={plate.strip} tone="lo" />
        {plate.stripStops.map((paths) => (
          <Solid crease="none" key={paths.outline} paths={paths} tone="mid" />
        ))}
        <Line d={plate.ticksMinor} tone="lo" />
        <Line d={plate.ticksMajor} tone="mid" />
        <Line d={plate.zero} tone="hi" />
        {plate.fenceClamps.map((paths) => (
          <Solid crease="faint" key={paths.outline} paths={paths} tone="lo" />
        ))}
        <Dots points={plate.fenceClampScrews} size={0.4} tone="mid" />
        <Solid crease="faint" paths={plate.fence} tone="mid" />
        <Dots points={plate.fenceScrews} size={0.42} tone="mid" />
        {now ? (
          <>
            <Solid crease="none" paths={now.rider} tone="hi" />
            <Line d={now.tick} tone="hi" />
          </>
        ) : null}
      </g>
    ),
    railBack: rail(art.railBack, "rail-back", false),
    railFront: rail(art.railFront, "rail-front", true),
    ram: (
      <g key="ram">
        <Ball
          center={ram.ball.center}
          radius={ram.ball.radius}
          shine={ram.ballShine}
        />
        <Solid crease="none" paths={ram.stylus} tone="mid" />
        <Solid crease="faint" paths={ram.module} tone="mid" />
        <Solid
          crease="faint"
          inner={<Line d={ram.headSeam} tone="faint" />}
          paths={ram.head}
          tone="mid"
        />
        <Solid crease="none" paths={ram.ram} tone="mid" />
      </g>
    ),
    saddle: (
      <g key="saddle">
        <Solid crease="faint" paths={carriage.saddle} tone="mid" />
        <Dots points={carriage.saddleScrews} size={0.42} tone="mid" />
        <Solid crease="none" paths={carriage.reader} tone="lo" />
        <Solid crease="faint" paths={carriage.knob} tone="mid" />
        <Line d={carriage.knobKnurl} tone="lo" />
        <Line d={carriage.knobPointer} tone="hi" />
      </g>
    ),
  };
};

export type GaugeParts = ReturnType<typeof gaugeParts>;
