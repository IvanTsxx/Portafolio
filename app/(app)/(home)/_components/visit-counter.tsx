export function VisitorCounter({ visitorNumber }: { visitorNumber: number }) {
  return <p>You are visitor #{visitorNumber.toLocaleString("en-US")}</p>;
}
