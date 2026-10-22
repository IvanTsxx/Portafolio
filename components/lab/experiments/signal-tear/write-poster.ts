import {
  readSourceLuma,
  writePosterBitmap,
} from "@/components/lab/source/write-poster-bitmap";

import { tearPoster } from "./poster-raster";

await writePosterBitmap(
  import.meta.dir,
  tearPoster(await readSourceLuma("messi"))
);
