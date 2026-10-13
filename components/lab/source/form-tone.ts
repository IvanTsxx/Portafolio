const formCenter = { x: 0, y: 0.04 } as const;
const formRadius = 0.34;
const groundLine = -0.37;

export const posterLight = { x: -0.38, y: 0.3 } as const;

const clamp01 = (value: number) => Math.min(Math.max(value, 0), 1);

const smoothstep = (edgeLow: number, edgeHigh: number, value: number) => {
  const amount = clamp01((value - edgeLow) / (edgeHigh - edgeLow));
  return amount * amount * (3 - 2 * amount);
};

const sphereInk = (offsetX: number, offsetY: number, depth: number) => {
  const towardX = posterLight.x - formCenter.x - offsetX;
  const towardY = posterLight.y - formCenter.y - offsetY;
  const towardZ = 0.75 - depth;
  const towardLength = Math.hypot(towardX, towardY, towardZ);
  const facing =
    (offsetX * towardX + offsetY * towardY + depth * towardZ) /
    (formRadius * towardLength);
  const diffuse = Math.max(facing, 0);
  const reflectedZ = (2 * facing * depth) / formRadius - towardZ / towardLength;
  const specular = Math.max(reflectedZ, 0) ** 28;
  return clamp01(0.94 - 0.74 * diffuse - 0.55 * specular);
};

const groundInk = (x: number, y: number) => {
  const shadowX = formCenter.x - (posterLight.x - formCenter.x) * 0.45;
  const shadowWidth = formRadius + Math.abs(posterLight.x) * 0.12;
  const shadowReach = Math.hypot(
    (x - shadowX) / shadowWidth,
    (y - groundLine) / 0.07
  );
  const shadow =
    (1 - smoothstep(0.55, 1.15, shadowReach)) *
    smoothstep(-0.4, 0.1, posterLight.y);
  const falloff = smoothstep(
    0.15,
    1.3,
    Math.hypot(posterLight.x - x, posterLight.y - y)
  );
  return clamp01(0.02 + 0.2 * falloff + 0.55 * shadow);
};

export const formInkAt = (x: number, y: number) => {
  const offsetX = x - formCenter.x;
  const offsetY = y - formCenter.y;
  const reach = offsetX * offsetX + offsetY * offsetY;
  if (reach < formRadius * formRadius) {
    return sphereInk(
      offsetX,
      offsetY,
      Math.sqrt(formRadius * formRadius - reach)
    );
  }
  return groundInk(x, y);
};
