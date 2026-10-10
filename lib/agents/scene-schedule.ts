export const sceneDwellMs = 8000;

export interface SceneSchedule {
  index: number;
  pinned: number | null;
  scrollIndex: number;
  since: number;
  target: number | null;
}

export type SceneScheduleEvent =
  | { kind: "pin"; index: number; now: number }
  | { kind: "unpin"; now: number }
  | { kind: "scroll"; index: number }
  | { kind: "tick"; now: number }
  | { kind: "wake"; now: number };

export const createSceneSchedule = (
  scrollIndex: number,
  now: number
): SceneSchedule => ({
  index: scrollIndex,
  pinned: null,
  scrollIndex,
  since: now,
  target: null,
});

export const shownSceneIndex = (schedule: SceneSchedule) =>
  schedule.pinned ?? schedule.index;

export const msUntilAdvance = (schedule: SceneSchedule, now: number) =>
  Math.max(0, schedule.since + sceneDwellMs - now);

const advance = (
  schedule: SceneSchedule,
  count: number,
  now: number
): SceneSchedule => {
  const { index, target } = schedule;
  if (target === null || target === index) {
    return {
      ...schedule,
      index: (index + 1) % count,
      since: now,
      target: null,
    };
  }
  const next = index + Math.sign(target - index);
  return {
    ...schedule,
    index: next,
    since: now,
    target: next === target ? null : target,
  };
};

export const stepSceneSchedule = (
  schedule: SceneSchedule,
  event: SceneScheduleEvent,
  count: number
): SceneSchedule => {
  switch (event.kind) {
    case "pin": {
      return event.index === schedule.pinned
        ? schedule
        : {
            ...schedule,
            index: event.index,
            pinned: event.index,
            since: event.now,
            target: null,
          };
    }
    case "unpin": {
      return schedule.pinned === null
        ? schedule
        : { ...schedule, pinned: null, since: event.now };
    }
    case "scroll": {
      return event.index === schedule.scrollIndex
        ? schedule
        : { ...schedule, scrollIndex: event.index, target: event.index };
    }
    case "wake": {
      return { ...schedule, since: event.now };
    }
    case "tick": {
      if (schedule.pinned !== null || msUntilAdvance(schedule, event.now) > 0) {
        return schedule;
      }
      return advance(schedule, count, event.now);
    }
    default: {
      return schedule;
    }
  }
};
