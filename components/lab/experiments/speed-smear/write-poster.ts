import { orderedDither } from "@/components/lab/source/ordered-dither";
import {
  posterGrid,
  readSourceLuma,
  writePosterBitmap,
} from "@/components/lab/source/write-poster-bitmap";

import { inkCurve, smearPoster } from "./poster-raster";

const smeared = smearPoster(await readSourceLuma("ippo"));
const ink = orderedDither({
  height: posterGrid.rows,
  values: smeared.map((value) => (1 - inkCurve(value)) * 255),
  width: posterGrid.columns,
});
await writePosterBitmap(import.meta.dir, ink);
