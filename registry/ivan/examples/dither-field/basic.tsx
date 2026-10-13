import { DitherField } from "@/registry/ivan/ui/dither-field";

export const Example = () => (
  <section className="relative isolate flex h-72 w-full flex-col justify-end gap-2 overflow-hidden p-6">
    <DitherField seed="ivo" />
    <p className="font-mono text-xs tracking-widest uppercase">Field notes</p>
    <h3 className="text-3xl font-light tracking-tight">Move the pointer</h3>
  </section>
);
