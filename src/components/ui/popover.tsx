"use client";
import { Popover as Primitive } from "@base-ui/react/popover";
import React from "react";
import { cn } from "../../lib/cn";

const Popover = Primitive.Root;

const PopoverTrigger = Primitive.Trigger;

const PopoverContent = React.forwardRef<
  React.ComponentRef<typeof Primitive.Popup>,
  React.ComponentPropsWithoutRef<typeof Primitive.Popup> &
    Pick<Primitive.Positioner.Props, "sideOffset" | "align">
>(({ className, align = "center", sideOffset = 4, ...props }, ref) => (
  <Primitive.Portal>
    <Primitive.Positioner
      align={align}
      className="z-50"
      side="bottom"
      sideOffset={sideOffset}
    >
      <Primitive.Popup
        className={(s) =>
          cn(
            "z-50 max-h-(--available-height) min-w-[240px] max-w-[98vw] origin-(--transform-origin) overflow-y-auto rounded-xl border bg-fd-popover/60 p-2 text-fd-popover-foreground text-sm shadow-lg backdrop-blur-lg focus-visible:outline-none data-closed:animate-fd-popover-out data-open:animate-fd-popover-in",
            typeof className === "function" ? className(s) : className
          )
        }
        ref={ref}
        {...props}
      />
    </Primitive.Positioner>
  </Primitive.Portal>
));
PopoverContent.displayName = Primitive.Popup.displayName;

const PopoverClose = Primitive.Close;

export { Popover, PopoverTrigger, PopoverContent, PopoverClose };
