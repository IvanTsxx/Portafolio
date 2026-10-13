import { describe, expect, test } from "bun:test";

import type { GaugeStop } from "./gauge-geometry";
import { aimAt, restOf, scanEndOf, stepMechanism } from "./gauge-motion";
import type { Phase } from "./gauge-motion";

const first: GaugeStop = { end: -108, lane: 24, reach: 23, start: -144 };
const last: GaugeStop = { end: 132, lane: -24, reach: 11, start: 90 };
const LIFT = 3;

const run = (calm: boolean) => {
  const mech = restOf(first);
  aimAt(mech, last);
  const phases: Phase[] = [];
  let lowest = Number.POSITIVE_INFINITY;
  for (
    let frame = 0;
    frame < 600 && stepMechanism(mech, LIFT, 1 / 60, calm);
    frame += 1
  ) {
    if (phases.at(-1) !== mech.phase) {
      phases.push(mech.phase);
    }
    if (mech.phase === "travel") {
      lowest = Math.min(lowest, -mech.ext.at);
    }
  }
  return { lowest, mech, phases };
};

describe("gauge probe", () => {
  test("lifts, travels, touches, then scans the selected block to its end", () => {
    const { mech, phases } = run(false);
    expect(phases).toEqual(["lift", "travel", "touch", "scan"]);
    expect(mech.phase).toBe("rest");
    expect(mech.bx.at).toBe(scanEndOf(last));
    expect(mech.cy.at).toBe(last.lane);
    expect(mech.ext.at).toBe(last.reach);
  });

  test("never lowers the probe while the bridge travels", () => {
    expect(run(false).lowest).toBeGreaterThanOrEqual(-LIFT - 0.6);
  });

  test("jumps straight to rest under reduced motion", () => {
    const mech = restOf(first);
    aimAt(mech, last);
    expect(stepMechanism(mech, LIFT, 1 / 60, true)).toBe(false);
    expect(mech.bx.at).toBe(scanEndOf(last));
    expect(mech.ext.at).toBe(last.reach);
  });

  test("ignores a request for the block it already rests on", () => {
    expect(aimAt(restOf(last), last)).toBe(false);
  });
});
