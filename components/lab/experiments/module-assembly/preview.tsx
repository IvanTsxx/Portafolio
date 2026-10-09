"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Color, Euler, MathUtils, Matrix4, Quaternion, Vector3 } from "three";
import type { InstancedMesh } from "three";

import { Agent } from "@/components/agents/agent";
import type { AgentProps } from "@/components/agents/agent";
import { ExperimentStage } from "@/components/lab/experiment-stage";
import {
  SliderControl,
  SwitchControl,
  ToggleControl,
} from "@/components/lab/lab-controls";
import { useStageActivity } from "@/components/lab/use-stage-activity";

import { layoutGrid, moduleCount, moduleLayouts } from "./layouts";
import type { ModuleLayout, ModuleTone } from "./layouts";

const layoutOptions = [
  { label: "Card", value: "card" },
  { label: "Stack", value: "stack" },
  { label: "Bento", value: "bento" },
] as const;

const toneColors = {
  ink: new Color("#d9d5cd"),
  panel: new Color("#3b3835"),
  plate: new Color("#252321"),
} as const satisfies Record<ModuleTone, Color>;

const seeded = (seed: number) => {
  const value = Math.sin(seed * 12.9898) * 43_758.5453;
  return value - Math.floor(value);
};

const scatterPoses = Array.from({ length: moduleCount }, (_, moduleIndex) => {
  const angle = seeded(moduleIndex + 1) * Math.PI * 2;
  const radius = 1.6 + seeded(moduleIndex + 41) * 1.4;
  return {
    position: new Vector3(
      Math.cos(angle) * radius,
      (seeded(moduleIndex + 7) - 0.5) * 2.4,
      Math.sin(angle) * radius * 0.6 - 0.4
    ),
    rotation: new Euler(
      seeded(moduleIndex + 13) * Math.PI,
      seeded(moduleIndex + 23) * Math.PI,
      seeded(moduleIndex + 31) * Math.PI
    ),
    scale: 0.18 + seeded(moduleIndex + 53) * 0.12,
  };
});

const easeInOutCubic = (value: number) =>
  value < 0.5 ? 4 * value ** 3 : 1 - (-2 * value + 2) ** 3 / 2;

const autoProgressAt = (time: number) => {
  const phase = (time % 8) / 8;
  if (phase < 0.12) {
    return 0;
  }
  if (phase < 0.45) {
    return (phase - 0.12) / 0.33;
  }
  if (phase < 0.82) {
    return 1;
  }
  return 1 - (phase - 0.82) / 0.18;
};

interface ModulesProps {
  layout: ModuleLayout;
  progress: number;
  isAuto: boolean;
  isRunning: boolean;
  isReduced: boolean;
}

const scratch = {
  matrix: new Matrix4(),
  position: new Vector3(),
  quaternion: new Quaternion(),
  scale: new Vector3(),
  scatterQuaternion: new Quaternion(),
  scatterScale: new Vector3(),
  slotQuaternion: new Quaternion(),
};

interface ModulePose {
  position: Vector3;
  quaternion: Quaternion;
  scale: Vector3;
}

const createPoses = (): ModulePose[] =>
  scatterPoses.map((pose) => ({
    position: pose.position.clone(),
    quaternion: new Quaternion().setFromEuler(pose.rotation),
    scale: new Vector3().setScalar(pose.scale),
  }));

const Modules = ({
  layout,
  progress,
  isAuto,
  isRunning,
  isReduced,
}: ModulesProps) => {
  const mesh = useRef<InstancedMesh>(null);
  const autoClock = useRef(0);
  const poses = useRef<ModulePose[] | null>(null);
  const frameInputs = useRef<ModulesProps>({
    isAuto,
    isReduced,
    isRunning,
    layout,
    progress,
  });
  const invalidate = useThree((state) => state.invalidate);

  useLayoutEffect(() => {
    const instances = mesh.current;
    if (!instances) {
      return;
    }
    const slots = moduleLayouts[layout];
    for (let moduleIndex = 0; moduleIndex < moduleCount; moduleIndex += 1) {
      instances.setColorAt(
        moduleIndex,
        toneColors[slots[moduleIndex]?.tone ?? "panel"]
      );
    }
    if (instances.instanceColor) {
      instances.instanceColor.needsUpdate = true;
    }
    invalidate();
  }, [invalidate, layout]);

  useEffect(() => {
    frameInputs.current = { isAuto, isReduced, isRunning, layout, progress };
    invalidate();
  }, [invalidate, isAuto, isReduced, isRunning, layout, progress]);

  useFrame((state, delta) => {
    const instances = mesh.current;
    if (!instances) {
      return;
    }
    const inputs = frameInputs.current;
    if (!poses.current) {
      poses.current = createPoses();
    }
    const { current } = poses;
    const step = Math.min(delta, 0.05);
    if (inputs.isAuto && inputs.isRunning) {
      autoClock.current += step;
    }
    const overall =
      inputs.isAuto && !inputs.isReduced
        ? autoProgressAt(autoClock.current)
        : inputs.progress;
    const slots = moduleLayouts[inputs.layout];
    const lambda = inputs.isReduced ? 1000 : 7;
    let largestGap = 0;

    for (let moduleIndex = 0; moduleIndex < moduleCount; moduleIndex += 1) {
      const scatter = scatterPoses[moduleIndex];
      const pose = current[moduleIndex];
      if (!(scatter && pose)) {
        continue;
      }
      const slot = slots[moduleIndex];
      const stagger = (moduleIndex / moduleCount) * 0.5;
      const local = easeInOutCubic(
        MathUtils.clamp((overall - stagger) / 0.5, 0, 1)
      );

      scratch.scatterQuaternion.setFromEuler(scatter.rotation);
      if (slot) {
        scratch.position.set(
          (slot.x + slot.width / 2 - layoutGrid.columns / 2) * layoutGrid.unit,
          (layoutGrid.rows / 2 - (slot.y + slot.height / 2)) * layoutGrid.unit,
          slot.lift * layoutGrid.unit * 2
        );
        scratch.scale.set(
          slot.width * layoutGrid.unit - 0.02,
          slot.height * layoutGrid.unit - 0.02,
          slot.depth
        );
        scratch.slotQuaternion.identity();
      } else {
        scratch.position.copy(scatter.position);
        scratch.scale.setScalar(0);
        scratch.slotQuaternion.copy(scratch.scatterQuaternion);
      }

      scratch.position.lerpVectors(scatter.position, scratch.position, local);
      scratch.scale.lerpVectors(
        scratch.scatterScale.setScalar(scatter.scale),
        scratch.scale,
        local
      );
      scratch.quaternion.slerpQuaternions(
        scratch.scatterQuaternion,
        scratch.slotQuaternion,
        local
      );

      pose.position.x = MathUtils.damp(
        pose.position.x,
        scratch.position.x,
        lambda,
        step
      );
      pose.position.y = MathUtils.damp(
        pose.position.y,
        scratch.position.y,
        lambda,
        step
      );
      pose.position.z = MathUtils.damp(
        pose.position.z,
        scratch.position.z,
        lambda,
        step
      );
      pose.scale.x = MathUtils.damp(
        pose.scale.x,
        scratch.scale.x,
        lambda,
        step
      );
      pose.scale.y = MathUtils.damp(
        pose.scale.y,
        scratch.scale.y,
        lambda,
        step
      );
      pose.scale.z = MathUtils.damp(
        pose.scale.z,
        scratch.scale.z,
        lambda,
        step
      );
      pose.quaternion.slerp(scratch.quaternion, 1 - Math.exp(-lambda * step));
      largestGap = Math.max(
        largestGap,
        pose.position.distanceTo(scratch.position),
        pose.scale.distanceTo(scratch.scale),
        1 - Math.abs(pose.quaternion.dot(scratch.quaternion))
      );

      instances.setMatrixAt(
        moduleIndex,
        scratch.matrix.compose(pose.position, pose.quaternion, pose.scale)
      );
    }
    instances.instanceMatrix.needsUpdate = true;

    const sway = inputs.isReduced ? 0 : state.pointer.x * 0.25;
    state.camera.position.x = MathUtils.damp(
      state.camera.position.x,
      sway,
      3,
      step
    );
    state.camera.lookAt(0, 0, 0);

    const isSettled =
      largestGap < 0.001 && Math.abs(state.camera.position.x - sway) < 0.001;
    if (inputs.isRunning && (inputs.isAuto || !isSettled)) {
      invalidate();
    }
  });

  return (
    <instancedMesh args={[undefined, undefined, moduleCount]} ref={mesh}>
      <boxGeometry />
      <meshStandardMaterial roughness={0.7} />
    </instancedMesh>
  );
};

const PointerWake = ({ isRunning }: { isRunning: boolean }) => {
  const invalidate = useThree((state) => state.invalidate);
  const events = useThree((state) => state.events);
  useEffect(() => {
    const target = events.connected;
    if (!(target instanceof HTMLElement && isRunning)) {
      return;
    }
    const wake = () => invalidate();
    target.addEventListener("pointermove", wake);
    return () => target.removeEventListener("pointermove", wake);
  }, [events.connected, invalidate, isRunning]);
  return null;
};

const builderAgent = {
  action: "carry",
  focused: true,
  position: [-2.15, -1.25, 0.6],
  role: "builder",
  rotation: [0, 0.55, 0],
  scale: 0.55,
} as const satisfies AgentProps;

const ModuleAssemblyPreview = () => {
  const { activity, isReduced, ref } = useStageActivity<HTMLDivElement>();
  const [layout, setLayout] = useState<ModuleLayout>("card");
  const [progress, setProgress] = useState(100);
  const [isAuto, setIsAuto] = useState(true);

  const isRunning = activity === "running";
  const autoActive = isAuto && !isReduced;

  return (
    <ExperimentStage
      activity={activity}
      className="blueprint-dots"
      controls={
        <>
          <ToggleControl
            label="Layout"
            onChange={setLayout}
            options={layoutOptions}
            value={layout}
          />
          <SwitchControl
            checked={autoActive}
            disabled={isReduced}
            hint={
              isReduced
                ? "Unavailable under reduced motion."
                : "Cycles between scattered and assembled. Pauses offscreen."
            }
            label="Auto-cycle"
            onChange={setIsAuto}
          />
          <SliderControl
            disabled={autoActive}
            format={(value) => `${value}%`}
            hint={
              autoActive ? "Turn off auto-cycle to scrub by hand." : undefined
            }
            label="Assembly"
            max={100}
            min={0}
            onChange={setProgress}
            value={progress}
          />
        </>
      }
      reducedNote="Reduced motion is on. Modules jump straight to their pose and auto-cycle is off. Use the assembly slider to step through it."
      stageLabel="Instanced modules assembling into an interface layout next to a builder agent"
      stageRef={ref}
    >
      <Canvas
        camera={{ fov: 32, position: [0, 0.4, 7] }}
        className="touch-pan-y"
        dpr={[1, 1.75]}
        frameloop="demand"
      >
        <ambientLight intensity={0.7} />
        <directionalLight intensity={1.8} position={[3, 5, 6]} />
        <directionalLight intensity={0.4} position={[-4, -2, 3]} />
        <PointerWake isRunning={isRunning} />
        <Modules
          isAuto={autoActive}
          isReduced={isReduced}
          isRunning={isRunning}
          layout={layout}
          progress={progress / 100}
        />
        <Agent {...builderAgent} />
      </Canvas>
    </ExperimentStage>
  );
};

export default ModuleAssemblyPreview;
