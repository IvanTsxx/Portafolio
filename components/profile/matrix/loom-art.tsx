import { Dots, Line, Solid } from "@/components/iso/draw";

import type { LoomArt } from "./loom-geometry";

const rail = (side: LoomArt["railBack"]) => (
  <>
    <Solid crease="faint" paths={side.rail} tone="mid" />
    <Line d={side.teeth} tone="faint" />
    <Dots points={side.screws} size={0.45} tone="mid" />
    {side.stops.map((paths) => (
      <Solid crease="faint" key={paths.outline} paths={paths} tone="mid" />
    ))}
    <Dots points={side.stopScrews} size={0.4} tone="mid" />
  </>
);

export const loomParts = (art: LoomArt) => {
  const {
    base,
    bed,
    bridgeBack,
    bridgeFront,
    console: panel,
    drive,
    railBack,
    railFront,
  } = art;
  return {
    base: (
      <g key="base">
        <path className="iso-halo" d={base.halo} />
        {base.feet.map(({ flange, foot }) => (
          <g key={flange.outline}>
            <Solid crease="faint" paths={flange} tone="lo" />
            <Solid crease="faint" paths={foot} tone="mid" />
          </g>
        ))}
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
        <Line d={base.labelRule} free tone="lo" />
        <Dots points={base.labelScrews} size={0.42} tone="mid" />
      </g>
    ),
    bed: (
      <g key="bed">
        <path className="iso-halo" d={bed.slab.fill} />
        <Solid
          crease="faint"
          inner={<Line d={bed.seam} tone="faint" />}
          paths={bed.slab}
          tone="mid"
        />
        <Line d={bed.field} tone="faint" />
        <Line d={bed.screwRings} tone="lo" />
        <Dots points={bed.screws} size={0.45} tone="mid" />
        <Line d={bed.detentTrack} tone="faint" />
        <Line d={bed.detentRings} tone="lo" />
        <Dots points={bed.detentDots} size={0.42} tone="mid" />
        <Solid crease="none" paths={bed.strip} tone="lo" />
        <Line d={bed.ticksMinor} tone="lo" />
        <Line d={bed.ticksMajor} tone="mid" />
      </g>
    ),
    bridgeBack: (
      <g key="bridge-back">
        <Solid crease="faint" paths={bridgeBack.carriage} tone="mid" />
        <Dots points={bridgeBack.carriageScrews} size={0.4} tone="mid" />
        <Solid crease="faint" paths={bridgeBack.knob} tone="mid" />
        <Line d={bridgeBack.knobKnurl} tone="lo" />
        <Solid
          crease="faint"
          inner={<Line d={bridgeBack.legSeams} tone="faint" />}
          paths={bridgeBack.leg}
          tone="mid"
        />
      </g>
    ),
    bridgeFront: (
      <g key="bridge-front">
        <Solid
          crease="faint"
          inner={<Line d={bridgeFront.headSeam} tone="faint" />}
          paths={bridgeFront.head}
          tone="mid"
        />
        {bridgeFront.fingers.map((paths) => (
          <Solid crease="none" key={paths.outline} paths={paths} tone="mid" />
        ))}
        <Solid crease="faint" paths={bridgeFront.carriage} tone="mid" />
        <Dots points={bridgeFront.carriageScrews} size={0.4} tone="mid" />
        <Solid
          crease="faint"
          inner={<Line d={bridgeFront.legSeams} tone="faint" />}
          paths={bridgeFront.leg}
          tone="mid"
        />
        <Solid crease="faint" paths={bridgeFront.beam} tone="mid" />
        <Line d={bridgeFront.rowMarks} tone="faint" />
        {bridgeFront.beamCaps.map((paths) => (
          <Solid crease="faint" key={paths.outline} paths={paths} tone="mid" />
        ))}
        <Dots points={bridgeFront.beamCapScrews} size={0.4} tone="mid" />
        <g data-lamp>
          <Solid crease="faint" paths={bridgeFront.lamp} tone="hi" />
        </g>
      </g>
    ),
    console: (
      <g key="console">
        <path className="iso-halo" d={panel.box.fill} />
        <Solid
          crease="faint"
          inner={<Line d={panel.boxSeam} tone="faint" />}
          paths={panel.box}
          tone="mid"
        />
        <Line d={panel.panel} tone="faint" />
        <Dots points={panel.screws} size={0.42} tone="mid" />
        <Line d={panel.vents} tone="lo" />
        <Line d={panel.sweepBezel} tone="faint" />
        <g className="cursor-pointer" data-control="sweep">
          <Solid
            crease="faint"
            inner={<Line d={panel.sweepSeam} tone="faint" />}
            paths={panel.sweep}
            tone="hi"
          />
          <Line d={panel.sweepRing} tone="lo" />
        </g>
        <Line d={panel.busiestBezel} tone="faint" />
        <g className="cursor-pointer" data-control="busiest">
          <Solid crease="faint" paths={panel.busiest} tone="mid" />
          <Line d={panel.busiestRing} tone="lo" />
        </g>
        {panel.keys.map((key) => (
          <g
            className="group cursor-pointer"
            data-control="year"
            data-year={key.year}
            key={key.year}
          >
            <Line d={key.bezel} tone="faint" />
            <g className="group-data-pressed:hidden">
              <Solid crease="faint" paths={key.up} tone="mid" />
            </g>
            <g className="hidden group-data-pressed:inline">
              <Solid crease="faint" paths={key.down} tone="hi" />
            </g>
          </g>
        ))}
      </g>
    ),
    drive: (
      <g key="drive">
        <Solid
          crease="faint"
          inner={<Line d={drive.blockSeam} tone="faint" />}
          paths={drive.block}
          tone="mid"
        />
        <Dots points={drive.blockScrews} size={0.4} tone="mid" />
        <Solid crease="faint" paths={drive.wheel} tone="mid" />
        <Line d={drive.wheelKnurl} tone="lo" />
        <Line d={drive.wheelHub} tone="lo" />
        <Solid crease="none" paths={drive.crank} tone="mid" />
        <Solid crease="faint" paths={drive.crankKnob} tone="hi" />
      </g>
    ),
    railBack: <g key="rail-back">{rail(railBack)}</g>,
    railFront: <g key="rail-front">{rail(railFront)}</g>,
  };
};

export type LoomParts = ReturnType<typeof loomParts>;
