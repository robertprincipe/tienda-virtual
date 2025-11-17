import { getCategories } from "@/services/categories/actions/category.actions";
import { CategoryCard } from "@/components/cards/category-card";

const Page = async () => {
  const categories = await getCategories();

  // Filter only parent categories for display
  const parentCategories = categories;

  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Categorías</h1>
        <p className="text-muted-foreground">
          Explora nuestras categorías de productos
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {parentCategories.map((category) => {
          const childrenCount = categories.filter(
            (cat) => cat.parentId === category.id
          ).length;

          return (
            <CategoryCard
              childrenCount={childrenCount}
              key={category.id}
              title={category.name}
              image={category.imageUrl ?? ""}
              slug={category.slug}
            />
          );
        })}
      </div>

      {parentCategories.length === 0 && (
        <div className="text-center py-12">
          <p className="text-lg text-muted-foreground">
            No hay categorías disponibles
          </p>
        </div>
      )}
    </div>
  );
};

export default Page;
