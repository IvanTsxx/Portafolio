"use client";

import { Edges, PerspectiveCamera } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import type { ThreeEvent } from "@react-three/fiber";
import { useRef, useState } from "react";
import type { ReactNode, RefObject } from "react";
import type { Group, PerspectiveCamera as PerspectiveCameraImpl } from "three";
import { MathUtils, Vector3 } from "three";

import { Agent } from "@/components/agents/agent";
import { rolePresets } from "@/components/agents/outfit";
import type { AgentAction, AgentRole } from "@/lib/agents/roles";
import type { experience } from "@/lib/site/experience";
import type {
  Timeline,
  TimelineEntry,
  TimelinePoint,
  TimelineSpan,
} from "@/lib/timeline/timeline";

import { BlobShadow } from "./scenes/kit";
import {
  boxGeometry,
  sceneColors,
  sceneMaterials,
} from "./scenes/scene-values";
import { TimelineLabel } from "./timeline-label";
import type { TimelineMode, TimelineScrub } from "./timeline-slot";
import { ViewLights } from "./view-lights";

export interface TimelineContentProps {
  activeId: string | null;
  card: RefObject<HTMLDivElement | null>;
  mode: TimelineMode;
  onHover: (id: string | null) => void;
  onSelect: (id: string) => void;
  scrub: RefObject<TimelineScrub>;
  timeline: Timeline;
}

const unitsPerMonth = 0.6;
const slab = {
  depth: 0.72,
  gap: 0.08,
  height: 0.16,
  laneStep: 0.5,
  y: 1.05,
  z: -0.35,
};
const card = {
  depth: 0.04,
  firstZ: 0.85,
  height: 0.48,
  laneStep: 0.62,
  tilt: -0.95,
  width: 0.84,
};
const strip = { depth: 0.5, height: 0.04 };
const lift = 0.16;
const scrubFrameWidth = 7;
const frameHeight = 2.7;
const fov = 30;
const elevation = 0.5;
const staticElevation = 0.72;
const lookHeight = 0.55;

const eraRolesByExperience = {
  "aliva-shop": "architect",
  "basement-studio": "orchestrator",
  "doctor-qali": "builder",
  tensolite: "inspector",
} as const satisfies Record<(typeof experience)[number]["id"], AgentRole>;

const eraRoles = new Map<string, AgentRole>(
  Object.entries(eraRolesByExperience)
);

const roleOfEra = (id: string) => eraRoles.get(id) ?? "builder";

const hoverHandlers = (
  id: string,
  onHover: (id: string | null) => void,
  onSelect: (id: string) => void
) => ({
  onClick: (event: ThreeEvent<MouseEvent>) => {
    event.stopPropagation();
    onSelect(id);
  },
  onPointerOut: () => {
    onHover(null);
    document.body.style.cursor = "";
  },
  onPointerOver: (event: ThreeEvent<PointerEvent>) => {
    event.stopPropagation();
    onHover(id);
    document.body.style.cursor = "pointer";
  },
});

const Lifted = ({
  children,
  isActive,
  isReduced,
}: {
  children: ReactNode;
  isActive: boolean;
  isReduced: boolean;
}) => {
  const group = useRef<Group>(null);
  const invalidate = useThree((state) => state.invalidate);

  useFrame((_, delta) => {
    const node = group.current;
    if (!node) {
      return;
    }
    const target = isActive ? lift : 0;
    const next = isReduced
      ? target
      : MathUtils.damp(node.position.y, target, 12, Math.min(delta, 0.1));
    node.position.y = Math.abs(next - target) < 0.001 ? target : next;
    if (node.position.y !== target) {
      invalidate();
    }
  });

  return <group ref={group}>{children}</group>;
};

const Rod = ({
  from,
  to,
  x,
  z,
  isActive,
}: {
  from: number;
  to: number;
  x: number;
  z: number;
  isActive: boolean;
}) => (
  <mesh
    geometry={boxGeometry}
    material={isActive ? sceneMaterials.vermilion : sceneMaterials.ink}
    position={[x, (from + to) / 2, z]}
    raycast={() => null}
    scale={[0.012, to - from, 0.012]}
  />
);

const SpanSlab = ({
  span,
  x,
  isActive,
  isReduced,
  onHover,
  onSelect,
}: {
  span: TimelineSpan;
  x: (at: number) => number;
  isActive: boolean;
  isReduced: boolean;
  onHover: (id: string | null) => void;
  onSelect: (id: string) => void;
}) => {
  const left = x(span.from) + slab.gap / 2;
  const width = Math.max(x(span.to) - x(span.from) - slab.gap, 0.2);
  const y = slab.y + span.lane * slab.laneStep;
  const ink = span.isCurrent;
  const labelColor = ink ? sceneColors.paper : sceneColors.ink;

  return (
    <group>
      <BlobShadow
        position={[left + width / 2, 0.002, slab.z]}
        scale={[width * 0.55, slab.depth * 0.6]}
      />
      <Rod
        from={strip.height}
        isActive={isActive}
        to={y - slab.height / 2}
        x={left + 0.04}
        z={slab.z + slab.depth / 2 - 0.04}
      />
      <Lifted isActive={isActive} isReduced={isReduced}>
        <mesh
          {...hoverHandlers(span.id, onHover, onSelect)}
          geometry={boxGeometry}
          material={ink ? sceneMaterials.ink : sceneMaterials.paper}
          position={[left + width / 2, y, slab.z]}
          scale={[width, slab.height, slab.depth]}
        >
          <Edges
            color={ink ? sceneColors.graphite : sceneColors.ink}
            linewidth={1}
          />
        </mesh>
        <TimelineLabel
          color={labelColor}
          height={0.1}
          maxWidth={width - 0.12}
          position={[left + 0.06, y, slab.z + slab.depth / 2 + 0.002]}
          text={span.company}
        />
      </Lifted>
    </group>
  );
};

const ellipsize = (text: string, limit: number) =>
  text.length > limit ? `${text.slice(0, limit - 1)}…` : text;

const PointCard = ({
  point,
  x,
  isActive,
  isReduced,
  onHover,
  onSelect,
}: {
  point: TimelinePoint;
  x: (at: number) => number;
  isActive: boolean;
  isReduced: boolean;
  onHover: (id: string | null) => void;
  onSelect: (id: string) => void;
}) => {
  const left = x(point.at);
  const z = card.firstZ + point.lane * card.laneStep;
  const center = card.height / 2 + 0.06;

  return (
    <group>
      <mesh
        geometry={boxGeometry}
        material={isActive ? sceneMaterials.vermilion : sceneMaterials.ink}
        position={[left, 0.003, (strip.depth / 2 + z) / 2]}
        raycast={() => null}
        scale={[0.012, 0.004, z - strip.depth / 2]}
      />
      <BlobShadow
        position={[left + card.width / 2, 0.002, z + 0.04]}
        scale={[card.width * 0.6, 0.16]}
      />
      <Lifted isActive={isActive} isReduced={isReduced}>
        <group position={[left + card.width / 2, 0, z]} rotation-x={card.tilt}>
          <mesh
            geometry={boxGeometry}
            material={sceneMaterials.ink}
            position={[-card.width / 2 + 0.03, 0.03, 0]}
            raycast={() => null}
            scale={[0.06, 0.06, 0.06]}
          />
          <mesh
            {...hoverHandlers(point.id, onHover, onSelect)}
            geometry={boxGeometry}
            material={
              point.visibility === "public-template"
                ? sceneMaterials.paperDeep
                : sceneMaterials.paper
            }
            position={[0, center, 0]}
            scale={[card.width, card.height, card.depth]}
          >
            <Edges color={sceneColors.ink} linewidth={1} />
          </mesh>
          <TimelineLabel
            color={sceneColors.ink}
            height={0.075}
            maxWidth={card.width - 0.12}
            position={[
              -card.width / 2 + 0.06,
              center + card.height / 2 - 0.09,
              card.depth / 2 + 0.002,
            ]}
            text={ellipsize(point.name, 18)}
          />
          <TimelineLabel
            color={sceneColors.graphite}
            height={0.06}
            position={[
              -card.width / 2 + 0.06,
              center - card.height / 2 + 0.08,
              card.depth / 2 + 0.002,
            ]}
            text={point.createdAt.slice(0, 7).replace("-", ".")}
          />
        </group>
      </Lifted>
    </group>
  );
};

const Baseline = ({
  timeline,
  x,
}: {
  timeline: Timeline;
  x: (at: number) => number;
}) => {
  const start = x(timeline.range.from) - 0.4;
  const end = x(timeline.range.to) + 0.4;
  const length = end - start;
  const now = x(timeline.now.at);

  return (
    <group>
      <mesh
        geometry={boxGeometry}
        material={sceneMaterials.paper}
        position={[start + length / 2, strip.height / 2, 0]}
        raycast={() => null}
        scale={[length, strip.height, strip.depth]}
      >
        <Edges color={sceneColors.rule} linewidth={1} />
      </mesh>
      <mesh
        geometry={boxGeometry}
        material={sceneMaterials.ink}
        position={[
          start + length / 2,
          strip.height + 0.002,
          strip.depth / 2 - 0.05,
        ]}
        raycast={() => null}
        scale={[length, 0.004, 0.012]}
      />
      <BlobShadow
        position={[start + length / 2, 0.001, 0.02]}
        scale={[length * 0.52, 0.42]}
      />
      {timeline.ticks.map((tick) => (
        <group key={tick.year} position={[x(tick.at), 0, 0]}>
          <mesh
            geometry={boxGeometry}
            material={sceneMaterials.ink}
            position={[0, strip.height + 0.002, 0]}
            raycast={() => null}
            scale={[0.02, 0.006, strip.depth]}
          />
          <TimelineLabel
            color={sceneColors.ink}
            height={0.13}
            position={[0.06, strip.height + 0.004, strip.depth / 2 - 0.14]}
            rotation-x={-Math.PI / 2}
            text={String(tick.year)}
          />
        </group>
      ))}
      <group position={[now, 0, 0]}>
        <mesh
          geometry={boxGeometry}
          material={sceneMaterials.vermilion}
          position={[0, 0.32, -0.05]}
          raycast={() => null}
          scale={[0.016, 0.64, 0.016]}
        />
        <mesh
          geometry={boxGeometry}
          material={sceneMaterials.vermilion}
          position={[0.11, 0.6, -0.05]}
          raycast={() => null}
          scale={[0.2, 0.08, 0.012]}
        />
        <TimelineLabel
          color={sceneColors.graphite}
          height={0.055}
          position={[0.24, 0.6, -0.04]}
          text="Present"
        />
      </group>
    </group>
  );
};

const lookTarget = new Vector3();
const viewDirection = new Vector3();

const fitDistance = (width: number, aspect: number) => {
  const halfFov = MathUtils.degToRad(fov / 2);
  return Math.max(
    frameHeight / 2 / Math.tan(halfFov),
    width / 2 / (Math.tan(halfFov) * aspect)
  );
};

const anchorOf = (
  entry: TimelineEntry,
  x: (at: number) => number,
  target: Vector3
) => {
  if (entry.kind === "experience") {
    return target.set(
      (x(entry.from) + x(entry.to)) / 2,
      slab.y + entry.lane * slab.laneStep + lift,
      slab.z + slab.depth / 2
    );
  }
  const reach = card.height + 0.06;
  return target.set(
    x(entry.at) + card.width / 2,
    reach * Math.cos(card.tilt) + lift,
    card.firstZ + entry.lane * card.laneStep + reach * Math.sin(card.tilt)
  );
};

const projected = new Vector3();
const anchorPoint = new Vector3();
const cardGap = 14;

const placeCard = (
  element: HTMLDivElement,
  anchor: Vector3,
  camera: PerspectiveCameraImpl,
  size: { width: number; height: number }
) => {
  projected.copy(anchor).project(camera);
  const anchorX = ((projected.x + 1) / 2) * size.width;
  const anchorY = ((1 - projected.y) / 2) * size.height;
  const { offsetWidth, offsetHeight } = element;
  const left = MathUtils.clamp(
    anchorX - offsetWidth / 2,
    8,
    Math.max(8, size.width - offsetWidth - 8)
  );
  const placeBelow = anchorY < size.height / 2;
  const top = MathUtils.clamp(
    placeBelow ? anchorY + cardGap : anchorY - offsetHeight - cardGap,
    8,
    Math.max(8, size.height - offsetHeight - 8)
  );
  element.style.transform = `translate3d(${Math.round(left)}px, ${Math.round(top)}px, 0)`;
};

const eraAt = (timeline: Timeline, at: number) => {
  let era = timeline.spans[0]?.id ?? "";
  for (const span of timeline.spans) {
    if (span.from <= at) {
      era = span.id;
    }
  }
  return era;
};

const TimelineContent = ({
  activeId,
  card: cardElement,
  mode,
  onHover,
  onSelect,
  scrub,
  timeline,
}: TimelineContentProps) => {
  const isReduced = mode === "static";
  const camera = useRef<PerspectiveCameraImpl>(null);
  const walker = useRef<Group>(null);
  const action = useRef<AgentAction>("idle");
  const size = useThree((state) => state.size);
  const x = (at: number) => (at - timeline.range.from) * unitsPerMonth;
  const startX = x(timeline.range.from) + 0.3;
  const nowX = x(timeline.now.at);
  const endX = x(timeline.range.to);
  const [era, setEra] = useState(() =>
    eraAt(timeline, isReduced ? timeline.now.at : timeline.range.from)
  );
  const active = timeline.entries.find((entry) => entry.id === activeId);

  useFrame((_, delta) => {
    const view = camera.current;
    const agent = walker.current;
    if (!(view && agent)) {
      return;
    }
    const step = Math.min(delta, 0.1);
    const progress = isReduced ? 1 : scrub.current.progress;
    const targetX = MathUtils.lerp(startX, nowX - 0.55, progress);
    const previousX = agent.position.x;
    agent.position.x = isReduced
      ? targetX
      : MathUtils.damp(previousX, targetX, 6, step);
    const velocity = step > 0 ? (agent.position.x - previousX) / step : 0;
    const isWalking = Math.abs(velocity) > 0.15;
    action.current = isWalking ? "walk" : "idle";
    const facing = isWalking ? Math.sign(velocity) * 1.25 : 0.35;
    agent.rotation.y = isReduced
      ? facing
      : MathUtils.damp(agent.rotation.y, facing, 8, step);

    const months = agent.position.x / unitsPerMonth + timeline.range.from;
    const nextEra = eraAt(timeline, months);
    if (nextEra !== era) {
      setEra(nextEra);
    }

    const aspect = size.width / Math.max(size.height, 1);
    if (isReduced) {
      const width = endX + 0.8;
      lookTarget.set(endX / 2, lookHeight, 0.55);
      viewDirection.set(
        0,
        Math.sin(staticElevation),
        Math.cos(staticElevation)
      );
      view.position
        .copy(lookTarget)
        .addScaledVector(viewDirection, fitDistance(width, aspect));
    } else {
      const half = scrubFrameWidth / 2;
      const focus = MathUtils.clamp(
        agent.position.x + 1.4,
        half - 0.8,
        Math.max(half - 0.8, endX - half + 0.8)
      );
      lookTarget.set(focus, lookHeight, 0.55);
      viewDirection
        .set(-0.08, Math.sin(elevation), Math.cos(elevation))
        .normalize();
      view.position
        .copy(lookTarget)
        .addScaledVector(viewDirection, fitDistance(scrubFrameWidth, aspect));
    }
    view.aspect = aspect;
    view.lookAt(lookTarget);
    view.updateProjectionMatrix();
    view.updateMatrixWorld();

    const element = cardElement.current;
    if (element && active) {
      placeCard(element, anchorOf(active, x, anchorPoint), view, size);
    }
  });

  return (
    <>
      <PerspectiveCamera fov={fov} makeDefault ref={camera} />
      <ViewLights />
      <Baseline timeline={timeline} x={x} />
      {timeline.spans.map((span) => (
        <SpanSlab
          isActive={span.id === activeId}
          isReduced={isReduced}
          key={span.id}
          onHover={onHover}
          onSelect={onSelect}
          span={span}
          x={x}
        />
      ))}
      {timeline.points.map((point) => (
        <PointCard
          isActive={point.id === activeId}
          isReduced={isReduced}
          key={point.id}
          onHover={onHover}
          onSelect={onSelect}
          point={point}
          x={x}
        />
      ))}
      <group position={[0, strip.height, 0.02]}>
        <group ref={walker}>
          <Agent
            action="idle"
            actionRef={action}
            animateOutfit
            outfit={rolePresets[roleOfEra(era)]}
            role={roleOfEra(era)}
            scale={0.42}
          />
        </group>
      </group>
    </>
  );
};

export default TimelineContent;
