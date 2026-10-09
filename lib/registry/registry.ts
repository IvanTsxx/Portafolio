import registryJson from "@/registry.json";

import { registrySchema } from "./schema";
import type { RegistryItem } from "./schema";

export const registry = registrySchema.parse(registryJson);

export const registryItems = registry.items;

export const getRegistryItem = (name: string): RegistryItem | undefined =>
  registryItems.find((item) => item.name === name);

export const getRegistryItemIndex = (name: string) =>
  registryItems.findIndex((item) => item.name === name);

export const formatRegistryIndex = (position: number) =>
  `R-${String(position + 1).padStart(2, "0")}`;

export interface RegistryCategory {
  count: number;
  id: string;
  label: string;
}

export const toCategoryLabel = (categoryId: string) =>
  `${categoryId.charAt(0).toUpperCase()}${categoryId.slice(1)}`;

export const getRegistryCategories = (
  items: readonly RegistryItem[] = registryItems
): RegistryCategory[] => {
  const counts = new Map<string, number>();
  for (const item of items) {
    for (const category of item.categories) {
      counts.set(category, (counts.get(category) ?? 0) + 1);
    }
  }
  return [...counts.entries()]
    .map(([id, count]) => ({ count, id, label: toCategoryLabel(id) }))
    .toSorted((first, second) => first.label.localeCompare(second.label));
};
