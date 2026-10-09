import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { DependenciesPanel } from "@/components/registry-docs/dependencies-panel";
import {
  BulletList,
  DocsSection,
  SectionNav,
} from "@/components/registry-docs/docs-section";
import {
  AnimationTable,
  PropsTables,
  VariantsTable,
} from "@/components/registry-docs/docs-tables";
import { ExampleBlock } from "@/components/registry-docs/example-block";
import { InstallSection } from "@/components/registry-docs/install-section";
import { ItemStyles } from "@/components/registry-docs/item-styles";
import { loadDemoModule } from "@/components/registry-docs/load-demo";
import { PreviewCodeTabs } from "@/components/registry-docs/preview-code-tabs";
import { Badge } from "@/components/ui/badge";
import { highlightCode } from "@/lib/registry/highlight";
import {
  getInstallCommand,
  getNamespacedInstallCommand,
  getRegistriesSnippet,
  packageRunners,
} from "@/lib/registry/install";
import {
  formatRegistryIndex,
  getRegistryItem,
  getRegistryItemIndex,
  registryItems,
  toCategoryLabel,
} from "@/lib/registry/registry";
import { buildItemCodeFiles } from "@/lib/registry/source";

export const dynamicParams = false;

export const generateStaticParams = () =>
  registryItems.map((item) => ({ slug: item.name }));

export const generateMetadata = async ({
  params,
}: PageProps<"/registry/[slug]">): Promise<Metadata> => {
  const { slug } = await params;
  const item = getRegistryItem(slug);
  if (!item) {
    return {};
  }
  return { description: item.description, title: item.title };
};

const NeighborLink = ({
  direction,
  name,
}: {
  direction: "Next" | "Previous";
  name: string | undefined;
}) => {
  const item = name ? getRegistryItem(name) : undefined;
  if (!item) {
    return <span />;
  }
  return (
    <Link
      className="group border-rule hover:border-rule-strong focus-visible:border-rule-strong flex min-h-11 flex-col gap-1 border px-4 py-3 transition-colors"
      href={`/registry/${item.name}`}
    >
      <span className="label text-muted-foreground group-hover:text-clay transition-colors">
        {direction}
      </span>
      <span className="text-sm font-medium">{item.title}</span>
    </Link>
  );
};

const RegistryItemPage = async ({ params }: PageProps<"/registry/[slug]">) => {
  const { slug } = await params;
  const item = getRegistryItem(slug);
  if (!item) {
    notFound();
  }

  const { docs } = item.meta;
  const position = getRegistryItemIndex(item.name);
  const registriesSource = getRegistriesSnippet();
  const [codeFiles, { Demo }, registriesLines] = await Promise.all([
    buildItemCodeFiles(item),
    loadDemoModule(item.name),
    highlightCode(registriesSource, "json"),
  ]);

  const sections = [
    { id: "preview", label: "Preview" },
    { id: "installation", label: "Installation" },
    { id: "usage", label: "Usage" },
    ...(docs.variants.length > 0
      ? [{ id: "variants", label: "Variants" }]
      : []),
    { id: "props", label: "Props" },
    { id: "accessibility", label: "Accessibility" },
    { id: "animation", label: "Animation" },
    { id: "dependencies", label: "Dependencies" },
  ];
  const indexOf = (id: string) =>
    String(sections.findIndex((section) => section.id === id) + 1).padStart(
      2,
      "0"
    );

  return (
    <>
      <ItemStyles items={[item]} />
      <div className="mx-auto flex w-full max-w-screen-2xl flex-col gap-12 px-4 py-12 md:px-6 md:py-16">
        <header className="flex flex-col gap-6">
          <nav
            aria-label="Breadcrumb"
            className="label flex items-center gap-3"
          >
            <Link
              className="text-muted-foreground hover:text-clay focus-visible:text-clay inline-flex min-h-9 items-center transition-colors"
              href="/registry"
            >
              Registry
            </Link>
            <span aria-hidden="true" className="text-muted-foreground">
              /
            </span>
            <span aria-current="page" className="text-clay">
              {formatRegistryIndex(position)}
            </span>
          </nav>
          <h1 className="display max-w-4xl text-5xl md:text-7xl">
            {item.title}
          </h1>
          <p className="text-muted-foreground max-w-prose text-base text-pretty">
            {item.description}
          </p>
          <ul className="flex flex-wrap gap-2">
            {item.categories.map((category) => (
              <li key={category}>
                <Badge variant="outline">{toCategoryLabel(category)}</Badge>
              </li>
            ))}
            <li>
              <Badge variant="secondary">{item.type}</Badge>
            </li>
          </ul>
        </header>
        <div className="grid gap-12 lg:grid-cols-12">
          <div className="flex min-w-0 flex-col gap-14 lg:col-span-9">
            <DocsSection
              id="preview"
              index={indexOf("preview")}
              title="Preview"
            >
              <PreviewCodeTabs files={codeFiles} preview={<Demo />} />
            </DocsSection>
            <DocsSection
              id="installation"
              index={indexOf("installation")}
              title="Installation"
            >
              <InstallSection
                commands={packageRunners.map((runner) => ({
                  id: runner.id,
                  label: runner.label,
                  namespaced: getNamespacedInstallCommand(runner.id, item.name),
                  url: getInstallCommand(runner.id, item.name),
                }))}
                registriesLines={registriesLines}
                registriesSource={registriesSource}
              />
            </DocsSection>
            <DocsSection id="usage" index={indexOf("usage")} title="Usage">
              <div className="flex flex-col gap-12">
                {docs.examples.map((example) => (
                  <ExampleBlock example={example} key={example.file} />
                ))}
              </div>
            </DocsSection>
            {docs.variants.length > 0 ? (
              <DocsSection
                id="variants"
                index={indexOf("variants")}
                title="Variants"
              >
                <VariantsTable variants={docs.variants} />
              </DocsSection>
            ) : null}
            <DocsSection id="props" index={indexOf("props")} title="Props">
              <PropsTables groups={docs.props} />
            </DocsSection>
            <DocsSection
              id="accessibility"
              index={indexOf("accessibility")}
              title="Accessibility"
            >
              <BulletList items={docs.accessibility} />
            </DocsSection>
            <DocsSection
              id="animation"
              index={indexOf("animation")}
              title="Animation"
            >
              {docs.animation.length > 0 ? (
                <AnimationTable animations={docs.animation} />
              ) : (
                <p className="text-muted-foreground max-w-prose text-sm text-pretty">
                  This component is static. It has no animation and nothing to
                  switch off for reduced motion.
                </p>
              )}
            </DocsSection>
            <DocsSection
              id="dependencies"
              index={indexOf("dependencies")}
              title="Dependencies"
            >
              <DependenciesPanel item={item} />
            </DocsSection>
            <nav
              aria-label="More registry items"
              className="border-rule grid gap-4 border-t pt-8 sm:grid-cols-2"
            >
              <NeighborLink
                direction="Previous"
                name={registryItems[position - 1]?.name}
              />
              <NeighborLink
                direction="Next"
                name={registryItems[position + 1]?.name}
              />
            </nav>
          </div>
          <aside className="hidden lg:col-span-3 lg:block">
            <div className="sticky top-20">
              <SectionNav sections={sections} />
            </div>
          </aside>
        </div>
      </div>
    </>
  );
};

export default RegistryItemPage;
