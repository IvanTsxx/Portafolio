import type { JsonLdGraph } from "@/lib/site/structured-data";

export const JsonLd = ({ data }: { data: JsonLdGraph }) => (
  <script type="application/ld+json">
    {JSON.stringify(data).replaceAll("<", String.raw`<`)}
  </script>
);
