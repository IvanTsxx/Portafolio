"use client";

import { useFrame } from "@react-three/fiber";
import { useImperativeHandle, useLayoutEffect, useRef } from "react";
import type { Ref } from "react";
import type { Group, InstancedMesh } from "three";
import {
  Color,
  DoubleSide,
  MeshStandardMaterial,
  Object3D,
  PlaneGeometry,
  Vector3,
} from "three";

import { accessoryKits } from "@/components/agents/accessories/registry";
import { anchorPositions, bodyBase } from "@/components/agents/rig";
import type { AgentRole } from "@/lib/agents/roles";

import { sceneColors } from "./scenes/scene-values";

export interface BurstHandle {
  burst: (origin: Vector3, scale: number) => void;
}

const pieceCount = 34;
const gravity = -14;
const drag = 1.6;
const pieceGeometry = new PlaneGeometry(0.16, 0.1);
const pieceMaterial = new MeshStandardMaterial({
  roughness: 0.9,
  side: DoubleSide,
});
const piecePalette = [
  sceneColors.paper,
  sceneColors.paper,
  sceneColors.paperDeep,
  sceneColors.rule,
  sceneColors.ink,
].map((hex) => new Color(hex));
const paperColor = new Color(sceneColors.paper);
const placement = new Object3D();

interface PaperPiece {
  life: number;
  position: Vector3;
  rotation: Vector3;
  spin: Vector3;
  velocity: Vector3;
}

const createPieces = (): PaperPiece[] =>
  Array.from({ length: pieceCount }, () => ({
    life: 0,
    position: new Vector3(),
    rotation: new Vector3(),
    spin: new Vector3(),
    velocity: new Vector3(),
  }));

const spread = (range: number) => (Math.random() * 2 - 1) * range;

export const PaperPoof = ({ ref }: { ref: Ref<BurstHandle> }) => {
  const mesh = useRef<InstancedMesh>(null);
  const pieces = createPieces();
  const pieceScale = useRef(1);
  const isActive = useRef(false);

  useLayoutEffect(() => {
    const instances = mesh.current;
    if (!instances) {
      return;
    }
    for (let index = 0; index < pieceCount; index += 1) {
      instances.setColorAt(
        index,
        piecePalette[index % piecePalette.length] ?? paperColor
      );
    }
    instances.visible = false;
  }, []);

  useImperativeHandle(ref, () => ({
    burst: (origin, scale) => {
      for (const piece of pieces) {
        piece.position.set(
          origin.x + spread(0.35) * scale,
          origin.y + spread(0.35) * scale,
          origin.z + spread(0.2)
        );
        piece.velocity.set(spread(4.2), 2.6 + Math.random() * 4.6, spread(1.5));
        piece.rotation.set(
          Math.random() * Math.PI,
          Math.random() * Math.PI,
          Math.random() * Math.PI
        );
        piece.spin.set(spread(14), spread(14), spread(10));
        piece.life = 0.75 + Math.random() * 0.5;
      }
      pieceScale.current = scale;
      isActive.current = true;
      if (mesh.current) {
        mesh.current.visible = true;
      }
    },
  }));

  useFrame((_, delta) => {
    const instances = mesh.current;
    if (!(instances && isActive.current)) {
      return;
    }
    const step = Math.min(delta, 0.05);
    const damping = Math.exp(-drag * step);
    let alive = 0;
    for (const [index, piece] of pieces.entries()) {
      piece.life -= step;
      const remaining = Math.max(0, piece.life);
      if (remaining > 0) {
        alive += 1;
      }
      piece.velocity.multiplyScalar(damping);
      piece.velocity.y += gravity * step;
      piece.position.addScaledVector(piece.velocity, step);
      piece.rotation.addScaledVector(piece.spin, step);
      placement.position.copy(piece.position);
      placement.rotation.set(
        piece.rotation.x,
        piece.rotation.y,
        piece.rotation.z
      );
      placement.scale.setScalar(
        Math.max(0.0001, Math.min(1, remaining * 4) * pieceScale.current)
      );
      placement.updateMatrix();
      instances.setMatrixAt(index, placement.matrix);
    }
    instances.instanceMatrix.needsUpdate = true;
    if (alive === 0) {
      isActive.current = false;
      instances.visible = false;
    }
  });

  return (
    <instancedMesh
      args={[pieceGeometry, pieceMaterial, pieceCount]}
      frustumCulled={false}
      ref={mesh}
    />
  );
};

export interface HatToss {
  role: AgentRole;
  id: number;
}

export interface TossHandle {
  launch: (origin: Vector3, direction: number, scale: number) => void;
}

const hatLift = bodyBase + anchorPositions.head[1];
const tossSeconds = 1.1;

export const FlyingHat = ({
  ref,
  toss,
}: {
  ref: Ref<TossHandle>;
  toss: HatToss | null;
}) => {
  const group = useRef<Group>(null);
  const flight = useRef({
    direction: 1,
    origin: new Vector3(),
    scale: 1,
    start: Number.NEGATIVE_INFINITY,
  });
  const HeadKit = toss ? accessoryKits[toss.role].head : null;

  useImperativeHandle(ref, () => ({
    launch: (origin, direction, scale) => {
      flight.current.origin.copy(origin);
      flight.current.direction = direction;
      flight.current.scale = scale;
      flight.current.start = Number.NaN;
    },
  }));

  useFrame((state) => {
    const hat = group.current;
    if (!hat) {
      return;
    }
    const { current } = flight;
    if (Number.isNaN(current.start)) {
      current.start = state.clock.elapsedTime;
    }
    const time = state.clock.elapsedTime - current.start;
    if (!(time >= 0 && time < tossSeconds)) {
      hat.visible = false;
      return;
    }
    const { direction, origin, scale } = current;
    hat.visible = true;
    hat.position.set(
      origin.x + direction * 2.4 * time * scale,
      origin.y + (hatLift + 4.8 * time + 0.5 * gravity * time * time) * scale,
      origin.z + 0.4
    );
    hat.rotation.set(0.4 * time, 0, -direction * 7 * time);
    const shrink = Math.min(1, (tossSeconds - time) / 0.3);
    hat.scale.setScalar(Math.max(0.0001, shrink * scale));
  });

  return (
    <group ref={group} visible={false}>
      {HeadKit ? <HeadKit key={toss?.id} /> : null}
    </group>
  );
};
