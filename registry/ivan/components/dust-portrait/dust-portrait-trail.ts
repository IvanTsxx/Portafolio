import { Vector3 } from "three";

import { createSpring, driveSpring } from "@/registry/ivan/lib/spring";
import type { Spring, SpringConfig } from "@/registry/ivan/lib/spring";

export const dustTrailLength = 10;

const attack: SpringConfig = { damping: 36, stiffness: 324 };
const release: SpringConfig = { damping: 15, stiffness: 56.25 };
const dropEvery = 0.045;
const dropDistance = 0.012;
const restValue = 0.004;
const restVelocity = 0.02;
const substep = 1 / 120;

interface TrailMark {
  x: number;
  y: number;
  spring: Spring;
}

const createMark = (): TrailMark => ({ spring: createSpring(0), x: 0, y: 0 });

const isResting = ({ value, velocity }: Spring) =>
  Math.abs(value) < restValue && Math.abs(velocity) < restVelocity;

export class DustTrail {
  readonly uniform = Array.from(
    { length: dustTrailLength + 1 },
    () => new Vector3()
  );
  private readonly head = createMark();
  private readonly marks = Array.from({ length: dustTrailLength }, createMark);
  private isPointerIn = false;
  private sinceDrop = 0;
  private nextMark = 0;
  private lastDropX = Number.NaN;
  private lastDropY = Number.NaN;

  aim(x: number, y: number) {
    this.head.x = x;
    this.head.y = y;
    this.isPointerIn = true;
  }

  release() {
    this.isPointerIn = false;
  }

  get isSettled() {
    return (
      !this.isPointerIn &&
      isResting(this.head.spring) &&
      this.marks.every((mark) => isResting(mark.spring))
    );
  }

  get strength() {
    return this.head.spring.value;
  }

  clear() {
    this.isPointerIn = false;
    for (const mark of [this.head, ...this.marks]) {
      mark.spring.value = 0;
      mark.spring.velocity = 0;
    }
    this.write();
  }

  advance(step: number) {
    const { head } = this;
    for (let elapsed = 0; elapsed < step; elapsed += substep) {
      const slice = Math.min(substep, step - elapsed);
      driveSpring(
        head.spring,
        this.isPointerIn ? 1 : 0,
        this.isPointerIn ? attack : release,
        slice,
        true
      );
      for (const mark of this.marks) {
        driveSpring(mark.spring, 0, release, slice, true);
      }
    }
    this.sinceDrop += step;
    const moved =
      Number.isNaN(this.lastDropX) ||
      Math.hypot(head.x - this.lastDropX, head.y - this.lastDropY) >
        dropDistance;
    if (this.isPointerIn && moved && this.sinceDrop >= dropEvery) {
      this.drop();
    }
    for (const mark of [head, ...this.marks]) {
      if (isResting(mark.spring)) {
        mark.spring.value = 0;
        mark.spring.velocity = 0;
      }
    }
    this.write();
  }

  private drop() {
    const { head } = this;
    const mark = this.marks[this.nextMark];
    if (!mark) {
      return;
    }
    mark.x = head.x;
    mark.y = head.y;
    mark.spring.value = Math.max(head.spring.value, mark.spring.value * 0.5);
    mark.spring.velocity = 0;
    this.nextMark = (this.nextMark + 1) % this.marks.length;
    this.sinceDrop = 0;
    this.lastDropX = head.x;
    this.lastDropY = head.y;
  }

  private write() {
    const { head } = this;
    this.uniform[0]?.set(head.x, head.y, Math.max(head.spring.value, 0));
    for (const [index, mark] of this.marks.entries()) {
      this.uniform[index + 1]?.set(
        mark.x,
        mark.y,
        Math.max(mark.spring.value, 0)
      );
    }
  }
}
