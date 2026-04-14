"use client";

import {
  ArrowRightIcon,
  BookOpenIcon,
  CodeIcon,
  HomeIcon,
  SettingsIcon,
  UserIcon,
} from "lucide-react";
import { useState } from "react";

import { Icons } from "@/shared/components/icons";

// oxlint-disable-next-line import/no-cycle
import { CommandMenu } from ".";

const GROUPS = [
  {
    heading: "Navigation",
    items: [
      {
        icon: <HomeIcon className="size-3.5" />,
        id: "home",
        label: "Home",
        shortcut: "⌘H",
      },
      {
        icon: <BookOpenIcon className="size-3.5" />,
        id: "blog",
        label: "Blog",
        shortcut: "⌘B",
      },
      { icon: <UserIcon className="size-3.5" />, id: "about", label: "About" },
      {
        icon: <CodeIcon className="size-3.5" />,
        id: "projects",
        label: "Projects",
        shortcut: "⌘P",
      },
    ],
  },
  {
    heading: "External",
    items: [
      {
        href: "https://github.com",
        icon: <Icons.Github className="size-3.5" />,
        id: "github",
        label: "GitHub",
      },
      {
        href: "https://ui.shadcn.com/docs",
        icon: <BookOpenIcon className="size-3.5" />,
        id: "docs",
        label: "Documentation",
      },
    ],
  },
  {
    heading: "Actions",
    items: [
      {
        icon: <SettingsIcon className="size-3.5" />,
        id: "settings",
        label: "Settings",
        shortcut: "⌘,",
      },
    ],
  },
];

export default function CommandMenuExample() {
  const [open, setOpen] = useState(false);

  return (
    <div className="w-full max-w-sm space-y-4">
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex h-8 items-center gap-2 border border-border bg-background px-2.5 text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
      >
        <ArrowRightIcon className="size-3.5" />
        Open command menu
        <kbd className="ml-auto rounded-none border border-border px-1.5 py-0.5 text-2xs">
          ⌘K
        </kbd>
      </button>
      <CommandMenu
        groups={GROUPS}
        open={open}
        onOpenChange={setOpen}
        placeholder="Search commands..."
      />
      <p className="text-2xs text-muted-foreground">
        Click the button or press the trigger to open. Use arrow keys to
        navigate, Enter to select.
      </p>
    </div>
  );
}
