import { siteConfig } from "@/lib/site/config";

const firstName = siteConfig.name.split(" ")[0] ?? siteConfig.nickname;

export const Signature = () => (
  <div className="flex items-end justify-end gap-4">
    <span className="label text-faint pb-3">Signed</span>
    <span aria-hidden className="bg-border mb-4 h-px w-16" />
    <span className="font-signature text-signal signature-write block pr-2 text-6xl leading-none">
      {firstName}
    </span>
  </div>
);
