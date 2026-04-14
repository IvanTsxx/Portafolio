"use client";

import { XIcon } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useRef, useState } from "react";

import { cn } from "@/shared/lib/utils";

export interface TagInputProps {
  value?: string[];
  defaultValue?: string[];
  onChange?: (tags: string[]) => void;
  placeholder?: string;
  maxTags?: number;
  maxLength?: number;
  disabled?: boolean;
  className?: string;
}

export function TagInput({
  value: controlledValue,
  defaultValue = [],
  onChange,
  placeholder = "Add a tag...",
  maxTags,
  maxLength,
  disabled = false,
  className,
}: TagInputProps) {
  const [internalTags, setInternalTags] = useState<string[]>(defaultValue);
  const [inputValue, setInputValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const tags = controlledValue ?? internalTags;

  const addTag = useCallback(
    (tag: string) => {
      const trimmed = tag.trim();
      if (!trimmed) return;
      if (maxLength && trimmed.length > maxLength) return;
      if (maxTags && tags.length >= maxTags) return;
      if (tags.includes(trimmed)) {
        setInputValue("");
        return;
      }

      const next = [...tags, trimmed];
      if (!controlledValue) setInternalTags(next);
      onChange?.(next);
      setInputValue("");
    },
    [tags, controlledValue, onChange, maxTags, maxLength]
  );

  const removeTag = useCallback(
    (tagToRemove: string) => {
      const next = tags.filter((t) => t !== tagToRemove);
      if (!controlledValue) setInternalTags(next);
      onChange?.(next);
    },
    [tags, controlledValue, onChange]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (disabled) return;
      if (e.key === "Enter" || e.key === ",") {
        e.preventDefault();
        addTag(inputValue);
        return;
      }
      if (e.key === "Backspace" && !inputValue && tags.length > 0) {
        // oxlint-disable-next-line typescript/no-non-null-assertion
        removeTag(tags.at(-1)!);
      }
    },
    [addTag, removeTag, inputValue, tags, disabled]
  );

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const raw = e.target.value;
      if (raw.includes(",")) {
        const parts = raw.split(",");
        for (const part of parts) {
          if (part.trim()) addTag(part);
        }
        return;
      }
      if (maxLength && raw.length > maxLength) return;
      setInputValue(raw);
    },
    [addTag, maxLength]
  );

  return (
    <fieldset
      data-slot="tag-input"
      className={cn(
        "group/tag-input m-0 flex min-h-8 flex-wrap items-center gap-1.5 border border-input bg-transparent px-2.5 py-1.5 text-xs transition-colors",
        "focus-within:border-ring focus-within:ring-1 focus-within:ring-ring/50",
        "has-disabled:cursor-not-allowed has-disabled:opacity-50",
        "dark:bg-input/30 dark:has-disabled:bg-input/80",
        className
      )}
      onClick={() => inputRef.current?.focus()}
      onKeyDown={() => inputRef.current?.focus()}
    >
      <AnimatePresence initial={false} mode="popLayout">
        {tags.map((tag) => (
          <motion.span
            key={tag}
            layout
            initial={{ opacity: 0, scale: 0.7 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.7 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            data-slot="tag-input-item"
            className="inline-flex items-center gap-1 bg-secondary px-2 py-0.5 text-xs font-medium text-secondary-foreground"
          >
            <span className="max-w-[120px] truncate">{tag}</span>
            {!disabled && (
              <button
                type="button"
                onClick={() => removeTag(tag)}
                className="ml-0.5 inline-flex shrink-0 items-center justify-center text-muted-foreground transition-colors hover:text-brand-green"
                aria-label={`Remove ${tag}`}
              >
                <XIcon className="size-2.5" />
              </button>
            )}
          </motion.span>
        ))}
      </AnimatePresence>

      <input
        ref={inputRef}
        type="text"
        value={inputValue}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        placeholder={tags.length === 0 ? placeholder : ""}
        className="min-w-[80px] flex-1 bg-transparent text-xs text-foreground placeholder:text-muted-foreground focus:outline-none disabled:cursor-not-allowed"
        {...(maxLength ? { maxLength } : {})}
        {...(maxTags
          ? {
              "aria-label": `Tag input, ${tags.length} of ${maxTags} tags`,
            }
          : {})}
      />
    </fieldset>
  );
}
