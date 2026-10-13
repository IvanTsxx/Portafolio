import type { BufferGeometry, PerspectiveCamera } from "three";
import {
  BoxGeometry,
  CircleGeometry,
  Color,
  Euler,
  Float32BufferAttribute,
  MathUtils,
  Matrix4,
  Quaternion,
  Vector3,
} from "three";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";

import type { Piece, Rig, RigPose, Shadow, StageSpec } from "./scene-values";
import { sceneColors } from "./scene-values";

const unitBox = new BoxGeometry(1, 1, 1);
const minScale = 0.0001;

const scratch = {
  euler: new Euler(),
  matrix: new Matrix4(),
  offset: new Matrix4(),
  position: new Vector3(),
  quaternion: new Quaternion(),
  scale: new Vector3(),
};

export const shadeColor = (shade: keyof typeof sceneColors) =>
  new Color(sceneColors[shade]);

const pieceMatrix = (piece: Piece, target: Matrix4) => {
  const [rx, ry, rz] = piece.tilt ?? [0, 0, 0];
  scratch.quaternion.setFromEuler(scratch.euler.set(rx, ry, rz));
  scratch.position.set(...piece.at);
  if (piece.radius === undefined) {
    scratch.scale.set(...piece.size);
  } else {
    scratch.scale.set(1, 1, 1);
  }
  return target.compose(scratch.position, scratch.quaternion, scratch.scale);
};

const pieceGeometry = (piece: Piece): BufferGeometry => {
  const source =
    piece.radius === undefined
      ? unitBox
      : new RoundedBoxGeometry(
          piece.size[0],
          piece.size[1],
          piece.size[2],
          2,
          piece.radius
        );
  const geometry = source.index ? source.toNonIndexed() : source.clone();
  if (source !== unitBox) {
    source.dispose();
  }
  geometry.applyMatrix4(pieceMatrix(piece, new Matrix4()));
  const color = shadeColor(piece.shade);
  const { count } = geometry.getAttribute("position");
  const colors = new Float32Array(count * 3);
  for (let index = 0; index < count; index += 1) {
    colors[index * 3] = color.r;
    colors[index * 3 + 1] = color.g;
    colors[index * 3 + 2] = color.b;
  }
  geometry.setAttribute("color", new Float32BufferAttribute(colors, 3));
  return geometry;
};

export const mergeStill = (pieces: readonly Piece[]) => {
  const parts = pieces.map(pieceGeometry);
  const merged = mergeGeometries(parts);
  for (const part of parts) {
    part.dispose();
  }
  return merged;
};

export const mergeShadows = (shadows: readonly Shadow[]) => {
  if (shadows.length === 0) {
    return null;
  }
  const parts = shadows.map(({ at, scale }) => {
    const disc = new CircleGeometry(1, 48).toNonIndexed();
    disc.applyMatrix4(
      new Matrix4().compose(
        new Vector3(...at),
        new Quaternion().setFromEuler(new Euler(-Math.PI / 2, 0, 0)),
        new Vector3(scale[0], scale[1], 1)
      )
    );
    return disc;
  });
  const merged = mergeGeometries(parts);
  for (const part of parts) {
    part.dispose();
  }
  return merged;
};

export interface RigLayout {
  baseColors: readonly Color[];
  count: number;
  locals: readonly Matrix4[];
  owners: readonly number[];
  tints: readonly (Color | null)[];
}

export const layoutRigs = (rigs: readonly Rig[]): RigLayout => {
  const locals: Matrix4[] = [];
  const owners: number[] = [];
  const baseColors: Color[] = [];
  const tints: (Color | null)[] = [];
  for (const [rigIndex, rig] of rigs.entries()) {
    for (const piece of rig.pieces) {
      locals.push(pieceMatrix({ ...piece, radius: undefined }, new Matrix4()));
      owners.push(rigIndex);
      baseColors.push(shadeColor(piece.shade));
      tints.push(rig.tint ? shadeColor(rig.tint) : null);
    }
  }
  return { baseColors, count: locals.length, locals, owners, tints };
};

export const restPose = (): RigPose => ({
  rx: 0,
  ry: 0,
  rz: 0,
  sx: 1,
  sy: 1,
  sz: 1,
  tint: 0,
  x: 0,
  y: 0,
  z: 0,
});

export const resetPoses = (poses: readonly RigPose[]) => {
  for (const pose of poses) {
    Object.assign(pose, restPose());
  }
};

const rigMatrix = (rig: Rig, pose: RigPose, target: Matrix4) => {
  const [rx, ry, rz] = rig.tilt ?? [0, 0, 0];
  target.makeRotationFromEuler(scratch.euler.set(rx, ry, rz));
  target.setPosition(...rig.at);
  scratch.quaternion.setFromEuler(scratch.euler.set(pose.rx, pose.ry, pose.rz));
  scratch.position.set(pose.x, pose.y, pose.z);
  scratch.scale.set(
    Math.max(pose.sx, minScale),
    Math.max(pose.sy, minScale),
    Math.max(pose.sz, minScale)
  );
  scratch.offset.compose(scratch.position, scratch.quaternion, scratch.scale);
  return target.multiply(scratch.offset);
};

export interface RigWriter {
  color: (index: number, color: Color) => void;
  matrix: (index: number, matrix: Matrix4) => void;
}

const rigMatrices: Matrix4[] = [];
const tinted = new Color();

export const writeRigs = (
  rigs: readonly Rig[],
  poses: readonly RigPose[],
  layout: RigLayout,
  writer: RigWriter
) => {
  for (const [index, rig] of rigs.entries()) {
    const pose = poses[index];
    if (!pose) {
      continue;
    }
    rigMatrices[index] ??= new Matrix4();
    rigMatrix(rig, pose, rigMatrices[index]);
  }
  for (let index = 0; index < layout.count; index += 1) {
    const owner = layout.owners[index] ?? 0;
    const rigWorld = rigMatrices[owner];
    const local = layout.locals[index];
    const base = layout.baseColors[index];
    if (!(rigWorld && local && base)) {
      continue;
    }
    writer.matrix(index, scratch.matrix.multiplyMatrices(rigWorld, local));
    const tint = layout.tints[index];
    if (tint) {
      writer.color(
        index,
        tinted.lerpColors(base, tint, poses[owner]?.tint ?? 0)
      );
    }
  }
};

export const trianglesOf = (geometry: BufferGeometry | null) => {
  if (!geometry) {
    return 0;
  }
  const index = geometry.getIndex();
  return (index ? index.count : geometry.getAttribute("position").count) / 3;
};

export const boxTriangles = trianglesOf(unitBox);

export const stageFov = 26;
const stageElevation = 0.2;
const viewDirection = new Vector3();

export const fitStageCamera = (camera: PerspectiveCamera, spec: StageSpec) => {
  const halfFov = MathUtils.degToRad(stageFov / 2);
  const distance = Math.max(
    spec.camera.fitHeight / 2 / Math.tan(halfFov),
    spec.camera.fitWidth / 2 / (Math.tan(halfFov) * camera.aspect)
  );
  viewDirection.set(0, Math.sin(stageElevation), Math.cos(stageElevation));
  camera.position
    .set(...spec.camera.target)
    .addScaledVector(viewDirection, distance);
  camera.lookAt(...spec.camera.target);
  camera.updateMatrixWorld();
};
