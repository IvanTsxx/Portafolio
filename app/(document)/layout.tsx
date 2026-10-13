import { Dossier } from "@/components/site/dossier";

const DocumentGroupLayout = ({ children }: LayoutProps<"/">) => (
  <Dossier size="document">{children}</Dossier>
);

export default DocumentGroupLayout;
