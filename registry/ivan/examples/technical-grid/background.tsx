import { TechnicalGrid } from "@/registry/ivan/ui/technical-grid";

export const Example = () => (
  <section className="border-border relative isolate w-full overflow-hidden border">
    <TechnicalGrid
      className="absolute inset-0"
      fade="edges"
      markers={false}
      nodes={8}
      scan="both"
      tone="strong"
    />
    <div className="relative flex flex-col gap-3 px-6 py-16">
      <h2 className="text-foreground text-2xl font-medium tracking-tight">
        Systems, designed in the open
      </h2>
      <p className="text-muted-foreground max-w-prose text-sm text-pretty">
        The grid sits behind the content and fades out toward the edges, so the
        copy keeps its contrast.
      </p>
    </div>
  </section>
);
