"use client";

import {
  ArrowCounterClockwiseIcon,
  CheckIcon,
  DiceFiveIcon,
  LinkSimpleIcon,
  ShuffleIcon,
  WarningIcon,
} from "@phosphor-icons/react";
import type { Icon } from "@phosphor-icons/react";
import { cva } from "class-variance-authority";
import { useEffect, useId, useState } from "react";
import type { ReactNode } from "react";

import { outfitPieceIds, outfitSlots } from "@/components/agents/outfit";
import type { OutfitPieceId, OutfitSlot } from "@/components/agents/outfit";
import { AgentStageSlot } from "@/components/scene/agent-stage-slot";
import { DocumentSection } from "@/components/site/document-section";
import type { AgentAction, AgentRole } from "@/lib/agents/roles";
import { agentActions, agentProfiles, agentRoles } from "@/lib/agents/roles";
import { useWorkshopParams } from "@/lib/agents/use-workshop-params";
import {
  defaultWorkshopState,
  matchingPreset,
  presetState,
  withPiece,
  randomAction,
  randomOutfit,
} from "@/lib/agents/workshop";
import {
  actionCopy,
  pieceAnnotation,
  roleJp,
  slotCopy,
} from "@/lib/agents/workshop-copy";
import { sectionScripts } from "@/lib/site/section-scripts";
import { cn } from "@/lib/utils";

import { TickMark } from "./module";
import { SpecimenCorners } from "./specimen-corners";
import { TechnicalButton } from "./technical-button";

export const workshopSectionIndex = "GH-07";

const copyStatusSeconds = 2;

const chip = cva(
  "group ease-mechanical has-focus-visible:outline-ink relative flex cursor-pointer border transition-[background-color,color,border-color,translate] duration-100 select-none active:translate-y-px has-focus-visible:outline-1 has-focus-visible:outline-offset-2",
  {
    defaultVariants: { kind: "option", selected: false },
    variants: {
      kind: {
        option: "label h-11 items-center gap-2 px-3",
        piece: "aspect-square min-h-16 flex-col justify-between p-2",
      },
      selected: {
        false:
          "border-rule text-ink pointer-fine:hover:border-ink bg-transparent",
        true: "border-ink bg-ink text-paper",
      },
    },
  }
);

const padIndex = (index: number) => String(index + 1).padStart(2, "0");

const ControlGroup = ({
  children,
  code,
  jp,
  label,
}: {
  children: ReactNode;
  code: string;
  jp: string;
  label: string;
}) => (
  <fieldset className="border-rule relative m-0 min-w-0 border-0 border-b p-4 md:p-5">
    <TickMark />
    <legend className="sr-only">{label}</legend>
    <div
      aria-hidden
      className="label mb-3 flex items-baseline justify-between gap-3"
    >
      <span className="flex items-baseline gap-2">
        <span className="text-mist tabular-nums">{code}</span>
        <span className="text-ink">{label}</span>
      </span>
      <span className="jp text-mist">{jp}</span>
    </div>
    {children}
  </fieldset>
);

const PiecePicker = <Slot extends OutfitSlot>({
  code,
  onPick,
  selected,
  slot,
}: {
  code: string;
  onPick: (piece: OutfitPieceId<Slot>) => void;
  selected: OutfitPieceId<Slot>;
  slot: Slot;
}) => {
  const name = useId();
  const pieces: readonly OutfitPieceId<Slot>[] = outfitPieceIds[slot];
  return (
    <ControlGroup
      code={code}
      jp={slotCopy[slot].jp}
      label={slotCopy[slot].label}
    >
      <div className="grid grid-cols-4 gap-1.5">
        {pieces.map((piece, index) => {
          const isSelected = piece === selected;
          return (
            <label
              className={chip({ kind: "piece", selected: isSelected })}
              key={piece}
            >
              <input
                checked={isSelected}
                className="sr-only"
                name={name}
                onChange={() => onPick(piece)}
                type="radio"
                value={piece}
              />
              <SpecimenCorners />
              <span
                aria-hidden
                className={cn(
                  "label flex items-baseline justify-between gap-1 tabular-nums",
                  isSelected ? "text-paper/70" : "text-mist"
                )}
              >
                <span>{padIndex(index)}</span>
                <span className="jp truncate">
                  {pieceAnnotation(slot, piece).jp}
                </span>
              </span>
              <span className="label text-left leading-tight tracking-wider break-words hyphens-auto">
                {pieceAnnotation(slot, piece).label}
              </span>
            </label>
          );
        })}
      </div>
    </ControlGroup>
  );
};

const ActionPicker = ({
  onPick,
  selected,
}: {
  onPick: (action: AgentAction) => void;
  selected: AgentAction;
}) => {
  const name = useId();
  return (
    <ControlGroup code="W-07" jp="動作" label="Action">
      <div className="flex flex-wrap gap-1.5">
        {agentActions.map((action) => {
          const isSelected = action === selected;
          return (
            <label className={chip({ selected: isSelected })} key={action}>
              <input
                checked={isSelected}
                className="sr-only"
                name={name}
                onChange={() => onPick(action)}
                type="radio"
                value={action}
              />
              <span>{actionCopy[action].label}</span>
              <span
                aria-hidden
                className={cn("jp", isSelected ? "text-paper/70" : "text-mist")}
              >
                {actionCopy[action].jp}
              </span>
            </label>
          );
        })}
      </div>
    </ControlGroup>
  );
};

const PresetPicker = ({
  active,
  onPick,
  onRandom,
}: {
  active: AgentRole | null;
  onPick: (role: AgentRole) => void;
  onRandom: () => void;
}) => (
  <ControlGroup code="W-01" jp="役割" label="Preset">
    <div className="flex flex-wrap gap-1.5">
      {agentRoles.map((role) => {
        const isActive = role === active;
        return (
          <button
            aria-pressed={isActive}
            className={chip({ selected: isActive })}
            key={role}
            onClick={() => onPick(role)}
            type="button"
          >
            <span>{agentProfiles[role].title}</span>
            <span
              aria-hidden
              className={cn("jp", isActive ? "text-paper/70" : "text-mist")}
            >
              {roleJp[role]}
            </span>
          </button>
        );
      })}
      <button className={chip()} onClick={onRandom} type="button">
        <DiceFiveIcon aria-hidden className="size-4" />
        <span>Random</span>
        <span aria-hidden className="jp text-mist">
          無作為
        </span>
      </button>
    </div>
  </ControlGroup>
);

type CopyStatus = "idle" | "copied" | "failed";

const copyStates = {
  copied: {
    Icon: CheckIcon,
    announcement: "Link copied to the clipboard",
    label: "Copied",
    tone: "selected",
  },
  failed: {
    Icon: WarningIcon,
    announcement: "Copy failed. Copy the address bar instead",
    label: "Copy failed",
    tone: "outline",
  },
  idle: {
    Icon: LinkSimpleIcon,
    announcement: "",
    label: "Copy link",
    tone: "solid",
  },
} as const satisfies Record<
  CopyStatus,
  {
    announcement: string;
    Icon: Icon;
    label: string;
    tone: "outline" | "selected" | "solid";
  }
>;

const useCopyStatus = () => {
  const [status, setStatus] = useState<CopyStatus>("idle");
  useEffect(() => {
    if (status === "idle") {
      return;
    }
    const timer = window.setTimeout(
      () => setStatus("idle"),
      copyStatusSeconds * 1000
    );
    return () => window.clearTimeout(timer);
  }, [status]);
  return [status, setStatus] as const;
};

export const AgentWorkshop = ({
  index = workshopSectionIndex,
}: {
  index?: string;
}) => {
  const [state, setState] = useWorkshopParams();
  const [copyStatus, setCopyStatus] = useCopyStatus();
  const copyState = copyStates[copyStatus];
  const preset = matchingPreset(state.outfit);
  const wornPieces = outfitSlots.flatMap((slot) =>
    state.outfit[slot] === "none"
      ? []
      : [pieceAnnotation(slot, state.outfit[slot]).label]
  );
  const summary = `${preset ? agentProfiles[preset].title : "Custom"} agent, ${
    wornPieces.length > 0 ? wornPieces.join(", ") : "no gear"
  }, ${actionCopy[state.action].label.toLowerCase()}`;

  const pickPiece = <Slot extends OutfitSlot>(
    slot: Slot,
    piece: OutfitPieceId<Slot>
  ) => setState({ ...state, outfit: withPiece(state.outfit, slot, piece) });

  const copyLink = async () => {
    const url = new URL(window.location.href);
    url.hash = "workshop";
    try {
      await navigator.clipboard.writeText(url.toString());
      setCopyStatus("copied");
    } catch {
      setCopyStatus("failed");
    }
  };

  return (
    <DocumentSection
      aside={
        <span className="text-mist tabular-nums">
          {preset ? agentProfiles[preset].designation : "AG-XX"} /{" "}
          {preset ? agentProfiles[preset].title : "Custom"}
        </span>
      }
      id="workshop"
      index={index}
      jp="工房"
      label="Workshop"
      script={sectionScripts.homeWorkshop}
    >
      <div className="border-rule grid border xl:grid-cols-12">
        <div className="border-rule max-xl:bg-paper xl:bg-paper-deep/40 relative z-10 max-xl:sticky max-xl:top-12 max-xl:border-b xl:col-span-6 xl:border-r">
          <div className="max-xl:bg-paper-deep/40 xl:sticky xl:top-12">
            <AgentStageSlot
              action={state.action}
              className="h-[42svh] max-h-120 min-h-64 w-full xl:h-[min(38rem,calc(100svh-6rem))] xl:max-h-none"
              label="Customizable workshop agent"
              outfit={state.outfit}
              role={state.role}
            >
              <div className="label pointer-events-none absolute inset-x-0 top-0 z-40 flex items-baseline justify-between gap-3 p-3 md:p-4">
                <span className="flex items-center gap-2">
                  <span aria-hidden className="bg-clay size-1.5 rounded-full" />
                  <span className="text-ink">
                    {preset ? agentProfiles[preset].designation : "AG-XX"}
                  </span>
                  <span className="text-graphite">
                    {preset ? agentProfiles[preset].title : "Custom build"}
                  </span>
                </span>
                <span className="jp text-mist">試着室</span>
              </div>
              <figcaption
                aria-live="polite"
                className="label pointer-events-none absolute inset-x-0 bottom-0 z-40 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 p-3 md:p-4"
              >
                <span className="sr-only">{summary}</span>
                <span aria-hidden className="text-graphite">
                  {actionCopy[state.action].label}{" "}
                  <span className="jp text-mist">
                    {actionCopy[state.action].jp}
                  </span>
                </span>
                <span aria-hidden className="text-mist">
                  <span className="pointer-coarse:hidden">
                    Hover to react · click to hop
                  </span>
                  <span className="pointer-fine:hidden">Tap to hop</span>
                </span>
              </figcaption>
            </AgentStageSlot>
          </div>
        </div>
        <div className="flex min-w-0 flex-col xl:col-span-6">
          <PresetPicker
            active={preset}
            onPick={(role) => setState(presetState(role))}
            onRandom={() =>
              setState({ ...state, outfit: randomOutfit(state.outfit) })
            }
          />
          {outfitSlots.map((slot, slotIndex) => (
            <PiecePicker
              code={`W-${padIndex(slotIndex + 1)}`}
              key={slot}
              onPick={(piece) => pickPiece(slot, piece)}
              selected={state.outfit[slot]}
              slot={slot}
            />
          ))}
          <ActionPicker
            onPick={(action) => setState({ ...state, action })}
            selected={state.action}
          />
          <div className="grid grid-cols-3 gap-1.5 p-4 md:p-5">
            <TechnicalButton
              className="px-2"
              onClick={() =>
                setState({
                  ...state,
                  action: randomAction(state.action),
                  outfit: randomOutfit(state.outfit),
                })
              }
            >
              <ShuffleIcon aria-hidden className="size-4" />
              Shuffle
            </TechnicalButton>
            <TechnicalButton
              className="px-2"
              onClick={() => setState(defaultWorkshopState)}
            >
              <ArrowCounterClockwiseIcon aria-hidden className="size-4" />
              Reset
            </TechnicalButton>
            <TechnicalButton
              className="px-2"
              onClick={copyLink}
              tone={copyState.tone}
            >
              <copyState.Icon aria-hidden className="size-4" />
              {copyState.label}
            </TechnicalButton>
          </div>
          <p aria-live="polite" className="sr-only">
            {copyState.announcement}
          </p>
        </div>
      </div>
    </DocumentSection>
  );
};
