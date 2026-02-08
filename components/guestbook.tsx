"use client";

import type { JsonValue } from "@prisma/client/runtime/client";
import { AnimatePresence, motion } from "framer-motion";
import { Loader2, Palette, Send, Sparkles, User } from "lucide-react";
import { useEffect, useState, useTransition } from "react";
import { toast } from "sonner";
import { createGuestbookEntry } from "@/app/actions/guestbook";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/utils";
import { ScrollArea } from "./ui/scroll-area";

interface GuestbookProps {
  entries: {
    id: string;
    name: string | null;
    message: string;
    createdAt: Date;
    userId: string | null;
    ipHash?: string | null;
    style?: JsonValue;
  }[];
}

const STAR_COLORS = [
  {
    name: "Nebula Pink",
    value: "from-pink-500/20 to-purple-500/20 border-pink-500/50",
    text: "text-pink-500",
    glow: "shadow-pink-500/20",
  },
  {
    name: "Cosmic Blue",
    value: "from-blue-500/20 to-cyan-500/20 border-blue-500/50",
    text: "text-blue-500",
    glow: "shadow-blue-500/20",
  },
  {
    name: "Stellar Gold",
    value: "from-amber-500/20 to-orange-500/20 border-amber-500/50",
    text: "text-amber-500",
    glow: "shadow-amber-500/20",
  },
  {
    name: "Void Green",
    value: "from-emerald-500/20 to-teal-500/20 border-emerald-500/50",
    text: "text-emerald-500",
    glow: "shadow-emerald-500/20",
  },
  {
    name: "Galaxy Violet",
    value: "from-violet-500/20 to-fuchsia-500/20 border-violet-500/50",
    text: "text-violet-500",
    glow: "shadow-violet-500/20",
  },
];

const COSMIC_MESSAGES = [
  { icon: "🚀", text: "Despegando hacia el futuro" },
  { icon: "✨", text: "Me ha encantado el viaje" },
  { icon: "👽", text: "Saludos terrícola" },
  { icon: "🔥", text: "Esto está on fire" },
  { icon: "💎", text: "Una joya en el ciberespacio" },
  { icon: "👋", text: "¡Hola! Solo pasaba por aquí" },
];

export function Guestbook({ entries }: GuestbookProps) {
  const [isPending, startTransition] = useTransition();
  const session = authClient.useSession();
  const [selectedColor, setSelectedColor] = useState(STAR_COLORS[0]);
  const [selectedMessage, setSelectedMessage] = useState(
    COSMIC_MESSAGES[0].text,
  );
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSubmit = (formData: FormData) => {
    // Inject auth state check
    if (!session.data?.user) {
      startTransition(async () => {
        try {
          await authClient.signIn.anonymous();
          await submitEntry(formData);
        } catch (error) {
          console.log(error);
          toast.error("Error al iniciar sesión anónima");
        }
      });
    } else {
      startTransition(() => {
        submitEntry(formData);
      });
    }
  };

  const submitEntry = async (formData: FormData) => {
    const result = await createGuestbookEntry(formData);
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success("¡Tu firma ha sido enviada al cosmos!");
      const form = document.getElementById("guestbook-form") as HTMLFormElement;
      form?.reset();
    }
  };

  if (!mounted) return null;

  return (
    <div className="relative mx-auto max-w-3xl space-y-8">
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute top-1/6 right-0 h-[200px] w-[200px] -translate-y-1/2 rounded-full bg-linear-to-tr from-primary/60 via-primary/40 to-transparent blur-3xl" />
      </div>
      {/* Input Section */}
      <div className="relative overflow-hidden rounded-2xl border border-border/50 bg-card/30 p-1 backdrop-blur-md">
        <div className="absolute inset-0 bg-linear-to-br from-primary/5 via-transparent to-transparent opacity-50" />

        <div className="relative space-y-6 p-6">
          <div className="mb-2 flex items-center gap-3">
            <div
              className={cn(
                "rounded-lg border bg-background/50 p-2",
                selectedColor.value,
              )}
            >
              <Sparkles className={cn("h-5 w-5", selectedColor.text)} />
            </div>
            <div>
              <h3 className="font-semibold text-lg">Deja tu huella cósmica</h3>
              <p className="text-muted-foreground text-xs">
                Firma el libro de visitas digital. Solo una vez cada 24h.
              </p>
            </div>
          </div>

          <form id="guestbook-form" action={handleSubmit} className="space-y-6">
            <div className="space-y-3">
              <label className="ml-1 flex items-center gap-2 font-medium text-muted-foreground text-xs">
                <Palette className="h-3 w-3" /> Elige tu aura
              </label>
              <div className="flex flex-wrap gap-2">
                {STAR_COLORS.map((color) => (
                  <Button
                    variant="ghost"
                    key={color.name}
                    type="button"
                    onClick={() => setSelectedColor(color)}
                    className={cn(
                      "group relative h-8 w-8 rounded-full border-2 transition-all duration-300 hover:scale-110",
                      selectedColor.name === color.name
                        ? "scale-110 border-foreground"
                        : "border-transparent opacity-70 hover:opacity-100",
                    )}
                  >
                    <span
                      className={cn(
                        "absolute inset-0 rounded-full bg-linear-to-br opacity-50",
                        color.value,
                      )}
                    />
                    <span
                      className={cn(
                        "absolute inset-0.5 rounded-full bg-background",
                      )}
                    />
                    <span
                      className={cn(
                        "absolute inset-1.5 rounded-full bg-linear-to-br opacity-80",
                        color.value,
                      )}
                    />
                  </Button>
                ))}
              </div>
            </div>

            {/* Message Selection */}
            <div className="space-y-3">
              <label className="ml-1 flex items-center gap-2 font-medium text-muted-foreground text-xs">
                <Sparkles className="h-3 w-3" /> Elige tu mensaje
              </label>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {COSMIC_MESSAGES.map((msg) => (
                  <Button
                    variant="ghost"
                    size="lg"
                    type="button"
                    key={msg.text}
                    onClick={() => setSelectedMessage(msg.text)}
                    className={cn(
                      "relative overflow-hidden rounded-xl border p-3 text-left transition-all duration-300",
                      "group hover:bg-accent/50",
                      selectedMessage === msg.text
                        ? cn(
                            "border-primary/50 bg-accent shadow-md",
                            selectedColor.text,
                          )
                        : "border-border/50 bg-card/50 text-muted-foreground hover:border-border hover:text-foreground",
                    )}
                  >
                    <div className="relative z-10 flex items-center gap-3">
                      <span className="text-xl transition-transform duration-300 group-hover:scale-125">
                        {msg.icon}
                      </span>
                      <span className="font-medium text-sm">{msg.text}</span>
                    </div>
                    {selectedMessage === msg.text && (
                      <motion.div
                        layoutId="active-message"
                        className={cn(
                          "absolute inset-0 bg-linear-to-r opacity-10",
                          selectedColor.value,
                        )}
                      />
                    )}
                  </Button>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-4">
              <input type="hidden" name="message" value={selectedMessage} />

              <input
                type="hidden"
                name="style"
                value={JSON.stringify(selectedColor)}
              />
              <input
                type="hidden"
                name="name"
                value={session.data?.user?.name || "Viajero Anónimo"}
              />

              <div className="flex items-center justify-between pt-2">
                <div className="flex items-center gap-2 text-muted-foreground text-xs">
                  <User className="h-3 w-3" />
                  <span>
                    Firmando como:{" "}
                    <span className="font-medium text-foreground">
                      {session.data?.user?.name || "Anónimo"}
                    </span>
                  </span>
                </div>

                <Button
                  type="submit"
                  disabled={isPending}
                  className={cn(
                    "relative min-w-[140px] overflow-hidden transition-all duration-300",
                    isPending
                      ? "pl-10"
                      : "hover:shadow-lg hover:shadow-primary/20",
                  )}
                >
                  {isPending ? (
                    <Loader2 className="absolute left-3 h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="mr-2 h-4 w-4" />
                  )}
                  Dejar Huella
                </Button>
              </div>
            </div>
          </form>
        </div>
      </div>

      {/* Entries List */}
      <div className="space-y-4">
        <h4 className="ml-1 font-medium text-muted-foreground text-sm">
          Firmas Recientes
        </h4>
        {entries.length > 0 ? (
          <ScrollArea className="h-[200px]">
            <div className="grid gap-4 p-2 md:grid-cols-2">
              <AnimatePresence mode="popLayout">
                {entries.map((entry) => {
                  const style = entry.style as
                    | (typeof STAR_COLORS)[0]
                    | undefined;
                  const colorTheme =
                    style ||
                    STAR_COLORS[Math.floor(Math.random() * STAR_COLORS.length)]; // Fallback for old entries

                  return (
                    <motion.div
                      key={entry.id}
                      initial={{ opacity: 0, scale: 0.9, y: 20 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      layout
                      className={cn(
                        "group relative rounded-xl border bg-card/30 p-4 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1",
                        "hover:border-border/80 hover:shadow-lg",
                        colorTheme?.value.split(" ")[2], // Border color from value
                        style ? "" : "border-border/40",
                      )}
                    >
                      <div
                        className={cn(
                          "pointer-events-none absolute inset-0 rounded-xl bg-linear-to-br opacity-0 transition-opacity duration-500 group-hover:opacity-100",
                          colorTheme?.value,
                        )}
                      />

                      <div className="relative flex items-start gap-4">
                        <Avatar
                          className={cn(
                            "h-10 w-10 border-2 transition-transform group-hover:scale-105",
                            colorTheme.text.replace("text-", "border-"),
                          )}
                        >
                          <AvatarImage
                            src={`https://api.dicebear.com/9.x/notionists/svg?seed=${entry.name}&backgroundColor=transparent`}
                          />
                          <AvatarFallback className="bg-background">
                            {entry.name?.[0]}
                          </AvatarFallback>
                        </Avatar>

                        <div className="min-w-0 flex-1">
                          <div className="mb-1 flex items-center justify-between">
                            <span
                              className={cn(
                                "truncate font-medium text-sm",
                                colorTheme.text,
                              )}
                            >
                              {entry.name}
                            </span>
                            <span className="rounded-full border border-border/50 bg-background/50 px-2 py-0.5 text-[10px] text-muted-foreground">
                              {new Date(entry.createdAt).toLocaleDateString(
                                "es-ES",
                                {
                                  month: "short",
                                  day: "numeric",
                                },
                              )}
                            </span>
                          </div>
                          <p className="wrap-break-word text-foreground/90 text-sm leading-relaxed dark:text-foreground/80">
                            {entry.message}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          </ScrollArea>
        ) : (
          <div className="rounded-xl border border-border/50 border-dashed bg-card/20 py-12 text-center">
            <Sparkles className="mx-auto mb-3 h-8 w-8 text-muted-foreground/50" />
            <p className="text-muted-foreground">
              El universo está silencioso... sé el primero en hablar.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
