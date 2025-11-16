"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Icon } from "@iconify/react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface SearchResult {
  id: number;
  name: string;
  slug: string;
  price: string;
  compareAtPrice: string | null;
  stock: number;
  shortDesc: string | null;
  image: string | null;
}

interface SearchResults {
  products: SearchResult[];
  total: number;
  page: number;
  perPage: number;
  totalPages: number;
}

interface SearchPageClientProps {
  initialResults: SearchResults;
  query: string;
}

export default function SearchPageClient({
  initialResults,
  query,
}: SearchPageClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [sortBy, setSortBy] = useState(searchParams.get("sort") || "relevance");

  const handleSortChange = (value: string) => {
    setSortBy(value);
    const params = new URLSearchParams(searchParams.toString());
    params.set("sort", value);
    params.delete("page"); // Reset to page 1 when sorting
    router.push(`/search?${params.toString()}`);
  };

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", newPage.toString());
    router.push(`/search?${params.toString()}`);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const calculateDiscount = (price: string, comparePrice: string | null) => {
    if (!comparePrice) return null;
    const priceNum = parseFloat(price);
    const comparePriceNum = parseFloat(comparePrice);
    if (comparePriceNum <= priceNum) return null;
    return Math.round(((comparePriceNum - priceNum) / comparePriceNum) * 100);
  };

  return (
    <div className="container py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">
          Resultados de búsqueda para &quot;{query}&quot;
        </h1>
        <p className="text-muted-foreground">
          {initialResults.total}{" "}
          {initialResults.total === 1
            ? "producto encontrado"
            : "productos encontrados"}
        </p>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Ordenar por:</span>
          <Select value={sortBy} onValueChange={handleSortChange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="relevance">Relevancia</SelectItem>
              <SelectItem value="name-asc">Nombre (A-Z)</SelectItem>
              <SelectItem value="name-desc">Nombre (Z-A)</SelectItem>
              <SelectItem value="price-asc">Precio: Menor a Mayor</SelectItem>
              <SelectItem value="price-desc">Precio: Mayor a Menor</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Vista:</span>
          <div className="flex border rounded-lg overflow-hidden">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-2 ${
                viewMode === "grid"
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-muted"
              }`}
            >
              <Icon icon="material-symbols:grid-view" className="text-xl" />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`p-2 ${
                viewMode === "list"
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-muted"
              }`}
            >
              <Icon icon="material-symbols:list" className="text-xl" />
            </button>
          </div>
        </div>
      </div>

      {/* Results */}
      {initialResults.products.length > 0 ? (
        <>
          {viewMode === "grid" ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {initialResults.products.map((product) => {
                const discount = calculateDiscount(
                  product.price,
                  product.compareAtPrice
                );
                return (
                  <Link
                    key={product.id}
                    href={`/products/${product.slug}`}
                    className="group border rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
                  >
                    <div className="relative aspect-square bg-muted">
                      {product.image ? (
                        <Image
                          src={product.image}
                          alt={product.name}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform"
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Icon
                            icon="material-symbols:image-outline"
                            className="text-6xl text-muted-foreground"
                          />
                        </div>
                      )}
                      {discount && (
                        <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded-md text-xs font-bold">
                          -{discount}%
                        </div>
                      )}
                      {product.stock === 0 && (
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                          <span className="text-white font-bold">Agotado</span>
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold line-clamp-2 mb-2">
                        {product.name}
                      </h3>
                      {product.shortDesc && (
                        <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                          {product.shortDesc}
                        </p>
                      )}
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-bold text-primary">
                          ${parseFloat(product.price).toFixed(2)}
                        </span>
                        {product.compareAtPrice && discount && (
                          <span className="text-sm text-muted-foreground line-through">
                            ${parseFloat(product.compareAtPrice).toFixed(2)}
                          </span>
                        )}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="space-y-4">
              {initialResults.products.map((product) => {
                const discount = calculateDiscount(
                  product.price,
                  product.compareAtPrice
                );
                return (
                  <Link
                    key={product.id}
                    href={`/products/${product.slug}`}
                    className="group flex gap-4 border rounded-lg overflow-hidden hover:shadow-lg transition-shadow p-4"
                  >
                    <div className="relative w-32 h-32 shrink-0 bg-muted rounded-md overflow-hidden">
                      {product.image ? (
                        <Image
                          src={product.image}
                          alt={product.name}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform"
                          sizes="128px"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Icon
                            icon="material-symbols:image-outline"
                            className="text-4xl text-muted-foreground"
                          />
                        </div>
                      )}
                      {discount && (
                        <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded-md text-xs font-bold">
                          -{discount}%
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg mb-1">
                        {product.name}
                      </h3>
                      {product.shortDesc && (
                        <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                          {product.shortDesc}
                        </p>
                      )}
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xl font-bold text-primary">
                          ${parseFloat(product.price).toFixed(2)}
                        </span>
                        {product.compareAtPrice && discount && (
                          <span className="text-sm text-muted-foreground line-through">
                            ${parseFloat(product.compareAtPrice).toFixed(2)}
                          </span>
                        )}
                      </div>
                      {product.stock === 0 && (
                        <span className="text-sm text-red-500 font-semibold">
                          Agotado
                        </span>
                      )}
                      {product.stock > 0 && product.stock <= 5 && (
                        <span className="text-sm text-orange-500">
                          Solo quedan {product.stock} unidades
                        </span>
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>
          )}

          {/* Pagination */}
          {initialResults.totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-8">
              <Button
                variant="outline"
                onClick={() => handlePageChange(initialResults.page - 1)}
                disabled={initialResults.page === 1}
              >
                <Icon
                  icon="material-symbols:chevron-left"
                  className="text-xl"
                />
                Anterior
              </Button>

              <div className="flex items-center gap-1">
                {Array.from(
                  { length: initialResults.totalPages },
                  (_, i) => i + 1
                )
                  .filter((pageNum) => {
                    return (
                      pageNum === 1 ||
                      pageNum === initialResults.totalPages ||
                      Math.abs(pageNum - initialResults.page) <= 1
                    );
                  })
                  .map((pageNum, index, array) => {
                    const prevPageNum = array[index - 1];
                    const showEllipsis =
                      prevPageNum && pageNum - prevPageNum > 1;

                    return (
                      <div key={pageNum} className="flex items-center">
                        {showEllipsis && (
                          <span className="px-2 text-muted-foreground">
                            ...
                          </span>
                        )}
                        <Button
                          variant={
                            pageNum === initialResults.page
                              ? "default"
                              : "outline"
                          }
                          onClick={() => handlePageChange(pageNum)}
                          className="min-w-10"
                        >
                          {pageNum}
                        </Button>
                      </div>
                    );
                  })}
              </div>

              <Button
                variant="outline"
                onClick={() => handlePageChange(initialResults.page + 1)}
                disabled={initialResults.page === initialResults.totalPages}
              >
                Siguiente
                <Icon
                  icon="material-symbols:chevron-right"
                  className="text-xl"
                />
              </Button>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-12">
          <Icon
            icon="material-symbols:search-off"
            className="text-6xl text-muted-foreground mx-auto mb-4"
          />
          <h3 className="text-xl font-semibold mb-2">
            No se encontraron resultados
          </h3>
          <p className="text-muted-foreground mb-4">
            Intenta con otros términos de búsqueda
          </p>
          <Button asChild>
            <Link href="/products">Ver todos los productos</Link>
          </Button>
        </div>
      )}
    </div>
  );
}
