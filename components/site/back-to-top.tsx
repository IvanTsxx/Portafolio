import { ArrowUpIcon } from "@phosphor-icons/react/ssr";

import { technicalButtonVariants } from "@/components/site/styles";
import { cn } from "@/lib/utils";

export const BackToTop = () => (
  <a
    aria-label="Back to top"
    className={cn(
      technicalButtonVariants({ size: "sm" }),
      "scroll-reveal w-8 px-0"
    )}
    href="#top"
  >
    <ArrowUpIcon aria-hidden className="size-4" />
  </a>
);
