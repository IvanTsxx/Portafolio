"use client";

import { motion } from "motion/react";

import { ShimmeringText } from "@/shared/components/shimmering-text";
import { USER } from "@/shared/config/user";

export const HeroInfoTop = () => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ delay: 0.1, duration: 0.4 }}
    className="flex flex-col"
  >
    <div className="grow items-end pb-1 hidden lg:flex">
      <p
        className="line-clamp-1 font-light text-xs text-zinc-300 select-none dark:text-zinc-700"
        aria-hidden="true"
      >
        {USER.heroClass}
      </p>
    </div>

    <ShimmeringText
      text={USER.bio}
      className="text-xs lg:text-sm font-medium max-w-full"
    />
  </motion.div>
);
