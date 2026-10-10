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
  uniform float uMatrix;
  uniform float uContrast;
  uniform float uAccent;
  uniform vec2 uResolution;
  uniform vec2 uOrigin;
  uniform vec2 uPointer;
  uniform float uPressure;
  uniform vec3 uInk;
  uniform vec3 uPaper;
  uniform vec3 uClay;
  varying vec2 vUv;

  float bayer2(vec2 cell) {
    cell = floor(cell);
    return fract(cell.x / 2.0 + cell.y * cell.y * 0.75);
  }

  float bayer4(vec2 cell) {
    return bayer2(0.5 * cell) * 0.25 + bayer2(cell);
  }

  float bayer8(vec2 cell) {
    return bayer4(0.5 * cell) * 0.25 + bayer2(cell);
  }

  float threshold(vec2 cell) {
    if (uMatrix < 3.0) {
      return bayer2(cell);
    }
    if (uMatrix < 6.0) {
      return bayer4(cell);
    }
    return bayer8(cell);
  }

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

  float fbm(vec2 point) {
    float total = 0.0;
    float amplitude = 0.5;
    for (int octave = 0; octave < 4; octave++) {
      total += amplitude * valueNoise(point);
      point = point * 2.03 + vec2(17.0, 9.0);
      amplitude *= 0.5;
    }
    return total;
  }

  void main() {
    vec2 cellSize = vec2(uCell);
    vec2 cell = floor((gl_FragCoord.xy - uOrigin) / cellSize);
    vec2 cellCenter = (cell + 0.5) * cellSize / uResolution;
    float aspect = uResolution.x / uResolution.y;
    vec2 field = vec2(cellCenter.x * aspect, cellCenter.y);

    float drift = uTime * 0.04;
    float tone = fbm(field * 2.4 + vec2(drift, -drift * 0.6));
    tone = mix(tone, fbm(field * 5.0 - drift), 0.35);

    vec2 toPointer = (cellCenter - uPointer) * vec2(aspect, 1.0);
    float distanceToPointer = length(toPointer);
    float wave = exp(-distanceToPointer * distanceToPointer * 9.0) * uPressure;
    float ripple = sin(distanceToPointer * 38.0 - uTime * 2.2) * 0.5 + 0.5;
    float influence = wave * (0.55 + 0.45 * ripple);

    float lit = clamp((tone - 0.5) * uContrast + 0.2 + influence * 0.8, 0.0, 1.0);
    float limit = threshold(cell);
    float on = step(limit, lit);

    vec3 color = mix(uPaper, uInk, on);
    float hot = step(limit, (influence - 0.45) * 2.2) * on * uAccent;
    color = mix(color, uClay, hot);

    gl_FragColor = vec4(color, 1.0);
    #include <colorspace_fragment>
  }
`;

export const DitherMaterial = shaderMaterial(
  {
    uAccent: 1,
    uCell: 4,
    uClay: new Color("#e9814f"),
    uContrast: 1.6,
    uInk: new Color("#141414"),
    uMatrix: 8,
    uOrigin: new Vector2(0, 0),
    uPaper: new Color("#ededeb"),
    uPointer: new Vector2(0.5, 0.5),
    uPressure: 0,
    uResolution: new Vector2(1, 1),
    uTime: 0,
  },
  vertexShader,
  fragmentShader
);
