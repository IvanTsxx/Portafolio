export function TotalVisitors({ totalVisits }: { totalVisits: number }) {
  return <span>{totalVisits?.toLocaleString("en-US")} visitors</span>;
}
