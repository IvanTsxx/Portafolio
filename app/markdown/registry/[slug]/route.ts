import { registryItemMarkdown } from "@/lib/markdown/documents";
import { markdownResponse } from "@/lib/markdown/response";
import { getRegistryItem, registryItems } from "@/lib/registry/registry";
import { registryItemPath } from "@/lib/site/seo";

export const dynamic = "force-static";

export const dynamicParams = false;

export const generateStaticParams = () =>
  registryItems.map((item) => ({ slug: item.name }));

export const GET = async (
  _request: Request,
  { params }: RouteContext<"/markdown/registry/[slug]">
) => {
  const { slug } = await params;
  const item = getRegistryItem(slug);
  if (!item) {
    return new Response("Not found", { status: 404 });
  }
  return markdownResponse(await registryItemMarkdown(item), {
    canonicalPath: registryItemPath(slug),
  });
};
