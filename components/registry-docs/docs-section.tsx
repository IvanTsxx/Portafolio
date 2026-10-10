export const BulletList = ({ items }: { items: readonly string[] }) => (
  <ul className="flex max-w-prose flex-col">
    {items.map((item) => (
      <li
        className="border-rule flex gap-4 border-b border-dotted py-3 text-sm text-pretty"
        key={item}
      >
        <span aria-hidden="true" className="bg-ink mt-1.5 size-1.5 shrink-0" />
        <span className="text-graphite">{item}</span>
      </li>
    ))}
  </ul>
);
