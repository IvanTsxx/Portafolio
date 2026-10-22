import {
  detailPosterGrid,
  readSourceLuma,
  writePosterBitmap,
} from "@/components/lab/source/write-poster-bitmap";

import { rainPoster } from "./poster-raster";

await writePosterBitmap(
  import.meta.dir,
  rainPoster(await readSourceLuma("vegeta", detailPosterGrid)),
  detailPosterGrid
);
