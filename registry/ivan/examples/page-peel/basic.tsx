import {
  PagePeel,
  PagePeelTrigger,
} from "@/registry/ivan/components/page-peel/page-peel";

const SheetUnderside = () => (
  <div className="bg-foreground text-background flex h-full flex-col justify-end gap-2 p-6 font-mono text-xs uppercase">
    <span className="opacity-60">Underside</span>
    <span>Drawn by you · Sheet 1 of 1</span>
  </div>
);

export const Example = () => (
  <PagePeel
    className="border-border h-80 w-full max-w-xl border"
    scope="container"
    underside={<SheetUnderside />}
  >
    <div className="bg-background text-foreground flex h-full flex-col justify-between p-6">
      <p className="max-w-xs text-lg">
        Drag the bottom-right corner to peel this page.
      </p>
      <PagePeelTrigger className="w-fit text-sm underline underline-offset-4" />
    </div>
  </PagePeel>
);
