import { describe, expect, test } from "bun:test";

import { renderToStaticMarkup } from "react-dom/server";

import { loadDemoModule } from "@/components/registry-docs/load-demo";
import { registryItems } from "@/lib/registry/registry";

const interactiveMarkup = /<a[\s>]|<button[\s>]|tabindex=/iu;

describe("registry thumbnails", () => {
  for (const item of registryItems) {
    test(`${item.name} thumbnail renders without links, buttons or focus stops`, async () => {
      const { Thumbnail } = await loadDemoModule(item.name);
      const markup = renderToStaticMarkup(<Thumbnail />);
      expect(markup.length).toBeGreaterThan(0);
      expect(markup).not.toMatch(interactiveMarkup);
    });
  }
});
