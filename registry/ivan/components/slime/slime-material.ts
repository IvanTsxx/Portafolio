import { Color, Vector3, Vector4 } from "three";
import {
  Break,
  Fn,
  If,
  Loop,
  abs,
  clamp,
  cos,
  dot,
  exp,
  float,
  length,
  max,
  min,
  mix,
  mx_noise_float,
  normalize,
  positionGeometry,
  pow,
  reflect,
  refract,
  sin,
  smoothstep,
  sqrt,
  uniform,
  uniformArray,
  uv,
  vec3,
  vec4,
} from "three/tsl";
import { MeshBasicNodeMaterial } from "three/webgpu";
import type { Node } from "three/webgpu";

import { ballCount } from "./slime-body";

export const slimeDefaults = {
  glow: "#7ddc3c",
  ink: "#0b0b0c",
  night: true,
  paper: "#edece8",
  paused: false,
  reach: 1,
  veins: 1,
  viscosity: 1,
} as const;

export const cameraDistance = 3.2;
const blend = 0.3;
const cullMargin = blend * 0.6 + 0.03;
const marchSteps = 72;
const veinSamples = 4;

export const createSlimeUniforms = () => {
  const ballValues = Array.from(
    { length: ballCount },
    () => new Vector4(0, 0, 0, -0.4)
  );
  return {
    aspect: uniform(1),
    ballValues,
    balls: uniformArray<"vec4">(ballValues, "vec4"),
    excite: uniform(0),
    focal: uniform(1.9),
    glow: uniform(new Color(slimeDefaults.glow)),
    ground: uniform(new Color(slimeDefaults.ink)),
    ink: uniform(new Color(slimeDefaults.ink)),
    night: uniform(1),
    paper: uniform(new Color(slimeDefaults.paper)),
    pixel: uniform(0.003),
    time: uniform(0),
    touch: uniform(new Vector3()),
    veins: uniform(1),
  };
};

export type SlimeUniforms = ReturnType<typeof createSlimeUniforms>;

export const createSlimeMaterial = (uniforms: SlimeUniforms) => {
  const field = Fn(([point]: [Node<"vec3">]) => {
    const merged = float(10).toVar();
    Loop(ballCount, ({ i }) => {
      const entry = uniforms.balls.element(i);
      const gap = length(point.sub(entry.xyz)).sub(entry.w);
      const overlap = max(float(blend).sub(abs(merged.sub(gap))), 0).div(blend);
      merged.assign(
        min(merged, gap).sub(overlap.mul(overlap).mul(blend * 0.25))
      );
    });
    const ripple = sin(point.x.mul(9).add(uniforms.time.mul(1.3)))
      .mul(sin(point.y.mul(8).sub(uniforms.time.mul(1.1))))
      .mul(sin(point.z.mul(7).add(uniforms.time.mul(0.9))))
      .mul(0.012);
    return merged.add(ripple);
  }).setLayout({
    inputs: [{ name: "point", type: "vec3" }],
    name: "slimeField",
    type: "float",
  });

  const normalAt = Fn(([point]: [Node<"vec3">]) => {
    const offset = 0.002;
    const a = vec3(1, -1, -1);
    const b = vec3(-1, -1, 1);
    const c = vec3(-1, 1, -1);
    const d = vec3(1, 1, 1);
    return normalize(
      a
        .mul(field(point.add(a.mul(offset))))
        .add(b.mul(field(point.add(b.mul(offset)))))
        .add(c.mul(field(point.add(c.mul(offset)))))
        .add(d.mul(field(point.add(d.mul(offset)))))
    );
  }).setLayout({
    inputs: [{ name: "point", type: "vec3" }],
    name: "slimeNormal",
    type: "vec3",
  });

  const depthAt = Fn(([point, normal]: [Node<"vec3">, Node<"vec3">]) => {
    const near = clamp(field(point.sub(normal.mul(0.08))).div(-0.08), 0, 1);
    const middle = clamp(field(point.sub(normal.mul(0.22))).div(-0.22), 0, 1);
    const far = clamp(field(point.sub(normal.mul(0.45))).div(-0.45), 0, 1);
    return near.mul(0.25).add(middle.mul(0.35)).add(far.mul(0.4));
  }).setLayout({
    inputs: [
      { name: "point", type: "vec3" },
      { name: "normal", type: "vec3" },
    ],
    name: "slimeDepth",
    type: "float",
  });

  const veinsAt = Fn(([point, ray]: [Node<"vec3">, Node<"vec3">]) => {
    const amount = float(0).toVar();
    Loop(veinSamples, ({ i }) => {
      const travel = float(i).add(1).mul(0.075);
      const sample = point.add(ray.mul(travel));
      const drift = vec3(0, 0, uniforms.time.mul(0.12));
      const warp = mx_noise_float(sample.mul(0.9).sub(drift)).mul(0.9);
      const veinPoint = sample.mul(2.2).add(drift).add(warp);
      const noise = mx_noise_float(veinPoint);
      const step = 0.02;
      const slope = length(
        vec3(
          mx_noise_float(veinPoint.add(vec3(step, 0, 0))),
          mx_noise_float(veinPoint.add(vec3(0, step, 0))),
          mx_noise_float(veinPoint.add(vec3(0, 0, step)))
        )
          .sub(noise)
          .div(step)
      );
      const isoDistance = abs(noise).div(max(slope, 0.2));
      const reach = smoothstep(
        -0.25,
        0.3,
        mx_noise_float(
          sample.mul(0.8).add(vec3(7.3, 1.1, uniforms.time.mul(0.05)))
        )
      );
      const line = float(1).sub(smoothstep(0.006, 0.03, isoDistance));
      amount.addAssign(line.mul(reach).mul(exp(travel.mul(-3))));
    });
    return amount.mul(0.55);
  }).setLayout({
    inputs: [
      { name: "point", type: "vec3" },
      { name: "ray", type: "vec3" },
    ],
    name: "slimeVeins",
    type: "float",
  });

  const shade = Fn(() => {
    const ndc = uv().mul(2).sub(1);
    const origin = vec3(0, 0, cameraDistance);
    const ray = normalize(
      vec3(ndc.x.mul(uniforms.aspect), ndc.y, uniforms.focal.negate())
    );
    const ground = uniforms.ground.rgb;
    const result = vec3(ground).toVar();

    const enter = float(1000).toVar();
    const leave = float(0).toVar();
    Loop(ballCount, ({ i }) => {
      const entry = uniforms.balls.element(i);
      If(entry.w.greaterThan(0), () => {
        const offset = origin.sub(entry.xyz);
        const along = dot(offset, ray);
        const radius = entry.w.add(cullMargin);
        const spread = along
          .mul(along)
          .sub(dot(offset, offset))
          .add(radius.mul(radius));
        If(spread.greaterThan(0), () => {
          const root = sqrt(spread);
          enter.assign(min(enter, along.negate().sub(root)));
          leave.assign(max(leave, along.negate().add(root)));
        });
      });
    });

    If(leave.greaterThan(enter), () => {
      const travel = max(enter, 0).toVar();
      const exit = leave;
      const nearest = float(1000).toVar();
      const nearestTravel = float(0).toVar();
      const hit = float(0).toVar();

      Loop(marchSteps, () => {
        const distance = field(origin.add(ray.mul(travel)));
        If(distance.lessThan(nearest), () => {
          nearest.assign(distance);
          nearestTravel.assign(travel);
        });
        If(distance.lessThan(0.0012), () => {
          hit.assign(1);
          Break();
        });
        travel.addAssign(distance.mul(0.9));
        If(travel.greaterThan(exit), () => {
          Break();
        });
      });

      const edge = uniforms.pixel.mul(1.6);
      const coverage = max(hit, float(1).sub(smoothstep(0, edge, nearest)));

      If(coverage.greaterThan(0), () => {
        const point = origin.add(ray.mul(nearestTravel));
        const normal = normalAt(point);
        const view = ray.negate();
        const facing = clamp(dot(normal, view), 0, 1);
        const fresnel = pow(float(1).sub(facing), 3);
        const depth = depthAt(point, normal);
        const { night } = uniforms;

        const keyLight = normalize(vec3(-0.45, 0.75, 0.55));
        const diffuse = clamp(dot(normal, keyLight).mul(0.5).add(0.5), 0, 1);
        const backLight = normalize(vec3(0.3, 0.45, -1));
        const thin = pow(float(1).sub(depth), 2);
        const scatter = pow(
          clamp(dot(view, backLight.add(normal.mul(0.6)).negate()), 0, 1),
          4
        )
          .mul(thin)
          .add(pow(float(1).sub(depth), 3).mul(0.3));

        const reflected = reflect(ray, normal);
        const softbox = smoothstep(0.35, 0.9, reflected.y).mul(
          smoothstep(-0.2, 0.5, reflected.z)
        );
        const window = smoothstep(
          0.93,
          0.985,
          dot(reflected, normalize(vec3(-0.8, 0.35, 0.5)))
        );
        const envMask = clamp(softbox.mul(0.9).add(window), 0, 1);
        const highlight = pow(
          max(dot(normal, normalize(keyLight.add(view))), 0),
          160
        ).mul(1.4);

        const film = depth
          .mul(1.3)
          .add(fresnel.mul(0.9))
          .add(mx_noise_float(point.mul(1.7)).mul(0.35))
          .add(uniforms.time.mul(0.02));
        const spectrum = cos(vec3(0, 0.33, 0.67).add(film).mul(6.2832))
          .mul(0.5)
          .add(0.5);
        const grey = dot(spectrum, vec3(0.299, 0.587, 0.114));
        const sheen = mix(vec3(grey), spectrum, 0.6);

        const { glow, ink, paper } = uniforms;
        const touchGap = length(point.sub(vec3(uniforms.touch.xy, 0)));
        const touchGlow = exp(touchGap.mul(touchGap).mul(-5)).mul(
          uniforms.touch.z
        );
        const refracted = refract(ray, normal, 0.75);
        const veins = clamp(
          veinsAt(point, refracted)
            .mul(
              float(0.7).add(uniforms.excite.mul(1.3)).add(touchGlow.mul(0.7))
            )
            .mul(depth.mul(0.5).add(0.5))
            .mul(uniforms.veins),
          0,
          1
        );

        const nightBody = mix(ink.mul(1.1), glow.mul(0.32), 0.55)
          .add(glow.mul(scatter).mul(1.1))
          .add(glow.mul(veins).mul(1.6));
        const dayCore = mix(paper, glow, 0.9);
        const dayBody = mix(mix(paper, glow, 0.35), dayCore, pow(depth, 0.9))
          .mul(diffuse.mul(0.25).add(0.75))
          .add(paper.mul(scatter).mul(0.12));
        const body = mix(
          mix(dayBody, mix(glow, ink, 0.55), veins),
          nightBody,
          night
        );

        const envLow = mix(mix(ink, paper, 0.35), ink.mul(0.5), night);
        const env = mix(envLow, vec3(1), envMask);
        const reflectance = fresnel.mul(0.9).add(0.05);
        const lit = mix(body, env, reflectance).add(
          mix(vec3(1), sheen, 0.3).mul(highlight)
        );
        const dayFilm = mix(
          vec3(1),
          sheen.mul(1.5),
          fresnel.mul(0.7).mul(float(1).sub(night))
        );
        const surface = lit
          .mul(dayFilm)
          .add(sheen.mul(fresnel).mul(0.55).mul(night));

        result.assign(mix(ground, surface, coverage));
      });
    });

    return vec4(result, 1);
  });

  const material = new MeshBasicNodeMaterial();
  material.vertexNode = vec4(positionGeometry.xy, 0, 1);
  material.colorNode = shade();
  material.toneMapped = false;
  material.depthTest = false;
  material.depthWrite = false;
  return material;
};

export interface SlimeTones {
  glow: string;
  ink: string;
  night: boolean;
  paper: string;
}

export const applySlimeTones = (
  uniforms: SlimeUniforms,
  { glow, ink, night, paper }: SlimeTones
) => {
  uniforms.ink.value.set(ink);
  uniforms.paper.value.set(paper);
  uniforms.glow.value.set(glow);
  uniforms.ground.value.set(night ? ink : paper);
  uniforms.night.value = night ? 1 : 0;
};
