import { createRelativeLink } from "fumadocs-ui/mdx";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LLMCopyButton, ViewOptions } from "@/components/ai/page-actions";
import { DocsBody, DocsPage } from "@/components/layout/notebook/page";
import { PageLastUpdate } from "@/components/layout/notebook/page/client";
import { getPageImage, source } from "@/lib/source";
import { getMDXComponents } from "@/mdx-components";

export default async function Page(props: PageProps<"/[[...slug]]">) {
  const params = await props.params;
  const page = source.getPage(params.slug);
  if (!page) {
    notFound();
  }
  const { lastModified } = await page.data;

  const MDX = page.data.body;

  return (
    <DocsPage full={page.data.full} toc={page.data.toc}>
      <div className="flex flex-row items-center gap-2 border-b pb-6">
        {lastModified && <PageLastUpdate date={lastModified} />}
        <LLMCopyButton markdownUrl={`${page.url}.mdx`} />
        <ViewOptions markdownUrl={`${page.url}.mdx`} />
      </div>
      <DocsBody>
        <MDX
          components={getMDXComponents({
            // this allows you to link to other pages with relative file paths
            a: createRelativeLink(source, page),
          })}
        />
      </DocsBody>
    </DocsPage>
  );
}

export async function generateStaticParams() {
  return source.generateParams();
}

export async function generateMetadata(
  props: PageProps<"/[[...slug]]">
): Promise<Metadata> {
  const params = await props.params;
  const page = source.getPage(params.slug);
  if (!page) {
    notFound();
  }

  return {
    title: page.data.title,
    description: page.data.description,
    openGraph: {
      images: getPageImage(page).url,
      title: page.data.title,
      description: page.data.description,
      url: page.url,
      siteName: "Ivan Bongiovanni",
      locale: "es_AR",
      type: "website",
      countryName: "Argentina",
    },
    keywords: page.data.keywords,
    authors: [{ name: "Ivan Bongiovanni" }],
    creator: "Ivan Bongiovanni",
    metadataBase: new URL("https://ivantsx.dev"),

    twitter: {
      card: "summary_large_image",
      title: page.data.title,
      description: page.data.description,
      creator: "@IvanTsxx",
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}
