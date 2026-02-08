"use client";

import { FileText, FolderKanban, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { searchContent } from "@/app/actions/search";
import { Badge } from "@/components/ui/badge";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import type { SearchResult } from "@/lib/types";

export function SearchDialog() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isPending, startTransition] = useTransition();

  // Listen for Cmd+K / Ctrl+K
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  // Search when query changes
  useEffect(() => {
    if (!query || query.length < 2) {
      setResults([]);
      return;
    }

    const timeoutId = setTimeout(() => {
      startTransition(async () => {
        const searchResults = await searchContent(query);
        setResults(searchResults);
      });
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [query]);

  const handleSelect = (result: SearchResult) => {
    setOpen(false);
    setQuery("");
    setResults([]);

    if (result.type === "post") {
      router.push(`/blog/${result.slug}`);
    } else if (result.type === "project") {
      router.push(`/projects/${result.slug}`);
    }
  };

  const escapeRegExp = (value: string) =>
    value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

  const getHighlightedText = (text: string, highlight: string) => {
    if (!highlight.trim()) return text;

    const escapedHighlight = escapeRegExp(highlight);
    const regex = new RegExp(escapedHighlight, "gi");
    const matches = [...text.matchAll(regex)];

    if (matches.length === 0) return text;

    const result: React.ReactNode[] = [];
    let lastIndex = 0;

    matches.forEach((match, i) => {
      const matchStart = match.index!;
      const matchEnd = matchStart + match[0].length;

      // Añadir texto antes de la coincidencia
      if (matchStart > lastIndex) {
        result.push(text.slice(lastIndex, matchStart));
      }

      // Añadir la coincidencia resaltada
      result.push(
        <mark
          key={i}
          className="rounded-sm bg-primary/20 font-medium text-inherit"
        >
          {match[0]}
        </mark>,
      );

      lastIndex = matchEnd;
    });

    // Añadir texto restante después de la última coincidencia
    if (lastIndex < text.length) {
      result.push(text.slice(lastIndex));
    }

    return <span>{result}</span>;
  };

  return (
    <CommandDialog
      open={open}
      onOpenChange={setOpen}
      className="h-fit max-h-[400px] overflow-y-auto md:max-w-xl"
    >
      <CommandInput
        placeholder="Buscar posts, proyectos..."
        value={query}
        onValueChange={setQuery}
      />
      <CommandList>
        {isPending && (
          <div className="flex items-center justify-center py-6">
            <Loader2 className="size-6 animate-spin text-muted-foreground" />
          </div>
        )}

        {!isPending && query.length >= 2 && results.length === 0 && (
          <CommandEmpty>No se encontraron resultados.</CommandEmpty>
        )}

        {!isPending && results.length > 0 && (
          <>
            {results.filter((r) => r.type === "post").length > 0 && (
              <CommandGroup heading="Posts">
                {results
                  .filter((r) => r.type === "post")
                  .map((result) => (
                    <CommandItem
                      key={result.id}
                      value={`${result.title}-${result.description}`}
                      onSelect={() => handleSelect(result)}
                      className="flex items-start gap-3 py-3"
                    >
                      <FileText className="mt-1 size-4 shrink-0 text-muted-foreground" />
                      <div className="flex-1 space-y-1">
                        <div className="font-medium">
                          {getHighlightedText(result.title, query)}
                        </div>
                        <div className="line-clamp-1 text-muted-foreground text-sm">
                          {getHighlightedText(result.description || "", query)}
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {result.category && (
                            <Badge variant="default" className="text-xs">
                              {getHighlightedText(result.category, query)}
                            </Badge>
                          )}
                          {result.tags?.slice(0, 2).map((tag) => (
                            <Badge
                              key={tag}
                              variant="secondary"
                              className="text-xs"
                            >
                              {getHighlightedText(tag, query)}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </CommandItem>
                  ))}
              </CommandGroup>
            )}

            {results.filter((r) => r.type === "project").length > 0 && (
              <CommandGroup heading="Proyectos">
                {results
                  .filter((r) => r.type === "project")
                  .map((result) => (
                    <CommandItem
                      key={result.id}
                      value={`${result.title}-${result.description}`}
                      onSelect={() => handleSelect(result)}
                      className="flex items-start gap-3 py-3"
                    >
                      <FolderKanban className="mt-1 size-4 shrink-0 text-muted-foreground" />
                      <div className="flex-1 space-y-1">
                        <div className="font-medium">
                          {getHighlightedText(result.title, query)}
                        </div>
                        <div className="line-clamp-1 text-muted-foreground text-sm">
                          {getHighlightedText(result.description || "", query)}
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {result.technologies?.slice(0, 3).map((tech) => (
                            <Badge
                              key={tech}
                              variant="secondary"
                              className="text-xs"
                            >
                              {getHighlightedText(tech, query)}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </CommandItem>
                  ))}
              </CommandGroup>
            )}
          </>
        )}
      </CommandList>
    </CommandDialog>
  );
}
