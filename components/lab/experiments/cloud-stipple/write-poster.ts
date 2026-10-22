import { blueNoiseBytes } from "@/components/lab/source/blue-noise";
import {
  readSourceLuma,
  writePosterBitmap,
} from "@/components/lab/source/write-poster-bitmap";

import { stipplePoster } from "./poster-raster";

const side = 64;

await writePosterBitmap(
  import.meta.dir,
  stipplePoster(await readSourceLuma("clouds"), blueNoiseBytes(side), side)
);
