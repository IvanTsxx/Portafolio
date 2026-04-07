import { Footer } from "@/shared/components/footer";
import { Header } from "@/shared/components/navbar/header";

export default function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <main>
      <Header />
      <main>{children}</main>
      <Footer />
    </main>
  );
}
