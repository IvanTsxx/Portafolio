import {
  detailPosterGrid,
  readSourceLuma,
  writePosterBitmap,
} from "@/components/lab/source/write-poster-bitmap";

import { dotPoster } from "./poster-raster";

await writePosterBitmap(
  import.meta.dir,
  dotPoster(await readSourceLuma("rocky", detailPosterGrid)),
  detailPosterGrid
);
