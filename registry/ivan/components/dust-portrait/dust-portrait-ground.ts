import { Color, ShaderMaterial } from "three";
import type { IUniform, Vector3 } from "three";

import { dustBurstChunk } from "./dust-portrait-bursts";

const groundVertexShader = `
  varying vec2 vUv;

  void main() {
    vUv = position.xy + 0.5;
    gl_Position = vec4(position.xy * 2.0, 0.0, 1.0);
  }
`;

const groundFragmentShader = `
  uniform vec3 uGround;
  uniform vec3 uMark;
  uniform float uReveal;
  uniform float uAspect;
  uniform float uTime;

  varying vec2 vUv;

  ${dustBurstChunk}

  void main() {
    vec2 stage = vUv * vec2(uAspect, 1.0);
    float glow = 0.0;
    for (int index = 0; index < BURSTS; index++) {
      vec3 burst = uBursts[index];
      float age = uTime - burst.z;
      if (age < 0.0 || age > BURST_SECONDS) {
        continue;
      }
      float gap = length(stage - burst.xy * vec2(uAspect, 1.0));
      float wave = clamp(age / BURST_WAVE_SECONDS, 0.0, 1.0);
      float ring = exp(-pow((gap - burstFront(age)) / 0.03, 2.0)) * pow(1.0 - wave, 2.0);
      float flash = exp(-age * 12.0) * exp(-pow(gap / 0.14, 2.0));
      glow += 0.2 * ring + 0.32 * flash;
    }
    gl_FragColor = vec4(mix(uGround, uMark, min(glow, 0.5)), uReveal);
    #include <colorspace_fragment>
  }
`;

export interface DustGroundShared {
  uAspect: IUniform<number>;
  uBursts: IUniform<Vector3[]>;
  uMark: IUniform<Color>;
  uTime: IUniform<number>;
}

interface DustGroundUniforms extends DustGroundShared {
  [uniform: string]: IUniform;
  uGround: IUniform<Color>;
  uReveal: IUniform<number>;
}

export class DustGroundMaterial extends ShaderMaterial {
  declare uniforms: DustGroundUniforms;

  constructor(shared: DustGroundShared) {
    super({
      depthTest: false,
      depthWrite: false,
      fragmentShader: groundFragmentShader,
      toneMapped: false,
      transparent: true,
      uniforms: {
        ...shared,
        uGround: { value: new Color("#0B0B0C") },
        uReveal: { value: 0 },
      },
      vertexShader: groundVertexShader,
    });
  }
}
