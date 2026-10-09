import { cn } from "@/lib/utils";

export const NoteList = ({
  className,
  items,
}: {
  className?: string;
  items: readonly string[];
}) =>
  items.length > 0 ? (
    <ul className={cn("border-rule my-6 border-t", className)}>
      {items.map((item) => (
        <li
          className="border-rule text-foreground/90 flex gap-4 border-b py-4 text-base/7 md:text-lg/8"
          key={item}
        >
          <span aria-hidden className="bg-faint mt-3 size-1.5 shrink-0" />
          {item}
        </li>
      ))}
    </ul>
  ) : null;
