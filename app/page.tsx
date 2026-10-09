import { Capabilities } from "@/components/home/capabilities";
import { Contact } from "@/components/home/contact";
import { Experiments } from "@/components/home/experiments";
import { Hero } from "@/components/home/hero";
import { RegistryTeaser } from "@/components/home/registry-teaser";
import { SectionIndex } from "@/components/home/section-index";
import { SelectedWork } from "@/components/home/selected-work";
import { Workshop } from "@/components/home/workshop";

const HomePage = () => (
  <div className="mx-auto flex w-full max-w-screen-2xl">
    <div className="border-rule hidden w-16 shrink-0 border-r pl-4 lg:block xl:pl-6">
      <SectionIndex />
    </div>
    <div className="min-w-0 flex-1">
      <Hero />
      <Workshop />
      <SelectedWork />
      <Capabilities />
      <Experiments />
      <RegistryTeaser />
      <Contact />
    </div>
  </div>
);

export default HomePage;
