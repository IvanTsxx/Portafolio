"use client";

import { Dialog } from "@base-ui/react/dialog";
import { useEffect, useEffectEvent, useMemo, useRef, useState } from "react";
import type { ReactNode, RefObject } from "react";

import type { DossierFile } from "@/components/profile/dossier-file";
import { FigurePlate, FigureReadout } from "@/components/profile/figure-plate";
import { FileModal } from "@/components/profile/file-modal";
import { useBuildHeld } from "@/components/scene/build-hold";
import { useReducedMotion } from "@/hooks/use-reduced-motion";

export interface PickerEntry {
  file: DossierFile;
  lead: string;
  trail: string;
}

const TOUR_FIRST_MS = 1800;
const TOUR_EVERY_MS = 3400;
const QUIET_MS = 4200;

const itemOf = (target: EventTarget | null) => {
  const element = target instanceof Element ? target : null;
  const item = element?.closest<SVGAElement>("[data-item]");
  const index = Number(item?.dataset.item);
  return item && Number.isInteger(index) ? { index, item } : null;
};

const opensElsewhere = (event: MouseEvent) =>
  event.metaKey || event.ctrlKey || event.shiftKey || event.button !== 0;

const stepKeys = new Map([
  ["ArrowDown", 1],
  ["ArrowLeft", -1],
  ["ArrowRight", 1],
  ["ArrowUp", -1],
]);

const useInView = (node: RefObject<HTMLElement | null>) => {
  const [isVisible, setIsVisible] = useState(false);
  useEffect(() => {
    const element = node.current;
    if (!element) {
      return;
    }
    const sight = new IntersectionObserver(
      (entries) => setIsVisible(Boolean(entries.at(-1)?.isIntersecting)),
      { rootMargin: "80px 0px" }
    );
    sight.observe(element);
    return () => sight.disconnect();
  }, [node]);
  return isVisible;
};

const markActive = (root: HTMLElement | null, active: number | null) => {
  if (!root) {
    return;
  }
  for (const item of root.querySelectorAll<SVGAElement>("[data-item]")) {
    item.toggleAttribute("data-active", Number(item.dataset.item) === active);
  }
};

const visibleItems = (root: HTMLElement | null) =>
  [...(root?.querySelectorAll<SVGAElement>("[data-item]") ?? [])].filter(
    (item) => item.getClientRects().length > 0
  );

export const IsoPicker = ({
  entries,
  label,
  rest,
  tall,
  wide,
}: {
  entries: readonly PickerEntry[];
  label: string;
  rest: { lead: string; trail: string };
  tall: ReactNode;
  wide: ReactNode;
}) => {
  const root = useRef<HTMLElement>(null);
  const lastTouch = useRef(0);
  const handle = useMemo(() => Dialog.createHandle<DossierFile>(), []);
  const [active, setActive] = useState<number | null>(null);
  const [isEngaged, setIsEngaged] = useState(false);
  const isReduced = useReducedMotion();
  const isVisible = useInView(root);
  const isHeld = useBuildHeld(root);
  const isTouring = isVisible && !isReduced && !isEngaged && !isHeld;
  const shown = active === null ? null : entries[active];

  useEffect(() => {
    markActive(root.current, active);
  }, [active]);

  const advance = useEffectEvent(() => {
    if (performance.now() - lastTouch.current < QUIET_MS) {
      return;
    }
    setActive((current) =>
      current === null || current >= entries.length - 1 ? 0 : current + 1
    );
  });

  useEffect(() => {
    if (!isTouring || entries.length === 0) {
      return;
    }
    let interval = 0;
    const first = window.setTimeout(() => {
      advance();
      interval = window.setInterval(advance, TOUR_EVERY_MS);
    }, TOUR_FIRST_MS);
    return () => {
      window.clearTimeout(first);
      window.clearInterval(interval);
    };
  }, [isTouring, entries.length]);

  const release = useEffectEvent(() => {
    lastTouch.current = performance.now();
    setIsEngaged(false);
  });

  const engage = useEffectEvent((index: number) => {
    lastTouch.current = performance.now();
    setIsEngaged(true);
    setActive(index);
  });

  const open = useEffectEvent((event: MouseEvent) => {
    const hit = itemOf(event.target);
    const entry = hit ? entries[hit.index] : undefined;
    if (!entry || opensElsewhere(event)) {
      return;
    }
    event.preventDefault();
    handle.openWithPayload(entry.file);
  });

  useEffect(() => {
    const element = root.current;
    if (!element) {
      return;
    }
    const onFocusIn = (event: FocusEvent) => {
      const hit = itemOf(event.target);
      if (hit) {
        engage(hit.index);
      }
    };
    const onFocusOut = (event: FocusEvent) => {
      const next = event.relatedTarget;
      if (!(next instanceof Node && element.contains(next))) {
        release();
      }
    };
    const onPointerOver = (event: PointerEvent) => {
      const hit = event.pointerType === "mouse" ? itemOf(event.target) : null;
      if (hit) {
        engage(hit.index);
      }
    };
    const onKeyDown = (event: KeyboardEvent) => {
      const hit = itemOf(event.target);
      const by = stepKeys.get(event.key);
      if (!hit || by === undefined) {
        return;
      }
      event.preventDefault();
      const items = visibleItems(element);
      const at = items.indexOf(hit.item);
      items[(at + by + items.length) % items.length]?.focus();
    };
    element.addEventListener("click", open);
    element.addEventListener("focusin", onFocusIn);
    element.addEventListener("focusout", onFocusOut);
    element.addEventListener("pointerover", onPointerOver);
    element.addEventListener("pointerleave", release);
    element.addEventListener("keydown", onKeyDown);
    return () => {
      element.removeEventListener("click", open);
      element.removeEventListener("focusin", onFocusIn);
      element.removeEventListener("focusout", onFocusOut);
      element.removeEventListener("pointerover", onPointerOver);
      element.removeEventListener("pointerleave", release);
      element.removeEventListener("keydown", onKeyDown);
    };
  }, []);

  return (
    <>
      <figure
        aria-label={label}
        className="iso m-0"
        data-build-block
        data-running={isVisible && !isReduced ? "" : undefined}
        ref={root}
      >
        <FigurePlate
          readout={
            <FigureReadout
              lead={shown?.lead ?? rest.lead}
              swapKey={active === null ? "rest" : String(active)}
              trail={shown?.trail ?? rest.trail}
            />
          }
        >
          <div className="hidden lg:block">{wide}</div>
          <div className="mx-auto max-w-sm lg:hidden">{tall}</div>
        </FigurePlate>
      </figure>
      <FileModal handle={handle} />
    </>
  );
};
