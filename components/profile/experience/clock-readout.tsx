import { FigureReadout } from "@/components/profile/figure-plate";

import type { ClockReading } from "./clock-reading";

export const ClockReadout = ({ reading }: { reading: ClockReading }) => (
  <FigureReadout
    lead={
      reading.href ? (
        <a
          className="ink-underline"
          href={reading.href}
          rel="noreferrer"
          target="_blank"
        >
          {reading.lead} ↗
        </a>
      ) : (
        reading.lead
      )
    }
    swapKey={reading.key}
    trail={reading.trail}
  />
);
