import { fitWidth } from "@/components/iso/iso-kit";
import type { Plan, Point3, Projection } from "@/components/iso/iso-kit";

export interface PlotFrame {
  azimuth: number;
  cols: number;
  elevation: number;
  pitchX: number;
  pitchY: number;
  width: number;
}

export interface Plot {
  plate: Plan;
  projection: Projection;
  slots: readonly Plan[];
  viewBox: string;
}

export const PLATE_TOP = 14;

export const log2Stars = (stars: number) => Math.log2(1 + Math.max(0, stars));

export const plotOf = (
  count: number,
  frame: PlotFrame,
  slot: { d: number; w: number },
  { margin, rise }: { margin: number; rise: number }
): Plot => {
  const rows = Math.ceil(count / frame.cols);
  const slots = Array.from({ length: count }, (_, index): Plan => ({
    d: slot.d,
    r: 1.5,
    w: slot.w,
    x: margin + (index % frame.cols) * frame.pitchX,
    y: margin + Math.floor(index / frame.cols) * frame.pitchY,
  }));
  const plate: Plan = {
    d: margin * 2 + (rows - 1) * frame.pitchY + slot.d,
    r: 3,
    w: margin * 2 + (frame.cols - 1) * frame.pitchX + slot.w,
    x: 0,
    y: 0,
  };
  const box: Point3[] = [
    [0, 0, 0],
    [plate.w, 0, 0],
    [0, plate.d, 0],
    [plate.w, plate.d, 0],
    [0, 0, PLATE_TOP + rise],
    [plate.w, 0, PLATE_TOP + rise],
  ];
  const fit = fitWidth(box, frame.width, {
    azimuth: frame.azimuth,
    elevation: frame.elevation,
    pad: 14,
  });
  return {
    plate,
    projection: fit.projection,
    slots,
    viewBox: `0 0 ${frame.width} ${fit.height}`,
  };
};
