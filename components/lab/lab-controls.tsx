"use client";

import { useId } from "react";
import type { ReactNode } from "react";

import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

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
      <span className="text-foreground text-sm" id={labelId}>
        {label}
      </span>
      {readout === undefined ? null : (
        <span className="label text-muted-foreground tabular-nums">
          {readout}
        </span>
      )}
    </div>
    {children}
    {hint ? <p className="text-faint text-xs/relaxed">{hint}</p> : null}
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
        <span className="text-foreground text-sm" id={labelId}>
          {label}
        </span>
        <Switch
          aria-labelledby={labelId}
          checked={checked}
          disabled={disabled}
          onCheckedChange={onChange}
        />
      </div>
      {hint ? <p className="text-faint text-xs/relaxed">{hint}</p> : null}
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
        spacing={0}
        value={[value]}
        variant="outline"
      >
        {options.map((option) => (
          <ToggleGroupItem
            className="label aria-pressed:bg-foreground aria-pressed:text-background flex-1"
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
    <span className="text-foreground text-sm">{label}</span>
    <button
      className="label border-rule-strong text-foreground hover:border-clay hover:text-clay border px-3 py-1.5 transition-colors disabled:pointer-events-none disabled:opacity-50"
      disabled={disabled}
      onClick={onAction}
      type="button"
    >
      {actionLabel}
    </button>
  </div>
);
