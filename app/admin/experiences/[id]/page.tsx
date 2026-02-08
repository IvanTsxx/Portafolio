import { notFound } from "next/navigation";
import { getExperienceById } from "@/app/actions/experiences";
import { getTechnologies } from "@/app/actions/taxonamy";
import { EditExperienceForm } from "../_components/edit-experience-form";

interface EditExperiencePageProps {
  params: Promise<{ id: string }>;
}

export default async function EditExperiencePage({
  params,
}: EditExperiencePageProps) {
  const { id } = await params;
  const [experience, technologies] = await Promise.all([
    getExperienceById(id),
    getTechnologies(),
  ]);

  if (!experience) {
    notFound();
  }

  return (
    <EditExperienceForm experience={experience} technologies={technologies} />
  );
}
