import { useVisits } from "@/shared/hooks/use-visits";

export function VisitorCounter() {
  const data = useVisits();

  if (!data) return null;

  return <p>You are visitor #{data.visitorNumber.toLocaleString("en-US")}</p>;
}
