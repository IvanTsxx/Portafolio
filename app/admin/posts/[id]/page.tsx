import { notFound } from "next/navigation";
import { getPostById } from "@/app/actions/posts";
import { getCategories, getTags } from "@/app/actions/taxonamy";
import { EditPostForm } from "../_components/edit-post-form";

interface EditPostPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditPostPage({ params }: EditPostPageProps) {
  const { id } = await params;
  const [post, categories, tags] = await Promise.all([
    getPostById(id),
    getCategories(),
    getTags(),
  ]);

  if (!post) {
    notFound();
  }

  return <EditPostForm post={post} categories={categories} tags={tags} />;
}
