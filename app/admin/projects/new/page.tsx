import { getTechnologies } from "@/app/actions/taxonamy";
import { NewProjectPage } from "../_components/project-form";

export default async function AdminNewProjectPage() {
  const technologies = await getTechnologies();

  return <NewProjectPage technologies={technologies} />;
}
