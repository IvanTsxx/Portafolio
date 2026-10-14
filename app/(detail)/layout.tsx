import { Dossier } from "@/components/site/dossier";

const DetailGroupLayout = ({ children }: LayoutProps<"/">) => (
  <Dossier>{children}</Dossier>
);

export default DetailGroupLayout;
