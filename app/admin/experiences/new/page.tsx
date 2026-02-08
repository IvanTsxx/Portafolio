import { getTechnologies } from "@/app/actions/taxonamy";
import { ExperienceForm } from "../_components/experience-form";

export default async function AdminNewExperiencePage() {
  const technologies = await getTechnologies();

  return <ExperienceForm technologies={technologies} />;
}
