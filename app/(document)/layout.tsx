import { IdentityDossier } from "@/components/profile/identity-dossier";
import { DocumentShell } from "@/components/site/document-shell";
import { getGithubProfile } from "@/lib/site/github-profile";

export const revalidate = 3600;

const DocumentGroupLayout = async ({ children }: LayoutProps<"/">) => {
  const {
    profile: { identity },
  } = await getGithubProfile();
  return (
    <DocumentShell
      dossier={<IdentityDossier identity={identity} />}
      handle={identity.login}
    >
      {children}
    </DocumentShell>
  );
};

export default DocumentGroupLayout;
