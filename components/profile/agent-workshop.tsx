"use client";

import { Tabs } from "@base-ui/react/tabs";
import {
  ArrowCounterClockwiseIcon,
  CheckIcon,
  LinkSimpleIcon,
  ShuffleIcon,
  WarningIcon,
} from "@phosphor-icons/react";
import type { Icon } from "@phosphor-icons/react";
import { cva } from "class-variance-authority";
import { useEffect, useId, useLayoutEffect, useRef, useState } from "react";

import { outfitPieceIds, outfitSlots } from "@/components/agents/outfit";
import type { OutfitPieceId, OutfitSlot } from "@/components/agents/outfit";
import { registerCompanionStage } from "@/components/scene/companion-stages";
import { dressCompanion } from "@/components/scene/companion-wardrobe";
import { useWebGLSupport } from "@/components/scene/webgl-support";
import { DocumentSection } from "@/components/site/document-section";
import { focusRingClassName } from "@/components/site/styles";
import type { AgentAction, AgentRole } from "@/lib/agents/roles";
import { agentActions, agentProfiles, agentRoles } from "@/lib/agents/roles";
import { useWorkshopParams } from "@/lib/agents/use-workshop-params";
import type { WorkshopState } from "@/lib/agents/workshop";
import {
  defaultWorkshopState,
  matchingPreset,
  presetState,
  randomAction,
  randomOutfit,
  withPiece,
} from "@/lib/agents/workshop";
import {
  actionCopy,
  pieceAnnotation,
  slotCopy,
} from "@/lib/agents/workshop-copy";
import { sectionScripts } from "@/lib/site/section-scripts";
import { cn } from "@/lib/utils";

export const workshopSectionIndex = "GH-07";

const copyStatusSeconds = 2;
const boothActorShare = 0.6;
const boothYaw = -0.32;

const chip = cva(
  `label ease-mechanical inline-flex h-9 cursor-pointer items-center border px-2.5 transition-[background-color,color,border-color] duration-100 select-none ${focusRingClassName}`,
  {
    defaultVariants: { selected: false },
    variants: {
      selected: {
        false:
          "border-rule text-graphite pointer-fine:hover:border-ink pointer-fine:hover:text-ink",
        true: "border-ink bg-ink text-paper",
      },
    },
  }
);

const toolButton = `ease-mechanical text-graphite inline-flex size-11 cursor-pointer items-center justify-center transition-colors duration-100 pointer-fine:hover:text-ink ${focusRingClassName}`;

type Drawer = "preset" | OutfitSlot | "action";

const drawers: readonly { id: Drawer; label: string }[] = [
  { id: "preset", label: "Role" },
  ...outfitSlots.map((slot) => ({ id: slot, label: slotCopy[slot].label })),
  { id: "action", label: "Action" },
];

const Choice = ({
  isSelected,
  label,
  name,
  onPick,
  value,
}: {
  isSelected: boolean;
  label: string;
  name: string;
  onPick: () => void;
  value: string;
}) => (
  <label
    className={cn(
      chip({ selected: isSelected }),
      "has-focus-visible:ring-ink has-focus-visible:ring-2 has-focus-visible:ring-offset-2"
    )}
  >
    <input
      checked={isSelected}
      className="sr-only"
      name={name}
      onChange={onPick}
      type="radio"
      value={value}
    />
    {label}
  </label>
);

const PieceChoices = <Slot extends OutfitSlot>({
  onPick,
  selected,
  slot,
}: {
  onPick: (piece: OutfitPieceId<Slot>) => void;
  selected: OutfitPieceId<Slot>;
  slot: Slot;
}) => {
  const name = useId();
  const pieces: readonly OutfitPieceId<Slot>[] = outfitPieceIds[slot];
  return pieces.map((piece) => (
    <Choice
      isSelected={piece === selected}
      key={piece}
      label={pieceAnnotation(slot, piece).label}
      name={name}
      onPick={() => onPick(piece)}
      value={piece}
    />
  ));
};

const ActionChoices = ({
  onPick,
  selected,
}: {
  onPick: (action: AgentAction) => void;
  selected: AgentAction;
}) => {
  const name = useId();
  return agentActions.map((action) => (
    <Choice
      isSelected={action === selected}
      key={action}
      label={actionCopy[action].label}
      name={name}
      onPick={() => onPick(action)}
      value={action}
    />
  ));
};

const RoleChoices = ({
  active,
  onPick,
}: {
  active: AgentRole | null;
  onPick: (role: AgentRole) => void;
}) =>
  agentRoles.map((role) => (
    <button
      aria-pressed={role === active}
      className={chip({ selected: role === active })}
      key={role}
      onClick={() => onPick(role)}
      type="button"
    >
      {agentProfiles[role].title}
    </button>
  ));

type CopyStatus = "idle" | "copied" | "failed";

const copyStates = {
  copied: { Icon: CheckIcon, announcement: "Link copied", label: "Copied" },
  failed: {
    Icon: WarningIcon,
    announcement: "Copy failed. Copy the address bar instead",
    label: "Copy failed",
  },
  idle: { Icon: LinkSimpleIcon, announcement: "", label: "Copy link" },
} as const satisfies Record<
  CopyStatus,
  { announcement: string; Icon: Icon; label: string }
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

const useFittingBooth = (state: WorkshopState) => {
  const booth = useRef<HTMLElement>(null);
  const floor = useRef<HTMLSpanElement>(null);
  const action = useRef(state.action);

  useEffect(() => {
    action.current = state.action;
  }, [state.action]);

  useEffect(() => {
    dressCompanion(state.outfit);
  }, [state.outfit]);

  useEffect(() => () => dressCompanion(null), []);

  useLayoutEffect(() => {
    const figure = booth.current;
    const line = floor.current;
    if (!(figure && line)) {
      return;
    }
    return registerCompanionStage({
      figure,
      id: "workshop-booth",
      spot: () => {
        const box = figure.getBoundingClientRect();
        const ground = line.getBoundingClientRect();
        return {
          action: action.current,
          height: box.height * boothActorShare,
          x: (ground.left + ground.right) / 2,
          y: ground.top,
          yaw: boothYaw,
        };
      },
    });
  }, []);

  return { booth, floor };
};

export const AgentWorkshop = ({
  index = workshopSectionIndex,
}: {
  index?: string;
}) => {
  const [state, setState] = useWorkshopParams();
  const [drawer, setDrawer] = useState<Drawer>("preset");
  const [copyStatus, setCopyStatus] = useCopyStatus();
  const hasWebGL = useWebGLSupport();
  const { booth, floor } = useFittingBooth(state);
  const copyState = copyStates[copyStatus];
  const preset = matchingPreset(state.outfit);
  const wornPieces = outfitSlots.flatMap((slot) =>
    state.outfit[slot] === "none"
      ? []
      : [pieceAnnotation(slot, state.outfit[slot]).label]
  );
  const title = preset ? agentProfiles[preset].title : "Custom";

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
          {preset ? agentProfiles[preset].designation : "AG-XX"}
        </span>
      }
      id="workshop"
      index={index}
      jp="工房"
      label="Workshop"
      script={sectionScripts.homeWorkshop}
    >
      <div className="border-rule border">
        <div className="border-rule bg-paper sticky top-13 z-40 flex items-center justify-between gap-3 border-b pl-3 lg:top-12">
          <span className="label flex items-baseline gap-2">
            <span className="text-ink">{title}</span>
            <span className="jp text-mist">試着室</span>
          </span>
          <span className="flex items-center">
            <button
              aria-label="Shuffle outfit and action"
              className={toolButton}
              onClick={() =>
                setState({
                  ...state,
                  action: randomAction(state.action),
                  outfit: randomOutfit(state.outfit),
                })
              }
              type="button"
            >
              <ShuffleIcon aria-hidden className="size-4" />
            </button>
            <button
              aria-label="Reset outfit"
              className={toolButton}
              onClick={() => setState(defaultWorkshopState)}
              type="button"
            >
              <ArrowCounterClockwiseIcon aria-hidden className="size-4" />
            </button>
            <button
              aria-label={copyState.label}
              className={toolButton}
              onClick={copyLink}
              type="button"
            >
              <copyState.Icon aria-hidden className="size-4" />
            </button>
          </span>
        </div>
        <div className="grid md:grid-cols-5">
          <figure
            aria-label={`Fitting room: ${title}, ${wornPieces.join(", ") || "no gear"}, ${actionCopy[state.action].label.toLowerCase()}`}
            className="bg-paper-deep/40 border-rule relative m-0 h-56 border-b md:sticky md:top-24 md:col-span-2 md:h-72 md:self-start md:border-b-0 lg:top-23"
            data-build-block
            ref={booth}
          >
            <span
              aria-hidden
              className="bg-rule-strong absolute inset-x-6 bottom-10 h-px"
              ref={floor}
            />
            <span className="label text-graphite absolute inset-x-0 bottom-0 flex items-baseline justify-between gap-3 p-3">
              <span>{actionCopy[state.action].label}</span>
              {hasWebGL ? null : <span className="text-mist">No 3D</span>}
            </span>
          </figure>
          <Tabs.Root
            className="border-rule flex min-w-0 flex-col md:col-span-3 md:border-l"
            data-build-block
            onValueChange={(value: Drawer) => setDrawer(value)}
            value={drawer}
          >
            <Tabs.List
              aria-label="Outfit"
              className="border-rule flex flex-wrap border-b px-1.5"
            >
              {drawers.map((entry) => (
                <Tabs.Tab
                  className={cn(
                    "label ease-mechanical text-mist data-[active]:text-ink pointer-fine:hover:text-graphite after:bg-ink relative h-10 cursor-pointer px-2 transition-colors duration-100 after:absolute after:inset-x-2 after:bottom-0 after:h-px after:opacity-0 data-[active]:after:opacity-100",
                    focusRingClassName
                  )}
                  key={entry.id}
                  value={entry.id}
                >
                  {entry.label}
                </Tabs.Tab>
              ))}
            </Tabs.List>
            <Tabs.Panel
              className="flex flex-1 flex-wrap content-start gap-1.5 p-3"
              value="preset"
            >
              <RoleChoices
                active={preset}
                onPick={(role) => setState(presetState(role))}
              />
            </Tabs.Panel>
            {outfitSlots.map((slot) => (
              <Tabs.Panel
                className="flex flex-1 flex-wrap content-start gap-1.5 p-3"
                key={slot}
                value={slot}
              >
                <PieceChoices
                  onPick={(piece) => pickPiece(slot, piece)}
                  selected={state.outfit[slot]}
                  slot={slot}
                />
              </Tabs.Panel>
            ))}
            <Tabs.Panel
              className="flex flex-1 flex-wrap content-start gap-1.5 p-3"
              value="action"
            >
              <ActionChoices
                onPick={(action) => setState({ ...state, action })}
                selected={state.action}
              />
            </Tabs.Panel>
            <p aria-live="polite" className="sr-only">
              {copyState.announcement}
            </p>
          </Tabs.Root>
        </div>
      </div>
    </DocumentSection>
  );
};
