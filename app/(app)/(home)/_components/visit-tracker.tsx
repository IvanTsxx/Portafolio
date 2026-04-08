// oxlint-disable promise/prefer-await-to-then
"use client";

import { useEffect, useState } from "react";

import { registerNewVisitor } from "../_actions";

export function VisitTracker({
  visitorNumber: initialVisitorNumber,
  totalVisits,
}: {
  visitorNumber: number | null;
  totalVisits: number;
}) {
  const [visitorNumber, setVisitorNumber] = useState(initialVisitorNumber ?? 0);

  useEffect(() => {
    if (initialVisitorNumber !== null) return;

    registerNewVisitor().then(({ visitorNumber: num }) => {
      setVisitorNumber(num);
    });
  }, [initialVisitorNumber]);

  if (initialVisitorNumber === null && visitorNumber === 0) {
    return null;
  }

  return (
    <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between">
      <div className="flex items-center gap-2 text-muted-foreground">
        <span>{totalVisits?.toLocaleString("en-US")} visitors</span>
      </div>

      <div className="flex items-center gap-2 text-muted-foreground">
        <span>You are visitor #{visitorNumber.toLocaleString("en-US")}</span>
      </div>
    </div>
  );
}
