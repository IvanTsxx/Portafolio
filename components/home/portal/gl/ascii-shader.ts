/** Idle cosmos + Bolt tunnel → landed ambient that persists */

export const ASCII_VERT = /* glsl */ `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position.xy, 0.0, 1.0);
}
`

export const ASCII_FRAG = /* glsl */ `
precision mediump float;

uniform float uTime;
uniform vec2 uRes;
uniform vec2 uPointer;
uniform float uPointerActive;
uniform float uWorm;
uniform float uCharge;
uniform float uLand;
uniform float uLandMood;
uniform vec3 uBg;
uniform vec3 uFg;
uniform float uGlyphGain;
uniform float uCell;
uniform sampler2D uAtlas;
uniform float uAtlasLen;

varying vec2 vUv;

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  float a = hash(i);
  float b = hash(i + vec2(1.0, 0.0));
  float c = hash(i + vec2(0.0, 1.0));
  float d = hash(i + vec2(1.0, 1.0));
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
}

float cosmos(vec2 q, float t) {
  float n = noise(q * 1.25 + t * 0.028);
  float stars = step(0.952, hash(floor(q * 28.0))) * 0.2;
  return clamp(0.14 + n * 0.22 + stars, 0.0, 0.48);
}

float landField(vec2 q, float t, float mood) {
  float d = 0.0;
  if (mood < 0.15) {
    d = cosmos(q, t) + 0.04;
  } else if (mood < 0.35) {
    vec2 g = abs(fract(q * 4.0 + vec2(t * 0.05, -t * 0.03)) - 0.5);
    float line = 1.0 - smoothstep(0.0, 0.035, min(g.x, g.y));
    d = cosmos(q * 0.9, t) * 0.45 + line * 0.35;
  } else if (mood < 0.55) {
    float y = q.y + sin(q.x * 2.2 + t * 0.4) * 0.18;
    d = cosmos(q, t) * 0.4 + exp(-y * y * 7.0) * 0.4;
  } else if (mood < 0.8) {
    float sweep = sin((q.x + q.y) * 6.0 - t * 0.5) * 0.5 + 0.5;
    d = cosmos(q * 1.1, t) * 0.35 + sweep * 0.32;
  } else {
    float r = length(q);
    float ring = exp(-abs(r - fract(t * 0.15)) * 14.0);
    d = cosmos(q, t) * 0.35 + ring * 0.45;
  }
  return clamp(d, 0.0, 0.72);
}

vec2 warpBolt(vec2 q, float w) {
  float r = length(q) + 1e-4;
  vec2 dir = q / r;
  float pull = mix(1.0, 0.4, w);
  float stretch = 1.0 + w * (1.0 - r) * 1.15;
  return dir * r * pull * vec2(1.0, stretch);
}

float accentBolt(vec2 q, float t, float w) {
  float r = length(q) + 1e-4;
  float a = atan(q.y, q.x);
  float lines = pow(abs(sin(a * 8.0)), 2.5);
  float rush = fract(r * 4.0 - t * (1.6 + w * 3.5));
  rush = 1.0 - abs(rush - 0.5) * 2.0;
  return lines * rush * exp(-r * 0.9) * w * 0.35;
}

void main() {
  vec2 frag = gl_FragCoord.xy;
  float cell = max(uCell, 10.0);
  vec2 grid = floor(frag / cell);
  vec2 cellUv = fract(frag / cell);
  vec2 res = uRes;
  vec2 p = ((grid + 0.5) * cell - 0.5 * res) / res.y;

  float t = uTime;
  float travel = clamp(max(uWorm, uCharge * 0.9), 0.0, 1.0);
  float land = clamp(uLand, 0.0, 1.0);

  float zoom = 1.0 + travel * 1.0;
  vec2 q = p / zoom;
  vec2 warped = warpBolt(q, travel);
  vec2 samplePos = mix(q, warped, smoothstep(0.0, 0.75, travel));

  float d = cosmos(samplePos, t);
  if (land > 0.02) {
    float landMix = land * (1.0 - smoothstep(0.35, 0.85, travel));
    if (landMix > 0.01) {
      d = mix(d, landField(samplePos, t, uLandMood), landMix);
    }
  }

  if (travel > 0.05) d += accentBolt(warped, t, travel);
  d = clamp(d, 0.0, 0.82);

  // Pointer ripple — works on surface + landed (blocked only mid-tunnel)
  if (travel < 0.45 && uPointerActive > 0.5) {
    vec2 toP = q - (uPointer * 2.0 - 1.0) * vec2(uRes.x / uRes.y, 1.0);
    float falloff = exp(-dot(toP, toP) * 3.2);
    d += falloff * 0.11;
  }

  float idx = floor(clamp(d, 0.0, 1.0) * (uAtlasLen - 1.0) + 0.5);
  float glyph = texture2D(uAtlas, vec2((idx + cellUv.x) / uAtlasLen, cellUv.y)).r;
  /* Gain < 1 leaves headroom for floating UI (dim labels especially) over the field */
  float strength = glyph * (0.22 + d * 0.5) * clamp(uGlyphGain, 0.0, 1.0);
  gl_FragColor = vec4(mix(uBg, uFg, strength), 1.0);
}
`
