"use client";

import { motion } from "motion/react";
import Image from "next/image";
import Link from "next/link";

import { SITE } from "@/shared/config/site";

export const NavLogo = () => (
  <motion.div
    initial={{ opacity: 0, y: -10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5 }}
  >
    <Link
      prefetch={false}
      href="/"
      className="flex items-center gap-x-2 text-sm tracking-tight hover:text-brand-green transition-colors duration-150"
    >
      <Image
        src="/images/avatar.jpeg"
        alt="Logo"
        width={20}
        height={20}
        priority
        className="rounded-full"
      />
      {SITE.name}
    </Link>
  </motion.div>
);
