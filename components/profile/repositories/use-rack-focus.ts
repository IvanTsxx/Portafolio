"use client";

import { useEffect, useState } from "react";
import type { RefObject } from "react";

const steps = new Map([
  ["ArrowDown", 1],
  ["ArrowLeft", -1],
  ["ArrowRight", 1],
  ["ArrowUp", -1],
]);

const pickLinkOf = (target: EventTarget | null) =>
  target instanceof Element
    ? target.closest<HTMLAnchorElement>("a[data-pick]")
    : null;

const pickIndexOf = (target: EventTarget | null) => {
  const link = pickLinkOf(target);
  const index = Number(link?.dataset.pick);
  return link && Number.isInteger(index) ? index : null;
};

export const useRackFocus = (
  root: RefObject<HTMLElement | null>,
  initialActive: number
) => {
  const [active, setActive] = useState(initialActive);

  useEffect(() => {
    const element = root.current;
    if (!element) {
      return;
    }
    const show = (event: Event) => {
      const index = pickIndexOf(event.target);
      if (index !== null) {
        setActive(index);
      }
    };
    const showOnMouse = (event: PointerEvent) => {
      if (event.pointerType === "mouse") {
        show(event);
      }
    };
    const step = (event: KeyboardEvent) => {
      const by = steps.get(event.key);
      const link = pickLinkOf(event.target);
      if (by === undefined || !link || event.altKey || event.metaKey) {
        return;
      }
      const links = [
        ...element.querySelectorAll<HTMLAnchorElement>("a[data-pick]"),
      ];
      const position = links.indexOf(link);
      event.preventDefault();
      links[(position + by + links.length) % links.length]?.focus();
    };
    element.addEventListener("focusin", show);
    element.addEventListener("pointerover", showOnMouse);
    element.addEventListener("keydown", step);
    return () => {
      element.removeEventListener("focusin", show);
      element.removeEventListener("pointerover", showOnMouse);
      element.removeEventListener("keydown", step);
    };
  }, [root]);

  return active;
};
