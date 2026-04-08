"use client";

import { motion } from "motion/react";
import Image from "next/image";
import { useState } from "react";

export function Avatar() {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
      className="shrink-0"
    >
      <div
        className="relative w-fit"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Shimmer border layer */}
        <motion.div
          className="absolute rounded-full blur-sm -inset-[2px] z-0"
          initial={{ background: "rgba(0,0,0,0)" }}
          animate={
            isHovered
              ? {
                  background: [
                    "linear-gradient(0deg, #22c55e, #ffffff, #22c55e)",
                    "linear-gradient(180deg, #22c55e, #ffffff, #22c55e)",
                    "linear-gradient(360deg, #22c55e, #ffffff, #22c55e)",
                  ],
                }
              : { background: "rgba(0,0,0,0)" }
          }
          transition={{ duration: 1.2, ease: "linear", repeat: Infinity }}
        />
        <div className="relative z-10  h-16 w-16 lg:h-24 lg:w-24 p-[2px]">
          <Image
            src="/images/avatar.jpeg"
            alt="Iván Bongiovanni"
            width={100}
            height={100}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="block object-cover rounded-full"
            priority
          />
        </div>
      </div>
    </motion.div>
  );
}
