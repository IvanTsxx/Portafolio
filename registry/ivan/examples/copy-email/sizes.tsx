import { CopyEmail } from "@/registry/ivan/ui/copy-email";

export const Example = () => (
  <div className="flex flex-col items-start gap-4 p-6">
    <CopyEmail email="hello@example.com" size="sm" />
    <CopyEmail email="hello@example.com" label="Write to me" size="lg" />
  </div>
);
