import { SocialLinks } from "@/components/site/social-links";
import { siteConfig } from "@/lib/site/config";

const colophonYear = "2026";

export const BackCover = () => (
  <footer
    className="relative flex justify-end px-4 pt-16 pb-12 md:px-12 md:pt-24 md:pb-16"
    data-back-cover=""
  >
    <div className="border-ink bg-paper-deep stamp-press w-full origin-bottom-right border p-1 motion-reduce:animate-none md:w-auto">
      <div className="border-ink/60 grid gap-x-12 gap-y-6 border px-5 py-5 md:grid-cols-[auto_auto]">
        <div className="flex flex-col gap-3">
          <p className="label text-mist tabular-nums">
            [ END ] Colophon <span className="jp ml-1">奥付</span>
          </p>
          <p className="font-wordmark text-5xl leading-none italic">
            {siteConfig.nickname}
          </p>
          <p className="label text-graphite flex flex-col gap-1">
            <span>{siteConfig.role}</span>
            <span>{siteConfig.location}</span>
          </p>
        </div>
        <SocialLinks className="self-end" variant="footer" />
        <div className="col-span-full flex items-center gap-3">
          <span
            aria-hidden
            className="hazard-stripe text-ink block h-1.5 flex-1"
          />
          <span className="label text-ink tabular-nums">{colophonYear}</span>
        </div>
      </div>
    </div>
  </footer>
);
