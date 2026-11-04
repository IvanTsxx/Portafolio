"use client";

import {
  createContext,
  use,
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";
import type {
  ComponentProps,
  CSSProperties,
  PointerEvent as ReactPointerEvent,
  ReactNode,
  RefObject,
} from "react";

import { cn } from "@/lib/utils";
import { usePrefersReducedMotion } from "@/registry/ivan/hooks/use-prefers-reduced-motion";
import { foldCorner, restingTip } from "@/registry/ivan/lib/page-fold";

import {
  createPeelController,
  flapShadeSpan,
  peelLegs,
  undersideShadeSpan,
} from "./peel-controller";
import type { PeelController, PeelHandle } from "./peel-controller";

type PeelScope = "viewport" | "container";

interface PagePeelContextValue {
  isOpen: boolean;
  toggle: () => void;
  undersideId: string;
}

const PagePeelContext = createContext<PagePeelContextValue | null>(null);

const positionClassNames: Record<PeelScope, string> = {
  container: "absolute",
  viewport: "fixed",
};

const restLeg = `${peelLegs.corner.rest}px`;
const foldLeg = `${peelLegs.fold.rest}px`;
const referenceStage = { height: 1000, width: 1000 };
const restFold = foldCorner(
  referenceStage,
  restingTip(referenceStage, peelLegs.corner.rest)
);
const restAnchor = `translate(${restFold.midpoint.x - referenceStage.width}px, ${restFold.midpoint.y - referenceStage.height}px)`;

const undersideStyle: CSSProperties = {
  clipPath: `polygon(100% calc(100% - ${restLeg}), 100% 100%, calc(100% - ${restLeg}) 100%)`,
};

const flapStyle: CSSProperties = {
  backgroundColor:
    "color-mix(in oklch, var(--background) 92%, var(--foreground))",
  clipPath: `polygon(100% calc(100% - ${restLeg}), calc(100% - ${restLeg}) calc(100% - ${restLeg}), calc(100% - ${restLeg}) 100%)`,
};

const flapShadeStyle: CSSProperties = {
  backgroundImage:
    "linear-gradient(to right, color-mix(in oklch, var(--background) 74%, black) 0%, color-mix(in oklch, var(--background) 86%, white) 6%, color-mix(in oklch, var(--background) 95%, var(--foreground)) 38%, color-mix(in oklch, var(--background) 86%, var(--foreground)) 100%)",
  height: "300vmax",
  left: "100%",
  top: "100%",
  transform: `${restAnchor} rotate(${restFold.angle}rad) scaleX(${restFold.depth / flapShadeSpan}) translateY(-50%)`,
  transformOrigin: "0 0",
  width: flapShadeSpan,
};

const undersideShadeStyle: CSSProperties = {
  backgroundImage: "linear-gradient(to right, rgb(0 0 0 / 0.32), transparent)",
  height: "300vmax",
  left: "100%",
  top: "100%",
  transform: `${restAnchor} rotate(${restFold.angle + Math.PI}rad) scaleX(${Math.min(1, restFold.depth / undersideShadeSpan)}) translateY(-50%)`,
  transformOrigin: "0 0",
  width: undersideShadeSpan,
};

const foldHandleStyle: CSSProperties = {
  clipPath: `polygon(0 0, ${foldLeg} 0, 0 ${foldLeg})`,
};

const handleClassNames: Record<PeelHandle, string> = {
  corner: "right-0 bottom-0 size-12",
  fold: "top-0 left-0 size-20",
};

const pointerOf = (event: ReactPointerEvent) => ({
  clientX: event.clientX,
  clientY: event.clientY,
  timeStamp: event.timeStamp,
});

const setDragCursor = (isDragging: boolean) => {
  const root = document.documentElement.style;
  root.cursor = isDragging ? "grabbing" : "";
  root.userSelect = isDragging ? "none" : "";
};

export const usePagePeel = () => {
  const context = use(PagePeelContext);
  if (!context) {
    throw new Error("usePagePeel must be used inside PagePeel");
  }
  return context;
};

const useScrollLock = (isLocked: boolean) => {
  useEffect(() => {
    if (!isLocked) {
      return;
    }
    const root = document.documentElement;
    const previous = root.style.overflow;
    root.style.overflow = "hidden";
    return () => {
      root.style.overflow = previous;
    };
  }, [isLocked]);
};

const useOpenFocus = (
  isOpen: boolean,
  undersideRef: RefObject<HTMLElement | null>,
  returnFocusRef: RefObject<HTMLElement | null>,
  controllerRef: RefObject<PeelController | null>
) => {
  useEffect(() => {
    if (!isOpen) {
      const target = returnFocusRef.current;
      returnFocusRef.current = null;
      if (target?.isConnected) {
        target.focus({ preventScroll: true });
      }
      return;
    }
    undersideRef.current?.focus({ preventScroll: true });
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        controllerRef.current?.close();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, undersideRef, returnFocusRef, controllerRef]);
};

const PeelHandleArea = ({
  controllerRef,
  handle,
  isHidden,
  position,
  undersideRef,
}: {
  controllerRef: RefObject<PeelController | null>;
  handle: PeelHandle;
  isHidden: boolean;
  position: string;
  undersideRef: RefObject<HTMLElement | null>;
}) => {
  const handlePointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.button !== 0) {
      return;
    }
    const box = undersideRef.current?.getBoundingClientRect();
    const origin = { x: box?.left ?? 0, y: box?.top ?? 0 };
    if (controllerRef.current?.pointerDown(handle, pointerOf(event), origin)) {
      event.preventDefault();
      event.currentTarget.setPointerCapture(event.pointerId);
      setDragCursor(true);
    }
  };
  const handlePointerUp = (event: ReactPointerEvent<HTMLDivElement>) => {
    setDragCursor(false);
    controllerRef.current?.pointerUp(pointerOf(event));
  };
  const handlePointerCancel = () => {
    setDragCursor(false);
    controllerRef.current?.pointerCancel();
  };
  const handleHover =
    (isOver: boolean) => (event: ReactPointerEvent<HTMLDivElement>) => {
      if (event.pointerType !== "touch") {
        controllerRef.current?.hover(handle, isOver);
      }
    };
  return (
    <div
      aria-hidden
      className={cn(
        position,
        handleClassNames[handle],
        "z-50 cursor-grab touch-none select-none active:cursor-grabbing",
        isHidden && "hidden"
      )}
      data-page-peel-handle={handle}
      onPointerCancel={handlePointerCancel}
      onPointerDown={handlePointerDown}
      onPointerEnter={handleHover(true)}
      onPointerLeave={handleHover(false)}
      onPointerMove={(event) =>
        controllerRef.current?.pointerMove(pointerOf(event))
      }
      onPointerUp={handlePointerUp}
      style={handle === "fold" ? foldHandleStyle : undefined}
    />
  );
};

export interface PagePeelProps {
  children: ReactNode;
  className?: string;
  openAt?: number;
  scope?: PeelScope;
  underside: ReactNode;
  undersideClassName?: string;
  undersideLabel?: string;
}

export const PagePeel = ({
  children,
  className,
  openAt = 0.25,
  scope = "viewport",
  underside,
  undersideClassName,
  undersideLabel = "Underside",
}: PagePeelProps) => {
  const undersideId = useId();
  const isReduced = usePrefersReducedMotion();
  const [isOpen, setIsOpen] = useState(false);
  const undersideRef = useRef<HTMLElement>(null);
  const undersideShadeRef = useRef<HTMLDivElement>(null);
  const flapRef = useRef<HTMLDivElement>(null);
  const flapShadeRef = useRef<HTMLDivElement>(null);
  const returnFocusRef = useRef<HTMLElement>(null);
  const controllerRef = useRef<PeelController>(null);
  const isReducedRef = useRef(isReduced);
  const openAtRef = useRef(openAt);

  useEffect(() => {
    isReducedRef.current = isReduced;
    openAtRef.current = openAt;
  }, [isReduced, openAt]);

  useEffect(() => {
    const undersideLayer = undersideRef.current;
    const undersideShade = undersideShadeRef.current;
    const flap = flapRef.current;
    const flapShade = flapShadeRef.current;
    if (!undersideLayer || !undersideShade || !flap || !flapShade) {
      return;
    }
    const controller = createPeelController(
      { flap, flapShade, underside: undersideLayer, undersideShade },
      {
        isReduced: () => isReducedRef.current,
        onOpenChange: setIsOpen,
        openAt: () => openAtRef.current,
      }
    );
    controllerRef.current = controller;
    controller.measure();
    const observer = new ResizeObserver(controller.measure);
    observer.observe(undersideLayer);
    return () => {
      observer.disconnect();
      controller.dispose();
      controllerRef.current = null;
    };
  }, []);

  useScrollLock(isOpen && scope === "viewport");
  useOpenFocus(isOpen, undersideRef, returnFocusRef, controllerRef);

  const toggle = useCallback(() => {
    if (document.activeElement instanceof HTMLElement) {
      returnFocusRef.current = document.activeElement;
    }
    controllerRef.current?.toggle();
  }, []);

  const contextValue = useMemo(
    () => ({ isOpen, toggle, undersideId }),
    [isOpen, toggle, undersideId]
  );

  const position = positionClassNames[scope];

  const layers = (
    <>
      <section
        aria-hidden={!isOpen}
        aria-label={undersideLabel}
        className={cn(
          position,
          "inset-0 z-45 overflow-hidden outline-none",
          isOpen ? "pointer-events-auto" : "pointer-events-none",
          undersideClassName
        )}
        id={undersideId}
        inert={!isOpen}
        ref={undersideRef}
        style={undersideStyle}
        tabIndex={-1}
      >
        <div className="absolute inset-0 overflow-y-auto overscroll-contain">
          {underside}
        </div>
        <div
          aria-hidden
          className="pointer-events-none absolute"
          ref={undersideShadeRef}
          style={undersideShadeStyle}
        />
      </section>
      <div
        aria-hidden
        className={cn(position, "pointer-events-none inset-0 z-50")}
        ref={flapRef}
        style={flapStyle}
      >
        <div className="absolute" ref={flapShadeRef} style={flapShadeStyle} />
      </div>
      <PeelHandleArea
        controllerRef={controllerRef}
        handle="corner"
        isHidden={isOpen}
        position={position}
        undersideRef={undersideRef}
      />
      <PeelHandleArea
        controllerRef={controllerRef}
        handle="fold"
        isHidden={!isOpen}
        position={position}
        undersideRef={undersideRef}
      />
    </>
  );

  if (scope === "container") {
    return (
      <PagePeelContext value={contextValue}>
        <div className={cn("relative isolate overflow-hidden", className)}>
          <div className="h-full" inert={isOpen}>
            {children}
          </div>
          {layers}
        </div>
      </PagePeelContext>
    );
  }

  return (
    <PagePeelContext value={contextValue}>
      <div className={className} inert={isOpen}>
        {children}
      </div>
      {layers}
    </PagePeelContext>
  );
};

export const PagePeelTrigger = ({
  children = "View the underside",
  className,
  ...props
}: Omit<ComponentProps<"button">, "onClick" | "type">) => {
  const { isOpen, toggle, undersideId } = usePagePeel();
  return (
    <button
      aria-controls={undersideId}
      aria-expanded={isOpen}
      className={className}
      onClick={toggle}
      type="button"
      {...props}
    >
      {children}
    </button>
  );
};
