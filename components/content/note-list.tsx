import { cn } from "@/lib/utils";

export const NoteList = ({
  className,
  items,
}: {
  className?: string;
  items: readonly string[];
}) =>
  items.length > 0 ? (
    <ul className={cn("border-rule-strong my-6 border-t", className)}>
      {items.map((item) => (
        <li
          className="border-rule text-ink flex gap-4 border-b border-dotted py-4 text-base/7 md:text-lg/8"
          key={item}
        >
          <span aria-hidden className="bg-ink mt-3 size-1.5 shrink-0" />
          {item}
        </li>
      ))}
    </ul>
  ) : null;
