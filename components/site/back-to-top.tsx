import { ArrowUpIcon } from "@phosphor-icons/react/ssr";

import { technicalButtonVariants } from "@/components/site/styles";
import { cn } from "@/lib/utils";

export const BackToTop = () => (
  <div className="pointer-events-none absolute inset-y-0 -left-2 z-40 flex w-16 flex-col items-start overflow-clip pl-2.5">
    <a
      aria-label="Back to top"
      className={cn(
        technicalButtonVariants(),
        "scroll-dock scroll-reveal bg-paper pointer-events-auto size-11 px-0"
      )}
      href="#top"
    >
      <ArrowUpIcon aria-hidden className="size-4" />
    </a>
  </div>
);
