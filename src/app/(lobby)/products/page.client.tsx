"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { ProductCard } from "@/components/products/product-card";
import { ViewToggle } from "@/components/products/view-toggle";
import { PriceRangeFilter } from "@/components/products/price-range-filter";
import { CategoryFilter } from "@/components/products/category-filter";
import { AvailabilityFilter } from "@/components/products/availability-filter";
import type { PaginatedProducts } from "@/types/product";
import type { SelectCategory } from "@/schemas/category.schema";
import { Filter, Search } from "lucide-react";

interface ProductsClientProps {
  products: PaginatedProducts;
  categories: SelectCategory[];
}

export default function ProductsClient({
  products,
  categories,
}: ProductsClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [view, setView] = useState<"grid" | "list">("grid");
  const [searchValue, setSearchValue] = useState(
    searchParams.get("search") || ""
  );

  // Default to list view on mobile
  useEffect(() => {
    const checkMobile = () => {
      const isMobile = window.innerWidth < 768;
      if (isMobile && view === "grid") {
        setView("list");
      }
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, [view]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams.toString());

    if (searchValue.trim()) {
      params.set("search", searchValue.trim());
    } else {
      params.delete("search");
    }

    params.set("page", "1");
    router.push(`/products?${params.toString()}`, { scroll: false });
  };

  const handleSortChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());

    if (value === "default") {
      params.delete("sort");
    } else {
      params.set("sort", value);
    }

    params.set("page", "1");
    router.push(`/products?${params.toString()}`, { scroll: false });
  };

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", page.toString());
    router.push(`/products?${params.toString()}`, { scroll: false });
  };

  const currentSort = searchParams.get("sort") || "default";

  return (
    <div className="container py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Productos</h1>
        <p className="text-muted-foreground">
          Explora nuestro catálogo de productos
        </p>
      </div>

      {/* Search & Filters Bar */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <form onSubmit={handleSearch} className="flex-1 flex gap-2">
          <Input
            type="search"
            placeholder="Buscar productos..."
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            className="flex-1"
          />
          <Button type="submit" size="icon">
            <Search className="h-4 w-4" />
          </Button>
        </form>

        <div className="flex items-center gap-2">
          <Select value={currentSort} onValueChange={handleSortChange}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Ordenar por" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="default">Más recientes</SelectItem>
              <SelectItem value="createdAt.asc">Más antiguos</SelectItem>
              <SelectItem value="name.asc">Nombre (A-Z)</SelectItem>
              <SelectItem value="name.desc">Nombre (Z-A)</SelectItem>
              <SelectItem value="price.asc">Precio: Menor a Mayor</SelectItem>
              <SelectItem value="price.desc">Precio: Mayor a Menor</SelectItem>
            </SelectContent>
          </Select>

          <ViewToggle view={view} onViewChange={setView} />

          {/* Mobile Filter Button */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="md:hidden">
                <Filter className="h-4 w-4" />
              </Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>Filtros</SheetTitle>
              </SheetHeader>
              <div className="mt-6 space-y-6">
                <CategoryFilter categories={categories} />
                <PriceRangeFilter min={0} max={1000} step={10} />
                <AvailabilityFilter />
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {/* Results Info */}
      <div className="mb-4 text-sm text-muted-foreground">
        Mostrando {products.result.data.length} de {products.result.total}{" "}
        productos
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Desktop Sidebar Filters */}
        <aside className="hidden lg:block w-64 space-y-6">
          <div className="border rounded-lg p-4">
            <CategoryFilter categories={categories} />
          </div>
          <div className="border rounded-lg p-4">
            <PriceRangeFilter min={0} max={1000} step={10} />
          </div>
          <div className="border rounded-lg p-4">
            <AvailabilityFilter />
          </div>
        </aside>

        {/* Products Grid/List */}
        <main className="flex-1">
          {products.result.data.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-lg text-muted-foreground">
                No se encontraron productos
              </p>
            </div>
          ) : (
            <>
              <div
                className={
                  view === "grid"
                    ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
                    : "flex flex-col gap-4"
                }
              >
                {products.result.data.map((product) => (
                  <ProductCard key={product.id} product={product} view={view} />
                ))}
              </div>

              {/* Pagination */}
              {products.result.pageCount > 1 && (
                <div className="mt-8 flex items-center justify-center gap-2">
                  <Button
                    variant="outline"
                    onClick={() =>
                      handlePageChange(products.result.currentPage - 1)
                    }
                    disabled={products.result.currentPage <= 1}
                  >
                    Anterior
                  </Button>

                  <div className="flex items-center gap-1">
                    {Array.from(
                      { length: products.result.pageCount },
                      (_, i) => i + 1
                    ).map((page) => (
                      <Button
                        key={page}
                        variant={
                          page === products.result.currentPage
                            ? "default"
                            : "outline"
                        }
                        size="sm"
                        onClick={() => handlePageChange(page)}
                        className="h-8 w-8 p-0"
                      >
                        {page}
                      </Button>
                    ))}
                  </div>

                  <Button
                    variant="outline"
                    onClick={() =>
                      handlePageChange(products.result.currentPage + 1)
                    }
                    disabled={
                      products.result.currentPage >= products.result.pageCount
                    }
                  >
                    Siguiente
                  </Button>
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}
