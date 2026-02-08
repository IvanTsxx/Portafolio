"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
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
import { Badge } from "@/components/ui/badge";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import type { SearchResult } from "@/lib/types";

export function SearchDialog() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [dbResults, setDbResults] = useState<SearchResult[]>([]);
  const [isPending, startTransition] = useTransition();

  // Vercel AI SDK hook for chat
  // Casting to MyUIMessage[] for type safety with the custom schema
  const [input, setInput] = useState("");

  const { messages, status, stop, sendMessage } = useChat<UIMessage>({
    transport: new DefaultChatTransport({
      api: "/api/chat",
    }),
    onFinish: () => {
      console.log("AI finished");
    },
  });

  const isLoadingAI = status === "streaming" || status === "submitted";

  const handleSubmit = (e: React.SyntheticEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    // Use parts as content might not be available in strict types or sendMessage expects this structure
    void sendMessage({
      role: "user",
      parts: [{ type: "text", text: input }],
    });
    setInput("");
  };

  const lastAssistantMessage = messages
    .filter((m) => m.role === "assistant")
    .pop();

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

  return (
    <CommandDialog
      open={open}
      onOpenChange={(val) => {
        setOpen(val);
        if (!val) {
          stop(); // Stop generation if closed
          setInput("");
        }
      }}
      className="h-fit max-h-[600px] overflow-y-auto md:max-w-2xl"
    >
      <div className="relative">
        <Search className="absolute top-3.5 left-4 size-4 text-muted-foreground" />
        <input
          className="flex h-11 w-full rounded-md bg-transparent py-3 pr-4 pl-10 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
          placeholder="Buscar proyectos, posts o preguntar a la AI..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handleSubmit(e);
            }
          }}
          // biome-ignore lint/a11y/noAutofocus: <>
          autoFocus={open}
        />
        {isLoadingAI && (
          <div className="absolute top-3.5 right-4">
            <Loader2 className="size-4 animate-spin text-primary" />
          </div>
        )}
      </div>

      <CommandList>
        {/* AI Response Section */}
        {(lastAssistantMessage || isLoadingAI) && (
          <div className="border-border/50 border-b bg-muted/20 p-4">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 rounded-full bg-primary/10 p-1.5 text-primary">
                <Sparkles className="size-4" />
              </div>
              <div className="space-y-1">
                <p className="font-medium text-foreground text-sm">Iván AI</p>
                <div className="prose-sm dark:prose-invert text-muted-foreground text-sm leading-relaxed">
                  {lastAssistantMessage ? (
                    lastAssistantMessage.parts.map((part, index) => {
                      if (part.type === "text") {
                        return <span key={index}>{part.text}</span>;
                      }

                      // Handle reasoning parts if enabled in future
                      if (part.type === "reasoning") {
                        return (
                          <div
                            key={index}
                            className="my-1 border-l-2 pl-2 text-muted-foreground text-xs italic"
                          >
                            {part.text}
                          </div>
                        );
                      }

                      // Handle custom data or tools here
                      return null;
                    })
                  ) : (
                    <span className="animate-pulse">Pensando...</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Database Results */}
        {isPending && !lastAssistantMessage && (
          <div className="flex items-center justify-center py-6">
            <Loader2 className="size-6 animate-spin text-muted-foreground" />
          </div>
        )}

        {!isPending &&
          input?.length >= 2 &&
          dbResults.length === 0 &&
          !lastAssistantMessage &&
          !isLoadingAI && (
            <CommandEmpty className="py-6 text-center text-muted-foreground">
              Presiona{" "}
              <span className="font-medium text-foreground">Enter</span> para
              preguntar a la AI.
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
