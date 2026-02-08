"use client";

import { Check, ChevronsUpDown, Folder, Plus } from "lucide-react";
import * as React from "react";
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

interface SimpleCategory {
  id: string;
  name: string;
}

interface CategoryInputProps {
  categories: SimpleCategory[];
  value: string;
  onValueChange: (id: string) => void;
  onCreateCategory: (name: string) => Promise<SimpleCategory>;
}

export function CategoryInput({
  categories,
  value,
  onValueChange,
  onCreateCategory,
}: CategoryInputProps) {
  const [open, setOpen] = React.useState(false);
  const [inputValue, setInputValue] = React.useState("");
  const [isPending, setIsPending] = React.useState(false);

  const selectedCategory = categories.find((c) => c.id === value);

  // Filter categories manually since Command might handle filtering on the client,
  // but creating new ones requires checking against the original list.
  const filteredCategories = categories.filter((c) =>
    c.name.toLowerCase().includes(inputValue.toLowerCase()),
  );

  // Exact match logic to prevent re-creation
  const exactMatch = filteredCategories.some(
    (c) => c.name.toLowerCase() === inputValue.toLowerCase(),
  );

  const handleSelect = (categoryId: string) => {
    onValueChange(categoryId === value ? "" : categoryId);
    setOpen(false);
    setInputValue("");
  };

  const handleCreate = async () => {
    if (!inputValue.trim()) return;
    setIsPending(true);
    try {
      const newCategory = await onCreateCategory(inputValue.trim());
      onValueChange(newCategory.id);
      setOpen(false);
      setInputValue("");
    } catch (error) {
      console.error("Failed to create category", error);
    } finally {
      setIsPending(false);
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between font-normal transition-colors hover:bg-muted/50"
          >
            <span className="flex items-center gap-2 truncate">
              <Folder className="h-4 w-4 text-muted-foreground" />
              {selectedCategory ? (
                <span className="font-medium">{selectedCategory.name}</span>
              ) : (
                <span className="text-muted-foreground">
                  Seleccionar categoría...
                </span>
              )}
            </span>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        }
      />

      <PopoverContent className="w-[300px] p-0" align="start">
        <Command>
          <CommandInput
            placeholder="Buscar categoría..."
            onValueChange={setInputValue}
          />
          <CommandList>
            <CommandEmpty className="px-2 py-2">
              {inputValue && !isPending && !exactMatch ? (
                <div className="flex flex-col gap-2">
                  <p className="px-2 text-muted-foreground text-xs">
                    No se encontraron categorías.
                  </p>
                  <Button
                    variant="secondary"
                    size="sm"
                    className="h-8 w-full justify-start font-normal"
                    onClick={handleCreate}
                  >
                    <Plus className="mr-2 h-3.5 w-3.5" />
                    Crear "{inputValue}"
                  </Button>
                </div>
              ) : isPending ? (
                <p className="text-center text-muted-foreground text-xs">
                  Creando...
                </p>
              ) : (
                <p className="text-center text-muted-foreground text-xs">
                  No se encontraron categorías.
                </p>
              )}
            </CommandEmpty>

            <CommandGroup heading="Sugerencias" className="px-2">
              {categories.map((category) => (
                <CommandItem
                  key={category.id}
                  value={category.name}
                  onSelect={() => handleSelect(category.id)}
                  className="rounded-md"
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === category.id ? "opacity-100" : "opacity-0",
                    )}
                  />
                  {category.name}
                </CommandItem>
              ))}
            </CommandGroup>

            {!exactMatch && inputValue && !isPending && (
              <>
                <CommandSeparator />
                <CommandGroup className="px-2 pt-2">
                  <CommandItem
                    value={`create-${inputValue}`}
                    onSelect={handleCreate}
                    className="rounded-md bg-secondary/50 font-medium text-primary aria-selected:bg-secondary"
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
  );
}
