"use client";

import { PerspectiveCamera } from "@react-three/drei";
import { extend, useFrame } from "@react-three/fiber";
import { useRef } from "react";
import type { RefObject } from "react";
import type { Group } from "three";
import { DoubleSide, PlaneGeometry, Vector3 } from "three";

import { driveSpring, frameStep } from "@/components/lab/source/spring";
import type { Spring } from "@/components/lab/source/spring";

import { FoldMaterial } from "./fold-material";
import { creaseLines, panelAngle, panelLayouts } from "./fold-model";
import type { CreaseCount, Panel } from "./fold-model";

const FoldMaterialElement = extend(FoldMaterial);

const pageHeight = 2.2;
const pageWidth = pageHeight / Math.SQRT2;
const sheetTilt = -0.46;
const quad = new PlaneGeometry(1, 1);
const swaySpring = { damping: 9, stiffness: 40 } as const;

export interface FoldSettings {
  creases: CreaseCount;
  stiffness: number;
}

export interface FoldGesture {
  target: number;
  sway: number;
  fold: Spring;
  swayAngle: Spring;
}

const advanceGesture = (
  gesture: FoldGesture,
  stiffness: number,
  step: number,
  animate: boolean
) => {
  const damping = 2 * Math.sqrt(stiffness) * 0.42;
  driveSpring(
    gesture.fold,
    gesture.target,
    { damping, stiffness },
    step,
    animate
  );
  driveSpring(
    gesture.swayAngle,
    animate ? gesture.sway : 0,
    swaySpring,
    step,
    animate
  );
};

export interface FoldViewProps {
  settings: FoldSettings;
  animate: boolean;
  gesture: RefObject<FoldGesture>;
}

const hingeX = (panel: Panel) => {
  if (panel.hinge === "fixed") {
    return 0;
  }
  const pageX =
    panel.hinge === "left"
      ? panel.pageStart + panel.pageWidth
      : panel.pageStart;
  return (pageX - 0.5) * pageWidth;
};

const meshX = (panel: Panel) => {
  const width = panel.pageWidth * pageWidth;
  if (panel.hinge === "left") {
    return -width / 2;
  }
  if (panel.hinge === "right") {
    return width / 2;
  }
  return (panel.pageStart + panel.pageWidth / 2 - 0.5) * pageWidth;
};

const creaseUniform = (creases: CreaseCount) => {
  const [first = -1, second = -1] = creaseLines(creases);
  return new Vector3(first, second, -1);
};

const FoldView = ({ settings, animate, gesture }: FoldViewProps) => {
  const panels: readonly Panel[] = panelLayouts[settings.creases];
  const hinges = useRef<(Group | null)[]>([]);
  const sheet = useRef<Group>(null);
  const creases = creaseUniform(settings.creases);

  useFrame((_, delta) => {
    advanceGesture(
      gesture.current,
      settings.stiffness,
      frameStep(delta),
      animate
    );
    const { fold, swayAngle } = gesture.current;
    for (const [index, panel] of panels.entries()) {
      hinges.current[index]?.rotation.set(0, panelAngle(panel, fold.value), 0);
    }
    sheet.current?.rotation.set(sheetTilt, swayAngle.value * 0.22, 0);
  });

  return (
    <>
      <PerspectiveCamera fov={30} makeDefault position={[0, 0, 5.4]} />
      <group ref={sheet} rotation={[sheetTilt, 0, 0]}>
        {panels.map((panel, index) => (
          <group
            key={`${settings.creases}-${panel.pageStart}`}
            position={[hingeX(panel), 0, panel.lift]}
            ref={(group) => {
              hinges.current[index] = group;
            }}
          >
            <mesh
              geometry={quad}
              position={[meshX(panel), 0, 0]}
              scale={[panel.pageWidth * pageWidth, pageHeight, 1]}
            >
              <FoldMaterialElement
                key={FoldMaterial.key}
                side={DoubleSide}
                toneMapped={false}
                uCreases={creases}
                uPanel={[panel.pageStart, panel.pageWidth]}
              />
            </mesh>
          </group>
        ))}
      </group>
    </>
  );
};

export default FoldView;
