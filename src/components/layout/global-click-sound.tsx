"use client";

import { useEffect } from "react";
import { clickSoftSound } from "@/lib/click-soft";
import { decodeAudioData, playSound } from "@/lib/sound-engine";

export function GlobalClickSound() {
  useEffect(() => {
    // 1. Preload sound (decoding only happens once due to internal caching in sound-engine)
    // This ensures play() is instant on first user interaction after loading.
    decodeAudioData(clickSoftSound.dataUri).catch(() => {
      // Ignore preload errors
    });

    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;

      // 2. Expanded selector to cover inputs and roles
      // We look for:
      // - <a> tags
      // - <button> tags
      // - [role="button"] or [role="link"]
      // - inputs that act as buttons
      const clickable = target.closest(
        "a, button, [role='button'], [role='link'], input[type='button'], input[type='submit'], input[type='reset']"
      );

      if (clickable) {
        // 3. Optimized playback using direct engine call
        // This avoids React state updates/re-renders provided by useSound hook
        // Volume 0.5 is often better for repeated UI sounds to not be overwhelming
        playSound(clickSoftSound.dataUri, { volume: 0.5 }).catch(() => {
          // Ignore playback errors (e.g. AudioContext not resumed yet)
        });
      }
    };

    // 4. Use capture phase = true
    // This ensures we catch the click event even if a component calls e.stopPropagation()
    // This is critical for robust global handling.
    window.addEventListener("click", handleClick, { capture: true });

    return () => {
      window.removeEventListener("click", handleClick, { capture: true });
    };
  }, []);

  return null;
}
