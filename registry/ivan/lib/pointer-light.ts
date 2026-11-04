import { PointerTrace } from "@/registry/ivan/lib/pointer-trace";
import type { PointerSample } from "@/registry/ivan/lib/pointer-trace";

const followRate = 9;
const maxStep = 0.05;
const minStep = 0.001;

export const restingLight = { x: 0.24, y: 0.78 } as const;

export class PointerLight {
  readonly trace = new PointerTrace();
  x: number = restingLight.x;
  y: number = restingLight.y;
  kick = 0;
  private clock = 0;

  advance(pointer: PointerSample, delta: number, isAnimating: boolean) {
    const step = Math.min(delta, maxStep);
    const { trace } = this;
    trace.update(pointer, step, isAnimating);
    if (isAnimating) {
      this.clock += step;
    }
    const wanderX = 0.5 + Math.sin(this.clock * 0.4 - 1.3) * 0.32;
    const wanderY = 0.62 + Math.cos(this.clock * 0.31) * 0.2;
    let targetX = trace.isActive ? trace.x : wanderX;
    let targetY = trace.isActive ? trace.y : wanderY;
    if (!(isAnimating || trace.isActive)) {
      targetX = restingLight.x;
      targetY = restingLight.y;
    }
    const blend = isAnimating ? 1 - Math.exp(-step * followRate) : 1;
    const previousX = this.x;
    const previousY = this.y;
    this.x += (targetX - this.x) * blend;
    this.y += (targetY - this.y) * blend;
    const velocity =
      Math.hypot(this.x - previousX, this.y - previousY) /
      Math.max(step, minStep);
    const wanted = isAnimating ? Math.min(velocity / 2.5, 1) : 0;
    const rate = wanted > this.kick ? 14 : 3;
    this.kick += (wanted - this.kick) * (1 - Math.exp(-rate * step));
  }
}
