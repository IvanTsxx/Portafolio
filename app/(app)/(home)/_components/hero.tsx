import { Suspense } from "react";

import { Skeleton } from "@/shared/components/ui/skeleton";

import { getVisitorData } from "../_actions";
import { HeroEntrance } from "./hero-entrance";
import { HeroInfoMiddle } from "./hero-info-middle";
import { HeroSocial } from "./hero-social";
import { VisitTracker } from "./visit-tracker";

export function Hero() {
  return (
    <HeroEntrance>
      {/* Identity block */}
      <HeroInfoMiddle />

      {/* Visitor count */}
      <Suspense
        fallback={
          <div
            data-hero-visitors
            className="w-full flex items-center justify-between font-mono text-xs text-muted-foreground"
          >
            <div className="flex items-center gap-2">
              <Skeleton className="h-3.5 w-8" />
              <span>visitors</span>
            </div>
            <div className="flex items-center gap-2">
              <span>visitor #</span>
              <Skeleton className="h-3.5 w-8" />
            </div>
          </div>
        }
      >
        <VisitTrackerContent />
      </Suspense>

      {/* Social links */}
      <HeroSocial />
    </HeroEntrance>
  );
}

async function VisitTrackerContent() {
  const { visitorNumber, totalVisits } = await getVisitorData();
  return (
    <div data-hero-visitors>
      <VisitTracker totalVisits={totalVisits} visitorNumber={visitorNumber} />
    </div>
  );
}
