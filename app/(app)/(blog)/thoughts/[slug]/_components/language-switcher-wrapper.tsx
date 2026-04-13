"use client";

import { Suspense } from "react";

import { LanguageSwitcher } from "./language-switcher";

interface LanguageSwitcherWrapperProps {
  currentLang: string;
  availableLangs: string[];
  slug: string;
}

function LanguageSwitcherWithSuspense({
  currentLang,
  availableLangs,
  slug,
}: LanguageSwitcherWrapperProps) {
  return (
    <LanguageSwitcher
      currentLang={currentLang}
      availableLangs={availableLangs}
      slug={slug}
    />
  );
}

export function LanguageSwitcherWrapper(props: LanguageSwitcherWrapperProps) {
  return (
    <Suspense fallback={null}>
      <LanguageSwitcherWithSuspense {...props} />
    </Suspense>
  );
}
