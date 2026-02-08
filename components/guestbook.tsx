"use client";

import { Loader2, Send } from "lucide-react";
import { useTransition } from "react";
import { toast } from "sonner";
import { createGuestbookEntry } from "@/app/actions/guestbook";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { authClient } from "@/lib/auth-client";
import { ScrollArea } from "./ui/scroll-area";

interface GuestbookProps {
  entries: {
    id: string;
    name: string | null;
    message: string;
    createdAt: Date;
    userId: string | null;
  }[];
}

export function Guestbook({ entries }: GuestbookProps) {
  const [isPending, startTransition] = useTransition();
  const session = authClient.useSession();

  const handleSubmit = (formData: FormData) => {
    // If not signed in, sign in anonymously first
    if (!session.data?.user) {
      startTransition(async () => {
        try {
          await authClient.signIn.anonymous();
          // After auth, submit the form
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
      toast.success("Mensaje firmado correctamente!");
      // Reset form
      const form = document.getElementById("guestbook-form") as HTMLFormElement;
      form?.reset();
    }
  };

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <div className="space-y-4 rounded-xl border border-border/50 bg-card/50 p-6 backdrop-blur-sm">
        <div className="flex items-center gap-4">
          <Avatar className="h-10 w-10 border border-border">
            <AvatarImage
              src={
                session.data?.user?.image ||
                `https://api.dicebear.com/9.x/notionists/svg?seed=${Math.random()}`
              }
            />
            <AvatarFallback>UNK</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <form
              id="guestbook-form"
              action={handleSubmit}
              className="flex gap-2"
            >
              <Input
                name="message"
                placeholder="Deja tu huella aquí..."
                required
                maxLength={100}
                className="flex-1 bg-transparent"
                autoComplete="off"
              />
              <input
                type="hidden"
                name="name"
                value={session.data?.user?.name || "Anónimo"}
              />
              <Button
                type="submit"
                size="icon"
                disabled={isPending}
                className="shrink-0"
              >
                {isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
                <span className="sr-only">Enviar</span>
              </Button>
            </form>
          </div>
        </div>
        {!session.data?.user && (
          <p className="text-muted-foreground text-xs">
            Al enviar, firmarás como anónimo automáticamente.
          </p>
        )}
      </div>

      <ScrollArea className="h-[200px] rounded-xl border px-4 py-2">
        <div className="flex flex-col gap-2">
          {entries.map((entry) => (
            <div
              key={entry.id}
              className="group fade-in slide-in-from-bottom-4 flex animate-in gap-4 duration-500"
            >
              <Avatar className="h-10 w-10 border border-border transition-transform group-hover:scale-105">
                <AvatarImage
                  src={`https://api.dicebear.com/9.x/notionists/svg?seed=${entry.name}`}
                />
                <AvatarFallback>{entry.name?.[0]}</AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-foreground text-sm">
                    {entry.name}
                  </span>
                  <span className="text-muted-foreground text-xs">
                    {new Date(entry.createdAt).toLocaleDateString("es-ES", {
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                </div>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {entry.message}
                </p>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
      {entries.length === 0 && (
        <div className="text-center text-muted-foreground">
          Sé el primero en firmar el libro de visitas.
        </div>
      )}
    </div>
  );
}
