import {
  DynamicDrawUsage,
  InstancedMesh,
  Matrix4,
  PlaneGeometry,
  ShaderMaterial,
  Vector3,
} from "three";
import type { Object3D } from "three";

import { bayerGlsl, impactTiming } from "./lunar-dither-material";
import type { LunarDitherUniforms } from "./lunar-dither-material";

const streakCapacity = 12;
const streakWidth = 0.07;
const tailShare = 0.42;
const approachDistance = 1.7;

const vertexShader = `
varying vec2 vUv;

void main() {
  vUv = uv;
  vec4 local = vec4(position, 1.0);
  #ifdef USE_INSTANCING
  local = instanceMatrix * local;
  #endif
  gl_Position = projectionMatrix * modelViewMatrix * local;
}
`;

const fragmentShader = `
uniform vec3 uPaper;
uniform float uPixelSize;
uniform float uDpr;

varying vec2 vUv;

${bayerGlsl}

void main() {
  float across = abs(vUv.y - 0.5) * 2.0;
  float body = 1.0 - smoothstep(0.15, 1.0, across / max(vUv.x, 0.2));
  float coverage = (0.15 + 0.85 * vUv.x) * body * 1.2;
  float cellSize = max(uPixelSize * uDpr, 1.0);
  if (coverage < bayer8(gl_FragCoord.xy / cellSize) + 1.0 / 128.0) {
    discard;
  }
  gl_FragColor = vec4(uPaper, 1.0);
  #include <colorspace_fragment>
}
`;

interface Flight {
  launch: number;
  origin: Vector3;
  target: Vector3;
}

export class MeteorStreaks {
  readonly mesh: InstancedMesh;
  private readonly flights: Flight[] = [];
  private readonly matrix = new Matrix4();
  private readonly head = new Vector3();
  private readonly tail = new Vector3();
  private readonly end = new Vector3();
  private readonly axis = new Vector3();
  private readonly side = new Vector3();
  private readonly depth = new Vector3();
  private readonly middle = new Vector3();

  constructor(uniforms: LunarDitherUniforms) {
    const material = new ShaderMaterial({
      depthWrite: false,
      fragmentShader,
      toneMapped: false,
      uniforms: {
        uDpr: uniforms.uDpr,
        uPaper: uniforms.uPaper,
        uPixelSize: uniforms.uPixelSize,
      },
      vertexShader,
    });
    this.mesh = new InstancedMesh(
      new PlaneGeometry(1, 1),
      material,
      streakCapacity
    );
    this.mesh.instanceMatrix.setUsage(DynamicDrawUsage);
    this.mesh.frustumCulled = false;
    this.mesh.count = 0;
    this.mesh.renderOrder = 1;
  }

  launch(target: Vector3, hit: Vector3, toCamera: Vector3, now: number) {
    const sideways = this.side
      .set(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5)
      .projectOnPlane(toCamera)
      .normalize();
    const direction = this.axis
      .copy(hit)
      .normalize()
      .multiplyScalar(0.55)
      .addScaledVector(toCamera, 0.45)
      .addScaledVector(sideways, 1.1)
      .normalize();
    if (this.flights.length >= streakCapacity) {
      this.flights.shift();
    }
    this.flights.push({
      launch: now,
      origin: hit.clone().addScaledVector(direction, approachDistance),
      target: target.clone(),
    });
  }

  advance(now: number, moon: Object3D, cameraPosition: Vector3) {
    let drawn = 0;
    for (const flight of this.flights) {
      const progress = (now - flight.launch) / impactTiming.flight;
      if (progress < 0 || progress >= 1) {
        continue;
      }
      this.end.copy(flight.target);
      moon.localToWorld(this.end);
      this.head.lerpVectors(flight.origin, this.end, progress);
      this.tail.lerpVectors(
        flight.origin,
        this.end,
        Math.max(progress - tailShare, 0)
      );
      this.axis.subVectors(this.head, this.tail);
      const length = this.axis.length();
      if (length < 1e-4) {
        continue;
      }
      this.middle.addVectors(this.head, this.tail).multiplyScalar(0.5);
      this.depth.subVectors(cameraPosition, this.middle).normalize();
      this.side
        .crossVectors(this.depth, this.axis)
        .normalize()
        .multiplyScalar(streakWidth);
      this.depth.crossVectors(this.axis, this.side).normalize();
      this.matrix
        .makeBasis(this.axis, this.side, this.depth)
        .setPosition(this.middle);
      this.mesh.setMatrixAt(drawn, this.matrix);
      drawn += 1;
    }
    const lastLaunch = now - impactTiming.flight;
    while (
      this.flights.length > 0 &&
      (this.flights[0]?.launch ?? 0) < lastLaunch
    ) {
      this.flights.shift();
    }
    this.mesh.count = drawn;
    this.mesh.visible = drawn > 0;
    this.mesh.instanceMatrix.needsUpdate = drawn > 0;
  }

  clear() {
    this.flights.length = 0;
    this.mesh.count = 0;
    this.mesh.visible = false;
  }

  dispose() {
    this.mesh.geometry.dispose();
    const { material } = this.mesh;
    if (!Array.isArray(material)) {
      material.dispose();
    }
    this.mesh.dispose();
  }
}
