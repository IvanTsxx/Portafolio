import { getCategories } from "@/app/actions/taxonamy";
import { CategoriesList } from "./_components/categories-list";

export default async function AdminCategoriesPage() {
  const categories = await getCategories();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-bold text-3xl tracking-tight">Categorías</h1>
        <p className="text-muted-foreground">
          Administra las categorías de tus posts
        </p>
      </div>

      <CategoriesList initialCategories={categories} />
    </div>
  );
}
