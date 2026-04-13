"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useState, useRef, useEffect } from "react";
import { ChevronDown, Languages } from "lucide-react";

import { cn } from "@/shared/lib/utils";

const LANG_LABELS: Record<string, string> = {
  de: "Deutsch",
  en: "English",
  es: "Español",
  fr: "Français",
  pt: "Português",
};

const LANG_FLAGS: Record<string, string> = {
  de: "🇩🇪",
  en: "🇺🇸",
  es: "🇪🇸",
  fr: "🇫🇷",
  pt: "🇧🇷",
};

interface LanguageSwitcherProps {
  currentLang: string;
  availableLangs: string[];
  slug: string;
}

export function LanguageSwitcher({
  currentLang,
  availableLangs,
  slug,
}: LanguageSwitcherProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleChange = useCallback(
    (newLang: string) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set("lang", newLang);
      router.push(`/thoughts/${slug}?${params.toString()}`, { scroll: false });
      setIsOpen(false);
    },
    [router, searchParams, slug]
  );

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Only show if there are multiple languages available
  if (availableLangs.length <= 1) {
    return null;
  }

  const currentLabel = LANG_LABELS[currentLang] || currentLang.toUpperCase();
  const currentFlag = LANG_FLAGS[currentLang] || "🌐";

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex items-center gap-2 text-[13px] px-3 py-1.5 rounded-md border border-border",
          "hover:border-brand-green hover:text-brand-green transition-colors duration-150",
          "bg-background text-foreground"
        )}
        aria-label="Select language"
        aria-expanded={isOpen}
      >
        <Languages size={14} className="text-muted-foreground" />
        <span>{currentFlag} {currentLabel}</span>
        <ChevronDown
          size={14}
          className={cn(
            "text-muted-foreground transition-transform duration-150",
            isOpen && "rotate-180"
          )}
        />
      </button>

      {isOpen && (
        <div
          className={cn(
            "absolute z-50 mt-1 min-w-[140px] py-1 rounded-md border border-border",
            "bg-background shadow-lg"
          )}
        >
          {availableLangs.map((lang) => {
            const isActive = lang === currentLang;
            const label = LANG_LABELS[lang] || lang.toUpperCase();
            const flag = LANG_FLAGS[lang] || "🌐";

            return (
              <button
                type="button"
                key={lang}
                onClick={() => handleChange(lang)}
                className={cn(
                  "w-full flex items-center gap-2 px-3 py-2 text-[13px] text-left",
                  "hover:bg-secondary transition-colors duration-150",
                  isActive && "bg-brand-green/10 text-brand-green"
                )}
              >
                <span>{flag}</span>
                <span>{label}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}