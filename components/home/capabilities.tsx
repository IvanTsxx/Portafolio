"use client";

import { useState } from "react";

import {
  CornerMarks,
  HomeSectionShell,
  SectionHeading,
  StatusDot,
} from "@/components/home/primitives";
import { LazyCapabilityScene } from "@/components/home/scene/lazy-scenes";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { agentProfiles } from "@/lib/agents/roles";
import { capabilities } from "@/lib/home/content";
import type { CapabilityId } from "@/lib/home/content";

const isCapabilityId = (value: unknown): value is CapabilityId =>
  capabilities.some((capability) => capability.id === value);

export const Capabilities = () => {
  const [activeId, setActiveId] = useState<CapabilityId>(capabilities[0].id);
  const active =
    capabilities.find((capability) => capability.id === activeId) ??
    capabilities[0];
  const profile = agentProfiles[active.agent.role];

  return (
    <HomeSectionShell className="py-24 md:py-32" id="capabilities">
      <SectionHeading
        id="capabilities"
        lede="Seven stations on one bench. Pick one to see how I work in it and which agent I hand the repetitive parts to."
        title="The workstation"
      />
      <Tabs
        className="mt-12 grid gap-6 lg:grid-cols-12"
        onValueChange={(value) => {
          if (isCapabilityId(value)) {
            setActiveId(value);
          }
        }}
        orientation="vertical"
        value={activeId}
      >
        <TabsList
          aria-label="Capabilities"
          className="border-rule h-auto w-full flex-col items-stretch gap-0 border-t p-0 lg:col-span-4"
          variant="line"
        >
          {capabilities.map((capability) => (
            <TabsTrigger
              className="group/trigger border-rule text-muted-foreground hover:text-foreground data-active:text-foreground dark:data-active:border-rule h-auto min-h-12 justify-start gap-4 border-0 border-b px-0 py-3 text-left text-base font-normal after:hidden data-active:border-0 data-active:border-b data-active:bg-transparent dark:data-active:bg-transparent"
              key={capability.id}
              value={capability.id}
            >
              <span className="label text-faint group-data-active/trigger:text-clay w-10 transition-colors">
                {capability.index}
              </span>
              {capability.title}
              <span
                aria-hidden
                className="bg-clay ml-auto size-1.5 rounded-full opacity-0 transition-opacity group-data-active/trigger:opacity-100"
              />
            </TabsTrigger>
          ))}
        </TabsList>
        <div className="border-rule bg-card/40 relative grid border lg:col-span-8 lg:grid-cols-2">
          <CornerMarks />
          {capabilities.map((capability) => (
            <TabsContent
              className="flex flex-col gap-8 p-6 text-base md:p-8"
              key={capability.id}
              value={capability.id}
            >
              <div className="flex flex-col gap-4">
                <span className="label text-faint">
                  {capability.index} · Station
                </span>
                <h3 className="display text-4xl md:text-5xl">
                  {capability.title}
                </h3>
                <p className="text-muted-foreground text-pretty">
                  {capability.statement}
                </p>
              </div>
              <ul className="flex flex-col gap-3">
                {capability.practices.map((practice) => (
                  <li className="flex gap-3 text-sm" key={practice}>
                    <span
                      aria-hidden
                      className="bg-rule-strong mt-2 h-px w-3 shrink-0"
                    />
                    {practice}
                  </li>
                ))}
              </ul>
              <div className="border-rule mt-auto flex flex-col gap-3 border-t pt-4">
                <span className="label text-faint">Toolkit</span>
                <ul className="flex flex-wrap gap-1.5">
                  {capability.toolkit.map((tool) => (
                    <li
                      className="label border-rule-strong text-muted-foreground inline-flex h-6 items-center border px-2 normal-case"
                      key={tool}
                    >
                      {tool}
                    </li>
                  ))}
                </ul>
              </div>
            </TabsContent>
          ))}
          <div className="border-rule relative min-h-72 border-t lg:border-t-0 lg:border-l">
            <LazyCapabilityScene
              action={active.agent.action}
              className="absolute inset-0"
              role={active.agent.role}
              switchKey={active.id}
            />
            <p className="label text-muted-foreground pointer-events-none absolute inset-x-0 bottom-0 flex items-center gap-2 p-4">
              <StatusDot />
              {profile.designation} · {profile.title} · {active.agent.action}
            </p>
          </div>
        </div>
      </Tabs>
    </HomeSectionShell>
  );
};
