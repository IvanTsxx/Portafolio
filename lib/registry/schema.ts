import { z } from "zod";

export const registryItemTypeSchema = z.enum([
  "registry:ui",
  "registry:component",
  "registry:block",
  "registry:hook",
  "registry:lib",
  "registry:theme",
  "registry:style",
  "registry:file",
  "registry:page",
]);

export const registryFileSchema = z.object({
  path: z.string().min(1),
  target: z.string().min(1).optional(),
  type: registryItemTypeSchema,
});

const cssVariableMapSchema = z.record(z.string(), z.string());

export const registryCssVarsSchema = z.object({
  dark: cssVariableMapSchema.optional(),
  light: cssVariableMapSchema.optional(),
  theme: cssVariableMapSchema.optional(),
});

export type RegistryCssNode =
  | { kind: "declaration"; value: string }
  | { kind: "block"; rules: Record<string, RegistryCssNode> };

export const registryCssNodeSchema: z.ZodType<RegistryCssNode, unknown> =
  z.lazy(() =>
    z.union([
      z.string().transform((value): RegistryCssNode => ({
        kind: "declaration",
        value,
      })),
      z
        .record(z.string(), registryCssNodeSchema)
        .transform((rules): RegistryCssNode => ({ kind: "block", rules })),
    ])
  );

export const registryCssSchema = z.record(z.string(), registryCssNodeSchema);

export const docsPropSchema = z.object({
  default: z.string().optional(),
  description: z.string().min(1),
  name: z.string().min(1),
  required: z.boolean().optional(),
  type: z.string().min(1),
});

export const docsPropGroupSchema = z.object({
  component: z.string().min(1),
  description: z.string().optional(),
  props: z.array(docsPropSchema).min(1),
});

export const docsVariantSchema = z.object({
  default: z.string().min(1),
  description: z.string().min(1),
  name: z.string().min(1),
  options: z.array(z.string().min(1)).min(1),
});

export const docsExampleSchema = z.object({
  description: z.string().optional(),
  file: z.string().min(1),
  title: z.string().min(1),
});

export const docsAnimationSchema = z.object({
  properties: z.string().min(1),
  reducedMotion: z.string().min(1),
  target: z.string().min(1),
  timing: z.string().min(1),
  trigger: z.string().min(1),
});

export const registryItemDocsSchema = z.object({
  accessibility: z.array(z.string().min(1)).min(1),
  animation: z.array(docsAnimationSchema).default([]),
  examples: z.array(docsExampleSchema).min(1),
  props: z.array(docsPropGroupSchema).min(1),
  variants: z.array(docsVariantSchema).default([]),
});

export const registryItemSchema = z.object({
  categories: z.array(z.string().min(1)).min(1),
  css: registryCssSchema.optional(),
  cssVars: registryCssVarsSchema.optional(),
  dependencies: z.array(z.string().min(1)).default([]),
  description: z.string().min(1),
  devDependencies: z.array(z.string().min(1)).default([]),
  files: z.array(registryFileSchema).min(1),
  meta: z.object({ docs: registryItemDocsSchema }),
  name: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/u),
  registryDependencies: z.array(z.string().min(1)).default([]),
  title: z.string().min(1),
  type: registryItemTypeSchema,
});

export const registrySchema = z.object({
  $schema: z.url(),
  homepage: z.url(),
  items: z.array(registryItemSchema).min(1),
  name: z.string().min(1),
});

export type RegistryFile = z.infer<typeof registryFileSchema>;
export type RegistryCssVars = z.infer<typeof registryCssVarsSchema>;
export type RegistryItemDocs = z.infer<typeof registryItemDocsSchema>;
export type RegistryItem = z.infer<typeof registryItemSchema>;
export type Registry = z.infer<typeof registrySchema>;
