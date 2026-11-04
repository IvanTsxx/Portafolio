import Link from "next/link";

import { PortraitPlate, Statement } from "@/components/home/home-figures";
import { NowPlaying } from "@/components/home/now-playing";
import { LeaderRows, SectionMark } from "@/components/home/rows";
import { SkyCaption } from "@/components/home/sky-caption";
import { CapturedPoster } from "@/components/lab/captured-poster";
import { PlatePage } from "@/components/site/plate-page";
import { Signature } from "@/components/site/signature";
import { SocialLinks } from "@/components/site/social-links";
import { focusRingClassName } from "@/components/site/styles";
import { experiments } from "@/lib/lab/experiments";
import type { HomeSectionData } from "@/lib/site/home-sections";
import { experimentPath } from "@/lib/site/seo";
import { cn } from "@/lib/utils";

type Sections = readonly HomeSectionData[];

const SectionBlock = ({
  className,
  section,
}: {
  className?: string;
  section: HomeSectionData;
}) => (
  <section
    aria-labelledby={`${section.id}-label`}
    className={cn("flex scroll-mt-24 flex-col gap-4", className)}
    id={section.id}
  >
    <SectionMark id={section.id} label={section.label} phase={section.phase} />
    <div className="lg:pl-10">
      <LeaderRows more={section.more} rows={section.rows} />
    </div>
  </section>
);

const newestExperiments = experiments
  .toSorted((first, second) => second.index.localeCompare(first.index))
  .slice(0, 6);

const LabGallery = ({ section }: { section: HomeSectionData }) => (
  <section
    aria-labelledby={`${section.id}-label`}
    className="flex scroll-mt-24 flex-col gap-6"
    id={section.id}
  >
    <SectionMark id={section.id} label={section.label} phase={section.phase} />
    <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:pl-10">
      {newestExperiments.map((experiment) => (
        <li key={experiment.slug}>
          <Link
            className={cn("group/tile flex flex-col gap-2", focusRingClassName)}
            href={experimentPath(experiment.slug)}
          >
            <span className="bg-surface relative block aspect-4/3 overflow-hidden rounded-sm">
              <span className="ease-out-expo absolute inset-0 transition-transform duration-500 pointer-fine:group-hover/tile:scale-103">
                <CapturedPoster alt="" slug={experiment.slug} />
              </span>
            </span>
            <span className="flex items-baseline justify-between gap-2">
              <span className="text-foreground group-hover/tile:text-signal truncate text-sm transition-colors duration-200">
                {experiment.title}
              </span>
              <span className="label text-faint shrink-0 tabular-nums">
                {experiment.index}
              </span>
            </span>
          </Link>
        </li>
      ))}
    </ul>
    {section.more ? (
      <Link
        className={cn(
          "group/more label text-faint hover:text-foreground flex min-h-9 w-fit items-center gap-2 transition-colors duration-200 lg:ml-10",
          focusRingClassName
        )}
        href={section.more.href}
      >
        {section.more.label}
        <span
          aria-hidden
          className="ease-out-expo transition-transform duration-300 group-hover/more:translate-x-1"
        >
          →
        </span>
      </Link>
    ) : null}
  </section>
);

export const GalleryLayout = ({ sections }: { sections: Sections }) => (
  <PlatePage
    plate={
      <>
        <PortraitPlate
          aside={<SocialLinks variant="icons" />}
          className="max-w-72"
        />
        <SkyCaption />
        <NowPlaying />
      </>
    }
  >
    <Statement />
    {sections.map((section) =>
      section.id === "lab" ? (
        <LabGallery key={section.id} section={section} />
      ) : (
        <SectionBlock key={section.id} section={section} />
      )
    )}
    <Signature />
  </PlatePage>
);
