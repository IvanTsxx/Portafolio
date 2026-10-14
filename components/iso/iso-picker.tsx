"use client";

import { Dialog } from "@base-ui/react/dialog";
import { useEffect, useEffectEvent, useRef, useState } from "react";
import type {
  FocusEvent,
  KeyboardEvent,
  MouseEvent,
  PointerEvent,
  ReactNode,
  RefObject,
} from "react";

import type { DossierFile } from "@/components/profile/dossier-file";
import { FigurePlate, FigureReadout } from "@/components/profile/figure-plate";
import { FileModal } from "@/components/profile/file-modal";
import { useBuildHeld } from "@/components/scene/build-hold";
import { useReducedMotion } from "@/hooks/use-reduced-motion";

export interface PickerEntry {
  file: DossierFile;
  href: string | null;
  lead: string;
  trail: string;
}

const TOUR_FIRST_MS = 1800;
const TOUR_EVERY_MS = 3400;
const QUIET_MS = 4200;

const itemOf = (target: EventTarget | null) => {
  const element = target instanceof Element ? target : null;
  const item = element?.closest<SVGGElement>("[data-item]");
  const index = Number(item?.dataset.item);
  return item && Number.isInteger(index) ? { index, item } : null;
};

const opensInNewTab = (event: MouseEvent) =>
  event.metaKey || event.ctrlKey || event.shiftKey || event.button === 1;

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
  for (const item of root.querySelectorAll<SVGGElement>("[data-item]")) {
    item.toggleAttribute("data-active", Number(item.dataset.item) === active);
  }
};

const visibleItems = (root: HTMLElement | null) =>
  [...(root?.querySelectorAll<SVGGElement>("[data-item]") ?? [])].filter(
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
  const [handle] = useState(() => Dialog.createHandle<DossierFile>());
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

  const touch = () => {
    lastTouch.current = performance.now();
  };

  const open = (index: number, event?: MouseEvent) => {
    const entry = entries[index];
    if (!entry) {
      return;
    }
    if (event && entry.href && opensInNewTab(event)) {
      window.open(entry.href, "_blank", "noopener,noreferrer");
      return;
    }
    handle.openWithPayload(entry.file);
  };

  const engage = (index: number) => {
    touch();
    setIsEngaged(true);
    setActive(index);
  };

  const step = (from: SVGGElement, by: number) => {
    const items = visibleItems(root.current);
    const at = items.indexOf(from);
    items[(at + by + items.length) % items.length]?.focus();
  };

  const onKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    const hit = itemOf(event.target);
    if (!hit) {
      return;
    }
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      open(hit.index);
    } else if (event.key === "ArrowRight" || event.key === "ArrowDown") {
      event.preventDefault();
      step(hit.item, 1);
    } else if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
      event.preventDefault();
      step(hit.item, -1);
    }
  };

  return (
    <>
      <figure
        aria-label={label}
        className="iso m-0"
        data-build-block
        data-running={isVisible && !isReduced ? "" : undefined}
        onBlur={(event: FocusEvent<HTMLElement>) => {
          if (!event.currentTarget.contains(event.relatedTarget)) {
            setIsEngaged(false);
            touch();
          }
        }}
        onClick={(event) => {
          const hit = itemOf(event.target);
          if (hit) {
            open(hit.index, event);
          }
        }}
        onFocus={(event) => {
          const hit = itemOf(event.target);
          if (hit) {
            engage(hit.index);
          }
        }}
        onKeyDown={onKeyDown}
        onPointerLeave={() => {
          setIsEngaged(false);
          touch();
        }}
        onPointerOver={(event: PointerEvent<HTMLElement>) => {
          if (event.pointerType !== "mouse") {
            return;
          }
          const hit = itemOf(event.target);
          if (hit) {
            engage(hit.index);
          }
        }}
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
