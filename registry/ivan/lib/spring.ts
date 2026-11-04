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

export const driveSpring = (
  spring: Spring,
  target: number,
  { stiffness, damping }: SpringConfig,
  step: number,
  isAnimating: boolean
) => {
  if (isAnimating) {
    const acceleration =
      stiffness * (target - spring.value) - damping * spring.velocity;
    spring.velocity += acceleration * step;
    spring.value += spring.velocity * step;
  } else {
    spring.value = target;
    spring.velocity = 0;
  }
};

export const frameStep = (delta: number) => Math.min(delta, 1 / 30);
