import { shaderMaterial } from "@react-three/drei";
import { Vector2, Vector3 } from "three";

import { posterLight } from "@/components/lab/source/form-tone";
import {
  createSourceUniforms,
  sourceToneChunk,
} from "@/components/lab/source/tone-chunk";

const vertexShader = `
  varying vec2 vUv;
  varying vec3 vWorldNormal;

  void main() {
    vUv = uv;
    vWorldNormal = normalize(mat3(modelMatrix) * normal);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const fragmentShader = `
  uniform vec2 uPanel;
  uniform vec3 uCreases;
  uniform float uPageAspect;
  uniform float uCell;
  uniform vec3 uLightDirection;

  varying vec2 vUv;
  varying vec3 vWorldNormal;

  ${sourceToneChunk}

  const vec2 figureCenter = vec2(0.0, 0.2);
  const vec2 figureHalf = vec2(0.27, 0.2);
  const float textTop = -0.07;
  const float textBottom = -0.42;
  const float lineSpacing = 0.03;
  const float lineWeight = 0.0085;

  float hash(float value) {
    return fract(sin(value * 91.3458) * 47453.5453);
  }

  float box(vec2 point, vec2 center, vec2 halfSize, float soft) {
    vec2 outside = abs(point - center) - halfSize;
    return 1.0 - smoothstep(-soft, soft, max(outside.x, outside.y));
  }

  float figureTone(vec2 point) {
    return formInk((point - figureCenter) / (figureHalf.y * 2.0));
  }

  float dotRadius(float coverage) {
    if (coverage <= 0.7854) {
      return sqrt(coverage / 3.14159265);
    }
    return 0.5 + 0.2071 * pow((coverage - 0.7854) / 0.2146, 2.5);
  }

  float screenInk(vec2 point, float soft) {
    const float angle = 0.7853982;
    mat2 toScreen = mat2(cos(angle), -sin(angle), sin(angle), cos(angle));
    mat2 toPage = mat2(cos(angle), sin(angle), -sin(angle), cos(angle));
    vec2 screen = toScreen * point / uCell;
    vec2 base = floor(screen - 0.5);
    float ink = 0.0;
    for (int column = 0; column <= 1; column++) {
      for (int row = 0; row <= 1; row++) {
        vec2 cellCenter = base + vec2(float(column), float(row)) + 0.5;
        vec2 samplePoint = toPage * cellCenter * uCell;
        float inside = box(samplePoint, figureCenter, figureHalf, 0.0001);
        float coverage = figureTone(samplePoint) * inside;
        float radius = dotRadius(coverage);
        ink = max(ink, 1.0 - smoothstep(radius - soft, radius + soft, length(screen - cellCenter)));
      }
    }
    return ink;
  }

  float textInk(vec2 point, float soft) {
    if (point.y > textTop + lineWeight || point.y < textBottom - lineWeight) {
      return 0.0;
    }
    float row = floor((textTop - point.y) / lineSpacing + 0.5);
    float lineY = textTop - row * lineSpacing;
    float paragraphBreak = step(0.5, mod(row + 1.0, 5.0));
    float lineLength = mix(0.36, 0.54, hash(row + 3.0)) * mix(0.45, 1.0, paragraphBreak);
    vec2 center = vec2(-figureHalf.x + lineLength * 0.5, lineY);
    return box(point, center, vec2(lineLength * 0.5, lineWeight * 0.5), soft);
  }

  float headerInk(vec2 point, float soft) {
    float rule = box(point, vec2(0.0, 0.445), vec2(figureHalf.x, 0.0012), soft);
    float tab = box(point, vec2(-figureHalf.x + 0.06, 0.465), vec2(0.06, 0.009), soft);
    float folio = box(point, vec2(figureHalf.x - 0.02, 0.465), vec2(0.02, 0.006), soft);
    float frame = box(point, figureCenter, figureHalf + 0.012, soft) - box(point, figureCenter, figureHalf + 0.009, soft);
    return max(max(rule, tab), max(folio, frame));
  }

  float creaseInk(float pageX, float soft) {
    vec3 distanceToCrease = abs(vec3(pageX) - uCreases) * uPageAspect;
    float nearest = min(distanceToCrease.x, min(distanceToCrease.y, distanceToCrease.z));
    return (1.0 - smoothstep(0.0012 - soft, 0.0012 + soft, nearest)) * 0.22;
  }

  float printInk(vec2 page) {
    vec2 point = vec2((page.x - 0.5) * uPageAspect, page.y - 0.5);
    float soft = max(length(fwidth(point)), 1e-4) * 0.7;
    float screenSoft = soft / uCell;
    float ink = max(screenInk(point, screenSoft), textInk(point, soft));
    ink = max(ink, headerInk(point, soft));
    return max(ink, creaseInk(page.x, soft));
  }

  void main() {
    vec2 page = vec2(uPanel.x + vUv.x * uPanel.y, vUv.y);
    float ink = printInk(page);
    vec3 normal = normalize(vWorldNormal) * (gl_FrontFacing ? 1.0 : -1.0);
    float facing = max(dot(normal, normalize(uLightDirection)), 0.0);
    float shade = 0.38 + 0.62 * facing;
    float printed = gl_FrontFacing ? ink : ink * 0.07;
    vec3 surface = mix(uPaper, uInk, printed);
    gl_FragColor = vec4(mix(surface, uInk, (1.0 - shade) * 0.62), 1.0);
    #include <colorspace_fragment>
  }
`;

export const FoldMaterial = shaderMaterial(
  {
    ...createSourceUniforms(),
    uCell: 1 / 70,
    uCreases: new Vector3(-1, -1, -1),
    uLight: new Vector2(posterLight.x, posterLight.y),
    uLightDirection: new Vector3(-0.42, 0.55, 0.72),
    uPageAspect: 1 / Math.SQRT2,
    uPanel: new Vector2(0, 1),
  },
  vertexShader,
  fragmentShader
);
