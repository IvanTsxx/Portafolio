"use client";

import { useState } from "react";

// oxlint-disable-next-line import/no-cycle
import { TagInput } from ".";

export default function TagInputExample() {
  const [tags, setTags] = useState(["react", "nextjs", "typescript"]);

  return (
    <div className="w-full max-w-sm space-y-4">
      <TagInput
        value={tags}
        onChange={setTags}
        placeholder="Type and press Enter..."
      />
      <p className="text-2xs text-muted-foreground">
        {tags.length} tag{tags.length !== 1 ? "s" : ""} added — press Enter or
        comma to add, Backspace to remove
      </p>
    </div>
  );
}