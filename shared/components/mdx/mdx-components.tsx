import type { MDXComponents as MDXComponentsType } from "mdx/types";
import Link from "next/link";
import * as React from "react";

import { InstallCommand } from "@/app/(app)/(registry)/_components/install-command";
import { RegistryPreview } from "@/app/(app)/(registry)/_components/registry-preview";
import { PreShikiComponent } from "@/shared/components/code-block/mdx/pre-shiki";
import { ShadcnInstallCommand } from "@/shared/components/shadcn-install-command";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/shared/components/ui/tabs";
import { cn } from "@/shared/lib/utils";

import { Showcase } from "./showcase";

const DocCard = ({
  folder,
  document,
  anchor,
}: {
  folder: string;
  document: string;
  anchor?: string;
}) => (
  <div className="border border-border bg-secondary/30 p-4 rounded-md my-4 flex items-center justify-between">
    <div className="flex items-center gap-3">
      <div className="size-8 bg-background border border-border flex items-center justify-center rounded">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-muted-foreground"
        >
          <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
          <polyline points="14 2 14 8 20 8" />
        </svg>
      </div>
      <div>
        <h4 className="text-[14px] font-medium text-foreground">{document}</h4>
        <p className="text-[12px] text-muted-foreground">{folder}</p>
      </div>
    </div>
    <Link
      prefetch={false}
      href={`#${anchor ?? ""}`}
      className="text-[12px] text-brand-green hover:underline"
    >
      View →
    </Link>
  </div>
);

export const mdxComponents: MDXComponentsType = {
  DocCard,
  InstallCommand,
  RegistryPreview,
  ShadcnInstallCommand,
  Showcase,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  a: ({
    className,
    href,
    ...props
  }: React.AnchorHTMLAttributes<HTMLAnchorElement>) => (
    <Link
      prefetch={false}
      href={href ?? "#"}
      className={cn(
        "font-medium text-brand-green underline underline-offset-4",
        className
      )}
      {...props}
    />
  ),
  ...PreShikiComponent,
};
