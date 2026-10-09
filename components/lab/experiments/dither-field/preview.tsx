"use client";

import { Canvas, extend, useFrame, useThree } from "@react-three/fiber";
import { useRef, useState } from "react";
import { MathUtils } from "three";

import { ExperimentStage } from "@/components/lab/experiment-stage";
import {
  SliderControl,
  SwitchControl,
  ToggleControl,
} from "@/components/lab/lab-controls";
import { useStageActivity } from "@/components/lab/use-stage-activity";

import { DitherMaterial } from "./dither-material";

const DitherMaterialElement = extend(DitherMaterial);

const matrixOptions = [
  { label: "2×2", value: "2" },
  { label: "4×4", value: "4" },
  { label: "8×8", value: "8" },
] as const;

type MatrixSize = (typeof matrixOptions)[number]["value"];

interface DitherSettings {
  cell: number;
  contrast: number;
  matrix: MatrixSize;
  accent: boolean;
}

interface DitherPlaneProps {
  settings: DitherSettings;
  animate: boolean;
}

const DitherPlane = ({ settings, animate }: DitherPlaneProps) => {
  const material = useRef<InstanceType<typeof DitherMaterial>>(null);
  const isHovering = useRef(false);
  const viewport = useThree((state) => state.viewport);
  const invalidate = useThree((state) => state.invalidate);

  useFrame((state, delta) => {
    const shader = material.current;
    if (!shader) {
      return;
    }
    const step = Math.min(delta, 0.05);
    if (animate) {
      shader.uTime += step;
    }
    const time = shader.uTime;
    const target = isHovering.current
      ? { x: state.pointer.x * 0.5 + 0.5, y: state.pointer.y * 0.5 + 0.5 }
      : {
          x: 0.5 + Math.sin(time * 0.31) * 0.28,
          y: 0.5 + Math.cos(time * 0.23) * 0.22,
        };
    const pressureTarget = isHovering.current ? 1 : 0.6;
    const lambda = animate ? 6 : 1000;
    shader.uPointer.x = MathUtils.damp(
      shader.uPointer.x,
      target.x,
      lambda,
      step
    );
    shader.uPointer.y = MathUtils.damp(
      shader.uPointer.y,
      target.y,
      lambda,
      step
    );
    shader.uPressure = MathUtils.damp(
      shader.uPressure,
      pressureTarget,
      lambda / 2,
      step
    );
    shader.uResolution.set(
      state.size.width * state.viewport.dpr,
      state.size.height * state.viewport.dpr
    );
  });

  return (
    <mesh
      onPointerEnter={() => {
        isHovering.current = true;
      }}
      onPointerLeave={() => {
        isHovering.current = false;
        invalidate();
      }}
      onPointerMove={() => {
        if (!animate) {
          invalidate();
        }
      }}
      scale={[viewport.width, viewport.height, 1]}
    >
      <planeGeometry args={[1, 1]} />
      <DitherMaterialElement
        key={DitherMaterial.key}
        ref={material}
        uAccent={settings.accent ? 1 : 0}
        uCell={settings.cell * viewport.dpr}
        uContrast={settings.contrast}
        uMatrix={Number(settings.matrix)}
      />
    </mesh>
  );
};

const DitherFieldPreview = () => {
  const { activity, ref } = useStageActivity<HTMLDivElement>();
  const [settings, setSettings] = useState<DitherSettings>({
    accent: true,
    cell: 4,
    contrast: 1.6,
    matrix: "8",
  });

  const animate = activity === "running";

  return (
    <ExperimentStage
      activity={activity}
      controls={
        <>
          <SliderControl
            format={(value) => `${value}px`}
            label="Cell size"
            max={12}
            min={2}
            onChange={(cell) =>
              setSettings((current) => ({ ...current, cell }))
            }
            value={settings.cell}
          />
          <SliderControl
            format={(value) => value.toFixed(1)}
            label="Contrast"
            max={3}
            min={0.6}
            onChange={(contrast) =>
              setSettings((current) => ({ ...current, contrast }))
            }
            step={0.1}
            value={settings.contrast}
          />
          <ToggleControl
            hint="Larger matrices resolve more tone levels: 4, 16 or 64."
            label="Bayer matrix"
            onChange={(matrix) =>
              setSettings((current) => ({ ...current, matrix }))
            }
            options={matrixOptions}
            value={settings.matrix}
          />
          <SwitchControl
            checked={settings.accent}
            hint="Cells under the strongest pressure switch to clay."
            label="Clay accent"
            onChange={(accent) =>
              setSettings((current) => ({ ...current, accent }))
            }
          />
        </>
      }
      reducedNote="Reduced motion is on. The field holds a single frame and only redraws when a control changes."
      stageLabel="Dithered noise field that reacts to the pointer"
      stageRef={ref}
    >
      <Canvas
        camera={{ fov: 35, position: [0, 0, 4] }}
        className="cursor-crosshair touch-pan-y"
        dpr={[1, 1.75]}
        flat
        frameloop={animate ? "always" : "demand"}
        gl={{ antialias: false, powerPreference: "low-power" }}
      >
        <DitherPlane animate={animate} settings={settings} />
      </Canvas>
    </ExperimentStage>
  );
};

export default DitherFieldPreview;
