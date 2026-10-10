"use client";

import { useThree } from "@react-three/fiber";
import type { ThreeElements, ThreeEvent } from "@react-three/fiber";
import { useEffect, useId, useLayoutEffect, useRef } from "react";
import type { RefObject } from "react";
import { BoxGeometry, MathUtils, MeshBasicMaterial, Vector3 } from "three";

import { usePrefersReducedMotion } from "@/registry/ivan/hooks/use-prefers-reduced-motion";

import type { WornPart } from "./accessories/registry";
import { wornParts } from "./accessories/registry";
import { disc, roundedBox } from "./geometry";
import { AgentLiveContext, armPivotNames } from "./held-pose";
import type { Outfit } from "./outfit";
import { outfitSlots, rolePresets } from "./outfit";
import { PieceDrop, useOutfitPop } from "./outfit-motion";
import { Part } from "./part";
import {
  anchorPositions,
  armSize,
  bodyBase,
  bodySize,
  eyeSize,
  legOffsets,
  legSize,
  shoulder,
} from "./rig";
import { createRadialFadeTexture } from "./textures";
import type { AgentAction, AgentRole } from "./types";
import type { AgentMotion, AgentPointer } from "./use-agent-rig";
import { useAgentRig } from "./use-agent-rig";

export type { AgentMotion, AgentPointer } from "./use-agent-rig";

export interface AgentProps extends Omit<ThreeElements["group"], "children"> {
  role: AgentRole;
  outfit?: Outfit;
  animateOutfit?: boolean;
  action?: AgentAction;
  actionRef?: RefObject<AgentAction>;
  pointer?: RefObject<AgentPointer>;
  motion?: AgentMotion;
  shadow?: boolean;
}

const seedFromId = (id: string) => {
  let hash = 0;
  for (const character of id) {
    hash = (hash * 31 + (character.codePointAt(0) ?? 0)) % 9973;
  }
  return hash / 9973;
};

const bodyGeometry = roundedBox(
  bodySize.width,
  bodySize.height,
  bodySize.depth,
  bodySize.radius,
  5
);
const legGeometry = roundedBox(
  legSize.width,
  legSize.height,
  legSize.depth,
  legSize.radius,
  3
);
const armGeometry = roundedBox(
  armSize.length,
  armSize.height,
  armSize.depth,
  armSize.radius,
  4
);
const eyeGeometry = roundedBox(
  eyeSize.size,
  eyeSize.size,
  eyeSize.depth,
  0.014,
  2
);
const highlightGeometry = roundedBox(0.036, 0.036, 0.01, 0.004, 1);

const shadowMaterial = new MeshBasicMaterial({
  alphaMap: createRadialFadeTexture(),
  color: "#3b2a1f",
  depthWrite: false,
  opacity: 0.28,
  toneMapped: false,
  transparent: true,
});

const hitSize = { depth: 1.3, height: 1.9, width: 1.8 };
const hitGeometry = new BoxGeometry(
  hitSize.width,
  hitSize.height,
  hitSize.depth
);
const hitMaterial = new MeshBasicMaterial({ visible: false });
const hitLocal = new Vector3();

type PointerLook = Omit<AgentPointer, "presses">;

const pointerAt = (
  event: ThreeEvent<PointerEvent>,
  hovered: boolean
): PointerLook => {
  hitLocal.copy(event.point);
  event.object.worldToLocal(hitLocal);
  return {
    hovered,
    x: MathUtils.clamp(hitLocal.x / (hitSize.width / 2), -1, 1),
    y: MathUtils.clamp(hitLocal.y / (hitSize.height / 2), -1, 1),
  };
};

const HitProxy = ({
  onPointer,
  onPress,
}: {
  onPointer: (look: PointerLook) => void;
  onPress: () => void;
}) => {
  const isHovering = useRef(false);
  const invalidate = useThree((state) => state.invalidate);

  useEffect(
    () => () => {
      if (isHovering.current) {
        document.body.style.cursor = "";
      }
    },
    []
  );

  return (
    <mesh
      geometry={hitGeometry}
      material={hitMaterial}
      onClick={() => {
        onPress();
        invalidate();
      }}
      onPointerMove={(event) => onPointer(pointerAt(event, isHovering.current))}
      onPointerOut={(event) => {
        isHovering.current = false;
        onPointer(pointerAt(event, false));
        document.body.style.cursor = "";
      }}
      onPointerOver={(event) => {
        event.stopPropagation();
        isHovering.current = true;
        onPointer(pointerAt(event, true));
        document.body.style.cursor = "pointer";
      }}
      position={[0, hitSize.height / 2, 0]}
    />
  );
};

const Eye = ({ side }: { side: 1 | -1 }) => (
  <group position={[side * eyeSize.spacing, 0, 0]}>
    <Part geometry={eyeGeometry} material="eye" />
    <Part
      geometry={highlightGeometry}
      material="highlight"
      position={[-0.03, 0.03, eyeSize.depth / 2]}
      receiveShadow={false}
    />
  </group>
);

const Worn = ({ parts }: { parts: readonly WornPart[] }) =>
  parts.map(({ key, Wear }) => (
    <PieceDrop key={key}>
      <Wear />
    </PieceDrop>
  ));

export const Agent = ({
  role,
  outfit,
  animateOutfit = false,
  action = "idle",
  actionRef,
  pointer,
  motion,
  shadow = true,
  ...groupProps
}: AgentProps) => {
  const prefersReducedMotion = usePrefersReducedMotion();
  const resolvedMotion = motion ?? (prefersReducedMotion ? "reduced" : "full");
  const seed = seedFromId(useId());
  const ownPointer = useRef<AgentPointer>({
    hovered: false,
    presses: 0,
    x: 0,
    y: 0,
  });
  const { attach, attachLeg, liveAction } = useAgentRig({
    action,
    actionRef,
    motion: resolvedMotion,
    pointer: pointer ?? ownPointer,
    seed,
  });
  const worn = outfit ?? rolePresets[role];
  const parts = wornParts(worn);
  const isDressing = animateOutfit && resolvedMotion === "full";
  const dressing = useRef(false);
  const pop = useOutfitPop(
    outfitSlots.map((slot) => worn[slot]).join("|"),
    isDressing
  );

  useLayoutEffect(() => {
    dressing.current = isDressing;
  }, [isDressing]);

  return (
    <AgentLiveContext value={{ dressing, liveAction, motion: resolvedMotion }}>
      <group {...groupProps} dispose={null} name={`agent-${role}-${action}`}>
        {pointer ? null : (
          <HitProxy
            onPointer={(look) => {
              Object.assign(ownPointer.current, look);
            }}
            onPress={() => {
              ownPointer.current.presses += 1;
            }}
          />
        )}
        {shadow ? (
          <group ref={attach("shadow")}>
            <mesh
              geometry={disc()}
              material={shadowMaterial}
              position={[0, 0.004, 0.04]}
              rotation-x={-Math.PI / 2}
              scale={[0.95, 0.75, 1]}
            />
          </group>
        ) : null}
        <group ref={pop}>
          <group ref={attach("root")}>
            {legOffsets.map((x, index) => (
              <group
                key={x}
                position={[x, legSize.height, legSize.z]}
                ref={attachLeg(index)}
              >
                <Part
                  castShadow
                  geometry={legGeometry}
                  material="clay"
                  position={[0, -legSize.height / 2, 0]}
                />
              </group>
            ))}
            <group position={[0, bodyBase, 0]} ref={attach("body")}>
              <Part
                castShadow
                geometry={bodyGeometry}
                material="clay"
                position={[0, bodySize.height / 2, 0]}
              />
              <group position={anchorPositions.face}>
                <group ref={attach("eyes")}>
                  <Eye side={1} />
                  <Eye side={-1} />
                </group>
                <Worn parts={parts.face} />
              </group>
              <group position={anchorPositions.head}>
                <Worn parts={parts.head} />
              </group>
              <group position={anchorPositions.torso}>
                <Worn parts={parts.torso} />
              </group>
              <Worn parts={parts.body} />
              <group
                name={armPivotNames.right}
                position={[shoulder.x, shoulder.y, shoulder.z]}
                ref={attach("armRight")}
              >
                <Part
                  castShadow
                  geometry={armGeometry}
                  material="clay"
                  position={[armSize.length / 2, 0, 0]}
                />
                <Worn parts={parts.rightArm} />
              </group>
              <group
                name={armPivotNames.left}
                position={[-shoulder.x, shoulder.y, shoulder.z]}
                ref={attach("armLeft")}
              >
                <group scale={[-1, 1, 1]}>
                  <Part
                    castShadow
                    geometry={armGeometry}
                    material="clay"
                    position={[armSize.length / 2, 0, 0]}
                  />
                  <Worn parts={parts.leftArm} />
                </group>
              </group>
            </group>
          </group>
        </group>
      </group>
    </AgentLiveContext>
  );
};
