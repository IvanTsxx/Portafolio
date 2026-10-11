"use client";

import { Edges } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import type { ThreeEvent } from "@react-three/fiber";
import { useRef } from "react";
import type { RefObject } from "react";
import type { Group } from "three";
import { MathUtils, MeshStandardMaterial } from "three";

import { Agent } from "@/components/agents/agent";
import { spineLines } from "@/components/profile/repo-shelf/shelf-model";
import type {
  BookTone,
  ShelfBook,
} from "@/components/profile/repo-shelf/shelf-model";
import type { AgentAction } from "@/lib/agents/roles";

import { SceneLabel } from "./scene-label";
import { BlobShadow, SceneCamera } from "./scenes/kit";
import {
  boxGeometry,
  sceneColors,
  sceneMaterials,
} from "./scenes/scene-values";
import { ViewLights } from "./view-lights";
import { isLeadAgentCast } from "./view-registry";

export interface ShelfContentProps {
  activeId: string | null;
  books: readonly ShelfBook[];
  isReduced: boolean;
  onHover: (id: string | null) => void;
  onSelect: (id: string) => void;
  track: RefObject<HTMLElement | null>;
}

const steelColor = "#345a73";

const toneSurfaces = {
  deep: {
    edge: sceneColors.ink,
    label: sceneColors.ink,
    material: sceneMaterials.paperDeep,
  },
  graphite: {
    edge: sceneColors.ink,
    label: sceneColors.paper,
    material: sceneMaterials.graphite,
  },
  paper: {
    edge: sceneColors.ink,
    label: sceneColors.ink,
    material: sceneMaterials.paper,
  },
  steel: {
    edge: sceneColors.ink,
    label: sceneColors.paper,
    material: new MeshStandardMaterial({ color: steelColor, roughness: 0.78 }),
  },
} as const satisfies Record<
  BookTone,
  { edge: string; label: string; material: MeshStandardMaterial }
>;

const plank = { depth: 1, height: 0.08, top: 0.66 };
const book = { depth: 0.78, gap: 0.05 };
const pullDistance = 0.34;
const walkSpeed = 2.4;
const agentScale = 0.42;
const agentZ = 0.78;
const restYaw = 0.3;
const sceneShare = 0.64;

const hashOf = (text: string) => {
  let hash = 0;
  for (const character of text) {
    hash = (hash * 31 + (character.codePointAt(0) ?? 0)) % 9973;
  }
  return hash;
};

interface BookLayout {
  height: number;
  width: number;
  x: number;
}

const layoutBooks = (books: readonly ShelfBook[]) => {
  const sizes = books.map((entry) => {
    const hash = hashOf(entry.id);
    return {
      height: 1.04 + (hash % 5) * 0.07,
      width: 0.46 + (hash % 3) * 0.05,
    };
  });
  const total =
    sizes.reduce((sum, size) => sum + size.width, 0) +
    book.gap * Math.max(0, sizes.length - 1);
  let cursor = -total / 2;
  const layouts: BookLayout[] = sizes.map((size) => {
    const x = cursor + size.width / 2;
    cursor += size.width + book.gap;
    return { ...size, x };
  });
  return { layouts, total };
};

const Book = ({
  entry,
  layout,
  onHover,
  onSelect,
  pull,
}: {
  entry: ShelfBook;
  layout: BookLayout;
  onHover: (id: string | null) => void;
  onSelect: (id: string) => void;
  pull: (node: Group | null) => void;
}) => {
  const surface = toneSurfaces[entry.tone];
  const centerY = plank.top + layout.height / 2;
  const front = book.depth / 2 + 0.002;
  const lines = spineLines(entry.name);
  const lineHeight = Math.min(0.1, (layout.width * 0.4) / lines.length);

  return (
    <group position={[layout.x, 0, 0]}>
      <group ref={pull}>
        <mesh
          geometry={boxGeometry}
          material={surface.material}
          onClick={(event: ThreeEvent<MouseEvent>) => {
            event.stopPropagation();
            onSelect(entry.id);
          }}
          onPointerOut={() => {
            document.body.style.cursor = "";
          }}
          onPointerOver={(event: ThreeEvent<PointerEvent>) => {
            event.stopPropagation();
            onHover(entry.id);
            document.body.style.cursor = "pointer";
          }}
          position={[0, centerY, 0]}
          scale={[layout.width, layout.height, book.depth]}
        >
          <Edges color={surface.edge} linewidth={1} />
        </mesh>
        <mesh
          geometry={boxGeometry}
          material={
            surface.label === sceneColors.ink
              ? sceneMaterials.ink
              : sceneMaterials.paper
          }
          position={[0, plank.top + layout.height - 0.12, front]}
          raycast={() => null}
          scale={[layout.width * 0.6, 0.012, 0.004]}
        />
        {lines.map((line, index) => (
          <SceneLabel
            align="center"
            color={surface.label}
            height={lineHeight}
            key={line}
            maxWidth={layout.height - 0.34}
            position={[
              ((lines.length - 1) / 2 - index) * lineHeight * 1.25,
              centerY - 0.04,
              front,
            ]}
            rotation-z={-Math.PI / 2}
            text={line}
          />
        ))}
      </group>
    </group>
  );
};

const ShelfFrame = ({ width }: { width: number }) => (
  <group>
    <mesh
      geometry={boxGeometry}
      material={sceneMaterials.paper}
      position={[0, plank.top - plank.height / 2, 0]}
      raycast={() => null}
      scale={[width, plank.height, plank.depth]}
    >
      <Edges color={sceneColors.ink} linewidth={1} />
    </mesh>
    {[-1, 1].map((side) => (
      <mesh
        geometry={boxGeometry}
        key={side}
        material={sceneMaterials.paperDeep}
        position={[
          side * (width / 2 - 0.08),
          (plank.top - plank.height) / 2,
          -0.2,
        ]}
        raycast={() => null}
        scale={[0.06, plank.top - plank.height, 0.5]}
      >
        <Edges color={sceneColors.ink} linewidth={1} />
      </mesh>
    ))}
    <BlobShadow position={[0, 0.001, 0.1]} scale={[width * 0.55, 0.7]} />
  </group>
);

const ShelfContent = ({
  activeId,
  books,
  isReduced,
  onHover,
  onSelect,
  track,
}: ShelfContentProps) => {
  const walker = useRef<Group>(null);
  const body = useRef<Group>(null);
  const action = useRef<AgentAction>("read");
  const pulls = useRef(new Map<string, Group>());
  const shown = useRef(0);
  const isPlaced = useRef(false);
  const { layouts, total } = layoutBooks(books);
  const width = total + 0.5;
  const restX = -width / 2 - 0.42;
  const sceneLeft = restX - 0.9;
  const frameWidth = (width / 2 + 0.15 - sceneLeft) / sceneShare;
  const activeIndex = books.findIndex((entry) => entry.id === activeId);
  const activeLayout = layouts[activeIndex];

  useFrame((_, delta) => {
    const agent = walker.current;
    const spinner = body.current;
    if (!(agent && spinner)) {
      return;
    }
    if (!isPlaced.current) {
      isPlaced.current = true;
      agent.position.x = restX;
    }
    const frameStep = Math.min(delta, 0.1);
    const isLead = isLeadAgentCast(track.current);
    shown.current = isReduced
      ? Number(isLead)
      : MathUtils.damp(shown.current, isLead ? 1 : 0, 10, frameStep);
    spinner.visible = shown.current > 0.01;
    spinner.scale.setScalar(Math.max(0.0001, shown.current));

    const targetX = isReduced || !activeLayout ? restX : activeLayout.x;
    const gap = targetX - agent.position.x;
    const stride = walkSpeed * frameStep;
    const hasArrived = Math.abs(gap) <= stride;
    agent.position.x = hasArrived
      ? targetX
      : agent.position.x + Math.sign(gap) * stride;
    const facing = hasArrived ? restYaw : Math.sign(gap) * 1.3;
    spinner.rotation.y = isReduced
      ? restYaw
      : MathUtils.damp(spinner.rotation.y, facing, 10, frameStep);
    if (!hasArrived) {
      action.current = "walk";
    } else if (activeLayout) {
      action.current = "point";
    } else {
      action.current = "read";
    }

    for (const entry of books) {
      const node = pulls.current.get(entry.id);
      if (!node) {
        continue;
      }
      const isPulled = entry.id === activeId && (isReduced || hasArrived);
      const target = isPulled ? pullDistance : 0;
      node.position.z = isReduced
        ? target
        : MathUtils.damp(node.position.z, target, 9, frameStep);
    }
  });

  return (
    <>
      <SceneCamera
        elevation={0.16}
        fitHeight={2.3}
        fitWidth={frameWidth}
        fov={28}
        target={[sceneLeft + frameWidth / 2, 1.02, 0]}
      />
      <ViewLights />
      <ShelfFrame width={width} />
      {books.map((entry, index) => {
        const layout = layouts[index];
        return layout ? (
          <Book
            entry={entry}
            key={entry.id}
            layout={layout}
            onHover={onHover}
            onSelect={onSelect}
            pull={(node) => {
              if (node) {
                pulls.current.set(entry.id, node);
              } else {
                pulls.current.delete(entry.id);
              }
            }}
          />
        ) : null;
      })}
      <group position-z={agentZ}>
        <group ref={walker}>
          <group ref={body}>
            <Agent actionRef={action} role="researcher" scale={agentScale} />
          </group>
        </group>
      </group>
    </>
  );
};

export default ShelfContent;
