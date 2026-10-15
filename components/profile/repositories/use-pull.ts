"use client";

import { useEffect, useRef, useState } from "react";
import type { RefObject } from "react";

import { useReducedMotion } from "@/hooks/use-reduced-motion";

import { opensElsewhere } from "./opens-elsewhere";
import { useRackFocus } from "./use-rack-focus";

const pickOf = (target: EventTarget | null) =>
  target instanceof Element
    ? target.closest<HTMLAnchorElement>("a[data-pick]")
    : null;

const pickLinksOf = (element: HTMLElement) => [
  ...element.querySelectorAll<HTMLAnchorElement>("a[data-pick]"),
];

const isInDialog = (target: EventTarget | null) =>
  target instanceof Element && target.closest("[role=dialog]") !== null;

const isOutOfView = (element: Element) => {
  const box = element.getBoundingClientRect();
  return box.top < 0 || box.bottom > window.innerHeight;
};

export const usePull = (
  root: RefObject<HTMLElement | null>,
  rest: number | null
) => {
  const active = useRackFocus(root, rest, "pick");
  const [open, setOpen] = useState<number | null>(null);
  const openRef = useRef(open);
  const isReduced = useReducedMotion();

  useEffect(() => {
    openRef.current = open;
    const element = root.current;
    if (!element) {
      return;
    }
    for (const link of pickLinksOf(element)) {
      link.setAttribute(
        "aria-expanded",
        String(Number(link.dataset.pick) === open)
      );
    }
    const reveal = element.querySelector("[data-reveal]");
    if (open !== null && reveal && isOutOfView(reveal)) {
      reveal.scrollIntoView({
        behavior: isReduced ? "auto" : "smooth",
        block: "nearest",
      });
    }
  }, [root, open, isReduced]);

  useEffect(() => {
    const element = root.current;
    if (!element) {
      return;
    }
    const toggle = (link: HTMLAnchorElement) => {
      const index = Number(link.dataset.pick);
      setOpen((current) => (current === index ? null : index));
    };
    const putBack = () => {
      const index = openRef.current;
      if (index === null) {
        return;
      }
      setOpen(null);
      pickLinksOf(element)
        .find((link) => Number(link.dataset.pick) === index)
        ?.focus({ preventScroll: true });
    };
    const onClick = (event: MouseEvent) => {
      if (
        event.target instanceof Element &&
        event.target.closest("[data-put-back]")
      ) {
        putBack();
        return;
      }
      const link = pickOf(event.target);
      if (!link || opensElsewhere(event)) {
        return;
      }
      event.preventDefault();
      toggle(link);
    };
    const onSpace = (event: KeyboardEvent) => {
      const link = pickOf(event.target);
      if (link && event.key === " ") {
        event.preventDefault();
        toggle(link);
      }
    };
    const onEscape = (event: KeyboardEvent) => {
      if (
        event.key === "Escape" &&
        openRef.current !== null &&
        !isInDialog(event.target)
      ) {
        putBack();
      }
    };
    element.addEventListener("click", onClick);
    element.addEventListener("keydown", onSpace);
    document.addEventListener("keydown", onEscape);
    return () => {
      element.removeEventListener("click", onClick);
      element.removeEventListener("keydown", onSpace);
      document.removeEventListener("keydown", onEscape);
    };
  }, [root]);

  return { active, open };
};
