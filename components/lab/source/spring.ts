export interface Spring {
  value: number;
  velocity: number;
}

export interface SpringConfig {
  stiffness: number;
  damping: number;
}

export const createSpring = (value: number): Spring => ({
  value,
  velocity: 0,
});

export const stepSpring = (
  spring: Spring,
  target: number,
  { stiffness, damping }: SpringConfig,
  step: number
) => {
  const acceleration =
    stiffness * (target - spring.value) - damping * spring.velocity;
  spring.velocity += acceleration * step;
  spring.value += spring.velocity * step;
};

export const settleSpring = (spring: Spring, target: number) => {
  spring.value = target;
  spring.velocity = 0;
};

export const driveSpring = (
  spring: Spring,
  target: number,
  config: SpringConfig,
  step: number,
  animate: boolean
) => {
  if (animate) {
    stepSpring(spring, target, config, step);
  } else {
    settleSpring(spring, target);
  }
};

export const frameStep = (delta: number) => Math.min(delta, 1 / 30);
