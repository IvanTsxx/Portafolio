import { Color, ShaderMaterial, Vector3, Vector4 } from "three";
import type { IUniform } from "three";

export const lunarDitherDefaults = {
  craterScale: 3,
  followPointer: true,
  grain: 0.35,
  impacts: true,
  ink: "#0B0B0C",
  maxImpacts: 32,
  paper: "#EDECE8",
  paused: false,
  pixelSize: 2,
  rotationSpeed: 0.06,
} as const;

export interface LunarDitherUniforms {
  [uniform: string]: IUniform;
  uInk: IUniform<Color>;
  uPaper: IUniform<Color>;
  uLightDir: IUniform<Vector3>;
  uPixelSize: IUniform<number>;
  uTime: IUniform<number>;
  uGrain: IUniform<number>;
  uCraterScale: IUniform<number>;
  uDpr: IUniform<number>;
  uImpacts: IUniform<Vector4[]>;
  uImpactCount: IUniform<number>;
}

export const impactTiming = {
  flight: 0.18,
  settled: 1,
  shockwave: 0.6,
} as const;

const impactCapacityLimit = 64;

export const clampImpactCapacity = (capacity: number) =>
  Math.min(Math.max(Math.round(capacity), 1), impactCapacityLimit);

export const bayerGlsl = `
float bayer2(vec2 a) {
  a = floor(a);
  return fract(dot(a, vec2(0.5, a.y * 0.75)));
}

float bayer4(vec2 a) {
  return bayer2(0.5 * a) * 0.25 + bayer2(a);
}

float bayer8(vec2 a) {
  return bayer4(0.5 * a) * 0.25 + bayer2(a);
}
`;

const vertexShader = `
varying vec3 vObjectPosition;
varying vec3 vWorldPosition;
varying vec3 vWorldNormal;

void main() {
  vObjectPosition = position;
  vec4 world = modelMatrix * vec4(position, 1.0);
  vWorldPosition = world.xyz;
  vWorldNormal = normalize(mat3(modelMatrix) * normal);
  gl_Position = projectionMatrix * viewMatrix * world;
}
`;

const fragmentShader = `
uniform vec3 uInk;
uniform vec3 uPaper;
uniform vec3 uLightDir;
uniform float uPixelSize;
uniform float uTime;
uniform float uGrain;
uniform float uCraterScale;
uniform float uDpr;
uniform vec4 uImpacts[MAX_IMPACTS];
uniform float uImpactCount;

varying vec3 vObjectPosition;
varying vec3 vWorldPosition;
varying vec3 vWorldNormal;

float hash13(vec3 p) {
  p = fract(p * 0.1031);
  p += dot(p, p.zyx + 31.32);
  return fract((p.x + p.y) * p.z);
}

vec3 hash33(vec3 p) {
  p = fract(p * vec3(0.1031, 0.1030, 0.0973));
  p += dot(p, p.yxz + 33.33);
  return fract((p.xxy + p.yxx) * p.zyx);
}

float hash12(vec2 p) {
  vec3 q = fract(vec3(p.xyx) * 0.1031);
  q += dot(q, q.yzx + 33.33);
  return fract((q.x + q.y) * q.z);
}

float valueNoise(vec3 p) {
  vec3 i = floor(p);
  vec3 f = fract(p);
  vec3 u = f * f * (3.0 - 2.0 * f);
  float a = mix(hash13(i), hash13(i + vec3(1.0, 0.0, 0.0)), u.x);
  float b = mix(hash13(i + vec3(0.0, 1.0, 0.0)), hash13(i + vec3(1.0, 1.0, 0.0)), u.x);
  float c = mix(hash13(i + vec3(0.0, 0.0, 1.0)), hash13(i + vec3(1.0, 0.0, 1.0)), u.x);
  float d = mix(hash13(i + vec3(0.0, 1.0, 1.0)), hash13(i + vec3(1.0, 1.0, 1.0)), u.x);
  return mix(mix(a, b, u.y), mix(c, d, u.y), u.z);
}

float fbm(vec3 p) {
  float sum = 0.0;
  float amplitude = 0.5;
  for (int octave = 0; octave < 4; octave++) {
    sum += amplitude * valueNoise(p);
    p = p * 2.03 + 17.1;
    amplitude *= 0.5;
  }
  return sum;
}

float craterProfile(float x) {
  float bowl = max(min(x * x - 1.0, 0.0), -0.72);
  float rim = 0.3 * exp(-11.0 * (x - 1.0) * (x - 1.0));
  return bowl + rim;
}

float craterField(vec3 p) {
  vec3 cell = floor(p);
  vec3 local = fract(p);
  float height = 0.0;
  for (int z = -1; z <= 1; z++) {
    for (int y = -1; y <= 1; y++) {
      for (int x = -1; x <= 1; x++) {
        vec3 offset = vec3(float(x), float(y), float(z));
        vec3 id = cell + offset;
        vec3 seed = hash33(id);
        float radius = mix(0.16, 0.46, seed.x * seed.x);
        float present = step(0.32, seed.y);
        vec3 center = offset + 0.15 + 0.7 * hash33(id + 7.31);
        float reach = length(local - center) / radius;
        height += present * craterProfile(reach) * radius;
      }
    }
  }
  return height;
}

float surfaceHeight(vec3 p, float maria) {
  float scale = uCraterScale;
  float large = craterField(p * scale) / scale;
  float medium = craterField(p * scale * 2.7 + 3.1) / (scale * 2.7);
  float small = craterField(p * scale * 7.3 + 9.7) / (scale * 7.3);
  float regolith = fbm(p * 26.0) * 0.012;
  return 0.9 * (large * (1.0 - 0.65 * maria) + 0.8 * medium + 0.7 * small) + regolith;
}

struct ImpactMarks {
  float height;
  float ejecta;
  float shade;
  float glow;
};

ImpactMarks impactMarks(vec3 p, float baseHeight) {
  ImpactMarks marks = ImpactMarks(baseHeight, 0.0, 0.0, 0.0);
  for (int index = 0; index < MAX_IMPACTS; index++) {
    if (float(index) >= uImpactCount) {
      break;
    }
    vec4 impact = uImpacts[index];
    float age = uTime - impact.w;
    if (age < 0.0) {
      continue;
    }
    vec3 center = impact.xyz;
    float seed = hash13(center * 91.7);
    float radius = mix(0.07, 0.14, seed);
    vec3 offset = p - center;
    float reach = length(offset) / radius;
    if (reach > 8.0) {
      continue;
    }
    float grow = smoothstep(0.0, 0.09, age);
    float floorMask = smoothstep(1.15, 0.55, reach) * grow;
    marks.height = marks.height * (1.0 - 0.7 * floorMask) + craterProfile(reach) * radius * 0.95 * grow;

    vec3 helper = mix(vec3(0.0, 1.0, 0.0), vec3(1.0, 0.0, 0.0), step(0.9, abs(center.y)));
    vec3 tangent = normalize(cross(center, helper));
    vec3 bitangent = cross(center, tangent);
    float angle = atan(dot(offset, bitangent), dot(offset, tangent));
    vec3 around = vec3(cos(angle), sin(angle), 0.0);
    float rays = smoothstep(0.52, 0.82, valueNoise(around * 4.5 + center * 37.0 + seed * 11.0));
    float rayReach = exp(-(reach - 1.0) * (0.45 + 0.35 * seed)) * smoothstep(0.95, 1.35, reach);
    float blanket = exp(-pow((reach - 1.25) / 0.32, 2.0));
    float freshness = mix(0.35, 1.0, exp(-age / 9.0));
    marks.ejecta += (rays * rayReach + 0.55 * blanket) * freshness * grow;
    marks.shade += rayReach * (1.0 - rays) * freshness * grow;

    float flash = exp(-age * 16.0) * smoothstep(2.4, 0.0, reach);
    float wave = clamp(age / SHOCKWAVE_SECONDS, 0.0, 1.0);
    float front = 1.0 + 6.0 * (1.0 - pow(1.0 - wave, 3.0));
    float ring = exp(-pow((reach - front) / 0.45, 2.0)) * pow(1.0 - wave, 1.5);
    marks.glow += 1.4 * flash + 0.6 * ring;
  }
  return marks;
}

vec3 perturbNormal(vec3 position, vec3 normal, float height) {
  vec3 sigmaX = dFdx(position);
  vec3 sigmaY = dFdy(position);
  vec3 r1 = cross(sigmaY, normal);
  vec3 r2 = cross(normal, sigmaX);
  float determinant = dot(sigmaX, r1);
  vec2 slope = vec2(dFdx(height), dFdy(height));
  vec3 gradient = sign(determinant) * (slope.x * r1 + slope.y * r2);
  return normalize(abs(determinant) * normal - gradient);
}

${bayerGlsl}
void main() {
  vec3 p = normalize(vObjectPosition);
  float maria = smoothstep(0.47, 0.6, fbm(p * 1.7 + 4.0));
  float albedo = mix(1.0, 0.56, maria) * mix(0.9, 1.08, fbm(p * 9.0 + 1.3));

  vec3 geometryNormal = normalize(vWorldNormal);
  ImpactMarks marks = impactMarks(p, surfaceHeight(p, maria));
  albedo = albedo * (1.0 - 0.35 * min(marks.shade, 1.0)) + 0.5 * marks.ejecta;
  vec3 normal = perturbNormal(vWorldPosition, geometryNormal, marks.height);

  vec3 light = normalize(uLightDir);
  vec3 view = normalize(cameraPosition - vWorldPosition);
  float facing = dot(geometryNormal, light);
  float incidence = max(dot(normal, light), 0.0);
  float emergence = max(dot(normal, view), 0.0);
  float lommel = 2.0 * incidence / (incidence + emergence + 0.001);
  float terminator = smoothstep(-0.05, 0.32, facing);
  float lit = mix(incidence, lommel * 0.5, 0.25) * terminator;

  float limb = 1.0 - max(dot(geometryNormal, view), 0.0);
  float rim = pow(limb, 4.0) * smoothstep(0.0, 0.6, facing) * 0.3;
  float earthshine = 0.03 * (1.0 - terminator);

  float tone = albedo * (lit + earthshine) + rim;
  tone = smoothstep(0.02, 0.92, tone) + marks.glow;

  float cellSize = max(uPixelSize * uDpr, 1.0);
  float threshold = bayer8(gl_FragCoord.xy / cellSize) + 1.0 / 128.0;
  float grain = (hash12(floor(gl_FragCoord.xy) + floor(uTime * 24.0) * vec2(13.7, 7.3)) - 0.5) * uGrain * 0.36;
  float paper = step(threshold, tone + grain * step(0.002, tone));

  gl_FragColor = vec4(mix(uInk, uPaper, paper), 1.0);
  #include <colorspace_fragment>
}
`;

const createUniforms = (): LunarDitherUniforms => ({
  uCraterScale: { value: lunarDitherDefaults.craterScale },
  uDpr: { value: 1 },
  uGrain: { value: lunarDitherDefaults.grain },
  uImpactCount: { value: 0 },
  uImpacts: {
    value: Array.from(
      { length: lunarDitherDefaults.maxImpacts },
      () => new Vector4()
    ),
  },
  uInk: { value: new Color(lunarDitherDefaults.ink) },
  uLightDir: { value: new Vector3(-0.5, 0.2, 0.8).normalize() },
  uPaper: { value: new Color(lunarDitherDefaults.paper) },
  uPixelSize: { value: lunarDitherDefaults.pixelSize },
  uTime: { value: 0 },
});

export class LunarDitherMaterial extends ShaderMaterial {
  declare uniforms: LunarDitherUniforms;
  private nextImpact = 0;

  constructor() {
    super({
      defines: {
        MAX_IMPACTS: lunarDitherDefaults.maxImpacts,
        SHOCKWAVE_SECONDS: impactTiming.shockwave.toFixed(2),
      },
      fragmentShader,
      toneMapped: false,
      uniforms: createUniforms(),
      vertexShader,
    });
  }

  setImpactCapacity(capacity: number) {
    const { uImpacts } = this.uniforms;
    if (uImpacts.value.length === capacity) {
      return;
    }
    uImpacts.value = Array.from({ length: capacity }, () => new Vector4());
    this.defines.MAX_IMPACTS = capacity;
    this.needsUpdate = true;
    this.clearImpacts();
  }

  addImpact(direction: Vector3, birth: number) {
    const { uImpactCount, uImpacts } = this.uniforms;
    const capacity = uImpacts.value.length;
    uImpacts.value[this.nextImpact]?.set(
      direction.x,
      direction.y,
      direction.z,
      birth
    );
    this.nextImpact = (this.nextImpact + 1) % capacity;
    uImpactCount.value = Math.min(uImpactCount.value + 1, capacity);
  }

  clearImpacts() {
    this.nextImpact = 0;
    this.uniforms.uImpactCount.value = 0;
  }
}
