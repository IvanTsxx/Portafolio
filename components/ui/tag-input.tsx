"use client";

import { Check, Plus, X } from "lucide-react";
import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface SimpleTag {
  id: string;
  name: string;
  slug: string;
}

interface TagInputProps {
  placeholder?: string;
  availableTags: SimpleTag[];
  selectedTags: SimpleTag[];
  onTagsChange: (tags: SimpleTag[]) => void;
  onCreateTag: (name: string) => Promise<SimpleTag>;
}

export function TagInput({
  placeholder = "Añadir tags...",
  availableTags,
  selectedTags,
  onTagsChange,
  onCreateTag,
}: TagInputProps) {
  const [open, setOpen] = React.useState(false);
  const [inputValue, setInputValue] = React.useState("");
  const [isPending, setIsPending] = React.useState(false);

  const handleSelect = (tag: SimpleTag) => {
    if (selectedTags.some((t) => t.id === tag.id)) {
      onTagsChange(selectedTags.filter((t) => t.id !== tag.id));
    } else {
      onTagsChange([...selectedTags, tag]);
    }
  };

  const handleCreate = async () => {
    if (!inputValue.trim()) return;
    setIsPending(true);
    try {
      const newTag = await onCreateTag(inputValue.trim());
      onTagsChange([...selectedTags, newTag]);
      setInputValue("");
    } catch (error) {
      console.error("Failed to create tag", error);
    } finally {
      setIsPending(false);
    }
  };

  const handlePaste = async (e: React.ClipboardEvent) => {
    e.preventDefault();
    const text = e.clipboardData.getData("text");
    if (!text) return;

    const items = text
      .split(/[,;\n]/) // Split by comma, semicolon, or newline
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    if (items.length === 0) return;

    setIsPending(true);

    // Avoid processing duplicates within the pasted content
    const uniqueItems = Array.from(new Set(items));

    const newSelectedTags: SimpleTag[] = [...selectedTags];
    const tagsToAdd: SimpleTag[] = [];

    try {
      for (const itemName of uniqueItems) {
        // Check if already selected
        if (
          newSelectedTags.some(
            (t) => t.name.toLowerCase() === itemName.toLowerCase(),
          )
        ) {
          continue;
        }

        // Check if available in existing options
        const existing = availableTags.find(
          (t) => t.name.toLowerCase() === itemName.toLowerCase(),
        );

        if (existing) {
          tagsToAdd.push(existing);
          // Add to local list to prevent re-adding if duplicate in source
          newSelectedTags.push(existing);
        } else {
          // Create new
          try {
            // Check if we just created it in this loop (to avoid duplicates if onCreateTag doesn't return existing immediately although we fixed that in backend, local state update lag might be an issue)
            // But valid "onCreateTag" call returns the tag object.
            const newTag = await onCreateTag(itemName);
            if (newTag) {
              // Verify we haven't added it already (backend might return existing)
              if (!newSelectedTags.some((t) => t.id === newTag.id)) {
                tagsToAdd.push(newTag);
                newSelectedTags.push(newTag);
              }
            }
          } catch (err) {
            console.error(`Failed to create tag: ${itemName}`, err);
          }
        }
      }

      if (tagsToAdd.length > 0) {
        onTagsChange([...selectedTags, ...tagsToAdd]);
        // Also clear input and potentially close
        setInputValue("");
        setOpen(false);
      }
    } catch (error) {
      console.error("Paste handling error", error);
    } finally {
      setIsPending(false);
    }
  };

  const filteredTags = availableTags.filter((tag) =>
    tag.name.toLowerCase().includes(inputValue.toLowerCase()),
  );

  const exactMatch = filteredTags.some(
    (t) => t.name.toLowerCase() === inputValue.toLowerCase(),
  );

  return (
    <div className="flex flex-col gap-3">
      {selectedTags.length > 0 && (
        <div className="mb-2 flex flex-wrap gap-2">
          {selectedTags.map((tag) => (
            <Badge
              key={tag.id}
              variant="secondary"
              className="group h-7 border border-transparent bg-secondary/50 py-1 pr-1 pl-2 font-medium text-sm transition-colors hover:border-border hover:bg-secondary"
            >
              {tag.name}
              <Button
                variant="ghost"
                size="icon"
                className="ml-1 h-4 w-4 rounded-full p-0 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                onClick={(e) => {
                  e.stopPropagation();
                  handleSelect(tag);
                }}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          ))}
        </div>
      )}

      <Popover open={open} onOpenChange={setOpen}>
        <div className="flex items-center gap-2">
          <PopoverTrigger
            render={
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={open}
                className="min-w-[180px] justify-between border-dashed font-normal text-muted-foreground hover:bg-muted/50 hover:text-foreground"
              >
                <span className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  {placeholder}
                </span>
              </Button>
            }
          />
        </div>

        <PopoverContent className="w-[280px] p-0" align="start">
          <Command loop>
            <CommandInput
              placeholder="Buscar o crear..."
              onValueChange={setInputValue}
              onPaste={handlePaste}
            />
            <CommandList>
              <CommandEmpty className="px-2 py-2 text-center text-muted-foreground text-xs">
                {isPending ? "Creando..." : "No se encontraron tags."}
              </CommandEmpty>

              <CommandGroup
                heading="Disponibles"
                className="px-1 text-muted-foreground"
              >
                {availableTags.map((tag) => {
                  const isSelected = selectedTags.some((t) => t.id === tag.id);
                  return (
                    <CommandItem
                      key={tag.id}
                      value={tag.name}
                      onSelect={() => handleSelect(tag)}
                      className="rounded-sm aria-selected:bg-accent aria-selected:text-accent-foreground"
                    >
                      <div
                        className={cn(
                          "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
                          isSelected
                            ? "bg-primary text-primary-foreground"
                            : "opacity-50 [&_svg]:invisible",
                        )}
                      >
                        <Check className={cn("h-3 w-3")} />
                      </div>
                      {tag.name}
                    </CommandItem>
                  );
                })}
              </CommandGroup>

              {!exactMatch && inputValue && !isPending && (
                <>
                  <CommandSeparator />
                  <CommandGroup className="px-1 pt-2">
                    <CommandItem
                      value={`create-${inputValue}`}
                      onSelect={handleCreate}
                      className="rounded-sm bg-secondary/50 font-medium text-primary aria-selected:bg-secondary"
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Crear "{inputValue}"
                    </CommandItem>
                  </CommandGroup>
                </>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}
