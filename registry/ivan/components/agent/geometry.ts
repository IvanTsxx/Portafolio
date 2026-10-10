import type { BufferGeometry } from "three";
import {
  BoxGeometry,
  CircleGeometry,
  CylinderGeometry,
  SphereGeometry,
  TorusGeometry,
} from "three";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";

const geometryCache = new Map<string, BufferGeometry>();

const shared = (key: string, create: () => BufferGeometry) => {
  const cached = geometryCache.get(key);
  if (cached) {
    return cached;
  }
  const geometry = create();
  geometryCache.set(key, geometry);
  return geometry;
};

export const roundedBox = (
  width: number,
  height: number,
  depth: number,
  radius: number,
  segments = 3
) =>
  shared(
    `rounded-box:${width}:${height}:${depth}:${radius}:${segments}`,
    () => new RoundedBoxGeometry(width, height, depth, segments, radius)
  );

export const cylinder = (radialSegments = 24) =>
  shared(
    `cylinder:${radialSegments}`,
    () => new CylinderGeometry(1, 1, 1, radialSegments)
  );

export const sphere = (widthSegments = 24) =>
  shared(
    `sphere:${widthSegments}`,
    () =>
      new SphereGeometry(1, widthSegments, Math.max(8, widthSegments * 0.75))
  );

export const dome = () =>
  shared(
    "dome",
    () => new SphereGeometry(1, 40, 20, 0, Math.PI * 2, 0, Math.PI / 2)
  );

export const torus = (tubeRatio: number, arc = Math.PI * 2) =>
  shared(
    `torus:${tubeRatio}:${arc}`,
    () => new TorusGeometry(1, tubeRatio, 12, 48, arc)
  );

export const disc = () => shared("disc", () => new CircleGeometry(1, 64));

export const box = () => shared("box", () => new BoxGeometry(1, 1, 1));
