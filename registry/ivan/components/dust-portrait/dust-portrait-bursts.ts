import { Vector3 } from "three";

export const dustBurstCapacity = 8;

export const dustBurstTiming = {
  reach: 1.15,
  rise: 0.13,
  seconds: 2.4,
  wave: 0.9,
} as const;

const unbornAt = -1e4;

export const dustBurstChunk = `
  #define BURSTS ${dustBurstCapacity}
  #define BURST_REACH ${dustBurstTiming.reach.toFixed(3)}
  #define BURST_RISE ${dustBurstTiming.rise.toFixed(3)}
  #define BURST_SECONDS ${dustBurstTiming.seconds.toFixed(3)}
  #define BURST_WAVE_SECONDS ${dustBurstTiming.wave.toFixed(3)}

  uniform vec3 uBursts[BURSTS];

  float burstFront(float age) {
    float wave = clamp(age / BURST_WAVE_SECONDS, 0.0, 1.0);
    return BURST_REACH * (1.0 - pow(1.0 - wave, 3.0));
  }

  float burstArrival(float gap) {
    float travelled = clamp(gap / BURST_REACH, 0.0, 1.0);
    return BURST_WAVE_SECONDS * (1.0 - pow(1.0 - travelled, 1.0 / 3.0));
  }
`;

export class DustBursts {
  readonly uniform = Array.from(
    { length: dustBurstCapacity },
    () => new Vector3(0, 0, unbornAt)
  );
  private next = 0;
  private lastBirth = unbornAt;

  add(x: number, y: number, birth: number) {
    this.uniform[this.next]?.set(x, y, birth);
    this.next = (this.next + 1) % dustBurstCapacity;
    this.lastBirth = birth;
  }

  isActiveAt(time: number) {
    return time - this.lastBirth < dustBurstTiming.seconds;
  }

  clear() {
    for (const burst of this.uniform) {
      burst.z = unbornAt;
    }
    this.next = 0;
    this.lastBirth = unbornAt;
  }
}
