import dynamic from "next/dynamic";

import { ThemeToggle } from "../theme-toggle";
import { DesktopNavbar } from "./desktop";
import { NavItemGitHub } from "./nav-item-github";
import { NavLogo } from "./nav-logo";

const MobileNav = dynamic(async () => {
  const mod = await import("@/shared/components/navbar/mobile-nav");
  return mod.MobileNav;
});

export function Header() {
  return (
    <header className="sticky top-0 z-50 backdrop-blur-sm border-b border-border max-w-3xl mx-auto h-12">
      <section className="flex items-center justify-between px-4 h-full">
        {/* Logo */}
        <NavLogo />

        {/* Desktop Nav */}
        <DesktopNavbar />

        <section className="flex items-center">
          <ThemeToggle />
          <NavItemGitHub />
          <MobileNav />
        </section>
      </section>
    </header>
  );
}
