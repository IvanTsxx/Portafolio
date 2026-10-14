import { Dossier } from "@/components/site/dossier";

const DocumentGroupLayout = ({ children }: LayoutProps<"/">) => (
  <Dossier>{children}</Dossier>
);

export default DocumentGroupLayout;
