import type { ReactNode } from "react";

import { DocumentSection } from "@/components/site/document-section";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Kbd, KbdGroup } from "@/components/ui/kbd";
import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  otherPrimitiveFiles,
  primitiveSpecs,
} from "@/lib/design-system/catalog";
import type { ComponentSpec, PrimitiveId } from "@/lib/design-system/catalog";
import { sectionById } from "@/lib/design-system/sections";

import { ClassTag, SpecCell, SpecGrid, padCount } from "./spec-frame";

const buttonVariants = [
  "default",
  "outline",
  "secondary",
  "ghost",
  "destructive",
  "link",
] as const;

const buttonSizes = ["xs", "sm", "default", "lg"] as const;

const badgeVariants = [
  "default",
  "outline",
  "secondary",
  "ghost",
  "destructive",
  "link",
] as const;

const demos = {
  badge: (
    <div className="flex flex-wrap gap-2">
      {badgeVariants.map((variant) => (
        <Badge key={variant} variant={variant}>
          {variant}
        </Badge>
      ))}
    </div>
  ),
  button: (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap gap-2">
        {buttonVariants.map((variant) => (
          <Button key={variant} variant={variant}>
            {variant}
          </Button>
        ))}
      </div>
      <div className="flex flex-wrap items-center gap-2">
        {buttonSizes.map((size) => (
          <Button key={size} size={size} variant="outline">
            {size}
          </Button>
        ))}
        <Button disabled variant="outline">
          disabled
        </Button>
      </div>
    </div>
  ),
  input: (
    <div className="flex flex-col gap-2">
      <Input aria-label="Search tokens" placeholder="Search tokens" />
      <Input aria-invalid aria-label="Invalid value" defaultValue="--paper-" />
      <Input aria-label="Disabled field" defaultValue="Read only" disabled />
    </div>
  ),
  kbd: (
    <div className="flex flex-wrap items-center gap-3">
      <KbdGroup>
        <Kbd>⌘</Kbd>
        <Kbd>K</Kbd>
      </KbdGroup>
      <Kbd>Esc</Kbd>
      <KbdGroup>
        <Kbd>Shift</Kbd>
        <Kbd>Click</Kbd>
      </KbdGroup>
    </div>
  ),
  separator: (
    <div className="flex flex-col gap-3">
      <div className="label text-graphite flex h-5 items-center gap-3">
        <span>Tokens</span>
        <Separator orientation="vertical" />
        <span>Parts</span>
        <Separator orientation="vertical" />
        <span>Motion</span>
      </div>
      <Separator />
    </div>
  ),
  slider: (
    <div className="flex flex-col gap-4">
      <Slider aria-label="Density" defaultValue={[40]} />
      <Slider aria-label="Range" defaultValue={[20, 70]} />
    </div>
  ),
  switch: (
    <div className="label text-ink flex flex-col gap-3">
      <div className="flex items-center justify-between gap-3">
        <label htmlFor="switch-reduced-motion">Reduced motion</label>
        <Switch defaultChecked id="switch-reduced-motion" />
      </div>
      <div className="flex items-center justify-between gap-3">
        <label htmlFor="switch-compact">Compact</label>
        <Switch id="switch-compact" size="sm" />
      </div>
    </div>
  ),
  tabs: (
    <Tabs defaultValue="preview">
      <TabsList variant="line">
        <TabsTrigger value="preview">Preview</TabsTrigger>
        <TabsTrigger value="code">Code</TabsTrigger>
        <TabsTrigger value="usage">Usage</TabsTrigger>
      </TabsList>
      <TabsContent className="text-graphite text-sm" value="preview">
        Live render.
      </TabsContent>
      <TabsContent className="text-graphite text-sm" value="code">
        Source with highlighting.
      </TabsContent>
      <TabsContent className="text-graphite text-sm" value="usage">
        Props and variants.
      </TabsContent>
    </Tabs>
  ),
  "toggle-group": (
    <div className="flex flex-col gap-3">
      <ToggleGroup defaultValue={["grid"]} spacing={0} variant="outline">
        <ToggleGroupItem value="grid">Grid</ToggleGroupItem>
        <ToggleGroupItem value="list">List</ToggleGroupItem>
        <ToggleGroupItem value="map">Map</ToggleGroupItem>
      </ToggleGroup>
      <ToggleGroup defaultValue={["bold"]} multiple size="sm">
        <ToggleGroupItem value="bold">Bold</ToggleGroupItem>
        <ToggleGroupItem value="italic">Italic</ToggleGroupItem>
      </ToggleGroup>
    </div>
  ),
  tooltip: (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger render={<Button variant="outline" />}>
          Hover or focus
        </TooltipTrigger>
        <TooltipContent>
          Copy design.md
          <Kbd>C</Kbd>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  ),
} as const satisfies Record<PrimitiveId, ReactNode>;

const variantSummary = (spec: ComponentSpec) =>
  spec.variants
    .map(
      (axis) =>
        `${axis.axis}: ${axis.values.map((value) => value.name).join(" ")}`
    )
    .join(" · ");

const importLine = (spec: ComponentSpec) =>
  `@/${spec.file.replace(/\.tsx?$/u, "")}`;

export const PrimitivesSection = () => {
  const section = sectionById("primitives");
  return (
    <DocumentSection
      aside={`${padCount(primitiveSpecs.length)} shown`}
      id={section.id}
      index={section.index}
      jp={section.jp}
      label={section.label}
      waypoint={{ action: "check", role: "inspector", side: "left" }}
    >
      <SpecGrid className="grid-cols-1 @3xl:grid-cols-2">
        {primitiveSpecs.map((spec, index) => {
          const summary = variantSummary(spec);
          return (
            <SpecCell
              className={spec.id === "button" ? "@3xl:col-span-2" : undefined}
              code={`P-${padCount(index + 1)}`}
              footer={importLine(spec)}
              jp={spec.jp}
              key={spec.id}
              name={spec.name}
            >
              {demos[spec.id]}
              {summary ? (
                <p className="label text-mist normal-case">{summary}</p>
              ) : null}
            </SpecCell>
          );
        })}
      </SpecGrid>
      <p className="label text-mist flex flex-wrap items-baseline gap-2 normal-case">
        <span className="uppercase">Also installed</span>
        {otherPrimitiveFiles.map((file) => (
          <ClassTag key={file}>{file}</ClassTag>
        ))}
      </p>
    </DocumentSection>
  );
};
