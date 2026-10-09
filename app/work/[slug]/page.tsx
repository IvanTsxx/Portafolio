import { ArrowLeft, ArrowUpRight } from "@phosphor-icons/react/dist/ssr";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Figure } from "@/components/content/figure";
import { SampleBadge } from "@/components/content/sample-badge";
import { TableOfContents } from "@/components/content/table-of-contents";
import { Video } from "@/components/content/video";
import { WorkRow } from "@/components/content/work-row";
import { buildWorkMetadata } from "@/lib/content/metadata";
import type { Heading } from "@/lib/content/text";
import {
  getProject,
  getProjectSlugs,
  getRelatedProjects,
  toWorkIndexItem,
} from "@/lib/content/work";
import type { WorkProject } from "@/lib/content/work";
import { cn } from "@/lib/utils";

export const dynamicParams = false;

export const generateStaticParams = async () => {
  const slugs = await getProjectSlugs();
  return slugs.map((slug) => ({ slug }));
};

export const generateMetadata = async ({
  params,
}: PageProps<"/work/[slug]">): Promise<Metadata> => {
  const { slug } = await params;
  const document = await getProject(slug);
  return document ? buildWorkMetadata(document.entry) : {};
};

const Previews = ({ project }: { project: WorkProject }) => {
  if (project.previews.length === 0) {
    return project.sample ? (
      <div className="blueprint-dots border-rule bg-card grid min-h-48 place-items-center rounded-sm border md:min-h-72">
        <p className="label text-muted-foreground">
          Preview slot · add images or video to meta.previews
        </p>
      </div>
    ) : null;
  }
  return (
    <div className="grid gap-6 md:grid-cols-2">
      {project.previews.map((preview, index) => (
        <div
          className={cn(index === 0 && "md:col-span-2")}
          key={`${preview.kind}-${preview.src}`}
        >
          {preview.kind === "image" ? (
            <Figure
              alt={preview.alt}
              caption={preview.caption}
              className="my-0"
              height={preview.height}
              priority={index === 0}
              sizes="(min-width: 768px) 50vw, 100vw"
              src={preview.src}
              width={preview.width}
            />
          ) : (
            <Video
              alt={preview.alt}
              caption={preview.caption}
              className="my-0"
              height={preview.height}
              poster={preview.poster}
              src={preview.src}
              width={preview.width}
            />
          )}
        </div>
      ))}
    </div>
  );
};

const WorkProjectPage = async ({ params }: PageProps<"/work/[slug]">) => {
  const { slug } = await params;
  const document = await getProject(slug);
  if (!document) {
    notFound();
  }

  const { Content, entry: project, headings } = document;
  const related = await getRelatedProjects(project);

  const tableOfContents: Heading[] =
    related.length > 0
      ? [...headings, { depth: 2, id: "related", text: "Related" }]
      : [...headings];

  const facts = [
    { label: "Year", value: String(project.year) },
    {
      label: "Context",
      value: project.client
        ? `${project.client}. ${project.context}`
        : project.context,
    },
    { label: "Role", value: project.role },
    { label: "Stack", value: project.technologies.join(", ") },
  ];

  return (
    <article className="mx-auto w-full max-w-screen-2xl px-4 pt-10 pb-24 md:px-6 md:pt-14">
      <header>
        <Link
          className="label text-muted-foreground hover:text-foreground inline-flex min-h-11 items-center gap-2 transition-colors"
          href="/work"
        >
          <ArrowLeft aria-hidden className="size-4" />
          Work
        </Link>
        <div className="mt-6 flex flex-col items-start gap-6">
          <h1 className="display max-w-4xl text-6xl md:text-8xl">
            {project.title}
          </h1>
          {project.sample ? (
            <SampleBadge source={`content/work/${project.slug}.mdx`} />
          ) : null}
          <p className="text-muted-foreground max-w-2xl text-xl text-pretty">
            {project.summary}
          </p>
        </div>
        <dl className="border-rule mt-12 grid gap-x-8 gap-y-6 border-t py-8 sm:grid-cols-2 lg:grid-cols-4">
          {facts.map((fact) => (
            <div className="flex flex-col gap-2" key={fact.label}>
              <dt className="label text-muted-foreground">{fact.label}</dt>
              <dd className="text-foreground text-sm/6 text-pretty">
                {fact.value}
              </dd>
            </div>
          ))}
        </dl>
        <div className="border-rule grid gap-x-8 gap-y-4 border-t py-8 lg:grid-cols-4">
          <h2 className="label text-muted-foreground">Responsibilities</h2>
          <ul className="grid gap-x-8 gap-y-3 sm:grid-cols-2 lg:col-span-3">
            {project.responsibilities.map((responsibility) => (
              <li
                className="text-foreground text-sm/6 text-pretty"
                key={responsibility}
              >
                {responsibility}
              </li>
            ))}
          </ul>
        </div>
      </header>

      <div className="border-rule border-t pt-8 pb-16">
        <Previews project={project} />
      </div>

      <div className="lg:grid lg:grid-cols-12 lg:gap-x-8">
        <aside className="lg:sticky lg:top-24 lg:col-span-3 lg:self-start">
          <details className="border-rule mb-8 border lg:hidden">
            <summary className="label text-muted-foreground flex min-h-11 cursor-pointer items-center px-4">
              On this page
            </summary>
            <TableOfContents className="px-4 pb-3" headings={tableOfContents} />
          </details>
          <div className="hidden flex-col gap-8 lg:flex">
            <div>
              <p className="label text-muted-foreground mb-3">On this page</p>
              <TableOfContents headings={tableOfContents} />
            </div>
            {project.links.length > 0 ? (
              <div>
                <p className="label text-muted-foreground mb-3">Links</p>
                <ul>
                  {project.links.map((link) => (
                    <li key={link.href}>
                      <a
                        className="text-foreground hover:text-clay inline-flex items-center gap-1 py-2 text-sm transition-colors"
                        href={link.href}
                        rel="noopener noreferrer"
                        target="_blank"
                      >
                        {link.label}
                        <ArrowUpRight aria-hidden className="size-3.5" />
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>
        </aside>

        <div
          className="group/prose min-w-0 [counter-reset:section] lg:col-span-7 lg:col-start-5 [&_img]:h-auto [&_img]:max-w-full"
          data-numbered
        >
          <Content />
        </div>
      </div>

      {related.length > 0 ? (
        <section className="mt-24">
          <h2
            className="display border-rule border-t pt-6 pb-8 text-4xl"
            id="related"
          >
            Related
          </h2>
          <ul className="border-rule border-t">
            {related.map((item, index) => (
              <WorkRow
                index={String(index + 1).padStart(2, "0")}
                key={item.slug}
                project={toWorkIndexItem(item)}
              />
            ))}
          </ul>
        </section>
      ) : null}
    </article>
  );
};

export default WorkProjectPage;
