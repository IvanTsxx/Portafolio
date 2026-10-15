"use client";

import { useEffect, useState } from "react";
import type { RefObject } from "react";

const steps = new Map([
  ["ArrowDown", 1],
  ["ArrowLeft", -1],
  ["ArrowRight", 1],
  ["ArrowUp", -1],
]);

export type RackKey = "file" | "pick";

const rackLinkOf = (target: EventTarget | null, key: RackKey) =>
  target instanceof Element
    ? target.closest<HTMLAnchorElement>(`a[data-${key}]`)
    : null;

const rackIndexOf = (target: EventTarget | null, key: RackKey) => {
  const link = rackLinkOf(target, key);
  const index = Number(link?.dataset[key]);
  return link && Number.isInteger(index) ? index : null;
};

export const useRackFocus = (
  root: RefObject<HTMLElement | null>,
  rest: number | null,
  key: RackKey = "file"
) => {
  const [active, setActive] = useState<number | null>(rest);

  useEffect(() => {
    const element = root.current;
    if (!element) {
      return;
    }
    const show = (event: Event) => {
      const index = rackIndexOf(event.target, key);
      if (index !== null) {
        setActive(index);
      }
    };
    const showOnMouse = (event: PointerEvent) => {
      if (event.pointerType === "mouse") {
        show(event);
      }
    };
    const settleOnLeave = (event: PointerEvent) => {
      if (
        rest === null &&
        event.pointerType === "mouse" &&
        !element.contains(document.activeElement)
      ) {
        setActive(null);
      }
    };
    const settleOnBlur = (event: FocusEvent) => {
      const next = event.relatedTarget;
      if (
        rest === null &&
        !(next instanceof Node && element.contains(next)) &&
        !element.matches(":hover")
      ) {
        setActive(null);
      }
    };
    const step = (event: KeyboardEvent) => {
      const by = steps.get(event.key);
      const link = rackLinkOf(event.target, key);
      if (by === undefined || !link || event.altKey || event.metaKey) {
        return;
      }
      const links = [
        ...element.querySelectorAll<HTMLAnchorElement>(`a[data-${key}]`),
      ];
      const position = links.indexOf(link);
      event.preventDefault();
      links[(position + by + links.length) % links.length]?.focus();
    };
    element.addEventListener("focusin", show);
    element.addEventListener("focusout", settleOnBlur);
    element.addEventListener("pointerover", showOnMouse);
    element.addEventListener("pointerleave", settleOnLeave);
    element.addEventListener("keydown", step);
    return () => {
      element.removeEventListener("focusin", show);
      element.removeEventListener("focusout", settleOnBlur);
      element.removeEventListener("pointerover", showOnMouse);
      element.removeEventListener("pointerleave", settleOnLeave);
      element.removeEventListener("keydown", step);
    };
  }, [root, rest, key]);

  return active;
};
