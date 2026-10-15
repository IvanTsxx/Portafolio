import { describe, expect, test } from "bun:test";

import { renderToStaticMarkup } from "react-dom/server";

import { experiments } from "@/lib/lab/experiments";

const interactiveMarkup = /<a[\s>]|<button[\s>]|tabindex=/iu;

describe("experiment posters", () => {
  for (const { Poster, slug } of experiments) {
    test(`${slug} poster renders without links, buttons or focus stops`, () => {
      const markup = renderToStaticMarkup(<Poster />);
      expect(markup.length).toBeGreaterThan(0);
      expect(markup).not.toMatch(interactiveMarkup);
    });
  }
});
