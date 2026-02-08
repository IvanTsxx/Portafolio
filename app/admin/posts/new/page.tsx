import { getCategories, getTags } from "@/app/actions/taxonamy";
import { NewPostForm } from "./_components/new-post-form";

export default async function NewPostPage() {
  const [tags, categories] = await Promise.all([getTags(), getCategories()]);

  return <NewPostForm tags={tags} categories={categories} />;
}
