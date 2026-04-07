"use client";

import { motion } from "motion/react";
import { useRef } from "react";

import { FEEDBACKS } from "@/shared/config/feedbacks";

import { FeedbackCard } from "./feedback-card";
import { SectionHeader } from "./section-header";

// Duplicate array for seamless loop
const ITEMS = [...FEEDBACKS, ...FEEDBACKS, ...FEEDBACKS];

export function FeedbacksSection() {
  const isPaused = useRef(false);

  return (
    <section className="max-w-3xl mx-auto px-4 py-6">
      <SectionHeader label="Kind words" />

      {/* Marquee container with edge fade */}
      <div
        className="relative overflow-hidden"
        style={{
          WebkitMaskImage:
            "linear-gradient(to right, transparent 0%, black 10%, black 90%, transparent 100%)",
          maskImage:
            "linear-gradient(to right, transparent 0%, black 10%, black 90%, transparent 100%)",
        }}
        onMouseEnter={() => {
          isPaused.current = true;
        }}
        onMouseLeave={() => {
          isPaused.current = false;
        }}
      >
        <motion.div
          className="flex gap-3"
          animate={{ x: ["0%", "-33.333%"] }}
          transition={{
            duration: 30,
            ease: "linear",
            repeat: Infinity,
            repeatType: "loop",
          }}
          style={{ width: "max-content" }}
          whileHover={{ animationPlayState: "paused" } as never}
        >
          {ITEMS.map((feedback, i) => (
            <FeedbackCard key={`${feedback.id}-${i}`} feedback={feedback} />
          ))}
        </motion.div>
      </div>
    </section>
  );
}
