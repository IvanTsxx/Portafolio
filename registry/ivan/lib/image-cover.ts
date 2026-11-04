import { Vector2, Vector4 } from "three";
import type { IUniform, Texture, WebGLRenderer } from "three";

export interface CoverSource {
  texture: Texture;
  width: number;
  height: number;
}

export interface ImageFocus {
  x: number;
  y: number;
}

export const centeredFocus: ImageFocus = { x: 0.5, y: 0.5 };

export const fullscreenVertexShader = `
  void main() {
    gl_Position = vec4(position.xy * 2.0, 0.0, 1.0);
  }
`;

export const imageCoverChunk = `
  uniform vec2 uOrigin;
  uniform vec2 uResolution;
  uniform sampler2D uImage;
  uniform vec2 uImageSize;
  uniform vec2 uFocus;
  uniform float uHasImage;

  const vec3 lumaWeights = vec3(0.2126, 0.7152, 0.0722);

  vec2 imageSpan() {
    float stageAspect = uResolution.x / uResolution.y;
    float imageAspect = uImageSize.x / uImageSize.y;
    return stageAspect > imageAspect
      ? vec2(1.0, imageAspect / stageAspect)
      : vec2(stageAspect / imageAspect, 1.0);
  }

  vec2 coverUv(vec2 stage) {
    vec2 span = imageSpan();
    vec2 start = clamp(uFocus - span * 0.5, vec2(0.0), vec2(1.0) - span);
    return start + stage * span;
  }

  float imageLuma(vec2 uv, float lod) {
    return dot(textureLod(uImage, uv, lod).rgb, lumaWeights);
  }

  float imageLod(float footprint) {
    float texels = footprint * imageSpan().y * uImageSize.y / uResolution.y;
    return log2(max(texels, 1.0));
  }
`;

export interface ImageCoverUniforms {
  [uniform: string]: IUniform;
  uFocus: IUniform<Vector2>;
  uHasImage: IUniform<number>;
  uImage: IUniform<Texture | null>;
  uImageSize: IUniform<Vector2>;
  uOrigin: IUniform<Vector2>;
  uResolution: IUniform<Vector2>;
}

export const createImageCoverUniforms = (): ImageCoverUniforms => ({
  uFocus: { value: new Vector2(0.5, 0.5) },
  uHasImage: { value: 0 },
  uImage: { value: null },
  uImageSize: { value: new Vector2(1, 1) },
  uOrigin: { value: new Vector2(0, 0) },
  uResolution: { value: new Vector2(1, 1) },
});

export const setCoverImage = (
  uniforms: ImageCoverUniforms,
  image: CoverSource | null,
  focus: ImageFocus
) => {
  uniforms.uImage.value = image?.texture ?? null;
  uniforms.uHasImage.value = image ? 1 : 0;
  uniforms.uImageSize.value.set(image?.width ?? 1, image?.height ?? 1);
  uniforms.uFocus.value.set(focus.x, 1 - focus.y);
};

const viewport = new Vector4();

export const readViewport = (
  uniforms: ImageCoverUniforms,
  renderer: WebGLRenderer
) => {
  renderer.getCurrentViewport(viewport);
  uniforms.uOrigin.value.set(viewport.x, viewport.y);
  uniforms.uResolution.value.set(viewport.z, viewport.w);
  return viewport;
};
