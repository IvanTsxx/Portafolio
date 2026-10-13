import type { MetadataRoute } from "next";

import { getPublicRoutes, lastModifiedOf } from "@/lib/site/public-routes";
import { absoluteUrl } from "@/lib/site/seo";

const sitemap = async (): Promise<MetadataRoute.Sitemap> => {
  const routes = await getPublicRoutes();
  return routes.map((route) => ({
    lastModified: lastModifiedOf(route.path),
    url: absoluteUrl(route.path),
  }));
};

export default sitemap;
