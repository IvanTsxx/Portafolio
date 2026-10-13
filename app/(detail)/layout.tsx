import { Dossier } from "@/components/site/dossier";

const DetailGroupLayout = ({ children }: LayoutProps<"/">) => (
  <Dossier size="detail">{children}</Dossier>
);

export default DetailGroupLayout;
