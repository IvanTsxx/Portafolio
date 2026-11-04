import {
  AdditiveBlending,
  BufferAttribute,
  BufferGeometry,
  Color,
  NormalBlending,
  ShaderMaterial,
  Vector3,
} from "three";
import type { IUniform } from "three";

export const orbitDustDefaults = {
  ink: "#0B0B0C",
  paper: "#EDECE8",
  paused: false,
  radius: 1.6,
  speed: 1,
  thickness: 0.06,
  turbulence: 0.5,
} as const;

export const orbitDustLimits = {
  maxCount: 200_000,
  minCount: 50_000,
} as const;

export interface OrbitDustUniforms {
  [uniform: string]: IUniform;
  uTime: IUniform<number>;
  uRadius: IUniform<number>;
  uThickness: IUniform<number>;
  uTurbulence: IUniform<number>;
  uSize: IUniform<number>;
  uPixelRatio: IUniform<number>;
  uViewportHeight: IUniform<number>;
  uCameraDistance: IUniform<number>;
  uOpacity: IUniform<number>;
  uWell: IUniform<Vector3>;
  uWellStrength: IUniform<number>;
  uPaper: IUniform<Color>;
  uShade: IUniform<Color>;
}

const innerEdge = 0.48;
const ringGaps = [
  { at: 0.66, width: 0.018 },
  { at: 0.83, width: 0.03 },
] as const;

const vertexShader = `
uniform float uTime;
uniform float uRadius;
uniform float uThickness;
uniform float uTurbulence;
uniform float uSize;
uniform float uPixelRatio;
uniform float uViewportHeight;
uniform float uCameraDistance;
uniform vec3 uWell;
uniform float uWellStrength;

attribute float aSeed;

varying float vAlpha;
varying float vTone;

float hash13(vec3 p) {
  p = fract(p * 0.1031);
  p += dot(p, p.zyx + 31.32);
  return fract((p.x + p.y) * p.z);
}

vec4 noised(vec3 x) {
  vec3 i = floor(x);
  vec3 w = fract(x);
  vec3 u = w * w * (3.0 - 2.0 * w);
  vec3 du = 6.0 * w * (1.0 - w);
  float a = hash13(i);
  float b = hash13(i + vec3(1.0, 0.0, 0.0));
  float c = hash13(i + vec3(0.0, 1.0, 0.0));
  float d = hash13(i + vec3(1.0, 1.0, 0.0));
  float e = hash13(i + vec3(0.0, 0.0, 1.0));
  float f = hash13(i + vec3(1.0, 0.0, 1.0));
  float g = hash13(i + vec3(0.0, 1.0, 1.0));
  float h = hash13(i + vec3(1.0, 1.0, 1.0));
  float k1 = b - a;
  float k2 = c - a;
  float k3 = e - a;
  float k4 = a - b - c + d;
  float k5 = a - c - e + g;
  float k6 = a - b - e + f;
  float k7 = -a + b + c - d + e - f - g + h;
  float value = a + k1 * u.x + k2 * u.y + k3 * u.z + k4 * u.x * u.y + k5 * u.y * u.z + k6 * u.z * u.x + k7 * u.x * u.y * u.z;
  vec3 gradient = du * vec3(
    k1 + k4 * u.y + k6 * u.z + k7 * u.y * u.z,
    k2 + k5 * u.z + k4 * u.x + k7 * u.z * u.x,
    k3 + k6 * u.x + k5 * u.y + k7 * u.x * u.y
  );
  return vec4(value, gradient);
}

vec3 curlNoise(vec3 p) {
  vec3 dx = noised(p).yzw;
  vec3 dy = noised(p + vec3(31.4, 17.1, 5.3)).yzw;
  vec3 dz = noised(p + vec3(-11.7, 43.2, 27.9)).yzw;
  return vec3(dz.y - dy.z, dx.z - dz.x, dy.x - dx.y);
}

void main() {
  float band = position.x;
  float radius = band * uRadius;
  float angularVelocity = 0.42 / pow(max(band, 0.2), 1.5);
  float angle = position.y + uTime * angularVelocity;
  vec3 orbit = vec3(cos(angle) * radius, position.z * uThickness, sin(angle) * radius);

  vec3 flowPoint = orbit * (1.4 / uRadius) + vec3(0.0, uTime * 0.05, uTime * 0.03);
  vec3 swirl = curlNoise(flowPoint) * uTurbulence * 0.05 * uRadius * (0.35 + 0.65 * aSeed);
  orbit += swirl * vec3(1.0, 0.45, 1.0);

  vec3 toWell = uWell - orbit;
  toWell.y = 0.0;
  float reach = 0.32 * uRadius;
  float pull = uWellStrength * exp(-dot(toWell, toWell) / (reach * reach));
  orbit.xz += toWell.xz * pull * 0.55;
  orbit.y -= pull * reach * 0.6 * (0.6 + aSeed);

  vec4 viewPosition = modelViewMatrix * vec4(orbit, 1.0);
  float depth = max(-viewPosition.z, 0.001);
  float spriteSize = uSize * (0.55 + aSeed * 0.9) * uPixelRatio * uViewportHeight * projectionMatrix[1][1] * 0.5 / depth;
  float clampedSize = clamp(spriteSize, 1.0, 42.0);
  gl_PointSize = clampedSize;
  gl_Position = projectionMatrix * viewPosition;

  float depthFade = smoothstep(uCameraDistance + uRadius * 1.15, uCameraDistance - uRadius * 1.15, depth);
  float innerGlow = 1.0 - smoothstep(0.48, 1.0, band);
  float twinkle = 0.78 + 0.22 * sin(uTime * (0.6 + aSeed * 2.4) + aSeed * 61.0);
  float subPixel = min(spriteSize / clampedSize, 1.0);
  vAlpha = (0.35 + 0.65 * depthFade) * (0.55 + 0.45 * innerGlow) * twinkle * subPixel * (1.0 + pull * 1.5);
  vTone = step(0.7, fract(aSeed * 7.13)) * (1.0 - innerGlow * 0.5);
}
`;

const fragmentShader = `
uniform float uOpacity;
uniform vec3 uPaper;
uniform vec3 uShade;

varying float vAlpha;
varying float vTone;

void main() {
  float distanceToCenter = length(gl_PointCoord - 0.5);
  float sprite = pow(smoothstep(0.5, 0.0, distanceToCenter), 1.6);
  if (sprite < 0.004) discard;
  gl_FragColor = vec4(mix(uPaper, uShade, vTone), sprite * vAlpha * uOpacity);
  #include <colorspace_fragment>
}
`;

const createUniforms = (): OrbitDustUniforms => ({
  uCameraDistance: { value: 6 },
  uOpacity: { value: 0.5 },
  uPaper: { value: new Color(orbitDustDefaults.paper) },
  uPixelRatio: { value: 1 },
  uRadius: { value: orbitDustDefaults.radius },
  uShade: { value: new Color(orbitDustDefaults.paper) },
  uSize: { value: 0.012 },
  uThickness: { value: orbitDustDefaults.thickness },
  uTime: { value: 0 },
  uTurbulence: { value: orbitDustDefaults.turbulence },
  uViewportHeight: { value: 600 },
  uWell: { value: new Vector3() },
  uWellStrength: { value: 0 },
});

const luminance = ({ r, g, b }: Color) => 0.2126 * r + 0.7152 * g + 0.0722 * b;

export class OrbitDustMaterial extends ShaderMaterial {
  declare uniforms: OrbitDustUniforms;

  constructor() {
    super({
      blending: AdditiveBlending,
      depthWrite: false,
      fragmentShader,
      toneMapped: false,
      transparent: true,
      uniforms: createUniforms(),
      vertexShader,
    });
  }

  setTones(ink: string, paper: string) {
    const ground = new Color(ink);
    const dust = new Color(paper);
    const isLitDust = luminance(dust) >= luminance(ground);
    this.uniforms.uPaper.value.copy(dust);
    this.uniforms.uShade.value.copy(ground).lerp(dust, 0.45);
    this.blending = isLitDust ? AdditiveBlending : NormalBlending;
    return isLitDust;
  }
}

const lcgModulus = 4_294_967_296;

const createRandom = (seed: number) => {
  let state = Math.abs(Math.floor(seed)) % lcgModulus;
  return () => {
    state = (1_664_525 * state + 1_013_904_223) % lcgModulus;
    return state / lcgModulus;
  };
};

const bandDensity = (band: number) => {
  let density =
    0.35 +
    0.65 * Math.sin(Math.PI * ((band - innerEdge) / (1 - innerEdge)) ** 0.7);
  for (const gap of ringGaps) {
    const offset = (band - gap.at) / gap.width;
    density *= 1 - 0.92 * Math.exp(-offset * offset);
  }
  return density;
};

const gaussian = (random: () => number) =>
  Math.sqrt(-2 * Math.log(Math.max(random(), 1e-6))) *
  Math.cos(2 * Math.PI * random());

export interface DustParticle {
  band: number;
  angle: number;
  height: number;
  seed: number;
}

export const sampleDust = (count: number, seed = 7) => {
  const random = createRandom(seed);
  const particles: DustParticle[] = [];
  while (particles.length < count) {
    const band = innerEdge + (1 - innerEdge) * random();
    if (random() > bandDensity(band)) {
      continue;
    }
    const flare = 0.35 + 0.65 * ((band - innerEdge) / (1 - innerEdge));
    particles.push({
      angle: random() * Math.PI * 2,
      band,
      height: gaussian(random) * flare,
      seed: random(),
    });
  }
  return particles;
};

export const createDustGeometry = (count: number) => {
  const particles = sampleDust(count);
  const orbits = new Float32Array(count * 3);
  const seeds = new Float32Array(count);
  for (const [index, particle] of particles.entries()) {
    orbits[index * 3] = particle.band;
    orbits[index * 3 + 1] = particle.angle;
    orbits[index * 3 + 2] = particle.height;
    seeds[index] = particle.seed;
  }
  const geometry = new BufferGeometry();
  geometry.setAttribute("position", new BufferAttribute(orbits, 3));
  geometry.setAttribute("aSeed", new BufferAttribute(seeds, 1));
  return geometry;
};

const clampCount = (count: number) =>
  Math.round(
    Math.min(
      Math.max(count, orbitDustLimits.minCount),
      orbitDustLimits.maxCount
    )
  );

export const resolveDustCount = () => {
  if (typeof window === "undefined") {
    return 80_000;
  }
  const cores = navigator.hardwareConcurrency || 4;
  const pixelRatio = window.devicePixelRatio || 1;
  const isCoarse = window.matchMedia("(pointer: coarse)").matches;
  let count = 70_000;
  if (cores >= 12) {
    count = 200_000;
  } else if (cores >= 8) {
    count = 150_000;
  } else if (cores >= 6) {
    count = 110_000;
  }
  if (pixelRatio > 2.5) {
    count *= 0.5;
  } else if (pixelRatio > 2) {
    count *= 0.7;
  }
  if (isCoarse) {
    count *= 0.6;
  }
  return clampCount(count);
};

export const normalizeDustCount = (count: number | undefined) =>
  count === undefined ? resolveDustCount() : clampCount(count);

export const dustOpacityFor = (count: number, isLitDust: boolean) =>
  (isLitDust ? 0.55 : 0.45) * Math.sqrt(120_000 / count);
