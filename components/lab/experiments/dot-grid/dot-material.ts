import { shaderMaterial } from "@react-three/drei";
import { Color, Vector2 } from "three";

const vertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position.xy * 2.0, 0.0, 1.0);
  }
`;

const fragmentShader = `
  uniform float uTime;
  uniform float uCell;
  uniform float uLensRadius;
  uniform float uLensStrength;
  uniform float uSquare;
  uniform float uPixelRatio;
  uniform vec2 uResolution;
  uniform vec2 uOrigin;
  uniform vec2 uLens;
  uniform vec3 uInk;
  uniform vec3 uPaper;
  varying vec2 vUv;

  float hash(vec2 point) {
    return fract(sin(dot(point, vec2(127.1, 311.7))) * 43758.5453);
  }

  float valueNoise(vec2 point) {
    vec2 base = floor(point);
    vec2 offset = fract(point);
    vec2 blend = offset * offset * (3.0 - 2.0 * offset);
    float a = hash(base);
    float b = hash(base + vec2(1.0, 0.0));
    float c = hash(base + vec2(0.0, 1.0));
    float d = hash(base + vec2(1.0, 1.0));
    return mix(mix(a, b, blend.x), mix(c, d, blend.x), blend.y);
  }

  float toneAt(vec2 center) {
    vec2 field = center / uResolution.y;
    float drift = uTime * 0.06;
    float tone = valueNoise(field * 2.2 + vec2(drift, -drift * 0.7)) * 0.65;
    tone += valueNoise(field * 4.6 - vec2(drift * 0.8, drift)) * 0.35;
    return smoothstep(0.22, 0.78, tone);
  }

  float coverage(vec2 pixel, vec2 cell) {
    vec2 center = (cell + 0.5) * uCell;
    vec2 away = center - uLens;
    float distanceToLens = length(away);
    float lensDistance = distanceToLens / uLensRadius;
    float falloff = exp(-lensDistance * lensDistance) * uLensStrength;
    vec2 direction = distanceToLens > 0.001 ? away / distanceToLens : vec2(0.0);
    vec2 dotCenter = center + direction * falloff * uCell * 0.6;

    float tone = toneAt(center);
    float radius = uCell * 0.5 * clamp(0.12 + tone * 0.78 + falloff * 0.55, 0.0, 1.35);

    vec2 offset = pixel - dotCenter;
    float reach = mix(length(offset), max(abs(offset.x), abs(offset.y)), uSquare);
    float edge = uPixelRatio * 0.75;
    return 1.0 - smoothstep(radius - edge, radius + edge, reach);
  }

  void main() {
    vec2 pixel = gl_FragCoord.xy - uOrigin;
    vec2 cell = floor(pixel / uCell);
    float ink = 0.0;
    for (int column = -1; column <= 1; column++) {
      for (int row = -1; row <= 1; row++) {
        ink = max(ink, coverage(pixel, cell + vec2(float(column), float(row))));
      }
    }
    gl_FragColor = vec4(mix(uPaper, uInk, ink), 1.0);
    #include <colorspace_fragment>
  }
`;

export const DotMaterial = shaderMaterial(
  {
    uCell: 12,
    uInk: new Color("#141414"),
    uLens: new Vector2(0, 0),
    uLensRadius: 120,
    uLensStrength: 0,
    uOrigin: new Vector2(0, 0),
    uPaper: new Color("#ededeb"),
    uPixelRatio: 1,
    uResolution: new Vector2(1, 1),
    uSquare: 0,
    uTime: 0,
  },
  vertexShader,
  fragmentShader
);
