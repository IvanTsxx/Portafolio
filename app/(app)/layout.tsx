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
      <section className="mx-auto max-w-3xl flex flex-col gap-y-2 flex-1 lg:p-0 px-6">
        {children}
      </section>
      <Footer />
    </main>
  );
}
