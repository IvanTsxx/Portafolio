import { describe, expect, test } from "bun:test";

import { renderToStaticMarkup } from "react-dom/server";

import { DocumentSection } from "./document-section";
import { PanelHeading } from "./panel-heading";

const headingOf = (markup: string) => {
  const start = markup.indexOf("<h2");
  const end = markup.indexOf("</h2>");
  return start === -1 || end === -1 ? "" : markup.slice(start, end);
};

describe("PanelHeading", () => {
  test("the code and the label sit in the same heading element", () => {
    const heading = headingOf(
      renderToStaticMarkup(<PanelHeading index="GH-03" label="Experience" />)
    );
    expect(heading).toContain("GH-03");
    expect(heading).toContain("Experience");
  });

  test("a blank label renders no code and no rule", () => {
    expect(renderToStaticMarkup(<PanelHeading index="GH-03" label="" />)).toBe(
      ""
    );
    expect(
      renderToStaticMarkup(<PanelHeading index="GH-03" label="   " />)
    ).toBe("");
  });

  test("a document section names itself after the label, not the code", () => {
    const markup = renderToStaticMarkup(
      <DocumentSection id="experience" index="GH-03" label="Experience">
        <p>Body</p>
      </DocumentSection>
    );
    expect(markup).toContain('aria-labelledby="experience-heading"');
    const heading = headingOf(markup);
    expect(heading).toContain("Experience");
    expect(heading).toMatch(
      /<span aria-hidden="true"[^>]*>\[ GH-03 \]<\/span>/u
    );
  });
});
