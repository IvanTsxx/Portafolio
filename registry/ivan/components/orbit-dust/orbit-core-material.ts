import { Color, ShaderMaterial } from "three";
import type { IUniform } from "three";

import { orbitDustDefaults } from "./orbit-dust-material";

const coreVertexShader = `
varying vec3 vNormal;
varying vec3 vView;

void main() {
  vec4 viewPosition = modelViewMatrix * vec4(position, 1.0);
  vNormal = normalize(normalMatrix * normal);
  vView = normalize(-viewPosition.xyz);
  gl_Position = projectionMatrix * viewPosition;
}
`;

const coreFragmentShader = `
uniform vec3 uInk;
uniform vec3 uPaper;

varying vec3 vNormal;
varying vec3 vView;

void main() {
  float limb = 1.0 - max(dot(normalize(vNormal), normalize(vView)), 0.0);
  float rim = pow(limb, 5.0) * 0.55;
  gl_FragColor = vec4(mix(uInk, uPaper, rim), 1.0);
  #include <colorspace_fragment>
}
`;

export class OrbitCoreMaterial extends ShaderMaterial {
  declare uniforms: {
    [uniform: string]: IUniform;
    uInk: IUniform<Color>;
    uPaper: IUniform<Color>;
  };

  constructor() {
    super({
      fragmentShader: coreFragmentShader,
      toneMapped: false,
      uniforms: {
        uInk: { value: new Color(orbitDustDefaults.ink) },
        uPaper: { value: new Color(orbitDustDefaults.paper) },
      },
      vertexShader: coreVertexShader,
    });
  }

  setTones(ink: string, paper: string) {
    this.uniforms.uInk.value.set(ink);
    this.uniforms.uPaper.value.set(paper);
  }
}
