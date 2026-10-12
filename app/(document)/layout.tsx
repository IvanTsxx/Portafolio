import { DocumentShell } from "@/components/site/document-shell";

const DocumentGroupLayout = ({ children }: LayoutProps<"/">) => (
  <DocumentShell>{children}</DocumentShell>
);

export default DocumentGroupLayout;
