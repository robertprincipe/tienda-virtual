import { getCategoryBySlug } from "@/services/categories/actions/category.actions";
import { getProductsPaginated } from "@/services/products/actions/product.actions";
import { publicProductsSchema } from "@/schemas/product.schema";
import { type SearchParams } from "@/types/params";
import { notFound } from "next/navigation";
import CategoryDetailClient from "./page.client";
import { Metadata } from "next";

type CategoryDetailPageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<SearchParams>;
};

export async function generateMetadata({
  params,
}: CategoryDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);

  if (!category) {
    return {
      title: "Categoría no encontrada",
      description: "La categoría que buscas no está disponible.",
    };
  }

  return {
    title: category.name,
    description:
      category.description ||
      `Explora nuestra selección de productos en ${category.name}. Encuentra las mejores opciones y ofertas.`,
  };
}

const Page = async ({ params, searchParams }: CategoryDetailPageProps) => {
  const { slug } = await params;
  const resolvedSearchParams = await searchParams;

  const category = await getCategoryBySlug(slug);

  if (!category) {
    notFound();
  }

  // Get all category IDs (current + children) for filtering
  const categoryIds = [category.id];
  if (category.children && category.children.length > 0) {
    categoryIds.push(...category.children.map((child) => child.id));
  }

  // Parse search params and force categoryId to current category and its children
  const search = publicProductsSchema.parse({
    ...resolvedSearchParams,
    categoryId: categoryIds.join(","),
  });

  const products = await getProductsPaginated(search);

  return (
    <CategoryDetailClient
      category={category}
      products={products}
      categoryIds={categoryIds}
    />
  );
};

export default Page;
