export const DetailFallback = () => (
  <output aria-busy className="flex flex-col gap-12">
    <span className="bg-surface block h-3 w-40 animate-pulse rounded-sm" />
    <span className="bg-surface block h-12 w-2/3 max-w-xl animate-pulse rounded-sm" />
    <span className="bg-surface block h-4 w-1/2 max-w-md animate-pulse rounded-sm" />
    <span className="sr-only">Loading</span>
  </output>
);
