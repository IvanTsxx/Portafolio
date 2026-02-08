import { getTechnologies } from "@/app/actions/taxonamy";
import { ProjectForm } from "../_components/project-form";

export default async function AdminNewProjectPage() {
  const technologies = await getTechnologies();

  return <ProjectForm technologies={technologies} />;
}
