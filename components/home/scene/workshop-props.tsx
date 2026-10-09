"use client";

import { Edges, Grid, RoundedBox } from "@react-three/drei";
import type { ThreeElements } from "@react-three/fiber";

import { scenePalette } from "@/components/home/scene/palette";

export const WorkshopFloor = ({
  fadeDistance = 22,
}: {
  fadeDistance?: number;
}) => (
  <Grid
    cellColor={scenePalette.floorCell}
    cellSize={0.5}
    cellThickness={0.6}
    fadeDistance={fadeDistance}
    fadeStrength={1.4}
    infiniteGrid
    position={[0, 0.003, 0]}
    sectionColor={scenePalette.floorSection}
    sectionSize={2.5}
    sectionThickness={1}
  />
);

export const Desk = ({
  width = 3,
  depth = 1.2,
  height = 0.9,
  ...groupProps
}: ThreeElements["group"] & {
  width?: number;
  depth?: number;
  height?: number;
}) => {
  const legInsetX = width / 2 - 0.12;
  const legInsetZ = depth / 2 - 0.12;
  const legPositions: [number, number][] = [
    [-legInsetX, -legInsetZ],
    [legInsetX, -legInsetZ],
    [-legInsetX, legInsetZ],
    [legInsetX, legInsetZ],
  ];
  return (
    <group {...groupProps}>
      <mesh castShadow position={[0, height, 0]} receiveShadow>
        <boxGeometry args={[width, 0.08, depth]} />
        <meshStandardMaterial color={scenePalette.surface} roughness={0.85} />
        <Edges color={scenePalette.edge} />
      </mesh>
      {legPositions.map(([x, z]) => (
        <mesh castShadow key={`${x}-${z}`} position={[x, height / 2, z]}>
          <boxGeometry args={[0.06, height, 0.06]} />
          <meshStandardMaterial color={scenePalette.graphite} />
        </mesh>
      ))}
    </group>
  );
};

export const Monitor = ({
  screenColor = scenePalette.blueprint,
  ...groupProps
}: ThreeElements["group"] & { screenColor?: string }) => (
  <group {...groupProps}>
    <mesh castShadow position={[0, 0.42, 0]}>
      <boxGeometry args={[1.1, 0.68, 0.05]} />
      <meshStandardMaterial color={scenePalette.graphite} roughness={0.5} />
    </mesh>
    <mesh position={[0, 0.42, 0.027]}>
      <planeGeometry args={[1, 0.58]} />
      <meshStandardMaterial
        color={scenePalette.graphite}
        emissive={screenColor}
        emissiveIntensity={0.22}
      />
    </mesh>
    {[0.2, 0.08, -0.04, -0.16].map((offset, lineIndex) => (
      <mesh
        key={offset}
        position={[-0.12 + lineIndex * 0.04, 0.42 + offset, 0.03]}
      >
        <planeGeometry args={[0.56 - lineIndex * 0.08, 0.035]} />
        <meshBasicMaterial color={screenColor} opacity={0.55} transparent />
      </mesh>
    ))}
    <mesh position={[0, 0.04, 0]}>
      <boxGeometry args={[0.3, 0.04, 0.2]} />
      <meshStandardMaterial color={scenePalette.graphite} />
    </mesh>
  </group>
);

export const Crate = ({
  size = 0.45,
  color = scenePalette.surfaceLight,
  ...groupProps
}: ThreeElements["group"] & { size?: number; color?: string }) => (
  <group {...groupProps}>
    <RoundedBox
      args={[size, size, size]}
      castShadow
      position={[0, size / 2, 0]}
      radius={0.03}
      receiveShadow
    >
      <meshStandardMaterial color={color} roughness={0.9} />
    </RoundedBox>
  </group>
);

export const BlueprintBoard = (groupProps: ThreeElements["group"]) => (
  <group {...groupProps}>
    <mesh castShadow position={[0, 1.3, 0]}>
      <boxGeometry args={[2.2, 1.4, 0.04]} />
      <meshStandardMaterial color={scenePalette.graphite} roughness={0.9} />
      <Edges color={scenePalette.edge} />
    </mesh>
    {[-0.3, 0, 0.3].map((y) => (
      <mesh key={y} position={[-0.2, 1.3 + y, 0.025]}>
        <planeGeometry args={[1.4, 0.012]} />
        <meshBasicMaterial
          color={scenePalette.blueprint}
          opacity={0.6}
          transparent
        />
      </mesh>
    ))}
    <mesh position={[0.6, 1.3, 0.025]}>
      <ringGeometry args={[0.18, 0.2, 32]} />
      <meshBasicMaterial
        color={scenePalette.blueprint}
        opacity={0.6}
        transparent
      />
    </mesh>
    {[-0.9, 0.9].map((x) => (
      <mesh castShadow key={x} position={[x, 0.3, 0]}>
        <boxGeometry args={[0.05, 0.6, 0.05]} />
        <meshStandardMaterial color={scenePalette.graphite} />
      </mesh>
    ))}
  </group>
);
