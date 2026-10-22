"use client";

import { OrthographicCamera } from "@react-three/drei";
import { lazy, useEffect, useRef } from "react";
import type { RefObject } from "react";

import { useViewSlot } from "@/components/scene/view-registry";
import { useWebGLSupport } from "@/components/scene/webgl-support";
import { useReducedMotion } from "@/hooks/use-reduced-motion";

import { createLanePointer, isInsideRect } from "./lane-kit";
import type { LanePointer } from "./lane-kit";

const Toner = lazy(() => import("./toner"));

const sheetClearance = 14;
const interactiveSelector =
  "a, button, input, textarea, select, [role=button], header";

interface FieldState {
  lane: HTMLDivElement | null;
  pointer: LanePointer;
  sheets: Element[];
}

const field: FieldState = {
  lane: null,
  pointer: createLanePointer(),
  sheets: [],
};

const senseSheet = () => {
  const { lane, pointer, sheets } = field;
  if (!lane || sheets.length === 0) {
    return;
  }
  const box = lane.getBoundingClientRect();
  const page = {
    bottom: -Infinity,
    left: Infinity,
    right: -Infinity,
    top: Infinity,
  };
  for (const sheet of sheets) {
    const part = sheet.getBoundingClientRect();
    page.left = Math.min(page.left, part.left);
    page.right = Math.max(page.right, part.right);
    page.top = Math.min(page.top, part.top);
    page.bottom = Math.max(page.bottom, part.bottom);
  }
  pointer.sheet.left = page.left - box.left - box.width / 2 - sheetClearance;
  pointer.sheet.right = page.right - box.left - box.width / 2 + sheetClearance;
  pointer.sheet.top = box.height / 2 - (page.top - box.top) + sheetClearance;
  pointer.sheet.bottom =
    box.height / 2 - (page.bottom - box.top) - sheetClearance;
};

const locate = (lane: HTMLDivElement, event: PointerEvent) => {
  const box = lane.getBoundingClientRect();
  return {
    isOnLane: event.clientY >= box.top,
    x: event.clientX - box.left - box.width / 2,
    y: box.height / 2 - (event.clientY - box.top),
  };
};

const isInteractive = (target: EventTarget | null) =>
  target instanceof Element && target.closest(interactiveSelector) !== null;

const useFieldPointer = (track: RefObject<HTMLDivElement | null>) => {
  useEffect(() => {
    const lane = track.current;
    if (!lane) {
      return;
    }
    field.lane = lane;
    field.sheets = [...document.querySelectorAll("[data-dossier-sheet]")];
    const { pointer } = field;
    const move = (event: PointerEvent) => {
      const { isOnLane, x, y } = locate(lane, event);
      senseSheet();
      const isInside = isOnLane && !isInsideRect(pointer.sheet, x, y);
      pointer.x = x;
      pointer.y = y;
      pointer.isInside = isInside;
    };
    const leave = () => {
      pointer.isInside = false;
    };
    const press = (event: PointerEvent) => {
      move(event);
      if (pointer.isInside && !isInteractive(event.target)) {
        pointer.pulses.push({ x: pointer.x, y: pointer.y });
      }
    };
    window.addEventListener("pointermove", move, { passive: true });
    window.addEventListener("pointerdown", press, { passive: true });
    document.documentElement.addEventListener("pointerleave", leave);
    window.addEventListener("blur", leave);
    return () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerdown", press);
      document.documentElement.removeEventListener("pointerleave", leave);
      window.removeEventListener("blur", leave);
      field.lane = null;
      field.sheets = [];
    };
  }, [track]);
};

const FieldView = ({ animate }: { animate: boolean }) => (
  <>
    <OrthographicCamera makeDefault position={[0, 0, 10]} />
    <Toner animate={animate} pointer={field.pointer} sense={senseSheet} />
  </>
);

export const GutterField = () => {
  const track = useRef<HTMLDivElement>(null);
  const hasWebGL = useWebGLSupport();
  const isReduced = useReducedMotion();

  useFieldPointer(track);
  useViewSlot(
    "gutter-field",
    track,
    <FieldView animate={!isReduced} />,
    hasWebGL
  );

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-x-0 top-12 bottom-0 hidden xl:block"
      ref={track}
    />
  );
};
