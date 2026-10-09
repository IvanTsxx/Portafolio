import { z } from "zod";

export const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/u;

const hrefPattern = /^(?:https?:\/\/|\/|mailto:)/u;

export const slugSchema = z
  .string()
  .regex(slugPattern, "Use lowercase letters, digits and single hyphens");

const text = z.string().trim().min(1);

const href = z
  .string()
  .regex(
    hrefPattern,
    "Use an absolute http(s) URL, a root-relative path or mailto:"
  );

const hasUniqueValues = (values: readonly string[]) =>
  new Set(values).size === values.length;

const textList = z
  .array(text)
  .refine(hasUniqueValues, "Entries must be unique");

const requiredTextList = textList.min(1, "Add at least one entry");

const dimension = z.number().int().positive();

const imagePreviewSchema = z.strictObject({
  alt: text,
  caption: text.optional(),
  height: dimension,
  kind: z.literal("image"),
  src: href,
  width: dimension,
});

const videoPreviewSchema = z.strictObject({
  alt: text,
  caption: text.optional(),
  height: dimension,
  kind: z.literal("video"),
  poster: href.optional(),
  src: href,
  width: dimension,
});

export const previewSchema = z.discriminatedUnion("kind", [
  imagePreviewSchema,
  videoPreviewSchema,
]);

export const linkSchema = z.strictObject({
  href,
  label: text,
});

export const workMetaSchema = z.strictObject({
  aiWorkflowNotes: textList.default([]),
  client: text.optional(),
  context: text,
  featured: z.boolean().default(false),
  links: z.array(linkSchema).default([]),
  motionNotes: textList.default([]),
  previews: z.array(previewSchema).default([]),
  related: z.array(slugSchema).default([]),
  responsibilities: requiredTextList,
  role: text,
  sample: z.boolean().default(false),
  summary: text.max(280),
  technologies: requiredTextList,
  title: text,
  year: z.number().int().min(2000).max(2100),
});

export const blogMetaSchema = z.strictObject({
  date: z.iso.date(),
  sample: z.boolean().default(false),
  summary: text.max(280),
  tags: requiredTextList,
  title: text,
});

export type Preview = z.infer<typeof previewSchema>;
export type ContentLink = z.infer<typeof linkSchema>;
export type WorkMeta = z.infer<typeof workMetaSchema>;
export type BlogMeta = z.infer<typeof blogMetaSchema>;
