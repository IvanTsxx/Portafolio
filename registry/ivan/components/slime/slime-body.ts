export const coreCount = 6;
export const dropCount = 10;
export const strandCount = 5;
export const ballCount = coreCount + dropCount + strandCount + 1;

export interface Ball {
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  vz: number;
  radius: number;
  presence: number;
}

export interface PointerInput {
  x: number;
  y: number;
  pressed: boolean;
}

export interface SlimeTuning {
  viscosity: number;
  reach: number;
}

export interface StageBounds {
  halfWidth: number;
  halfHeight: number;
}

type DropPhase = "hidden" | "hang" | "fly" | "stick" | "crawl";
type Wall = "floor" | "ceiling" | "left" | "right";

interface Drop extends Ball {
  phase: DropPhase;
  size: number;
  clock: number;
  hold: number;
  wall: Wall | null;
  offset: number;
  hang: number;
  hangSpeed: number;
  hurried: boolean;
}

interface Grab {
  source: "pointer" | "hover";
  x: number;
  y: number;
}

interface Mass {
  x: number;
  y: number;
  vx: number;
  vy: number;
  sx: number;
  sy: number;
  svx: number;
  svy: number;
  targetX: number;
  targetY: number;
  wanderClock: number;
  wanderSpan: number;
  contact: Set<Wall>;
}

export interface SlimeBody {
  mass: Mass;
  core: Ball[];
  drops: Drop[];
  strand: Ball[];
  tip: Ball;
  anchor: number;
  grab: Grab | null;
  cooldown: number;
  dripClock: number;
  dripSpan: number;
  time: number;
  tension: number;
  flash: number;
  touch: { x: number; y: number; strength: number };
  wasPressed: boolean;
  seed: number;
  bounds: StageBounds;
}

const coreRest = [
  [0, 0.02, 0, 0.34],
  [0.27, 0.05, 0.04, 0.23],
  [-0.26, 0.07, -0.04, 0.24],
  [0.13, -0.19, 0.08, 0.22],
  [-0.15, -0.18, -0.06, 0.21],
  [0.02, 0.23, -0.08, 0.2],
] as const;

const massRadius = 0.48;
const massBottom = 0.36;
const hiddenRadius = -0.4;
const tipRadius = 0.13;
const gravity = 3.4;
const maxStep = 1 / 30;
const subSteps = 2;

const ball = (x: number, y: number, z: number, radius: number): Ball => ({
  presence: 0,
  radius,
  vx: 0,
  vy: 0,
  vz: 0,
  x,
  y,
  z,
});

const drop = (): Drop => ({
  ...ball(0, 0, 0, 0.08),
  clock: 0,
  hang: 0,
  hangSpeed: 0,
  hold: 0,
  hurried: false,
  offset: 0,
  phase: "hidden",
  size: 0.08,
  wall: null,
});

const clamp = (value: number, low: number, high: number) =>
  Math.min(Math.max(value, low), high);

const clamp01 = (value: number) => clamp(value, 0, 1);

const springTo = (
  target: Ball,
  x: number,
  y: number,
  z: number,
  stiffness: number,
  damping: number,
  step: number
) => {
  target.vx += ((x - target.x) * stiffness - target.vx * damping) * step;
  target.vy += ((y - target.y) * stiffness - target.vy * damping) * step;
  target.vz += ((z - target.z) * stiffness - target.vz * damping) * step;
  target.x += target.vx * step;
  target.y += target.vy * step;
  target.z += target.vz * step;
};

const random = (body: SlimeBody) => {
  body.seed = (body.seed * 16_807) % 2_147_483_647;
  return body.seed / 2_147_483_647;
};

const spread = (body: SlimeBody, low: number, high: number) =>
  low + random(body) * (high - low);

const dropsOut = (body: SlimeBody) =>
  body.drops.filter((entry) => entry.phase !== "hidden").length;

const massScale = (body: SlimeBody) => 1 - dropsOut(body) * 0.025;

const nearestCore = (body: SlimeBody, x: number, y: number) => {
  let best = 0;
  let bestGap = Number.POSITIVE_INFINITY;
  for (const [index, entry] of body.core.entries()) {
    const gap = Math.hypot(entry.x - x, entry.y - y) - entry.radius;
    if (gap < bestGap) {
      bestGap = gap;
      best = index;
    }
  }
  return { gap: bestGap, index: best };
};

export const snapLength = (reach: number, source: Grab["source"]) =>
  source === "pointer" ? 1 + reach * 0.9 : 0.75 + reach * 0.65;

export const createSlimeBody = (): SlimeBody => {
  const core = coreRest.map(([x, y, z, radius]) => {
    const entry = ball(x - 0.35, y + 0.15, z, radius);
    entry.presence = 1;
    return entry;
  });
  return {
    anchor: 0,
    bounds: { halfHeight: 1.3, halfWidth: 1.3 },
    cooldown: 0,
    core,
    dripClock: 0,
    dripSpan: 1.6,
    drops: Array.from({ length: dropCount }, drop),
    flash: 0,
    grab: null,
    mass: {
      contact: new Set(),
      svx: 0,
      svy: 0,
      sx: 1,
      sy: 1,
      targetX: 0.6,
      targetY: -0.2,
      vx: 0,
      vy: 0,
      wanderClock: 0,
      wanderSpan: 4,
      x: -0.35,
      y: 0.15,
    },
    seed: 48_271,
    strand: Array.from({ length: strandCount }, () =>
      ball(0, 0, 0, hiddenRadius)
    ),
    tension: 0,
    time: 0,
    tip: ball(0, 0, 0, hiddenRadius),
    touch: { strength: 0, x: 0, y: 0 },
    wasPressed: false,
  };
};

export const setSlimeBounds = (body: SlimeBody, bounds: StageBounds) => {
  body.bounds = bounds;
};

const launchDrop = (
  body: SlimeBody,
  entry: Drop,
  x: number,
  y: number,
  angle: number,
  speed: number
) => {
  entry.phase = "fly";
  entry.clock = 0;
  entry.hurried = false;
  entry.wall = null;
  entry.size = spread(body, 0.06, 0.12);
  entry.radius = entry.size;
  entry.x = x;
  entry.y = y;
  entry.z = spread(body, -0.05, 0.08);
  entry.vx = Math.cos(angle) * speed + body.mass.vx * 0.5;
  entry.vy = Math.sin(angle) * speed + body.mass.vy * 0.5;
  entry.vz = 0;
};

const fling = (
  body: SlimeBody,
  count: number,
  angle: number,
  width: number,
  speed: number
) => {
  const { mass } = body;
  const scale = massScale(body);
  let launched = 0;
  for (const entry of body.drops) {
    if (launched >= count) {
      break;
    }
    if (entry.phase !== "hidden") {
      continue;
    }
    const heading = angle + (random(body) - 0.5) * width;
    const x = mass.x + Math.cos(heading) * massRadius * scale * 0.7;
    const y = mass.y + Math.sin(heading) * massRadius * scale * 0.7;
    launchDrop(body, entry, x, y, heading, speed * spread(body, 0.7, 1.15));
    launched += 1;
  }
};

const splat = (body: SlimeBody, reach: number) => {
  const { mass } = body;
  mass.svy -= 6.2;
  mass.svx += 5;
  mass.vy -= 0.25;
  for (const entry of body.core) {
    const dx = entry.x - mass.x;
    entry.vx += dx * 5;
    entry.vy -= 0.6;
  }
  for (const entry of body.drops) {
    if (entry.phase === "crawl" || entry.phase === "stick") {
      entry.hurried = true;
    }
  }
  fling(body, 6, Math.PI / 2, Math.PI * 1.3, 2.4 + reach * 0.8);
  body.flash = 1;
};

export const splatSlimeBody = (body: SlimeBody, tuning: SlimeTuning) =>
  splat(body, tuning.reach);

const lunge = (body: SlimeBody, x: number, y: number, viscosity: number) => {
  const { mass } = body;
  const dx = x - mass.x;
  const dy = y - mass.y;
  const distance = Math.hypot(dx, dy) || 1;
  const kick = 1.7 / Math.sqrt(viscosity);
  mass.vx += (dx / distance) * kick;
  mass.vy += (dy / distance) * kick;
  mass.targetX = x;
  mass.targetY = y;
  mass.wanderClock = 0;
  mass.wanderSpan = 3;
  body.flash = Math.max(body.flash, 0.4);
};

const pickWander = (body: SlimeBody, viscosity: number) => {
  const { bounds, mass } = body;
  mass.targetX = (random(body) * 2 - 1) * bounds.halfWidth * 1.25;
  mass.targetY = (random(body) * 2 - 1) * bounds.halfHeight * 1.25;
  mass.wanderClock = 0;
  mass.wanderSpan = spread(body, 2.6, 5.4) * Math.sqrt(viscosity);
  const dx = mass.targetX - mass.x;
  const dy = mass.targetY - mass.y;
  const distance = Math.hypot(dx, dy) || 1;
  const kick = spread(body, 0.4, 1.1) / Math.sqrt(viscosity);
  mass.vx += (dx / distance) * kick;
  mass.vy += (dy / distance) * kick;
};

const release = (body: SlimeBody, snapped: boolean) => {
  const { grab, tip } = body;
  body.grab = null;
  body.flash = Math.max(body.flash, snapped ? 0.9 : 0.4);
  body.cooldown = snapped ? 1.1 : 0.5;
  const anchor = body.core[body.anchor];
  if (!anchor) {
    return;
  }
  const dx = tip.x - anchor.x;
  const dy = tip.y - anchor.y;
  const length = Math.hypot(dx, dy) || 1;
  anchor.vx += (dx / length) * (snapped ? 1.4 : 0.7);
  anchor.vy += (dy / length) * (snapped ? 1.4 : 0.7);
  if (!(snapped && grab)) {
    return;
  }
  const loose = body.drops.find((entry) => entry.phase === "hidden");
  if (loose) {
    launchDrop(body, loose, tip.x, tip.y, Math.atan2(tip.vy, tip.vx), 0);
    loose.vx = tip.vx * 0.4;
    loose.vy = tip.vy * 0.4;
    loose.size = tipRadius * 0.85;
    loose.presence = 1;
  }
  tip.presence = 0;
};

const startGrab = (
  body: SlimeBody,
  anchor: number,
  source: Grab["source"],
  x: number,
  y: number
) => {
  const anchorBall = body.core[anchor];
  if (!anchorBall) {
    return;
  }
  body.anchor = anchor;
  body.grab = { source, x, y };
  if (body.tip.presence < 0.05) {
    for (const entry of [...body.strand, body.tip]) {
      entry.x = anchorBall.x;
      entry.y = anchorBall.y;
      entry.z = anchorBall.z;
      entry.vx = 0;
      entry.vy = 0;
      entry.vz = 0;
    }
  }
};

const pressDown = (
  body: SlimeBody,
  pointer: PointerInput,
  tuning: SlimeTuning
) => {
  const { mass } = body;
  const gap =
    Math.hypot(pointer.x - mass.x, pointer.y - mass.y) -
    massRadius * massScale(body);
  if (gap > 0.3) {
    lunge(body, pointer.x, pointer.y, tuning.viscosity);
    return;
  }
  splat(body, tuning.reach);
  const nearest = nearestCore(body, pointer.x, pointer.y);
  if (body.grab) {
    body.grab.source = "pointer";
    return;
  }
  startGrab(body, nearest.index, "pointer", pointer.x, pointer.y);
};

const readPointer = (
  body: SlimeBody,
  pointer: PointerInput | null,
  tuning: SlimeTuning
) => {
  const pressed = pointer?.pressed ?? false;
  const justPressed = pressed && !body.wasPressed;
  body.wasPressed = pressed;
  if (!pointer) {
    if (body.grab) {
      release(body, false);
    }
    return;
  }
  if (justPressed) {
    pressDown(body, pointer, tuning);
  }
  if (body.grab?.source === "pointer" && !pressed) {
    release(body, false);
  }
  if (body.grab) {
    body.grab.x = pointer.x;
    body.grab.y = pointer.y;
    if (body.grab.source === "hover") {
      body.anchor = nearestCore(body, body.tip.x, body.tip.y).index;
    }
    return;
  }
  if (pressed || body.cooldown > 0) {
    return;
  }
  const nearest = nearestCore(body, pointer.x, pointer.y);
  if (nearest.gap < 0.1 + tuning.reach * 0.2) {
    startGrab(body, nearest.index, "hover", pointer.x, pointer.y);
  }
};

const wallGap = (body: SlimeBody, wall: Wall, x: number, y: number) => {
  const { halfHeight, halfWidth } = body.bounds;
  if (wall === "left") {
    return -halfWidth - x;
  }
  if (wall === "right") {
    return x - halfWidth;
  }
  if (wall === "floor") {
    return -halfHeight - y;
  }
  return y - halfHeight;
};

const walls: readonly Wall[] = ["left", "right", "floor", "ceiling"];

const wallNormal = (wall: Wall) => {
  if (wall === "left") {
    return { x: -1, y: 0 };
  }
  if (wall === "right") {
    return { x: 1, y: 0 };
  }
  if (wall === "floor") {
    return { x: 0, y: -1 };
  }
  return { x: 0, y: 1 };
};

const hitWall = (body: SlimeBody, wall: Wall, speed: number) => {
  const { mass } = body;
  const across = wall === "left" || wall === "right";
  const squash = Math.min(speed, 2.4) * 2.4;
  if (across) {
    mass.svx -= squash;
    mass.svy += squash * 0.7;
  } else {
    mass.svy -= squash;
    mass.svx += squash * 0.7;
  }
  body.flash = Math.max(body.flash, Math.min(speed, 1) * 0.6);
  if (speed > 0.75) {
    const normal = wallNormal(wall);
    const away = Math.atan2(-normal.y, -normal.x);
    fling(body, 2, away, Math.PI * 0.9, 1.2 + speed * 0.6);
  }
};

const pressMassOnWalls = (body: SlimeBody, step: number, scale: number) => {
  const { mass } = body;
  const reachOut = massRadius * scale;
  let pressX = 0;
  let pressY = 0;
  for (const wall of walls) {
    const normal = wallNormal(wall);
    const depth = wallGap(
      body,
      wall,
      mass.x + normal.x * reachOut,
      mass.y + normal.y * reachOut
    );
    if (depth <= 0) {
      mass.contact.delete(wall);
      continue;
    }
    const speed = mass.vx * normal.x + mass.vy * normal.y;
    if (!mass.contact.has(wall)) {
      mass.contact.add(wall);
      hitWall(body, wall, Math.max(speed, 0));
    }
    mass.vx -= normal.x * depth * 26 * step;
    mass.vy -= normal.y * depth * 26 * step;
    if (speed > 0) {
      mass.vx -= normal.x * speed * 4 * step;
      mass.vy -= normal.y * speed * 4 * step;
    }
    const squeeze = depth / reachOut;
    pressX += normal.x === 0 ? squeeze * 0.6 : -squeeze;
    pressY += normal.y === 0 ? squeeze * 0.6 : -squeeze;
  }
  const { halfHeight, halfWidth } = body.bounds;
  const limitX = Math.max(halfWidth - reachOut * 0.3, 0);
  const limitY = Math.max(halfHeight - reachOut * 0.3, 0);
  mass.x = clamp(mass.x, -limitX, limitX);
  mass.y = clamp(mass.y, -limitY, limitY);
  return { pressX, pressY };
};

const moveMass = (
  body: SlimeBody,
  pointer: PointerInput | null,
  step: number,
  { viscosity }: SlimeTuning
) => {
  const { mass } = body;
  const scale = massScale(body);
  mass.wanderClock += step;
  const toTarget = Math.hypot(mass.targetX - mass.x, mass.targetY - mass.y);
  if (mass.wanderClock > mass.wanderSpan || toTarget < 0.15) {
    pickWander(body, viscosity);
  }
  const crawl = 0.9 / viscosity;
  let ax = ((mass.targetX - mass.x) / (toTarget || 1)) * crawl;
  let ay = ((mass.targetY - mass.y) / (toTarget || 1)) * crawl;
  if (pointer && !pointer.pressed) {
    const dx = pointer.x - mass.x;
    const dy = pointer.y - mass.y;
    const distance = Math.hypot(dx, dy) || 1;
    const lure = clamp01((distance - massRadius * scale * 0.8) / 0.5);
    ax = ax * 0.3 + (dx / distance) * lure * 1.5 * crawl;
    ay = ay * 0.3 + (dy / distance) * lure * 1.5 * crawl;
  }
  if (body.grab?.source === "pointer") {
    const dx = body.tip.x - mass.x;
    const dy = body.tip.y - mass.y;
    ax += dx * body.tension * 3.2;
    ay += dy * body.tension * 3.2;
  }
  mass.vx += ax * step;
  mass.vy += ay * step;
  const drag = Math.exp(-step * (1.2 + viscosity * 0.7));
  mass.vx *= drag;
  mass.vy *= drag;
  mass.x += mass.vx * step;
  mass.y += mass.vy * step;
  const { pressX, pressY } = pressMassOnWalls(body, step, scale);
  const stretchX = Math.abs(mass.vx) * 0.22 - Math.abs(mass.vy) * 0.1;
  const stretchY = Math.abs(mass.vy) * 0.22 - Math.abs(mass.vx) * 0.1;
  const targetX = clamp(1 + stretchX + pressX, 0.55, 1.6);
  const targetY = clamp(1 + stretchY + pressY, 0.55, 1.6);
  const stiffness = 46 / viscosity;
  const damping = 2.6 + viscosity * 1.4;
  mass.svx += ((targetX - mass.sx) * stiffness - mass.svx * damping) * step;
  mass.svy += ((targetY - mass.sy) * stiffness - mass.svy * damping) * step;
  mass.sx = clamp(mass.sx + mass.svx * step, 0.45, 1.8);
  mass.sy = clamp(mass.sy + mass.svy * step, 0.45, 1.8);
};

const moveCore = (
  body: SlimeBody,
  pointer: PointerInput | null,
  step: number,
  { reach, viscosity }: SlimeTuning
) => {
  const { bounds, mass, time } = body;
  const scale = massScale(body);
  const stiffness = 30 / viscosity;
  const damping = 3 + viscosity * 1.5;
  const tip = body.grab ? body.tip : null;
  for (const [index, entry] of body.core.entries()) {
    const rest = coreRest[index];
    if (!rest) {
      continue;
    }
    const sag = rest[1] < 0 ? 0.035 * viscosity : 0;
    let tx =
      mass.x +
      rest[0] * scale * mass.sx +
      Math.sin(time * 0.71 + index * 1.9) * 0.03;
    let ty =
      mass.y +
      (rest[1] * scale - sag) * mass.sy +
      Math.cos(time * 0.53 + index * 2.7) * 0.03;
    const tz = rest[2] + Math.sin(time * 0.61 + index) * 0.05;
    entry.radius =
      rest[3] * scale * (1 + Math.sin(time * 0.9 + index * 1.3) * 0.04);
    if (tip) {
      const pull = index === body.anchor ? 0.2 : 0.05;
      tx += (tip.x - tx) * pull * body.tension;
      ty += (tip.y - ty) * pull * body.tension;
    }
    if (pointer && !pointer.pressed) {
      const dx = pointer.x - tx;
      const dy = pointer.y - ty;
      const distance = Math.hypot(dx, dy);
      const lure =
        clamp01(1 - (distance - entry.radius) / (0.25 + reach * 0.35)) ** 2;
      tx += dx * lure * 0.3;
      ty += dy * lure * 0.3;
    }
    springTo(entry, tx, ty, tz, stiffness, damping, step);
    const limitX = bounds.halfWidth - entry.radius * 0.4;
    const limitY = bounds.halfHeight - entry.radius * 0.4;
    if (Math.abs(entry.x) > limitX) {
      entry.x = Math.sign(entry.x) * limitX;
      entry.vx = 0;
    }
    if (Math.abs(entry.y) > limitY) {
      entry.y = Math.sign(entry.y) * limitY;
      entry.vy = 0;
    }
  }
};

const startDrip = (body: SlimeBody, viscosity: number) => {
  const { bounds, mass } = body;
  body.dripClock = 0;
  body.dripSpan = spread(body, 1.3, 3) * viscosity;
  const hanging = body.drops.filter((entry) => entry.phase === "hang").length;
  const room = mass.y - massBottom - 0.5 > -bounds.halfHeight;
  const entry = body.drops.find((item) => item.phase === "hidden");
  if (!entry || hanging >= 2 || !room || body.grab?.source === "pointer") {
    return;
  }
  entry.phase = "hang";
  entry.clock = 0;
  entry.hang = 0;
  entry.hangSpeed = 0.02;
  entry.offset = spread(body, -0.6, 0.6);
  entry.size = spread(body, 0.08, 0.12);
  entry.hurried = false;
  entry.wall = null;
  entry.x = mass.x;
  entry.y = mass.y;
  entry.z = 0;
};

const hangDrop = (
  body: SlimeBody,
  entry: Drop,
  step: number,
  viscosity: number
) => {
  const { mass } = body;
  const scale = massScale(body);
  entry.hangSpeed += (gravity * 0.1 * step) / viscosity;
  entry.hang += entry.hangSpeed * step;
  entry.radius = entry.size * (0.55 + 0.45 * clamp01(entry.clock / 1.4));
  entry.x = mass.x + entry.offset * massRadius * scale * mass.sx * 0.6;
  entry.y = mass.y - massBottom * scale * mass.sy - entry.hang;
  entry.vx = mass.vx;
  entry.vy = mass.vy - entry.hangSpeed;
  entry.z += (0 - entry.z) * step * 4;
  if (entry.hang > 0.26 + entry.size) {
    entry.phase = "fly";
    entry.clock = 0;
    entry.vy = Math.min(entry.vy, -entry.hangSpeed * 1.5);
  }
};

const stick = (body: SlimeBody, entry: Drop, wall: Wall, viscosity: number) => {
  const { halfHeight, halfWidth } = body.bounds;
  entry.phase = "stick";
  entry.wall = wall;
  entry.clock = 0;
  entry.hold = spread(body, 0.7, 1.6) * viscosity;
  entry.vx = 0;
  entry.vy = 0;
  const inset = entry.size * 0.45;
  if (wall === "left") {
    entry.x = -halfWidth + inset;
  } else if (wall === "right") {
    entry.x = halfWidth - inset;
  } else if (wall === "floor") {
    entry.y = -halfHeight + inset;
  } else {
    entry.y = halfHeight - inset;
  }
};

const flyDrop = (
  body: SlimeBody,
  entry: Drop,
  step: number,
  viscosity: number
) => {
  const { mass } = body;
  entry.vy -= gravity * step;
  const drag = Math.exp(-step * 0.5);
  entry.vx *= drag;
  entry.vy *= drag;
  entry.x += entry.vx * step;
  entry.y += entry.vy * step;
  entry.z += (0 - entry.z) * step * 2;
  const stretch = Math.hypot(entry.vx, entry.vy) * 0.04;
  entry.radius = entry.size * (1 - Math.min(stretch, 0.2));
  for (const wall of walls) {
    if (wallGap(body, wall, entry.x, entry.y) > -entry.size * 0.45) {
      stick(body, entry, wall, viscosity);
      return;
    }
  }
  const home = Math.hypot(entry.x - mass.x, entry.y - mass.y);
  if (entry.clock > 0.3 && home < massRadius * massScale(body) * 0.9) {
    entry.phase = "crawl";
    entry.clock = 0;
  }
};

const stickDrop = (
  body: SlimeBody,
  entry: Drop,
  step: number,
  viscosity: number
) => {
  entry.radius += (entry.size * 1.3 - entry.radius) * (1 - Math.exp(-step * 9));
  if (entry.wall === "left" || entry.wall === "right") {
    entry.y = Math.max(
      entry.y - (0.08 / viscosity) * step,
      -body.bounds.halfHeight + entry.size * 0.45
    );
  }
  const hold = entry.hurried ? entry.hold * 0.4 : entry.hold;
  if (entry.clock < hold) {
    return;
  }
  entry.clock = 0;
  if (entry.wall === "ceiling") {
    entry.phase = "fly";
    entry.vy = -0.1;
    entry.y -= entry.size * 0.3;
    return;
  }
  entry.phase = "crawl";
};

const crawlDrop = (
  body: SlimeBody,
  entry: Drop,
  step: number,
  viscosity: number
) => {
  const { mass } = body;
  const dx = mass.x - entry.x;
  const dy = mass.y - entry.y;
  const distance = Math.hypot(dx, dy) || 1;
  const speed =
    ((entry.hurried ? 1.3 : 0.55) + entry.clock * 0.08) / Math.sqrt(viscosity);
  const wobble = Math.sin(body.time * 3 + entry.size * 90) * 0.25;
  const vx = ((dx - dy * wobble) / distance) * speed;
  const vy = ((dy + dx * wobble) / distance) * speed;
  const ease = 1 - Math.exp(-step * 3);
  entry.vx += (vx - entry.vx) * ease;
  entry.vy += (vy - entry.vy) * ease;
  entry.x += entry.vx * step;
  entry.y += entry.vy * step;
  entry.radius =
    entry.size * (1.05 + Math.sin(body.time * 5 + entry.size * 40) * 0.12);
  if (distance < massRadius * massScale(body) * 0.85) {
    entry.presence = Math.max(0, entry.presence - step * 2.5);
    if (entry.presence <= 0) {
      entry.phase = "hidden";
    }
  }
};

const moveDrops = (body: SlimeBody, step: number, viscosity: number) => {
  body.dripClock += step;
  if (body.dripClock > body.dripSpan) {
    startDrip(body, viscosity);
  }
  const { mass } = body;
  for (const entry of body.drops) {
    entry.clock += step;
    if (entry.phase === "hidden") {
      entry.presence = 0;
      entry.x = mass.x;
      entry.y = mass.y;
      continue;
    }
    if (entry.phase !== "crawl") {
      entry.presence = Math.min(1, entry.presence + step * 10);
    }
    if (entry.phase === "hang") {
      hangDrop(body, entry, step, viscosity);
    } else if (entry.phase === "fly") {
      flyDrop(body, entry, step, viscosity);
    } else if (entry.phase === "stick") {
      stickDrop(body, entry, step, viscosity);
    } else {
      crawlDrop(body, entry, step, viscosity);
    }
  }
};

const moveStrand = (
  body: SlimeBody,
  step: number,
  { reach, viscosity }: SlimeTuning
) => {
  const anchor = body.core[body.anchor];
  if (!anchor) {
    return;
  }
  const { grab, tip } = body;
  if (grab?.source === "pointer") {
    springTo(tip, grab.x, grab.y, 0.05, 240, 22, step);
  } else if (grab) {
    springTo(tip, grab.x, grab.y, 0.05, 90 / viscosity, 9, step);
  } else {
    springTo(tip, anchor.x, anchor.y, anchor.z, 60 / viscosity, 6, step);
  }
  if (grab) {
    tip.presence = Math.min(1, tip.presence + step * 8);
  }
  const dx = tip.x - anchor.x;
  const dy = tip.y - anchor.y;
  const dz = tip.z - anchor.z;
  const length = Math.hypot(dx, dy, dz);
  const limit = snapLength(reach, grab?.source ?? "hover");
  body.tension = clamp01((length - anchor.radius) / (limit - anchor.radius));
  const thinning = Math.min(1, (0.6 / Math.max(length, 0.6)) ** 0.7);
  for (const [index, entry] of body.strand.entries()) {
    const along = (index + 1) / (strandCount + 1);
    const bow = Math.sin(Math.PI * along);
    const sag = bow * length * 0.14 * Math.sqrt(viscosity);
    const lag = 1 + viscosity * 0.45 + index * 0.04;
    if (grab) {
      springTo(
        entry,
        anchor.x + dx * along,
        anchor.y + dy * along - sag,
        anchor.z + dz * along,
        130 / lag,
        12,
        step
      );
      entry.presence = Math.min(1, entry.presence + step * 9);
    } else {
      springTo(entry, anchor.x, anchor.y, anchor.z, 50 + index * 5, 6, step);
    }
    entry.radius = (0.12 - bow ** 0.6 * 0.075) * thinning;
  }
  tip.radius = tipRadius * (1 - body.tension * 0.3);
  if (grab && length > limit) {
    release(body, true);
  }
  if (!body.grab) {
    const settle = length < anchor.radius * 0.9 ? step * 2.4 : 0;
    tip.presence = Math.max(0, tip.presence - settle);
    for (const entry of body.strand) {
      entry.presence = Math.max(0, entry.presence - settle);
    }
  }
};

const moveTouch = (
  body: SlimeBody,
  pointer: PointerInput | null,
  step: number
) => {
  const target = pointer ? 1 : 0;
  body.touch.strength +=
    (target - body.touch.strength) * (1 - Math.exp(-step * 5));
  if (pointer) {
    body.touch.x = pointer.x;
    body.touch.y = pointer.y;
  }
  body.flash *= Math.exp(-step * 2.2);
  body.cooldown = Math.max(0, body.cooldown - step);
};

export const stepSlimeBody = (
  body: SlimeBody,
  delta: number,
  pointer: PointerInput | null,
  tuning: SlimeTuning
) => {
  const step = Math.min(delta, maxStep) / subSteps;
  readPointer(body, pointer, tuning);
  for (let index = 0; index < subSteps; index += 1) {
    body.time += step;
    moveMass(body, pointer, step, tuning);
    moveCore(body, pointer, step, tuning);
    moveDrops(body, step, tuning.viscosity);
    moveStrand(body, step, tuning);
    moveTouch(body, pointer, step);
  }
};

export const settleSlimeBody = (
  body: SlimeBody,
  seconds: number,
  tuning: SlimeTuning
) => {
  const frames = Math.round(seconds * 60);
  for (let index = 0; index < frames; index += 1) {
    stepSlimeBody(body, 1 / 60, null, tuning);
  }
};

export const effectiveRadius = (entry: Ball) =>
  hiddenRadius + (entry.radius - hiddenRadius) * entry.presence;

export const slimeBalls = (body: SlimeBody): readonly Ball[] => [
  ...body.core,
  ...body.drops,
  ...body.strand,
  body.tip,
];

export const excitementOf = (body: SlimeBody) =>
  Math.max(body.tension * 0.85, body.flash, body.touch.strength * 0.35);
