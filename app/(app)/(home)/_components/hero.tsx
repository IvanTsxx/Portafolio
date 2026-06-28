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
      <section className="flex flex-col w-full justify-center gap-y-2">
        <HeroInfoMiddle />

        <Suspense
          fallback={
            <section className="w-full md:w-auto">
              <section className="flex w-full md:w-auto flex-row items-center justify-between">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Skeleton className="h-5 rounded-full w-10" /> Visitors
                </div>

                <div className="flex items-center gap-2 text-muted-foreground">
                  You are visitor #
                  <Skeleton className="h-5 rounded-full w-10" />
                </div>
              </section>
            </section>
          }
        >
          <VisitTrackerContent />
        </Suspense>
      </section>

      <HeroSocial />
    </HeroEntrance>
  );
}

async function VisitTrackerContent() {
  const { visitorNumber, totalVisits } = await getVisitorData();
  return (
    <VisitTracker totalVisits={totalVisits} visitorNumber={visitorNumber} />
  );
}
