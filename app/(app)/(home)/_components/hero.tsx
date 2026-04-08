import { Suspense } from "react";

import { Skeleton } from "@/shared/components/ui/skeleton";

import { getVisitorData } from "../_actions";
import { Avatar } from "./avatar";
import { HeroInfoFlip } from "./hero-info-flip";
import { HeroInfoTop } from "./hero-info-header";
import { HeroInfoMiddle } from "./hero-info-middle";
import { HeroSocial } from "./hero-social";
import { VisitTracker } from "./visit-tracker";

// ─── Avatar with shimmer border on hover ──────────────────────────────────────

export function Hero() {
  return (
    <section>
      {/* Top section */}
      <div className="flex  gap-6 pb-6 md:flex-row md:gap-8">
        {/* Avatar */}

        <Avatar />

        {/* Info */}
        <div className="flex flex-col justify-center gap-2">
          <HeroInfoTop />

          <HeroInfoMiddle />

          <HeroInfoFlip />

          <Suspense
            fallback={
              <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Skeleton className="h-6 w-24" />
                </div>

                <div className="flex items-center gap-2 text-muted-foreground">
                  <Skeleton className="h-6 w-24" />
                </div>
              </div>
            }
          >
            <VisitTrackerContent />
          </Suspense>
        </div>
      </div>

      {/* Social */}
      <HeroSocial />
    </section>
  );
}

async function VisitTrackerContent() {
  const { visitorNumber, totalVisits } = await getVisitorData();
  return (
    <VisitTracker totalVisits={totalVisits} visitorNumber={visitorNumber} />
  );
}
