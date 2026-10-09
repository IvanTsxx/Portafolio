import type { BlogPost } from "@/lib/content/blog";
import { buildPostJsonLd } from "@/lib/content/metadata";

export const PostJsonLd = ({ post }: { post: BlogPost }) => (
  <script type="application/ld+json">
    {JSON.stringify(buildPostJsonLd(post)).replaceAll("<", String.raw`<`)}
  </script>
);
