import { searchProducts } from "@/services/products/actions/search.actions";
import { redirect } from "next/navigation";
import SearchPageClient from "./page.client";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Buscar Productos",
  description:
    "Busca productos en nuestro catálogo. Encuentra rápidamente lo que necesitas con nuestro buscador.",
};

type SearchPageProps = {
  searchParams: Promise<{
    q?: string;
    page?: string;
    sort?: string;
  }>;
};

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const params = await searchParams;
  const query = params.q || "";
  const page = parseInt(params.page || "1", 10);
  const sort = params.sort || "relevance";

  if (!query || query.trim().length < 2) {
    redirect("/products");
  }

  const results = await searchProducts({
    query,
    page,
    perPage: 12,
    sort,
  });

  return <SearchPageClient initialResults={results} query={query} />;
}
