import { notFound } from "next/navigation";

import { getPost, getPostSlugs } from "@/lib/content/blog";
import { renderOgImage } from "@/lib/content/og-image";

export const alt = "Field note";
export const size = { height: 630, width: 1200 };
export const contentType = "image/png";

export const generateStaticParams = async () => {
  const slugs = await getPostSlugs();
  return slugs.map((slug) => ({ slug }));
};

const BlogOpenGraphImage = async ({
  params,
}: {
  params: Promise<{ slug: string }>;
}) => {
  const { slug } = await params;
  const document = await getPost(slug);
  if (!document) {
    notFound();
  }
  const { entry: post } = document;
  return renderOgImage({
    eyebrow: `Field notes · ${post.date} · ${post.readingTimeMinutes} min read`,
    sample: post.sample,
    title: post.title,
  });
};

export default BlogOpenGraphImage;
