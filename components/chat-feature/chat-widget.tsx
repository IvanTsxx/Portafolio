"use client";

import { useChat } from "@ai-sdk/react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Loader2,
  MessageCircle,
  Minimize2,
  Send,
  Sparkles,
  X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useChatContext } from "@/components/chat-feature/chat-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { MemoizedMarkdown } from "../memoized-markdown";

export function ChatWidget() {
  const { chat, isOpen, setIsOpen } = useChatContext();
  const { messages, sendMessage, status } = useChat({ chat });
  const [input, setInput] = useState("");

  const isLoading = status === "streaming" || status === "submitted";

  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom of messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isOpen]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const handleSubmit = (e: React.SyntheticEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    sendMessage({ text: input });
    setInput("");
  };

  return (
    <div className="fixed right-6 bottom-6 z-50 flex flex-col items-end gap-4">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="relative flex h-[500px] w-[350px] flex-col overflow-hidden rounded-xl border border-border bg-background shadow-xl sm:w-[400px]"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b bg-muted/40 p-4">
              <div className="flex items-center gap-2">
                <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Sparkles className="size-4" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm">Iván AI</h3>
                  <p className="text-muted-foreground text-xs">
                    Desarrollador Full-Stack
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="size-8"
                onClick={() => setIsOpen(false)}
              >
                <Minimize2 className="size-4" />
              </Button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4" ref={scrollRef}>
              {messages.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center space-y-4 text-center text-muted-foreground">
                  <Sparkles className="size-8 opacity-20" />
                  <div className="max-w-[200px] text-sm">
                    <p>Hola, soy la IA de Iván.</p>
                    <p className="mt-1">
                      Pregúntame sobre mi experiencia, proyectos o habilidades.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {messages.map((m) => (
                    <div
                      key={m.id}
                      className={cn(
                        "flex w-max max-w-[85%] flex-col gap-1 rounded-2xl px-3 py-2 text-sm",
                        m.role === "user"
                          ? "ml-auto bg-primary text-primary-foreground"
                          : "bg-muted text-foreground",
                      )}
                    >
                      {m.parts ? (
                        m.parts.map((part, i) => (
                          <div key={i}>
                            {part.type === "text" && (
                              <MemoizedMarkdown
                                key={`${m.id}-text`}
                                id={m.id}
                                content={part.text}
                              />
                            )}
                            {/* Handling potential future reasoning parts */}
                            {part.type === "reasoning" && (
                              <span className="my-1 block border-white/30 border-l-2 pl-2 italic opacity-70">
                                {part.text}
                              </span>
                            )}
                          </div>
                        ))
                      ) : (
                        <span>
                          {"content" in m
                            ? (m.content as string)
                            : "Mensaje sin contenido"}
                        </span>
                      )}
                    </div>
                  ))}
                  {isLoading &&
                    messages[messages.length - 1]?.role !== "assistant" && (
                      <div className="flex w-max max-w-[85%] flex-col gap-1 rounded-2xl bg-muted px-3 py-2 text-foreground">
                        <div className="flex items-center gap-1">
                          <span className="size-1.5 animate-bounce rounded-full bg-foreground/50 [animation-delay:-0.3s]" />
                          <span className="size-1.5 animate-bounce rounded-full bg-foreground/50 [animation-delay:-0.15s]" />
                          <span className="size-1.5 animate-bounce rounded-full bg-foreground/50" />
                        </div>
                      </div>
                    )}
                </div>
              )}
            </div>

            {/* Input */}
            <div className="border-t bg-background p-4">
              <form onSubmit={handleSubmit} className="flex gap-2">
                <Input
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Escribe un mensaje..."
                  className="flex-1"
                  disabled={isLoading}
                />
                <Button
                  type="submit"
                  size="icon"
                  disabled={isLoading || !input.trim()}
                  className="shrink-0"
                >
                  {isLoading ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <Send className="size-4" />
                  )}
                </Button>
              </form>
              <div className="mt-2 text-center text-[10px] text-muted-foreground/60">
                La IA puede cometer errores. Verifica la información importante
                si es necesario.
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <Button
        onClick={() => setIsOpen(!isOpen)}
        size="icon"
        className="size-12 rounded-full shadow-lg transition-transform hover:scale-110"
      >
        {isOpen ? (
          <X className="size-6" />
        ) : (
          <MessageCircle className="size-6" />
        )}
      </Button>
    </div>
  );
}
