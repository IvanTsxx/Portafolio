"use client";

import { ArrowCounterClockwiseIcon } from "@phosphor-icons/react";
import { useId, useState } from "react";
import type { ReactNode } from "react";

import { PreviewStage } from "@/components/registry-docs/preview-stage";
import { choiceItemClassName } from "@/components/registry-docs/toggle-styles";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

export type ControlValue = boolean | number | string;

interface ControlBase<Key extends string> {
  key: Key;
  label: string;
}

interface RangeControl<Key extends string> extends ControlBase<Key> {
  kind: "range";
  max: number;
  min: number;
  step?: number;
  unit?: string;
}

interface ChoiceControl<Key extends string> extends ControlBase<Key> {
  kind: "choice";
  options: readonly string[];
}

interface ToggleControl<Key extends string> extends ControlBase<Key> {
  kind: "toggle";
}

interface TextControl<Key extends string> extends ControlBase<Key> {
  kind: "text";
  maxLength?: number;
}

export type Control<Key extends string = string> =
  | RangeControl<Key>
  | ChoiceControl<Key>
  | ToggleControl<Key>
  | TextControl<Key>;

const readNumber = (value: ControlValue | undefined, fallback: number) =>
  Number(value ?? fallback);

const readString = (value: ControlValue | undefined) => String(value ?? "");

const ControlField = ({
  control,
  onChange,
  value,
}: {
  control: Control;
  onChange: (value: ControlValue) => void;
  value: ControlValue | undefined;
}) => {
  const labelId = useId();

  if (control.kind === "toggle") {
    return (
      <div className="flex items-center justify-between gap-4">
        <span className="label text-muted-foreground" id={labelId}>
          {control.label}
        </span>
        <Switch
          aria-labelledby={labelId}
          checked={value === true}
          onCheckedChange={onChange}
        />
      </div>
    );
  }

  if (control.kind === "range") {
    const current = readNumber(value, control.min);
    return (
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between gap-4">
          <span className="label text-muted-foreground" id={labelId}>
            {control.label}
          </span>
          <output className="label text-foreground tabular-nums">
            {current}
            {control.unit ?? ""}
          </output>
        </div>
        <Slider
          aria-labelledby={labelId}
          max={control.max}
          min={control.min}
          onValueChange={(next) =>
            onChange(Array.isArray(next) ? (next[0] ?? current) : next)
          }
          step={control.step ?? 1}
          value={[current]}
        />
      </div>
    );
  }

  if (control.kind === "choice") {
    const current = readString(value);
    return (
      <div className="flex flex-col gap-3">
        <span className="label text-muted-foreground" id={labelId}>
          {control.label}
        </span>
        <ToggleGroup
          aria-labelledby={labelId}
          className="flex-wrap"
          onValueChange={(next) => {
            const [first] = next;
            if (first !== undefined) {
              onChange(first);
            }
          }}
          size="sm"
          spacing={1}
          value={[current]}
          variant="outline"
        >
          {control.options.map((option) => (
            <ToggleGroupItem
              className={choiceItemClassName}
              key={option}
              value={option}
            >
              {option}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <label className="label text-muted-foreground" htmlFor={labelId}>
        {control.label}
      </label>
      <Input
        className="h-11 text-base md:text-sm"
        id={labelId}
        maxLength={control.maxLength}
        onChange={(event) => onChange(event.target.value)}
        value={readString(value)}
      />
    </div>
  );
};

export const Playground = <
  Values extends { [Key in keyof Values]: ControlValue },
>({
  children,
  controls,
  initialValues,
}: {
  children: (values: Values, context: { runId: number }) => ReactNode;
  controls: readonly Control<Extract<keyof Values, string>>[];
  initialValues: Values;
}) => {
  const [values, setValues] = useState(initialValues);
  const [runId, setRunId] = useState(0);

  const updateValue = (key: keyof Values, value: ControlValue) =>
    setValues((current) => ({ ...current, [key]: value }));

  const reset = () => {
    setValues(initialValues);
    setRunId((current) => current + 1);
  };

  return (
    <div className="border-rule bg-card grid border lg:grid-cols-[minmax(0,1fr)_20rem]">
      <div className="flex flex-col">
        <div className="border-rule flex items-center justify-between gap-4 border-b py-1 pl-4">
          <p className="label text-muted-foreground">
            Live preview · Sample content
          </p>
          <button
            className="label text-muted-foreground hover:text-foreground focus-visible:text-foreground inline-flex min-h-11 items-center gap-2 px-4 transition-colors"
            onClick={() => setRunId((current) => current + 1)}
            type="button"
          >
            <ArrowCounterClockwiseIcon aria-hidden="true" className="size-4" />
            Replay
          </button>
        </div>
        <PreviewStage className="min-h-80 flex-1 border-0">
          {children(values, { runId })}
        </PreviewStage>
      </div>
      <form
        aria-label="Edit parameters"
        className="border-rule flex flex-col gap-6 border-t p-4 lg:border-t-0 lg:border-l"
        onSubmit={(event) => event.preventDefault()}
      >
        <div className="flex items-center justify-between gap-4">
          <p className="label text-foreground">Parameters</p>
          <button
            className="label text-muted-foreground hover:text-foreground focus-visible:text-foreground inline-flex min-h-11 items-center px-2 transition-colors"
            onClick={reset}
            type="button"
          >
            Reset
          </button>
        </div>
        {controls.map((control) => (
          <ControlField
            control={control}
            key={control.key}
            onChange={(next) => updateValue(control.key, next)}
            value={values[control.key]}
          />
        ))}
      </form>
    </div>
  );
};
