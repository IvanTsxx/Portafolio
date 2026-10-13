"use client";

import { useState } from "react";

import { useCompanionActivate } from "@/components/scene/companion-signals";

import { AgentGameDialog } from "./agent-game-dialog";

export const CompanionGame = () => {
  const [open, setOpen] = useState(false);
  useCompanionActivate(() => setOpen(true));
  return <AgentGameDialog onOpenChange={setOpen} open={open} />;
};
