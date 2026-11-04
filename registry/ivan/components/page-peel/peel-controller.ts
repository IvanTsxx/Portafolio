import {
  clampToStage,
  easeOutQuart,
  foldCorner,
  openTip,
  peeledShare,
  restingTip,
  settleAxis,
  toClipPath,
} from "@/registry/ivan/lib/page-fold";
import type { Point, Stage } from "@/registry/ivan/lib/page-fold";

export type PeelPhase = "rest" | "dragging" | "opening" | "open" | "closing";

export type PeelHandle = "corner" | "fold";

export interface PeelElements {
  flap: HTMLElement;
  flapShade: HTMLElement;
  underside: HTMLElement;
  undersideShade: HTMLElement;
}

export interface PeelOptions {
  isReduced: () => boolean;
  onOpenChange: (isOpen: boolean) => void;
  openAt: () => number;
}

export interface PeelPointer {
  clientX: number;
  clientY: number;
  timeStamp: number;
}

interface PointerSample {
  time: number;
  x: number;
  y: number;
}

interface DragTrack {
  handle: PeelHandle;
  offset: Point;
  origin: Point;
  samples: PointerSample[];
  start: PointerSample;
  wasOpen: boolean;
}

export const peelLegs = {
  corner: { hover: 48, rest: 28 },
  fold: { hover: 80, rest: 64 },
} as const;

export const flapShadeSpan = 100;
export const undersideShadeSpan = 96;

const tapSlop = 6;
const tapWindow = 450;
const flickSpeed = 0.5;
const settleDuration = 560;
const hoverDuration = 220;
const crossfadeDuration = 200;
const sampleWindow = 90;

const sampleOf = (pointer: PeelPointer, origin: Point): PointerSample => ({
  time: pointer.timeStamp,
  x: pointer.clientX - origin.x,
  y: pointer.clientY - origin.y,
});

const pointerVelocity = (samples: PointerSample[]): Point => {
  const last = samples.at(-1);
  const first =
    samples.find((sample) => last && last.time - sample.time <= sampleWindow) ??
    last;
  if (!first || !last || last.time - first.time < 1) {
    return { x: 0, y: 0 };
  }
  const elapsed = last.time - first.time;
  return { x: (last.x - first.x) / elapsed, y: (last.y - first.y) / elapsed };
};

const tipFromPointer = (
  stage: Stage,
  handle: PeelHandle,
  anchor: Point
): Point =>
  handle === "corner"
    ? anchor
    : { x: 2 * anchor.x - stage.width, y: 2 * anchor.y - stage.height };

const cornerAnchor = (stage: Stage, handle: PeelHandle, tip: Point): Point =>
  handle === "corner"
    ? tip
    : { x: (tip.x + stage.width) / 2, y: (tip.y + stage.height) / 2 };

export const createPeelController = (
  elements: PeelElements,
  options: PeelOptions
) => {
  let phase: PeelPhase = "rest";
  let stage: Stage = { height: 0, width: 0 };
  let tip: Point = { x: 0, y: 0 };
  let leg: number = peelLegs.corner.rest;
  let foldLeg: number = peelLegs.fold.rest;
  let frame = 0;
  let timer = 0;
  let drag: DragTrack | null = null;

  const paint = (next: Point) => {
    tip = next;
    if (stage.width === 0) {
      return;
    }
    const fold = foldCorner(stage, next);
    const anchor = `translate(${fold.midpoint.x - stage.width}px, ${fold.midpoint.y - stage.height}px)`;
    elements.underside.style.clipPath = toClipPath(fold.peeled);
    elements.flap.style.clipPath = toClipPath(fold.flap);
    elements.flapShade.style.transform = `${anchor} rotate(${fold.angle}rad) scaleX(${fold.depth / flapShadeSpan}) translateY(-50%)`;
    elements.undersideShade.style.transform = `${anchor} rotate(${fold.angle + Math.PI}rad) scaleX(${Math.min(1, fold.depth / undersideShadeSpan)}) translateY(-50%)`;
  };

  const stop = () => {
    cancelAnimationFrame(frame);
    window.clearTimeout(timer);
  };

  const restTarget = () => restingTip(stage, leg);
  const openTarget = () => openTip(stage, foldLeg);

  const tweenTo = (target: Point, duration: number) => {
    stop();
    const from = tip;
    const startedAt = performance.now();
    const step = (now: number) => {
      const progress = Math.min(1, (now - startedAt) / duration);
      const eased = easeOutQuart(progress);
      paint({
        x: from.x + (target.x - from.x) * eased,
        y: from.y + (target.y - from.y) * eased,
      });
      if (progress < 1) {
        frame = requestAnimationFrame(step);
      }
    };
    frame = requestAnimationFrame(step);
  };

  const settleTo = (
    target: Point,
    velocity: Point | null,
    onSettled: () => void
  ) => {
    stop();
    const seconds = settleDuration / 1000;
    const curveX = settleAxis(tip.x, target.x, velocity?.x ?? null, seconds);
    const curveY = settleAxis(tip.y, target.y, velocity?.y ?? null, seconds);
    const startedAt = performance.now();
    const step = (now: number) => {
      const progress = (now - startedAt) / settleDuration;
      if (progress >= 1) {
        paint(target);
        onSettled();
        return;
      }
      paint({ x: curveX(progress), y: curveY(progress) });
      frame = requestAnimationFrame(step);
    };
    frame = requestAnimationFrame(step);
  };

  const crossfade = (target: Point, onDone: () => void) => {
    stop();
    elements.underside.style.transition = `opacity ${crossfadeDuration}ms ease`;
    elements.underside.style.opacity = "0";
    timer = window.setTimeout(() => {
      elements.underside.style.transition = "none";
      paint(target);
      elements.underside.getBoundingClientRect();
      elements.underside.style.transition = `opacity ${crossfadeDuration}ms ease`;
      elements.underside.style.opacity = "1";
      onDone();
    }, crossfadeDuration);
  };

  const settleOpen = () => {
    phase = "open";
  };

  const settleRest = () => {
    phase = "rest";
  };

  const isOpenish = () => phase === "open" || phase === "opening";

  const open = (velocity: Point | null = null) => {
    phase = "opening";
    foldLeg = peelLegs.fold.rest;
    options.onOpenChange(true);
    if (options.isReduced()) {
      crossfade(openTarget(), settleOpen);
      return;
    }
    settleTo(openTarget(), velocity, settleOpen);
  };

  const close = (velocity: Point | null = null) => {
    phase = "closing";
    leg = peelLegs.corner.rest;
    options.onOpenChange(false);
    if (options.isReduced()) {
      crossfade(restTarget(), settleRest);
      return;
    }
    settleTo(restTarget(), velocity, settleRest);
  };

  const hover = (handle: PeelHandle, isOver: boolean) => {
    if (options.isReduced()) {
      return;
    }
    const legs = peelLegs[handle];
    const nextLeg = isOver ? legs.hover : legs.rest;
    if (handle === "corner" && phase === "rest") {
      leg = nextLeg;
      tweenTo(restTarget(), hoverDuration);
    } else if (handle === "fold" && phase === "open") {
      foldLeg = nextLeg;
      tweenTo(openTarget(), hoverDuration);
    }
  };

  const pointerDown = (
    handle: PeelHandle,
    pointer: PeelPointer,
    origin: Point
  ) => {
    if (phase === "dragging") {
      return false;
    }
    stop();
    const start = sampleOf(pointer, origin);
    const anchor = cornerAnchor(stage, handle, tip);
    drag = {
      handle,
      offset: { x: anchor.x - start.x, y: anchor.y - start.y },
      origin,
      samples: [start],
      start,
      wasOpen: isOpenish(),
    };
    phase = "dragging";
    return true;
  };

  const pointerMove = (pointer: PeelPointer) => {
    if (phase !== "dragging" || !drag) {
      return;
    }
    const sample = sampleOf(pointer, drag.origin);
    drag.samples = [...drag.samples.slice(-7), sample];
    if (options.isReduced()) {
      return;
    }
    paint(
      clampToStage(
        stage,
        tipFromPointer(stage, drag.handle, {
          x: sample.x + drag.offset.x,
          y: sample.y + drag.offset.y,
        })
      )
    );
  };

  const pointerUp = (pointer: PeelPointer) => {
    const track = drag;
    drag = null;
    if (phase !== "dragging" || !track) {
      return;
    }
    const sample = sampleOf(pointer, track.origin);
    const samples = [...track.samples, sample];
    const isTap =
      Math.hypot(sample.x - track.start.x, sample.y - track.start.y) <
        tapSlop && sample.time - track.start.time < tapWindow;
    if (isTap || options.isReduced()) {
      if (track.wasOpen) {
        close();
      } else if (isTap) {
        open();
      } else {
        phase = "rest";
      }
      return;
    }
    const scale = track.handle === "corner" ? 1000 : 2000;
    const pointerSpeed = pointerVelocity(samples);
    const velocity = { x: pointerSpeed.x * scale, y: pointerSpeed.y * scale };
    const diagonal = Math.hypot(stage.width, stage.height);
    const towardOpen =
      -(pointerSpeed.x * stage.width + pointerSpeed.y * stage.height) /
      diagonal;
    const shouldOpen =
      Math.abs(towardOpen) > flickSpeed
        ? towardOpen > 0
        : peeledShare(stage, tip) > options.openAt();
    if (shouldOpen) {
      open(velocity);
    } else {
      close(velocity);
    }
  };

  const pointerCancel = () => {
    const track = drag;
    drag = null;
    if (phase !== "dragging" || !track) {
      return;
    }
    if (track.wasOpen) {
      open();
    } else {
      close();
    }
  };

  const measure = () => {
    stage = {
      height: elements.underside.clientHeight,
      width: elements.underside.clientWidth,
    };
    if (phase === "open") {
      paint(openTarget());
    } else if (phase === "rest") {
      paint(restTarget());
    }
  };

  return {
    close: () => {
      if (isOpenish()) {
        close();
      }
    },
    dispose: stop,
    hover,
    measure,
    pointerCancel,
    pointerDown,
    pointerMove,
    pointerUp,
    toggle: () => (isOpenish() ? close() : open()),
  };
};

export type PeelController = ReturnType<typeof createPeelController>;
