import path from "node:path";

import type { RootContent } from "mdast";

import type { ContentDocument } from "@/lib/content/collection";
import { noteKinds, notePath } from "@/lib/content/note-domain";
import type { NoteMeta } from "@/lib/content/schema";
import type { Experiment } from "@/lib/lab/experiments";
import {
  getInstallCommand,
  getNamespacedInstallCommand,
  getRegistriesSnippet,
  getRegistryItemUrl,
  packageRunners,
} from "@/lib/registry/install";
import { toInstalledSource } from "@/lib/registry/installed";
import type { RegistryItem } from "@/lib/registry/schema";
import { readRegistrySource } from "@/lib/registry/source";
import { siteConfig } from "@/lib/site/config";
import { absoluteUrl, experimentPath, registryItemPath } from "@/lib/site/seo";

import {
  bulletList,
  code,
  heading,
  inlineCode,
  link,
  list,
  orderedList,
  paragraph,
  stringifyMarkdown,
  table,
  text,
  textParagraph,
} from "./mdast";
import { mdxToMarkdownNodes } from "./mdx-to-markdown";

type FrontMatterValue = number | string | readonly string[] | undefined;

type FrontMatterField = readonly [string, FrontMatterValue];

export const toFrontMatter = (fields: readonly FrontMatterField[]) => {
  const lines = fields.flatMap(([key, value]) =>
    value === undefined ? [] : [`${key}: ${JSON.stringify(value)}`]
  );
  return `---\n${lines.join("\n")}\n---\n`;
};

const toDocument = (
  fields: readonly FrontMatterField[],
  nodes: readonly RootContent[]
) => `${toFrontMatter(fields)}\n${stringifyMarkdown(nodes)}`;

const sourceNote = (canonical: string) =>
  paragraph(
    text("Source: "),
    link(canonical),
    text(` by ${siteConfig.nickname}.`)
  );

type NoteDocument = ContentDocument<NoteMeta>;

const noteListsOf = (entry: NoteMeta) =>
  entry.kind === "case-study"
    ? {
        aiWorkflowNotes: entry.aiWorkflowNotes,
        motionNotes: entry.motionNotes,
        responsibilities: entry.responsibilities,
        stack: entry.stack,
      }
    : { tags: entry.tags };

export const noteMarkdown = ({ body, entry }: NoteDocument) => {
  const canonical = absoluteUrl(notePath(entry.slug));
  const shared: FrontMatterField[] = [
    ["title", entry.title],
    ["kind", noteKinds[entry.kind].label],
  ];
  const fields: FrontMatterField[] =
    entry.kind === "note"
      ? [
          ...shared,
          ["date", entry.date],
          ["summary", entry.summary],
          ["tags", entry.tags],
        ]
      : [
          ...shared,
          ["date", entry.date],
          ["summary", entry.summary],
          ["role", entry.role],
          ["context", entry.context],
          ["stack", entry.stack],
          ["responsibilities", entry.responsibilities],
        ];
  return toDocument(
    [...fields, ["author", siteConfig.nickname], ["canonical", canonical]],
    [
      heading(1, entry.title),
      textParagraph(entry.summary),
      ...mdxToMarkdownNodes(body, { meta: noteListsOf(entry) }),
      sourceNote(canonical),
    ]
  );
};

export const experimentMarkdown = (experiment: Experiment) => {
  const canonical = absoluteUrl(experimentPath(experiment.slug));
  return toDocument(
    [
      ["title", experiment.title],
      ["index", experiment.index],
      ["year", experiment.year],
      ["summary", experiment.summary],
      ["topics", experiment.topics],
      ["technologies", experiment.technologies],
      ["source", experiment.sourceUrl],
      ["author", siteConfig.nickname],
      ["canonical", canonical],
    ],
    [
      heading(1, experiment.title),
      textParagraph(experiment.summary),
      heading(2, "Implementation"),
      orderedList(experiment.implementation),
      heading(2, "Technical notes"),
      bulletList(experiment.technicalNotes),
      heading(2, "Stack"),
      bulletList(experiment.technologies),
      sourceNote(canonical),
    ]
  );
};

type PackageRunner = (typeof packageRunners)[number];

const commandList = (commandOf: (runner: PackageRunner) => string) =>
  list(
    packageRunners.map((runner) => [
      paragraph(text(`${runner.label}: `), inlineCode(commandOf(runner))),
    ])
  );

const dependencySection = (item: RegistryItem): RootContent[] => {
  const groups = [
    ["npm", item.dependencies],
    ["Dev", item.devDependencies],
    ["Registry", item.registryDependencies],
  ] as const;
  const rows = groups.flatMap(([label, names]) =>
    names.map((name) => [text(label), inlineCode(name)])
  );
  return rows.length > 0
    ? [heading(2, "Dependencies"), table(["Kind", "Package"], rows)]
    : [];
};

const exampleSection = async (item: RegistryItem) => {
  const examples = await Promise.all(
    item.meta.docs.examples.map(async (example) => [
      heading(3, example.title),
      ...(example.description ? [textParagraph(example.description)] : []),
      code(
        toInstalledSource(await readRegistrySource(example.file)),
        path.extname(example.file).slice(1)
      ),
    ])
  );
  return [heading(2, "Usage"), ...examples.flat()];
};

const propsSection = (item: RegistryItem): RootContent[] => [
  heading(2, "Props"),
  ...item.meta.docs.props.flatMap((group) => [
    heading(3, group.component),
    ...(group.description ? [textParagraph(group.description)] : []),
    table(
      ["Prop", "Type", "Default", "Description"],
      group.props.map((prop) => [
        inlineCode(prop.required ? `${prop.name} (required)` : prop.name),
        inlineCode(prop.type),
        prop.default ? inlineCode(prop.default) : text(""),
        text(prop.description),
      ])
    ),
  ]),
];

const variantsSection = (item: RegistryItem): RootContent[] =>
  item.meta.docs.variants.length > 0
    ? [
        heading(2, "Variants"),
        table(
          ["Variant", "Options", "Default", "Description"],
          item.meta.docs.variants.map((variant) => [
            inlineCode(variant.name),
            text(variant.options.join(", ")),
            inlineCode(variant.default),
            text(variant.description),
          ])
        ),
      ]
    : [];

const animationSection = (item: RegistryItem): RootContent[] =>
  item.meta.docs.animation.length > 0
    ? [
        heading(2, "Animation"),
        table(
          ["Target", "Trigger", "Properties", "Timing", "Reduced motion"],
          item.meta.docs.animation.map((entry) =>
            [
              entry.target,
              entry.trigger,
              entry.properties,
              entry.timing,
              entry.reducedMotion,
            ].map(text)
          )
        ),
      ]
    : [
        heading(2, "Animation"),
        textParagraph("Static. Nothing to switch off."),
      ];

export const registryItemMarkdown = async (item: RegistryItem) => {
  const canonical = absoluteUrl(registryItemPath(item.name));
  return toDocument(
    [
      ["title", item.title],
      ["name", item.name],
      ["type", item.type],
      ["description", item.description],
      ["categories", item.categories],
      ["registry", getRegistryItemUrl(item.name)],
      ["author", siteConfig.nickname],
      ["canonical", canonical],
    ],
    [
      heading(1, item.title),
      textParagraph(item.description),
      heading(2, "Installation"),
      textParagraph("With the registry URL:"),
      commandList((runner) => getInstallCommand(runner.id, item.name)),
      paragraph(
        text("With the "),
        inlineCode(siteConfig.registryNamespace),
        text(" namespace in "),
        inlineCode("components.json"),
        text(":")
      ),
      code(getRegistriesSnippet(), "json"),
      commandList((runner) =>
        getNamespacedInstallCommand(runner.id, item.name)
      ),
      ...dependencySection(item),
      ...(await exampleSection(item)),
      ...propsSection(item),
      ...variantsSection(item),
      heading(2, "Accessibility"),
      bulletList(item.meta.docs.accessibility),
      ...animationSection(item),
      heading(2, "Files"),
      bulletList(item.files.map((file) => file.target ?? file.path)),
      sourceNote(canonical),
    ]
  );
};
