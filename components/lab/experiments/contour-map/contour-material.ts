import { shaderMaterial } from "@react-three/drei";
import { Vector3 } from "three";

import {
  createSourceUniforms,
  sourceToneChunk,
} from "@/components/lab/source/tone-chunk";

import { reliefBand } from "./contours";

const vertexShader = `
  void main() {
    gl_Position = vec4(position.xy * 2.0, 0.0, 1.0);
  }
`;

const fragmentShader = `
  uniform float uLevels;
  uniform float uPixelRatio;
  uniform float uPortraitLod;
  uniform float uHillRadius;
  uniform vec3 uHill;

  ${sourceToneChunk}

  float formGround(vec2 point) {
    vec2 shadowCenter = vec2(formCenter.x - (uLight.x - formCenter.x) * 0.45, groundLine);
    vec2 shadowScale = vec2(formRadius + abs(uLight.x) * 0.12, 0.07);
    float shadow = 1.0 - smoothstep(0.55, 1.15, length((point - shadowCenter) / shadowScale));
    shadow *= smoothstep(-0.4, 0.1, uLight.y);
    float falloff = smoothstep(0.15, 1.3, length(uLight - point));
    return 1.0 - clamp(0.02 + 0.2 * falloff + 0.55 * shadow, 0.0, 1.0);
  }

  float formRelief(vec2 point) {
    vec2 offset = point - formCenter;
    float distanceToCenter = length(offset);
    float ground = formGround(point);
    float onForm = smoothstep(formRadius, formRadius - ${reliefBand.toFixed(3)}, distanceToCenter);
    if (onForm <= 0.0) {
      return ground;
    }
    float depth = sqrt(max(formRadius * formRadius - distanceToCenter * distanceToCenter, 0.0));
    vec3 normal = vec3(offset, depth) / formRadius;
    vec3 toLight = normalize(vec3(uLight - point, 0.75 - depth));
    float diffuse = max(dot(normal, toLight), 0.0);
    float specular = pow(max(dot(reflect(-toLight, normal), vec3(0.0, 0.0, 1.0)), 0.0), 28.0);
    float sphere = 1.0 - clamp(0.94 - 0.74 * diffuse - 0.55 * specular, 0.0, 1.0);
    return mix(ground, sphere, onForm);
  }

  float groundHeight(vec2 point) {
    if (uSource > 0.5 && uHasPortrait > 0.5) {
      return portraitLuma(point / max(uAspect, 1.0) + 0.5, uPortraitLod);
    }
    return formRelief(point);
  }

  float terrain(vec2 point) {
    vec2 offset = point - uHill.xy;
    float hill = uHill.z * exp(-dot(offset, offset) / (uHillRadius * uHillRadius));
    return groundHeight(point) + hill;
  }

  float lineInk(float level, float widthInPixels) {
    float slope = max(fwidth(level), 1e-5);
    float distanceToLine = abs(fract(level - 0.5) - 0.5) / slope;
    float halfWidth = widthInPixels * 0.5;
    return 1.0 - smoothstep(halfWidth - 0.6, halfWidth + 0.6, distanceToLine);
  }

  void main() {
    vec2 pixel = gl_FragCoord.xy - uOrigin;
    vec2 point = (pixel - uResolution * 0.5) / uResolution.y;
    float level = terrain(point) * uLevels;
    float isIndex = 1.0 - step(0.5, mod(floor(level + 0.5), 5.0));
    float widthInPixels = mix(0.9, 2.1, isIndex) * uPixelRatio;
    float ink = lineInk(level, widthInPixels) * mix(0.78, 1.0, isIndex);
    gl_FragColor = vec4(mix(uPaper, uInk, ink), 1.0);
    #include <colorspace_fragment>
  }
`;

export const ContourMaterial = shaderMaterial(
  {
    ...createSourceUniforms(),
    uHill: new Vector3(0, 0, 0),
    uHillRadius: 0.12,
    uLevels: 20,
    uPixelRatio: 1,
    uPortraitLod: 2,
  },
  vertexShader,
  fragmentShader
);
