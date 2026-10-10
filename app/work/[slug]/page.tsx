import { ArrowLeft, ArrowUpRight } from "@phosphor-icons/react/dist/ssr";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Figure } from "@/components/content/figure";
import { SampleBadge } from "@/components/content/sample-badge";
import { TableOfContents } from "@/components/content/table-of-contents";
import { Video } from "@/components/content/video";
import { WorkRow } from "@/components/content/work-row";
import { CornerMarks } from "@/components/site/corner-marks";
import { LeaderList, LeaderRow } from "@/components/site/leader-list";
import { PanelHeading } from "@/components/site/panel-heading";
import { focusRingClassName, linkClassName } from "@/components/site/styles";
import { buildWorkMetadata } from "@/lib/content/metadata";
import type { Heading } from "@/lib/content/text";
import {
  getProject,
  getProjects,
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

const pad = (value: number) => String(value).padStart(2, "0");

const Previews = ({ project }: { project: WorkProject }) => {
  if (project.previews.length === 0) {
    return project.sample ? (
      <div className="hatch border-rule-strong bg-popover relative grid min-h-48 place-items-center border md:min-h-72">
        <CornerMarks />
        <p className="label text-graphite">Preview slot</p>
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
  const [projects, related] = await Promise.all([
    getProjects(),
    getRelatedProjects(project),
  ]);
  const code = `WK-${pad(projects.findIndex((item) => item.slug === slug) + 1)}`;

  const tableOfContents: Heading[] =
    related.length > 0
      ? [...headings, { depth: 2, id: "related", text: "Related" }]
      : [...headings];

  const facts = [
    { jp: "年", label: "Year", value: String(project.year) },
    { jp: "文脈", label: "Context", value: project.context },
    { jp: "役割", label: "Role", value: project.role },
    { jp: "技術", label: "Stack", value: project.technologies.join(", ") },
  ];

  return (
    <article className="mx-auto w-full max-w-screen-2xl px-4 pt-6 pb-8 md:px-8 md:pt-8">
      <header>
        <div className="label border-rule-strong flex flex-wrap items-center justify-between gap-x-6 gap-y-1 border-b pb-2">
          <Link
            className={cn(
              focusRingClassName,
              "text-ink hover:text-graphite ease-mechanical inline-flex min-h-11 items-center gap-2 transition-colors duration-100 md:min-h-8"
            )}
            href="/work"
          >
            <ArrowLeft aria-hidden className="size-4" />
            Work
          </Link>
          <span className="flex gap-2">
            <span className="text-mist">Doc</span>
            <span className="text-ink tabular-nums">{code}</span>
          </span>
        </div>
        <div className="mt-10 grid gap-x-6 gap-y-10 md:mt-16 lg:grid-cols-12 lg:items-end">
          <div className="flex flex-col items-start gap-6 lg:col-span-7">
            <h1 className="display text-ink text-5xl md:text-7xl lg:text-8xl">
              {project.title}
            </h1>
            {project.sample ? (
              <SampleBadge source={`content/work/${project.slug}.mdx`} />
            ) : null}
            <p className="text-graphite max-w-prose text-base text-pretty">
              {project.summary}
            </p>
          </div>
          <LeaderList className="lg:col-span-5">
            {facts.map((fact) => (
              <LeaderRow jp={fact.jp} key={fact.label} label={fact.label}>
                {fact.value}
              </LeaderRow>
            ))}
          </LeaderList>
        </div>
      </header>

      <section aria-labelledby="responsibilities" className="mt-16">
        <PanelHeading
          aside={pad(project.responsibilities.length)}
          id="responsibilities"
          index={`${code}.1`}
          jp="担当"
          label="Responsibilities"
        />
        <ul className="mt-6 grid gap-x-8 sm:grid-cols-2">
          {project.responsibilities.map((responsibility) => (
            <li
              className="border-rule text-ink flex gap-3 border-b border-dotted py-3 text-sm text-pretty"
              key={responsibility}
            >
              <span aria-hidden className="bg-ink mt-1.5 size-1.5 shrink-0" />
              {responsibility}
            </li>
          ))}
        </ul>
      </section>

      {project.previews.length > 0 || project.sample ? (
        <section aria-labelledby="preview" className="mt-16">
          <PanelHeading
            id="preview"
            index={`${code}.2`}
            jp="見本"
            label="Preview"
          />
          <div className="mt-6">
            <Previews project={project} />
          </div>
        </section>
      ) : null}

      <div className="mt-16 lg:grid lg:grid-cols-12 lg:gap-x-8">
        <aside className="lg:sticky lg:top-20 lg:col-span-3 lg:self-start">
          <details className="group/toc border-rule-strong mb-8 border lg:hidden">
            <summary
              className={cn(
                "label text-graphite flex min-h-11 cursor-pointer items-center px-4 after:ml-auto after:content-['+'] group-open/toc:after:content-['−']",
                focusRingClassName
              )}
            >
              On this page
            </summary>
            <TableOfContents className="px-4 pb-3" headings={tableOfContents} />
          </details>
          <div className="hidden flex-col gap-8 lg:flex">
            <div>
              <p className="label text-mist mb-3">
                On this page <span className="jp ml-2">目次</span>
              </p>
              <TableOfContents headings={tableOfContents} />
            </div>
            {project.links.length > 0 ? (
              <div>
                <p className="label text-mist mb-3">Links</p>
                <ul>
                  {project.links.map((link) => (
                    <li key={link.href}>
                      <a
                        className={cn(
                          linkClassName,
                          "text-ink inline-flex items-center gap-1 py-2 text-sm"
                        )}
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
        <section aria-labelledby="related" className="mt-24">
          <PanelHeading
            aside={pad(related.length)}
            id="related"
            index={`${code}.3`}
            jp="関連"
            label="Related"
          />
          <ul className="border-rule mt-6 border-t">
            {related.map((item) => (
              <WorkRow
                index={pad(
                  projects.findIndex((entry) => entry.slug === item.slug) + 1
                )}
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
