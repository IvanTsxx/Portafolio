import { Color, NormalBlending, ShaderMaterial } from "three";
import type { IUniform, Vector3 } from "three";

import { dustBurstChunk } from "./dust-portrait-bursts";
import { dustTrailLength } from "./dust-portrait-trail";

export const dustPortraitDefaults = {
  burst: true,
  density: 1,
  dispersion: 1,
  drift: 1,
  idle: true,
  ink: "#0B0B0C",
  paper: "#EDECE8",
  paused: false,
} as const;

export interface DustPortraitUniforms {
  [uniform: string]: IUniform;
  uAspect: IUniform<number>;
  uBursts: IUniform<Vector3[]>;
  uCellPx: IUniform<number>;
  uDispersion: IUniform<number>;
  uDrift: IUniform<number>;
  uIdle: IUniform<number>;
  uMark: IUniform<Color>;
  uIsLitMark: IUniform<number>;
  uRadius: IUniform<number>;
  uReveal: IUniform<number>;
  uTime: IUniform<number>;
  uTrail: IUniform<Vector3[]>;
}

const noiseChunk = `
  vec3 permute3(vec3 x) {
    return mod(((x * 34.0) + 1.0) * x, 289.0);
  }

  float simplex(vec2 v) {
    const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
    vec2 i = floor(v + dot(v, C.yy));
    vec2 x0 = v - i + dot(i, C.xx);
    vec2 i1 = x0.x > x0.y ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
    vec4 x12 = x0.xyxy + C.xxzz;
    x12.xy -= i1;
    i = mod(i, 289.0);
    vec3 p = permute3(permute3(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
    vec3 m = max(0.5 - vec3(dot(x0, x0), dot(x12.xy, x12.xy), dot(x12.zw, x12.zw)), 0.0);
    m = m * m;
    m = m * m;
    vec3 x = 2.0 * fract(p * C.www) - 1.0;
    vec3 h = abs(x) - 0.5;
    vec3 ox = floor(x + 0.5);
    vec3 a0 = x - ox;
    m *= 1.79284291400159 - 0.85373472095314 * (a0 * a0 + h * h);
    vec3 g;
    g.x = a0.x * x0.x + h.x * x0.y;
    g.yz = a0.yz * x12.xz + h.yz * x12.yw;
    return 130.0 * dot(m, g);
  }

  vec2 curl(vec2 p) {
    const float e = 0.08;
    float up = simplex(p + vec2(0.0, e));
    float down = simplex(p - vec2(0.0, e));
    float right = simplex(p + vec2(e, 0.0));
    float left = simplex(p - vec2(e, 0.0));
    return vec2(up - down, left - right) / (2.0 * e);
  }
`;

const vertexShader = `
  #define TRAIL ${dustTrailLength + 1}

  attribute vec2 aMeta;

  uniform vec3 uTrail[TRAIL];
  uniform float uAspect;
  uniform float uRadius;
  uniform float uDispersion;
  uniform float uDrift;
  uniform float uTime;
  uniform float uIdle;
  uniform float uCellPx;
  uniform float uIsLitMark;
  uniform float uReveal;

  varying float vAlpha;
  varying float vRadius;
  varying float vSize;

  ${noiseChunk}
  ${dustBurstChunk}

  struct BurstPush {
    vec2 offset;
    float amount;
    float ring;
  };

  BurstPush burstPushAt(vec2 stageHome, float seed) {
    BurstPush push = BurstPush(vec2(0.0), 0.0, 0.0);
    vec2 swirl = vec2(0.0);
    bool hasSwirl = false;
    float rise = BURST_RISE * (0.75 + 0.5 * fract(seed * 5.71));
    float reach = 0.1 + 0.08 * fract(seed * 9.13);
    for (int index = 0; index < BURSTS; index++) {
      vec3 burst = uBursts[index];
      float age = uTime - burst.z;
      if (age < 0.0 || age > BURST_SECONDS) {
        continue;
      }
      vec2 delta = stageHome - burst.xy * vec2(uAspect, 1.0);
      float gap = length(delta);
      float local = (age - burstArrival(gap)) / rise;
      if (local <= 0.0) {
        continue;
      }
      if (!hasSwirl) {
        swirl = curl(stageHome * 3.1 + seed * 0.3);
        hasSwirl = true;
      }
      float response = local * exp(1.0 - local);
      float falloff = exp(-gap * 3.2);
      float angle = seed * 6.2832;
      vec2 radial = gap > 0.0001 ? delta / gap : vec2(cos(angle), sin(angle));
      vec2 direction = normalize(radial + swirl * 0.45 * uDispersion + vec2(uDrift * 0.15, 0.0));
      push.offset += direction * response * falloff * reach;
      push.amount = max(push.amount, response * falloff);
      float fade = 1.0 - smoothstep(0.0, BURST_WAVE_SECONDS * 1.3, age);
      push.ring = max(push.ring, exp(-pow((local - 0.7) * 1.8, 2.0)) * fade);
    }
    float travel = length(push.offset);
    if (travel > 0.28) {
      push.offset *= 0.28 / travel;
    }
    push.amount = min(push.amount, 1.0);
    return push;
  }

  float influenceAt(vec2 home, float ragged) {
    float strongest = 0.0;
    vec2 scale = vec2(uAspect, 1.0);
    for (int index = 0; index < TRAIL; index++) {
      vec3 mark = uTrail[index];
      if (mark.z < 0.001) {
        continue;
      }
      vec2 delta = (home - mark.xy) * scale;
      delta.x *= delta.x > 0.0 ? 0.62 : 1.2;
      float reach = length(delta) / (uRadius * ragged);
      strongest = max(strongest, mark.z * (1.0 - smoothstep(0.3, 1.0, reach)));
    }
    return strongest;
  }

  void main() {
    vec2 home = position.xy;
    float luma = position.z;
    float seed = aMeta.x;
    float edge = aMeta.y;
    vec2 stageHome = home * vec2(uAspect, 1.0);

    float ragged = 0.78 + 0.44 * (simplex(stageHome * 9.0) * 0.5 + 0.5);
    float pushed = influenceAt(home, ragged);
    float idle = min(uIdle, 3.0);
    float windward = smoothstep(0.45, 1.0, home.x);
    float shedRate = 0.975 - idle * (0.012 + windward * 0.07);
    float shedder = step(shedRate, fract(seed * 7.31)) * step(0.22 * (1.0 - windward * min(idle, 1.0)), edge);
    float shed = min(idle, 1.0) * shedder * pow(max(sin(uTime * (0.22 + 0.3 * seed) + seed * 43.0), 0.0), mix(10.0, 4.0, windward * min(idle, 1.0))) * (0.55 + 0.25 * windward);
    float gustFront = fract(uTime * 0.045 + seed * 0.015);
    float gustBand = exp(-pow((home.x - (gustFront * 1.6 - 0.3)) * 7.0, 2.0));
    float gustLift = step(0.82, fract(seed * 5.13 + floor(uTime * 0.045) * 0.37));
    float gust = min(idle, 2.0) * 0.18 * gustBand * gustLift * (0.35 + 0.65 * windward);
    float amount = max(max(pushed, shed), gust);
    amount = amount * amount * (3.0 - 2.0 * amount);

    vec2 offset = vec2(0.0);
    if (amount > 0.0005) {
      float lag = 0.35 + 0.65 * fract(seed * 3.17);
      vec2 flow = curl(stageHome * 2.4 + vec2(-uTime * 0.16, uTime * 0.05) + seed * 0.4);
      float gust = 0.85 + 0.15 * sin(uTime * 0.9 + seed * 20.0);
      offset = flow * uDispersion * 0.09 * lag;
      offset += vec2(uDrift * 0.42 * lag * gust, (seed - 0.45) * 0.06 * uDispersion);
      offset *= amount;
    }

    BurstPush burst = burstPushAt(stageHome, seed);
    offset += burst.offset;
    offset += idle * windward * windward * 0.0016 * vec2(sin(uTime * 1.3 + seed * 50.0), cos(uTime * 1.1 + seed * 31.0));
    vec2 stage = home + vec2(offset.x / uAspect, offset.y);
    gl_Position = vec4(stage * 2.0 - 1.0, 0.0, 1.0);

    float coverage = mix(1.0 - luma, luma, uIsLitMark);
    float scatter = max(amount, burst.amount * 0.8);
    float grain = mix(1.0, 0.62 + 0.28 * seed, scatter);
    vRadius = sqrt(coverage) * 0.64 * uCellPx * grain * (1.0 + 0.45 * burst.ring);
    vSize = ceil(uCellPx * 1.35 + 2.0);
    vAlpha = min(mix(1.0, 0.5 + 0.5 * fract(seed * 13.7), scatter) + burst.ring * 0.5, 1.0) * uReveal;
    gl_PointSize = vSize;
  }
`;

const fragmentShader = `
  uniform vec3 uMark;

  varying float vAlpha;
  varying float vRadius;
  varying float vSize;

  void main() {
    float reach = length(gl_PointCoord - 0.5) * vSize;
    float alpha = (1.0 - smoothstep(vRadius - 0.6, vRadius + 0.6, reach)) * vAlpha;
    if (alpha < 0.004) {
      discard;
    }
    gl_FragColor = vec4(uMark, alpha);
    #include <colorspace_fragment>
  }
`;

export const createDustUniforms = (
  trail: Vector3[],
  bursts: Vector3[]
): DustPortraitUniforms => ({
  uAspect: { value: 1 },
  uBursts: { value: bursts },
  uCellPx: { value: 2 },
  uDispersion: { value: dustPortraitDefaults.dispersion },
  uDrift: { value: dustPortraitDefaults.drift },
  uIdle: { value: 0 },
  uIsLitMark: { value: 1 },
  uMark: { value: new Color(dustPortraitDefaults.paper) },
  uRadius: { value: 0.16 },
  uReveal: { value: 0 },
  uTime: { value: 0 },
  uTrail: { value: trail },
});

export class DustPortraitMaterial extends ShaderMaterial {
  declare uniforms: DustPortraitUniforms;

  constructor(trail: Vector3[], bursts: Vector3[]) {
    super({
      blending: NormalBlending,
      depthTest: false,
      depthWrite: false,
      fragmentShader,
      toneMapped: false,
      transparent: true,
      uniforms: createDustUniforms(trail, bursts),
      vertexShader,
    });
  }
}

const luminance = (value: string) => {
  const { r, g, b } = new Color(value);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};

export const isLighterThan = (mark: string, ground: string) =>
  luminance(mark) >= luminance(ground);
