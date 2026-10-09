import type { ComponentProps } from "react";

import { cn } from "@/lib/utils";

export const Steps = ({ className, ...props }: ComponentProps<"ol">) => (
  <ol
    className={cn(
      "border-rule-strong my-8 ml-3.5 list-none border-l [counter-reset:step]",
      className
    )}
    {...props}
  />
);

export interface StepProps extends Omit<ComponentProps<"li">, "title"> {
  title: string;
}

export const Step = ({ children, className, title, ...props }: StepProps) => (
  <li
    className={cn(
      "before:border-rule-strong before:bg-background before:text-muted-foreground relative pb-8 pl-8 [counter-increment:step] before:absolute before:top-0 before:-left-3.5 before:grid before:size-7 before:place-items-center before:border before:font-mono before:text-xs before:content-[counter(step)] last:pb-0",
      className
    )}
    {...props}
  >
    <p className="text-foreground text-lg leading-7 font-semibold">{title}</p>
    <div className="text-foreground/90 [&_p]:text-base/7 [&>*]:my-0 [&>*+*]:mt-3">
      {children}
    </div>
  </li>
);
