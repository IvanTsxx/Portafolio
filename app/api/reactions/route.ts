import { NextResponse, connection } from "next/server";

import { experiments } from "@/lib/lab/experiments";
import { getReactionStore } from "@/lib/reactions/store";

export const GET = async () => {
  await connection();
  const store = getReactionStore();
  if (!store) {
    return NextResponse.json(
      { error: "Reactions are not configured" },
      { status: 503 }
    );
  }
  return NextResponse.json(
    await store.totals(experiments.map((experiment) => experiment.slug)),
    { headers: { "Cache-Control": "no-store" } }
  );
};
