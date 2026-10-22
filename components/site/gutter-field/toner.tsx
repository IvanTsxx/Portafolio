"use client";

import { useEffect, useMemo, useRef } from "react";
import type { Mesh, WebGLRenderer } from "three";
import {
  PlaneGeometry,
  ShaderMaterial,
  Vector2,
  Vector3,
  Vector4,
} from "three";

import { clayColor, inkColor, useLaneEngine, useLaneSize } from "./lane-kit";
import type {
  LaneEngine,
  LanePointer,
  LaneSceneProps,
  LaneTick,
} from "./lane-kit";

const ringSlots = 4;
const ringSpeed = 180;
const ringLife = 1;
const lensStiffness = 90;
const lensDamping = 15;
const lensRise = 6;
const smearScale = 0.06;

const vertexShader = `
  void main() {
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`;

const fragmentShader = `
  uniform vec3 uInk;
  uniform vec3 uClay;
  uniform vec2 uSize;
  uniform vec4 uViewport;
  uniform float uRatio;
  uniform vec4 uSheet;
  uniform vec3 uLens;
  uniform vec2 uSmear;
  uniform vec4 uRings[${ringSlots}];
  uniform float uTime;

  const float cellSize = 4.0;
  const float dotSize = 2.0;
  const float lensRadius = 56.0;

  float hash(vec2 point) {
    return fract(sin(dot(point, vec2(127.1, 311.7))) * 43758.5453);
  }

  float noise(vec2 point) {
    vec2 base = floor(point);
    vec2 blend = fract(point);
    blend = blend * blend * (3.0 - 2.0 * blend);
    float bottom = mix(hash(base), hash(base + vec2(1.0, 0.0)), blend.x);
    float top = mix(hash(base + vec2(0.0, 1.0)), hash(base + vec2(1.0, 1.0)), blend.x);
    return mix(bottom, top, blend.y);
  }

  float fbm(vec2 point) {
    return noise(point) * 0.55 + noise(point * 2.1) * 0.3 + noise(point * 4.3) * 0.15;
  }

  float bayer2(vec2 cell) {
    cell = floor(cell);
    return fract(cell.x / 2.0 + cell.y * cell.y * 0.75);
  }

  float bayer4(vec2 cell) {
    return bayer2(0.5 * cell) * 0.25 + bayer2(cell);
  }

  float sheetDistance(vec2 lane) {
    vec2 center = vec2((uSheet.x + uSheet.y) * 0.5, (uSheet.z + uSheet.w) * 0.5);
    vec2 extent = vec2((uSheet.y - uSheet.x) * 0.5, (uSheet.z - uSheet.w) * 0.5);
    vec2 outside = abs(lane - center) - extent;
    return length(max(outside, 0.0)) + min(max(outside.x, outside.y), 0.0);
  }

  void main() {
    vec2 css = (gl_FragCoord.xy - uViewport.xy) / uRatio;
    vec2 cell = floor(css / cellSize);
    vec2 lane = (cell + 0.5) * cellSize - uSize * 0.5;

    float edge = sheetDistance(lane);
    if (edge < 0.0) {
      discard;
    }

    float grain = fbm(lane * 0.018 + vec2(uTime * 0.03, -uTime * 0.02));
    float bleed = exp(-edge / 16.0) * 0.16 * smoothstep(0.45, 0.85, grain);
    float drift = step(0.9975, hash(floor((lane + vec2(uTime * 4.0, -uTime * 2.5)) / cellSize)));

    vec2 away = lane - uLens.xy;
    float along = dot(away, uSmear) / max(dot(uSmear, uSmear), 0.0001);
    vec2 stretched = away - uSmear * clamp(along, -1.0, 0.0);
    float lens = uLens.z * exp(-dot(stretched, stretched) / (lensRadius * lensRadius));
    lens *= 0.45 + 0.55 * grain;

    float rings = 0.0;
    for (int index = 0; index < ${ringSlots}; index++) {
      vec4 ring = uRings[index];
      float front = (length(lane - ring.xy) - ring.z) / 6.0;
      rings += exp(-front * front) * ring.w * (0.5 + 0.5 * grain);
    }

    float density = clamp(bleed + drift * 0.6 + lens * 0.3 + rings * 0.32, 0.0, 1.0);
    if (density <= bayer4(cell) + 0.03125) {
      discard;
    }

    vec2 inside = mod(css, cellSize) - (cellSize - dotSize) * 0.5;
    if (inside.x < 0.0 || inside.y < 0.0 || inside.x > dotSize || inside.y > dotSize) {
      discard;
    }
    float spark = hash(cell + vec2(17.0, floor(uTime * 0.6 + hash(cell) * 4.0)));
    float clayChance = 0.05 + lens * 0.35 + rings * 0.3;
    gl_FragColor = spark < clayChance ? vec4(uClay, 0.7) : vec4(uInk, 0.38);
  }
`;

const quad = new PlaneGeometry(2, 2);
const viewport = new Vector4();

interface Ring {
  age: number;
  x: number;
  y: number;
}

const createTonerUniforms = () => ({
  uClay: { value: new Vector3(clayColor.r, clayColor.g, clayColor.b) },
  uInk: { value: new Vector3(inkColor.r, inkColor.g, inkColor.b) },
  uLens: { value: new Vector3() },
  uRatio: { value: 1 },
  uRings: { value: Array.from({ length: ringSlots }, () => new Vector4()) },
  uSheet: { value: new Vector4() },
  uSize: { value: new Vector2() },
  uSmear: { value: new Vector2() },
  uTime: { value: 0 },
  uViewport: { value: new Vector4() },
});

type TonerUniforms = ReturnType<typeof createTonerUniforms>;

const createTonerMaterial = (uniforms: TonerUniforms) =>
  new ShaderMaterial({
    depthTest: false,
    depthWrite: false,
    fragmentShader,
    toneMapped: false,
    transparent: true,
    uniforms,
    vertexShader,
  });

const createToner = (
  pointer: LanePointer
): LaneEngine<TonerUniforms> & {
  material: ShaderMaterial;
  uniforms: TonerUniforms;
} => {
  const uniforms = createTonerUniforms();
  const material = createTonerMaterial(uniforms);
  const lens = { strength: 0, velocityX: 0, velocityY: 0, x: 0, y: 0 };
  let rings: Ring[] = [];
  let time = 0;

  const simulate = ({ energy, pulses, step }: LaneTick) => {
    time += step * (1 + energy * 2);
    if (pointer.isInside) {
      lens.velocityX +=
        (lensStiffness * (pointer.x - lens.x) - lensDamping * lens.velocityX) *
        step;
      lens.velocityY +=
        (lensStiffness * (pointer.y - lens.y) - lensDamping * lens.velocityY) *
        step;
      lens.x += lens.velocityX * step;
      lens.y += lens.velocityY * step;
    }
    lens.strength +=
      (energy - lens.strength) * (1 - Math.exp(-lensRise * step));
    for (const pulse of pulses) {
      rings.push({ age: 0, x: pulse.x, y: pulse.y });
    }
    for (const ring of rings) {
      ring.age += step;
    }
    rings = rings.filter((ring) => ring.age < ringLife).slice(-ringSlots);
  };

  const draw = (target: TonerUniforms) => {
    target.uTime.value = time;
    const { sheet } = pointer;
    target.uSheet.value.set(sheet.left, sheet.right, sheet.top, sheet.bottom);
    target.uLens.value.set(lens.x, lens.y, lens.strength);
    target.uSmear.value.set(
      -lens.velocityX * smearScale,
      -lens.velocityY * smearScale
    );
    for (const [index, slot] of target.uRings.value.entries()) {
      const ring = rings[index];
      if (ring) {
        slot.set(ring.x, ring.y, ring.age * ringSpeed, 1 - ring.age / ringLife);
      } else {
        slot.set(0, 0, 0, 0);
      }
    }
  };

  return {
    dispose: () => material.dispose(),
    draw,
    material,
    simulate,
    uniforms,
  };
};

const Toner = ({ animate, pointer, sense }: LaneSceneProps) => {
  const size = useLaneSize();
  const mesh = useRef<Mesh>(null);
  const engine = useMemo(() => createToner(pointer), [pointer]);

  useEffect(() => {
    const plane = mesh.current;
    if (!plane) {
      return;
    }
    plane.onBeforeRender = (renderer: WebGLRenderer) => {
      renderer.getCurrentViewport(viewport);
      const { uniforms } = engine;
      uniforms.uViewport.value.copy(viewport);
      uniforms.uRatio.value = renderer.getPixelRatio();
      uniforms.uSize.value.set(size.width, size.height);
    };
  }, [engine, size]);

  useLaneEngine({ animate, pointer, sense }, engine, () => engine.uniforms);

  return (
    <mesh
      frustumCulled={false}
      geometry={quad}
      material={engine.material}
      ref={mesh}
    />
  );
};

export default Toner;
