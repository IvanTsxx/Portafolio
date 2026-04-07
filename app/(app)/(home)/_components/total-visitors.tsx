import { useVisits } from "@/shared/hooks/use-visits";

export function TotalVisitors() {
  const data = useVisits();

  if (!data) return null;

  return <span>{data.totalVisits.toLocaleString("en-US")} visitors</span>;
}
