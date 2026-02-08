"use client";

import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { signOut } from "@/lib/auth-client";

export const SignOutButton = () => {
  const router = useRouter();
  const handleSignOut = async () => {
    await signOut();
    router.push("/");
    router.refresh();
  };
  return (
    <Button
      type="submit"
      className="w-full justify-start"
      onClick={handleSignOut}
    >
      <LogOut className="mr-2 size-4" />
      Cerrar sesión
    </Button>
  );
};
