import type { Metadata } from "next";

export const metadata: Metadata = {
  robots: { follow: false, index: false },
  title: "Preview",
};

export default function PreviewLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <main className="bg-background min-h-screen w-full">{children}</main>;
}
