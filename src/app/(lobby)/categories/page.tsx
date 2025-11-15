import { getCategories } from "@/services/categories/actions/category.actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import Link from "next/link";

const Page = async () => {
  const categories = await getCategories();

  // Filter only parent categories for display
  const parentCategories = categories.filter((cat) => !cat.parentId);

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
            <Link key={category.id} href={`/categories/${category.slug}`}>
              <Card className="overflow-hidden hover:shadow-lg transition-shadow group h-full">
                <div className="relative aspect-square bg-muted">
                  {category.imageUrl ? (
                    <Image
                      src={category.imageUrl}
                      alt={category.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                      Sin imagen
                    </div>
                  )}
                </div>

                <CardHeader className="p-4">
                  <CardTitle className="text-lg group-hover:text-primary transition-colors">
                    {category.name}
                  </CardTitle>
                  {category.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2 mt-2">
                      {category.description}
                    </p>
                  )}
                </CardHeader>

                <CardContent className="p-4 pt-0">
                  {childrenCount > 0 && (
                    <Badge variant="secondary">
                      {childrenCount} subcategoría{childrenCount > 1 ? "s" : ""}
                    </Badge>
                  )}
                </CardContent>
              </Card>
            </Link>
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
