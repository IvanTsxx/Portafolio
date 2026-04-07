"use client";

import { motion, useMotionValue, useSpring, useTransform } from "motion/react";
import { useEffect, useState } from "react";

export default function AnimatedCounter({
  value = 0,
  suffix = "",
  prefix = "",
}: {
  value?: number;
  suffix?: string;
  prefix?: string;
}) {
  const motionValue = useMotionValue(value);
  const springValue = useSpring(motionValue, { stiffness: 75, damping: 15 });
  const [display, setDisplay] = useState(value);

  useEffect(() => {
    const unsubscribe = springValue.on("change", (latest) => {
      setDisplay(Math.round(latest));
    });
    return unsubscribe;
  }, [springValue]);

  return (
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="inline-flex items-center justify-center tabular-nums"
    >
      <span className="text-4xl font-bold tracking-tight text-zinc-900 dark:text-white">
        {prefix}
      </span>
      <span className="text-4xl font-bold tracking-tight text-zinc-900 dark:text-white">
        {display.toLocaleString()}
      </span>
      <span className="text-4xl font-bold tracking-tight text-zinc-900 dark:text-white">
        {suffix}
      </span>
    </motion.div>
  );
}