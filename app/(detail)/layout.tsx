import { DetailShell } from "@/components/site/detail-shell";

const DetailGroupLayout = ({ children }: LayoutProps<"/">) => (
  <DetailShell>{children}</DetailShell>
);

export default DetailGroupLayout;
