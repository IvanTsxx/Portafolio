// oxlint-disable promise/prefer-await-to-then
"use client";

import { motion } from "motion/react";
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
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.2, duration: 0.4 }}
      className="w-full md:w-auto"
    >
      <section className="flex w-full md:w-auto flex-row items-center justify-between">
        <span>{totalVisits?.toLocaleString("en-US")} visitors</span>

        <span>You are visitor #{visitorNumber.toLocaleString("en-US")}</span>
      </section>
    </motion.section>
  );
}
