import { appIconSizes, renderIconMark } from "@/lib/site/icon-mark";

export const generateStaticParams = () =>
  appIconSizes.map((size) => ({ size: String(size) }));

export const GET = async (
  _request: Request,
  { params }: RouteContext<"/pwa-icon/[size]">
) => {
  const { size } = await params;
  const pixels = appIconSizes.find((candidate) => String(candidate) === size);
  if (!pixels) {
    return new Response("Not found", { status: 404 });
  }
  return renderIconMark("app", pixels);
};
