import { serializeRegistryCss } from "@/lib/registry/css";
import type { RegistryItem } from "@/lib/registry/schema";

export const ItemStyles = ({ items }: { items: readonly RegistryItem[] }) => (
  <>
    {items.map((item) =>
      item.css ? (
        <style
          href={`registry-item-${item.name}`}
          key={item.name}
          precedence="default"
        >
          {serializeRegistryCss(item.css)}
        </style>
      ) : null
    )}
  </>
);
