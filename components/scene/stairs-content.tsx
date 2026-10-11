"use client";

import { Edges } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import type { ThreeEvent } from "@react-three/fiber";
import { useRef, useState } from "react";
import type { RefObject } from "react";
import type { Group } from "three";
import { MathUtils, Vector3 } from "three";

import { Agent } from "@/components/agents/agent";
import type { Stair } from "@/components/profile/experience-stairs/stairs-model";
import type { AgentAction } from "@/lib/agents/roles";

import { FlyingHat, PaperPoof } from "./companion-effects";
import type { BurstHandle, HatToss, TossHandle } from "./companion-effects";
import { SceneLabel } from "./scene-label";
import { BlobShadow, SceneCamera } from "./scenes/kit";
import {
  boxGeometry,
  easeInOutCubic,
  sceneColors,
  sceneMaterials,
} from "./scenes/scene-values";
import { ViewLights } from "./view-lights";
import { isLeadAgentCast } from "./view-registry";

export interface StairsContentProps {
  activeIndex: number;
  highlightIndex: number | null;
  isReduced: boolean;
  onHover: (index: number | null) => void;
  onSelect: (index: number) => void;
  stairs: readonly Stair[];
  track: RefObject<HTMLElement | null>;
}

const step = { depth: 1.1, rise: 0.42, width: 1.3 };
const agentScale = 0.46;
const hopApex = 0.62;
const climbSeconds = 0.62;
const rushSeconds = 0.36;
const restYaw = -0.18;
const yawStairs = 0.2;

const stepTop = (index: number) => (index + 1) * step.rise;

interface Hop {
  from: number;
  start: number;
  swapped: boolean;
  to: number;
}

interface Worn {
  index: number;
  toss: HatToss | null;
}

const hoverHandlers = (
  index: number,
  onHover: (index: number | null) => void,
  onSelect: (index: number) => void
) => ({
  onClick: (event: ThreeEvent<MouseEvent>) => {
    event.stopPropagation();
    onSelect(index);
  },
  onPointerOut: () => {
    document.body.style.cursor = "";
  },
  onPointerOver: (event: ThreeEvent<PointerEvent>) => {
    event.stopPropagation();
    onHover(index);
    document.body.style.cursor = "pointer";
  },
});

const Step = ({
  index,
  isHighlighted,
  onHover,
  onSelect,
  stair,
}: {
  index: number;
  isHighlighted: boolean;
  onHover: (index: number | null) => void;
  onSelect: (index: number) => void;
  stair: Stair;
}) => {
  const height = stepTop(index);
  const x = index * step.width;
  const front = step.depth / 2 + 0.002;
  const left = x - step.width / 2 + 0.1;

  return (
    <group>
      <mesh
        {...hoverHandlers(index, onHover, onSelect)}
        geometry={boxGeometry}
        material={
          isHighlighted ? sceneMaterials.paperDeep : sceneMaterials.paper
        }
        position={[x, height / 2, 0]}
        scale={[step.width, height, step.depth]}
      >
        <Edges color={sceneColors.ink} linewidth={1} />
      </mesh>
      {stair.isCurrent ? (
        <mesh
          geometry={boxGeometry}
          material={sceneMaterials.ink}
          position={[x, height + 0.012, 0]}
          raycast={() => null}
          scale={[step.width, 0.024, step.depth]}
        />
      ) : null}
      <mesh
        geometry={boxGeometry}
        material={sceneMaterials.ink}
        position={[left + 0.025, height - 0.075, front]}
        raycast={() => null}
        scale={[0.05, 0.05, 0.004]}
      />
      <SceneLabel
        color={sceneColors.ink}
        height={0.085}
        maxWidth={step.width - 0.3}
        position={[left + 0.1, height - 0.075, front]}
        text={stair.company}
      />
      <SceneLabel
        color={sceneColors.graphite}
        height={0.068}
        position={[left, height - 0.19, front]}
        text={stair.year}
      />
    </group>
  );
};

const feet = new Vector3();
const swapOrigin = new Vector3();

const placeOnStep = (agent: Group, index: number) => {
  agent.position.set(index * step.width, stepTop(index), 0.08);
};

const StairsContent = ({
  activeIndex,
  highlightIndex,
  isReduced,
  onHover,
  onSelect,
  stairs,
  track,
}: StairsContentProps) => {
  const mover = useRef<Group>(null);
  const body = useRef<Group>(null);
  const poof = useRef<BurstHandle>(null);
  const hat = useRef<TossHandle>(null);
  const action = useRef<AgentAction>("idle");
  const standing = useRef(activeIndex);
  const hop = useRef<Hop | null>(null);
  const shown = useRef(0);
  const tossCount = useRef(0);
  const [worn, setWorn] = useState<Worn>({ index: activeIndex, toss: null });
  const last = stairs.length - 1;
  const wornStair = stairs[worn.index] ?? stairs[last];

  const swapOutfit = (to: number, agent: Group, direction: number) => {
    const tossed = stairs[standing.current]?.cast.role;
    tossCount.current += 1;
    setWorn({
      index: to,
      toss: tossed ? { id: tossCount.current, role: tossed } : null,
    });
    feet.copy(agent.position);
    agent.parent?.localToWorld(feet);
    poof.current?.burst(swapOrigin.copy(feet).setY(feet.y + 0.35), 0.5);
    hat.current?.launch(feet, -direction, agentScale);
  };

  useFrame((state, delta) => {
    const agent = mover.current;
    const spinner = body.current;
    if (!(agent && spinner)) {
      return;
    }
    const isLead = isLeadAgentCast(track.current);
    const target = MathUtils.clamp(activeIndex, 0, last);
    const time = state.clock.elapsedTime;

    if (isReduced) {
      standing.current = target;
      hop.current = null;
      placeOnStep(agent, target);
      spinner.rotation.y = restYaw;
      spinner.scale.setScalar(1);
      spinner.visible = isLead;
      action.current = stairs[target]?.cast.action ?? "idle";
      if (worn.index !== target) {
        setWorn({ index: target, toss: null });
      }
      return;
    }

    shown.current = MathUtils.damp(
      shown.current,
      isLead ? 1 : 0,
      10,
      Math.min(delta, 0.1)
    );
    spinner.visible = shown.current > 0.01;
    spinner.scale.setScalar(Math.max(0.0001, shown.current));

    if (!hop.current && standing.current !== target) {
      const direction = Math.sign(target - standing.current);
      hop.current = {
        from: standing.current,
        start: time,
        swapped: false,
        to: standing.current + direction,
      };
    }

    const { current } = hop;
    if (!current) {
      placeOnStep(agent, standing.current);
      spinner.rotation.y = MathUtils.damp(
        spinner.rotation.y,
        restYaw,
        8,
        Math.min(delta, 0.1)
      );
      action.current = stairs[standing.current]?.cast.action ?? "idle";
      return;
    }

    const isRushing = Math.abs(target - current.from) > 1;
    const seconds = isRushing ? rushSeconds : climbSeconds;
    const progress = Math.min(1, (time - current.start) / seconds);
    const eased = easeInOutCubic(progress);
    const direction = Math.sign(current.to - current.from);
    agent.position.set(
      MathUtils.lerp(current.from * step.width, current.to * step.width, eased),
      MathUtils.lerp(stepTop(current.from), stepTop(current.to), eased) +
        4 * hopApex * progress * (1 - progress),
      0.08
    );
    spinner.rotation.y = restYaw + direction * Math.PI * 2 * eased;
    action.current = "idle";

    if (!current.swapped && progress >= 0.5) {
      current.swapped = true;
      swapOutfit(current.to, agent, direction);
    }
    if (progress >= 1) {
      standing.current = current.to;
      hop.current = null;
    }
  });

  return (
    <>
      <SceneCamera
        elevation={0.34}
        fitHeight={3.25}
        fitWidth={6.1}
        fov={28}
        target={[2.05, 1.15, 0]}
      />
      <ViewLights />
      <group rotation-y={yawStairs}>
        <BlobShadow
          position={[((stairs.length - 1) * step.width) / 2, 0.001, 0.05]}
          scale={[stairs.length * step.width * 0.56, step.depth * 0.75]}
        />
        {stairs.map((stair, index) => (
          <Step
            index={index}
            isHighlighted={index === highlightIndex}
            key={stair.id}
            onHover={onHover}
            onSelect={onSelect}
            stair={stair}
          />
        ))}
        <group ref={mover}>
          <group ref={body}>
            <Agent
              actionRef={action}
              animateOutfit
              role={wornStair?.cast.role ?? "builder"}
              scale={agentScale}
            />
          </group>
        </group>
      </group>
      <PaperPoof ref={poof} />
      <FlyingHat ref={hat} toss={worn.toss} />
    </>
  );
};

export default StairsContent;
