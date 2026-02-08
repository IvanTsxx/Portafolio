import { getTags } from "@/app/actions/taxonamy";
import { TagsList } from "./_components/tags-list";

export default async function AdminTagsPage() {
  const tags = await getTags();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-bold text-3xl tracking-tight">Tags</h1>
        <p className="text-muted-foreground">
          Administra los tags de tus publicaciones
        </p>
      </div>

      <TagsList initialTags={tags} />
    </div>
  );
}
