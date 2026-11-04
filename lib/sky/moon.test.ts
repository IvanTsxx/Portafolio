import { describe, expect, test } from "bun:test";

import { moonLightDirection, readMoon } from "./moon";

describe("readMoon", () => {
  test("reads a known full moon as full", () => {
    const reading = readMoon(new Date(Date.UTC(2024, 0, 25, 17, 54)));
    expect(reading.name).toBe("Full moon");
    expect(reading.illumination).toBeGreaterThan(0.98);
  });

  test("reads a known new moon as new", () => {
    const reading = readMoon(new Date(Date.UTC(2024, 1, 9, 22, 59)));
    expect(reading.name).toBe("New moon");
    expect(reading.illumination).toBeLessThan(0.02);
  });

  test("reads a known first quarter as half lit and waxing", () => {
    const reading = readMoon(new Date(Date.UTC(2024, 1, 16, 15, 1)));
    expect(reading.name).toBe("First quarter");
    expect(reading.isWaxing).toBe(true);
    expect(reading.illumination).toBeGreaterThan(0.4);
    expect(reading.illumination).toBeLessThan(0.6);
  });
});

describe("moonLightDirection", () => {
  test("lights a full moon from the viewer", () => {
    const [x, , z] = moonLightDirection(0.5, "south");
    expect(Math.abs(x)).toBeLessThan(1e-9);
    expect(z).toBeCloseTo(1);
  });

  test("mirrors the lit side between hemispheres", () => {
    const [north] = moonLightDirection(0.25, "north");
    const [south] = moonLightDirection(0.25, "south");
    expect(north).toBeCloseTo(-south);
  });
});
