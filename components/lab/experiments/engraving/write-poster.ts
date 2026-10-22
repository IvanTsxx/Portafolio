import {
  detailPosterGrid,
  readSourceLuma,
  writePosterBitmap,
} from "@/components/lab/source/write-poster-bitmap";

import { engravingPoster } from "./poster-raster";

await writePosterBitmap(
  import.meta.dir,
  engravingPoster(await readSourceLuma("ippo", detailPosterGrid)),
  detailPosterGrid
);
