"use client";

import { useState } from "react";

import { TextScramble } from "@/registry/ivan/ui/text-scramble";

export const Example = () => {
  const [replayKey, setReplayKey] = useState(0);

  return (
    <div className="flex flex-col items-start gap-6">
      <TextScramble
        charset="hex"
        text="0xA3 / AG-03 / Builder"
        trigger="hover"
      />
      <TextScramble
        as="h2"
        replayKey={replayKey}
        text="Review before integrate"
        trigger="manual"
        variant="heading"
      />
      <button
        className="border-border hover:bg-accent focus-visible:ring-ring inline-flex min-h-11 items-center border px-4 font-mono text-xs tracking-widest uppercase transition-colors focus-visible:ring-2 focus-visible:outline-none"
        onClick={() => setReplayKey((current) => current + 1)}
        type="button"
      >
        Replay
      </button>
    </div>
  );
};
