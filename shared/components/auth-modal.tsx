"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@/shared/components/ui/dialog";

import { signIn } from "../lib/auth-client";
import { cn } from "../lib/utils";
import { Icons } from "./icons";
import { Button } from "./ui/button";
import { Spinner } from "./ui/spinner";

interface AuthModalProps {
  message?: string;
  callbackUrl: string;
}

export function AuthModal({ message, callbackUrl }: AuthModalProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
  };

  const handleSignIn = () => {
    startTransition(async () => {
      const { error } = await signIn.social({
        callbackURL: callbackUrl,
        provider: "github",
      });
      if (error) toast.error(error.message);
      if (!error) {
        setOpen(false);
        router.refresh();
      }
    });
  };

  const handleAnonymous = () => {
    startTransition(async () => {
      const { error } = await signIn.anonymous();
      if (error) {
        toast.error(error.message);
        return;
      }
      if (!error) {
        setOpen(false);

        router.refresh();
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger
        render={
          <button
            className={cn(
              "flex items-center gap-2 px-3 py-2 border border-border",
              "text-sm font-sans text-foreground transition-colors duration-150",
              "hover:border-foreground"
            )}
          >
            <Icons.Github className="size-6" strokeWidth={1.5} />
            {message ?? "Sign in to leave a comment"}
          </button>
        }
      >
        <span className="flex items-center gap-2">
          <Icons.Github className="size-6" strokeWidth={1.5} />
          {message ?? "Sign in to leave a comment"}
        </span>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[425px] bg-background">
        <DialogTitle>Join the conversation</DialogTitle>
        <DialogDescription>
          Sign in or continue as guest to participate.
        </DialogDescription>
        <div className="flex flex-col gap-3">
          <Button onClick={handleSignIn} disabled={pending}>
            {!pending ? <Icons.Github className="mr-2 h-4 w-4" /> : <Spinner />}
            {!pending ? "Sign in with GitHub" : "Signing in..."}
          </Button>
          <Button
            variant="outline"
            onClick={handleAnonymous}
            disabled={pending}
          >
            {!pending ? "Continue as Guest" : "Loading..."}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
