"use client";

import { useChat } from "@ai-sdk/react";
import {
  FileText,
  FolderKanban,
  Loader2,
  Search,
  Sparkles,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";

import { searchContent } from "@/app/actions/search";
import { useChatContext } from "@/components/chat-feature/chat-context";
import { Badge } from "@/components/ui/badge";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import type { SearchResult } from "@/lib/types";
import { Input } from "./ui/input";

export function SearchDialog() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [dbResults, setDbResults] = useState<SearchResult[]>([]);
  const [isPending, startTransition] = useTransition();
  const [input, setInput] = useState("");

  const { chat, setIsOpen: setChatOpen } = useChatContext();
  const { sendMessage } = useChat({ chat });

  const handleAskAI = (query: string) => {
    if (!query.trim()) return;

    setOpen(false);
    setChatOpen(true);

    // Add user message to chat context which triggers the AI response
    // Using setTimeout to allow state updates and avoid potential conflicts
    setTimeout(() => {
      void sendMessage({
        text: query,
      });
    }, 100);

    setInput("");
  };

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

  // Search DB when query changes (debounced)
  useEffect(() => {
    if (!input || input?.length < 2) {
      setDbResults([]);
      return;
    }

    const timeoutId = setTimeout(() => {
      startTransition(async () => {
        const searchResults = await searchContent(input);
        setDbResults(searchResults);
      });
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [input]);

  const handleSelect = (result: SearchResult) => {
    setOpen(false);
    setInput("");
    setDbResults([]);

    if (result.type === "post") {
      router.push(`/blog/${result.slug}`);
    } else if (result.type === "project") {
      router.push(`/projects/${result.slug}`);
    }
  };

  const hasNoResults =
    !isPending && input?.length >= 2 && dbResults.length === 0;

  return (
    <CommandDialog
      open={open}
      onOpenChange={(val) => {
        setOpen(val);
        if (!val) {
          setInput("");
        }
      }}
      className="h-fit max-h-[600px] overflow-y-auto md:max-w-2xl"
    >
      <div className="relative">
        <Search className="absolute top-3.5 left-4 size-4 text-muted-foreground" />
        <Input
          className="flex h-11 w-full rounded-md bg-transparent py-5 pr-4 pl-10 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
          placeholder="Buscar proyectos, posts o presiona Enter para preguntar a la AI..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              if (hasNoResults || input?.length > 0) {
                if (hasNoResults) {
                  handleAskAI(input);
                }
              }
            }
          }}
          // biome-ignore lint/a11y/noAutofocus: <explanation>
          autoFocus={open}
        />
      </div>

      <CommandList>
        {/* Database Results */}
        {isPending && (
          <div className="flex items-center justify-center py-6">
            <Loader2 className="size-6 animate-spin text-muted-foreground" />
          </div>
        )}

        {hasNoResults && (
          <CommandEmpty className="py-6 text-center text-muted-foreground">
            <div className="flex flex-col items-center gap-2">
              <p>
                No se encontraron resultados para{" "}
                <span className="font-medium">"{input}"</span>
              </p>
              <button
                onClick={() => handleAskAI(input)}
                className="mt-2 flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-2 text-primary text-sm transition-colors hover:bg-primary/10"
                type="button"
              >
                <Sparkles className="size-4" />
                Preguntar a la IA
              </button>
              <p className="mt-2 text-muted-foreground text-xs">
                Presiona{" "}
                <span className="font-medium text-foreground">Enter</span> para
                enviar automáticamente
              </p>
            </div>
          </CommandEmpty>
        )}

        {!isPending && input.length < 1 && dbResults.length === 0 && (
          <CommandEmpty className="py-6 text-center text-muted-foreground">
            <div className="flex flex-col items-center gap-2">
              <p>Empieza a escribir para buscar</p>
            </div>
          </CommandEmpty>
        )}

        {!isPending && dbResults.length > 0 && (
          <CommandGroup heading="Resultados encontrados">
            {dbResults.map((result) => (
              <CommandItem
                key={result.id}
                value={`${result.title}`}
                onSelect={() => handleSelect(result)}
                className="flex items-start gap-3 py-3"
              >
                {result.type === "post" ? (
                  <FileText className="mt-1 size-4 shrink-0 text-muted-foreground" />
                ) : (
                  <FolderKanban className="mt-1 size-4 shrink-0 text-muted-foreground" />
                )}
                <div className="flex-1 space-y-1">
                  <div className="font-medium">{result.title}</div>
                  <div className="line-clamp-1 text-muted-foreground text-sm">
                    {result.description}
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {result.type === "project" &&
                      result.technologies?.slice(0, 3).map((tech) => (
                        <Badge
                          key={tech}
                          variant="secondary"
                          className="text-xs"
                        >
                          {tech}
                        </Badge>
                      ))}
                  </div>
                </div>
              </CommandItem>
            ))}
          </CommandGroup>
        )}
      </CommandList>
    </CommandDialog>
  );
}
