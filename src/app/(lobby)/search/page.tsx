import { searchProducts } from "@/services/products/actions/search.actions";
import { redirect } from "next/navigation";
import SearchPageClient from "./page.client";

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
