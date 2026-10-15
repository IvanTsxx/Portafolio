"use client";

import { useId } from "react";
import type { ReactNode } from "react";

import {
  chipClassName,
  technicalButtonVariants,
} from "@/components/site/styles";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { cn } from "@/lib/utils";

interface ControlRowProps {
  labelId: string;
  label: string;
  readout?: ReactNode;
  hint?: string;
  children: ReactNode;
}

const ControlRow = ({
  labelId,
  label,
  readout,
  hint,
  children,
}: ControlRowProps) => (
  <div className="flex flex-col gap-3 px-5 py-4">
    <div className="flex items-baseline justify-between gap-4">
      <span className="label text-ink" id={labelId}>
        {label}
      </span>
      {readout === undefined ? null : (
        <span className="label text-graphite tabular-nums">{readout}</span>
      )}
    </div>
    {children}
    {hint ? <p className="text-mist text-xs/relaxed">{hint}</p> : null}
  </div>
);

interface SliderControlProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  format?: (value: number) => string;
  hint?: string;
  disabled?: boolean;
  onChange: (value: number) => void;
}

export const SliderControl = ({
  label,
  value,
  min,
  max,
  step = 1,
  format = String,
  hint,
  disabled = false,
  onChange,
}: SliderControlProps) => {
  const labelId = useId();
  return (
    <ControlRow
      hint={hint}
      label={label}
      labelId={labelId}
      readout={format(value)}
    >
      <Slider
        aria-labelledby={labelId}
        disabled={disabled}
        max={max}
        min={min}
        onValueChange={(next) =>
          onChange(Array.isArray(next) ? (next[0] ?? min) : next)
        }
        step={step}
        value={value}
      />
    </ControlRow>
  );
};

interface TextControlProps {
  label: string;
  value: string;
  maxLength: number;
  hint?: string;
  disabled?: boolean;
  onChange: (value: string) => void;
}

export const TextControl = ({
  label,
  value,
  maxLength,
  hint,
  disabled = false,
  onChange,
}: TextControlProps) => {
  const labelId = useId();
  return (
    <ControlRow
      hint={hint}
      label={label}
      labelId={labelId}
      readout={`${value.length}/${maxLength}`}
    >
      <Input
        aria-labelledby={labelId}
        autoComplete="off"
        className="font-mono"
        disabled={disabled}
        maxLength={maxLength}
        onChange={(event) => onChange(event.target.value)}
        spellCheck={false}
        value={value}
      />
    </ControlRow>
  );
};

interface SwitchControlProps {
  label: string;
  checked: boolean;
  hint?: string;
  disabled?: boolean;
  onChange: (checked: boolean) => void;
}

export const SwitchControl = ({
  label,
  checked,
  hint,
  disabled = false,
  onChange,
}: SwitchControlProps) => {
  const labelId = useId();
  return (
    <div className="flex flex-col gap-2 px-5 py-4">
      <div className="flex items-center justify-between gap-4">
        <span className="label text-ink" id={labelId}>
          {label}
        </span>
        <Switch
          aria-labelledby={labelId}
          checked={checked}
          disabled={disabled}
          onCheckedChange={onChange}
        />
      </div>
      {hint ? <p className="text-mist text-xs/relaxed">{hint}</p> : null}
    </div>
  );
};

interface ToggleControlProps<Value extends string> {
  label: string;
  value: Value;
  options: readonly { value: Value; label: string }[];
  hint?: string;
  disabled?: boolean;
  onChange: (value: Value) => void;
}

export const ToggleControl = <Value extends string>({
  label,
  value,
  options,
  hint,
  disabled = false,
  onChange,
}: ToggleControlProps<Value>) => {
  const labelId = useId();
  return (
    <ControlRow hint={hint} label={label} labelId={labelId}>
      <ToggleGroup
        aria-labelledby={labelId}
        className="w-full"
        disabled={disabled}
        onValueChange={(next) => {
          const selected = options.find((option) => option.value === next[0]);
          if (selected) {
            onChange(selected.value);
          }
        }}
        spacing={1}
        value={[value]}
        variant="outline"
      >
        {options.map((option) => (
          <ToggleGroupItem
            className={cn(chipClassName, "flex-1 justify-center")}
            key={option.value}
            value={option.value}
          >
            {option.label}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
    </ControlRow>
  );
};

interface ActionControlProps {
  label: string;
  actionLabel: string;
  disabled?: boolean;
  onAction: () => void;
}

export const ActionControl = ({
  label,
  actionLabel,
  disabled = false,
  onAction,
}: ActionControlProps) => (
  <div className="flex items-center justify-between gap-4 px-5 py-4">
    <span className="label text-ink">{label}</span>
    <button
      className={technicalButtonVariants({ size: "sm" })}
      disabled={disabled}
      onClick={onAction}
      type="button"
    >
      {actionLabel}
    </button>
  </div>
);

interface ControlTab {
  value: string;
  label: string;
  content: ReactNode;
}

interface ControlTabsProps {
  label: string;
  tabs: readonly ControlTab[];
}

export const ControlTabs = ({ label, tabs }: ControlTabsProps) => (
  <Tabs className="gap-0" defaultValue={tabs[0]?.value}>
    <TabsList
      aria-label={label}
      className="border-rule h-auto w-full gap-0 border-b p-0"
      variant="line"
    >
      {tabs.map((tab) => (
        <TabsTrigger
          className="label min-h-11 md:min-h-9"
          key={tab.value}
          value={tab.value}
        >
          {tab.label}
        </TabsTrigger>
      ))}
    </TabsList>
    {tabs.map((tab) => (
      <TabsContent
        className="divide-rule flex flex-col divide-y"
        key={tab.value}
        value={tab.value}
      >
        {tab.content}
      </TabsContent>
    ))}
  </Tabs>
);
