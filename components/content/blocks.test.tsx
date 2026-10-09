import { describe, expect, test } from "bun:test";

import { renderToStaticMarkup } from "react-dom/server";

import { Callout } from "./callout";
import { Demo } from "./demo";
import { Diagram } from "./diagram";
import { NoteList } from "./note-list";
import { Step, Steps } from "./steps";
import { Video } from "./video";

describe("Callout", () => {
  test("falls back to the default title of its tone", () => {
    expect(
      renderToStaticMarkup(<Callout tone="warning">Careful</Callout>)
    ).toContain("Watch out");
    expect(
      renderToStaticMarkup(<Callout tone="sample">Draft</Callout>)
    ).toContain("Sample content");
  });

  test("prefers an explicit title and renders its children", () => {
    const html = renderToStaticMarkup(
      <Callout title="Custom title" tone="tip">
        Body copy
      </Callout>
    );

    expect(html).toContain("Custom title");
    expect(html).toContain("Body copy");
    expect(html).not.toContain(">Tip<");
  });
});

describe("Demo", () => {
  test("embeds the source in a sandboxed lazy iframe", () => {
    const html = renderToStaticMarkup(
      <Demo src="https://example.com/demo" title="Live demo" />
    );

    expect(html).toContain("<iframe");
    expect(html).toContain('sandbox="allow-scripts"');
    expect(html).toContain('loading="lazy"');
    expect(html).toContain('title="Live demo"');
  });

  test("renders its children as the slot when there is no source", () => {
    const html = renderToStaticMarkup(
      <Demo title="Slot demo">Custom slot</Demo>
    );

    expect(html).not.toContain("<iframe");
    expect(html).toContain("Custom slot");
  });

  test("shows a labelled empty slot when nothing is provided", () => {
    expect(renderToStaticMarkup(<Demo title="Empty" />)).toContain("Demo slot");
  });
});

describe("Video", () => {
  const base = {
    alt: "Screen recording",
    height: 540,
    src: "/clip.mp4",
    width: 960,
  };

  test("renders muted controls with the poster and caption", () => {
    const html = renderToStaticMarkup(
      <Video {...base} caption="A caption" poster="/poster.png" />
    );

    expect(html).toContain("controls");
    expect(html).toContain("muted");
    expect(html).toContain('poster="/poster.png"');
    expect(html).toContain("A caption");
    expect(html).not.toContain("<track");
  });

  test("adds a captions track only when a source is given", () => {
    const html = renderToStaticMarkup(
      <Video {...base} captionsSrc="/clip.vtt" />
    );

    expect(html).toContain("<track");
    expect(html).toContain('src="/clip.vtt"');
  });
});

describe("Diagram", () => {
  test("labels the figure for assistive technology", () => {
    const html = renderToStaticMarkup(
      <Diagram caption="Caption" label="What the diagram shows">
        <span>Inner</span>
      </Diagram>
    );

    expect(html).toContain('aria-label="What the diagram shows"');
    expect(html).toContain("Inner");
    expect(html).toContain("Caption");
  });
});

describe("Steps", () => {
  test("renders each step title inside an ordered list", () => {
    const html = renderToStaticMarkup(
      <Steps>
        <Step title="First">One</Step>
        <Step title="Second">Two</Step>
      </Steps>
    );

    expect(html.startsWith("<ol")).toBe(true);
    expect(html.match(/<li/gu)).toHaveLength(2);
    expect(html).toContain("First");
    expect(html).toContain("Second");
  });
});

describe("NoteList", () => {
  test("renders nothing for an empty list and one item per note otherwise", () => {
    expect(renderToStaticMarkup(<NoteList items={[]} />)).toBe("");
    expect(
      renderToStaticMarkup(
        <NoteList items={["First note", "Second note"]} />
      ).match(/<li/gu)
    ).toHaveLength(2);
  });
});
