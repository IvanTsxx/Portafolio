import { notFound } from "next/navigation";
import { getProjectById } from "@/app/actions/projects";
import { getTechnologies } from "@/app/actions/taxonamy";
import { EditProjectForm } from "../_components/edit-project-form";

interface EditProjectPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditProjectPage({
  params,
}: EditProjectPageProps) {
  const { id } = await params;
  const [project, technologies] = await Promise.all([
    getProjectById(id),
    getTechnologies(),
  ]);

  if (!project) {
    notFound();
  }

  return <EditProjectForm project={project} technologies={technologies} />;
}
