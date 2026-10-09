import { cn } from "@/lib/utils";

export interface StageFallbackProps {
  label: string;
  className?: string;
}

export const StageFallback = ({ label, className }: StageFallbackProps) => (
  <div
    className={cn(
      "blueprint-grid border-rule relative flex size-full min-h-48 items-end border p-4",
      className
    )}
  >
    <span className="border-rule-strong absolute top-2 left-2 size-2 border-t border-l" />
    <span className="border-rule-strong absolute top-2 right-2 size-2 border-t border-r" />
    <span className="border-rule-strong absolute bottom-2 left-2 size-2 border-b border-l" />
    <span className="border-rule-strong absolute right-2 bottom-2 size-2 border-r border-b" />
    <p className="label text-faint flex items-center gap-2">
      <span className="bg-clay size-1.5 rounded-full" />
      {label}
    </p>
  </div>
);
