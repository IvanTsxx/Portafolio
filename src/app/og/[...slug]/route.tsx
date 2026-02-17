import { readFileSync } from "node:fs";
import { join } from "node:path";
import { ImageResponse } from "@takumi-rs/image-response";
import { notFound } from "next/navigation";
import { getPageImage, source } from "@/lib/source";
import BlogPostTemplate from "@/takumi/takumi-template/src/templates/blog-post-template";

export const revalidate = false;

export async function GET(
  _req: Request,
  props: { params: Promise<{ slug: string[] }> }
) {
  const { slug } = await props.params;
  const page = source.getPage(slug.slice(0, -1));
  if (!page) {
    notFound();
  }

  const lastModified = page.data.lastModified?.toISOString();
  // Read the avatar file from the filesystem
  const avatarPath = join(process.cwd(), "public", "avatar.webp");
  const avatarBuffer = readFileSync(avatarPath);
  const avatarBase64 = `data:image/webp;base64,${avatarBuffer.toString(
    "base64"
  )}`;

  return new ImageResponse(
    <BlogPostTemplate
      author="Ivan Bongiovanni"
      avatar={avatarBase64}
      category={page.data.keywords?.[0]}
      date={
        <time dateTime={lastModified}>
          {new Date(lastModified || "").toLocaleDateString()}
        </time>
      }
      title={page.data.title}
    />,
    {
      width: 1200,
      height: 630,
      format: "webp",
    }
  );
}

export function generateStaticParams() {
  return source.getPages().map((page) => ({
    lang: page.locale,
    slug: getPageImage(page).segments,
  }));
}
