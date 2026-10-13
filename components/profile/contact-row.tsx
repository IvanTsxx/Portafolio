import { CopyEmail } from "@/components/profile/copy-email";
import { DocumentSection } from "@/components/site/document-section";
import { SocialLinks } from "@/components/site/social-links";
import { siteConfig } from "@/lib/site/config";
import { homeSectionById } from "@/lib/site/page-sections";
import { sectionScripts } from "@/lib/site/section-scripts";

export const ContactRow = () => {
  const section = homeSectionById("contact");
  return (
    <DocumentSection
      id={section.id}
      index={section.index}
      label={section.label}
      script={sectionScripts.homeContact}
    >
      <div className="flex flex-wrap items-center justify-between gap-x-8 gap-y-2">
        <CopyEmail email={siteConfig.email} />
        <SocialLinks ids={["github", "x", "linkedin"]} />
      </div>
    </DocumentSection>
  );
};
