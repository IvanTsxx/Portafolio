import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { TableOfContents } from "@/components/content/table-of-contents";
import { DependenciesPanel } from "@/components/registry-docs/dependencies-panel";
import { BulletList } from "@/components/registry-docs/docs-section";
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
import {
  CompactDossier,
  DossierPanel,
} from "@/components/site/compact-dossier";
import { CornerMarks } from "@/components/site/corner-marks";
import { DocumentHero } from "@/components/site/document-hero";
import { DocumentLayout } from "@/components/site/document-layout";
import { DocumentSection } from "@/components/site/document-section";
import { LeaderList, LeaderRow } from "@/components/site/leader-list";
import { focusRingClassName } from "@/components/site/styles";
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
import { siteConfig } from "@/lib/site/config";
import { cn } from "@/lib/utils";

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

const sectionAnnotations = {
  accessibility: "配慮",
  animation: "動作",
  dependencies: "依存",
  installation: "導入",
  preview: "見本",
  props: "属性",
  usage: "用法",
  variants: "変種",
} as const;

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
      className={cn(
        "group/marks border-rule-strong ease-mechanical hover:bg-paper-deep/60 relative flex min-h-11 flex-col gap-1 border px-4 py-3 transition-colors duration-100",
        focusRingClassName
      )}
      href={`/registry/${item.name}`}
    >
      <CornerMarks reveal="hover" />
      <span className="label text-mist group-hover/marks:text-ink transition-colors">
        {direction}
      </span>
      <span className="text-ink text-sm font-medium">{item.title}</span>
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
  const code = formatRegistryIndex(position);
  const registriesSource = getRegistriesSnippet();
  const [codeFiles, { Demo }, registriesLines] = await Promise.all([
    buildItemCodeFiles(item),
    loadDemoModule(item.name),
    highlightCode(registriesSource, "json"),
  ]);

  const sections: { id: keyof typeof sectionAnnotations; label: string }[] = [
    { id: "preview", label: "Preview" },
    { id: "installation", label: "Installation" },
    { id: "usage", label: "Usage" },
    ...(docs.variants.length > 0
      ? [{ id: "variants" as const, label: "Variants" }]
      : []),
    { id: "props", label: "Props" },
    { id: "accessibility", label: "Accessibility" },
    { id: "animation", label: "Animation" },
    { id: "dependencies", label: "Dependencies" },
  ];
  const sectionProps = (id: keyof typeof sectionAnnotations) => {
    const section = sections.find((entry) => entry.id === id);
    const number = String(
      sections.findIndex((entry) => entry.id === id) + 1
    ).padStart(2, "0");
    return {
      id,
      index: `${code}.${number}`,
      jp: sectionAnnotations[id],
      label: section?.label ?? id,
    };
  };

  return (
    <>
      <ItemStyles items={[item]} />
      <DocumentLayout
        dossier={
          <CompactDossier code="REG-02">
            <DossierPanel jp="仕様" label="Facts">
              <LeaderList>
                <LeaderRow jp="種別" label="Type">
                  {item.type}
                </LeaderRow>
                <LeaderRow jp="分類" label="Category">
                  {item.categories.map(toCategoryLabel).join(" / ")}
                </LeaderRow>
                <LeaderRow jp="名称" label="Name">
                  {`${siteConfig.registryNamespace}/${item.name}`}
                </LeaderRow>
                <LeaderRow jp="ファイル" label="Files">
                  {String(item.files.length).padStart(2, "0")}
                </LeaderRow>
              </LeaderList>
            </DossierPanel>
            <DossierPanel collapsible jp="目次" label="On this page">
              <TableOfContents
                headings={sections.map((section) => ({
                  depth: 2,
                  id: section.id,
                  text: section.label,
                }))}
              />
            </DossierPanel>
          </CompactDossier>
        }
        dossierLabel="Component details"
        hero={
          <DocumentHero
            back={{ href: "/registry", label: "Registry" }}
            code={code}
            jp="部品"
            lede={item.categories.map(toCategoryLabel).join(" / ")}
            meta={[{ label: "Type", value: item.type }]}
            size="title"
            title={item.title}
          >
            <p className="text-graphite max-w-prose text-base text-pretty">
              {item.description}
            </p>
          </DocumentHero>
        }
      >
        <DocumentSection
          {...sectionProps("preview")}
          waypoint={{ action: "inspect", role: "inspector", side: "left" }}
        >
          <PreviewCodeTabs files={codeFiles} preview={<Demo />} />
        </DocumentSection>
        <DocumentSection {...sectionProps("installation")}>
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
        </DocumentSection>
        <DocumentSection {...sectionProps("usage")}>
          <div className="flex flex-col gap-12">
            {docs.examples.map((example) => (
              <ExampleBlock example={example} key={example.file} />
            ))}
          </div>
        </DocumentSection>
        {docs.variants.length > 0 ? (
          <DocumentSection {...sectionProps("variants")}>
            <VariantsTable variants={docs.variants} />
          </DocumentSection>
        ) : null}
        <DocumentSection {...sectionProps("props")}>
          <PropsTables groups={docs.props} />
        </DocumentSection>
        <DocumentSection {...sectionProps("accessibility")}>
          <BulletList items={docs.accessibility} />
        </DocumentSection>
        <DocumentSection {...sectionProps("animation")}>
          {docs.animation.length > 0 ? (
            <AnimationTable animations={docs.animation} />
          ) : (
            <p className="label text-graphite">
              Static. Nothing to switch off.
            </p>
          )}
        </DocumentSection>
        <DocumentSection {...sectionProps("dependencies")}>
          <DependenciesPanel item={item} />
        </DocumentSection>
        <nav
          aria-label="More registry items"
          className="border-rule-strong grid gap-4 border-t pt-8 sm:grid-cols-2"
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
      </DocumentLayout>
    </>
  );
};

export default RegistryItemPage;
