import { GalleryLayout } from "@/components/home/layouts/gallery-layout";
import { JsonLd } from "@/components/site/json-ld";
import { getHomeSections } from "@/lib/site/home-sections";
import { buildPageMetadata, pageSeo } from "@/lib/site/seo";
import { homeJsonLd } from "@/lib/site/structured-data";

export const metadata = buildPageMetadata(pageSeo.home);

const HomePage = async () => {
  const sections = await getHomeSections();
  return (
    <>
      <JsonLd data={homeJsonLd()} />
      <GalleryLayout sections={sections} />
    </>
  );
};

export default HomePage;
