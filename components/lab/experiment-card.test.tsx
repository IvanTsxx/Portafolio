import { describe, expect, test } from "bun:test";

import { renderToStaticMarkup } from "react-dom/server";

import { ExperimentCard } from "@/components/lab/experiment-card";
import { experiments } from "@/lib/lab/experiments";

describe("experiment card", () => {
  for (const experiment of experiments) {
    test(`${experiment.slug} links to its experiment page`, () => {
      const markup = renderToStaticMarkup(
        <ExperimentCard experiment={experiment} />
      );
      expect(markup).toContain(`href="/experiments/${experiment.slug}"`);
    });
  }
});
