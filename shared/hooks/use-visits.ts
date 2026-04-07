// oxlint-disable promise/prefer-await-to-then
"use client";
import { useEffect, useState } from "react";

interface VisitsData {
  visitorNumber: number;
  totalVisits: number;
}

export function useVisits() {
  const [data, setData] = useState<VisitsData | null>(null);

  useEffect(() => {
    fetch("/api/visits")
      .then((res) => res.json())
      .then(setData);
  }, []);

  return data;
}
