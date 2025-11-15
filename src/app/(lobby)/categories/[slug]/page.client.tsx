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
import { Badge } from "@/components/ui/badge";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { ProductCard } from "@/components/products/product-card";
import { ViewToggle } from "@/components/products/view-toggle";
import { PriceRangeFilter } from "@/components/products/price-range-filter";
import { AvailabilityFilter } from "@/components/products/availability-filter";
import type { PaginatedProducts } from "@/types/product";
import type { SelectCategory } from "@/schemas/category.schema";
import { Filter, Search, ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

interface CategoryDetailClientProps {
  category: SelectCategory & {
    parent?: SelectCategory | null;
    children?: SelectCategory[];
    productsCount?: number;
  };
  products: PaginatedProducts;
  categoryIds: number[];
}

function CategoryDetailClient({
  category,
  products,
}: CategoryDetailClientProps) {
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
    router.push(`?${params.toString()}`);
  };

  const currentSort = searchParams.get("sort") || "default";
  const currentPage = Number(searchParams.get("page")) || 1;

  const handleSortChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());

    if (value === "default") {
      params.delete("sort");
    } else {
      params.set("sort", value);
    }

    params.set("page", "1");
    router.push(`?${params.toString()}`);
  };

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", page.toString());
    router.push(`?${params.toString()}`);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="container py-8">
      {/* Breadcrumb */}
      <Breadcrumb className="mb-6">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/categories">Categorías</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          {category.parent && (
            <>
              <BreadcrumbItem>
                <BreadcrumbLink href={`/categories/${category.parent.slug}`}>
                  {category.parent.name}
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
            </>
          )}
          <BreadcrumbItem>
            <BreadcrumbPage>{category.name}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Category Header */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row gap-6 items-start">
          {category.imageUrl && (
            <div className="relative w-full md:w-48 h-48 rounded-lg overflow-hidden bg-muted shrink-0">
              <Image
                src={category.imageUrl}
                alt={category.name}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 192px"
              />
            </div>
          )}
          <div className="flex-1">
            <h1 className="text-4xl font-bold mb-2">{category.name}</h1>
            {category.description && (
              <p className="text-muted-foreground text-lg mb-4">
                {category.description}
              </p>
            )}
            {category.productsCount !== undefined && (
              <p className="text-sm text-muted-foreground">
                {category.productsCount} producto
                {category.productsCount !== 1 ? "s" : ""}
              </p>
            )}
          </div>
        </div>

        {/* Subcategories */}
        {category.children && category.children.length > 0 && (
          <div className="mt-6">
            <h2 className="text-lg font-semibold mb-3">Subcategorías</h2>
            <div className="flex flex-wrap gap-2">
              {category.children.map((child) => (
                <Link key={child.id} href={`/categories/${child.slug}`}>
                  <Badge
                    variant="secondary"
                    className="text-sm py-2 px-4 hover:bg-primary hover:text-primary-foreground transition-colors cursor-pointer"
                  >
                    {child.name}
                  </Badge>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Search & Filters Bar */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <form onSubmit={handleSearch} className="flex-1 flex gap-2">
          <Input
            type="search"
            placeholder="Buscar productos en esta categoría..."
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
                No se encontraron productos en esta categoría
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
                    size="icon"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>

                  <div className="flex items-center gap-2">
                    {Array.from(
                      { length: products.result.pageCount },
                      (_, i) => i + 1
                    )
                      .filter((page) => {
                        return (
                          page === 1 ||
                          page === products.result.pageCount ||
                          Math.abs(page - currentPage) <= 1
                        );
                      })
                      .map((page, index, array) => (
                        <React.Fragment key={page}>
                          {index > 0 && array[index - 1] !== page - 1 && (
                            <span className="text-muted-foreground">...</span>
                          )}
                          <Button
                            variant={
                              page === currentPage ? "default" : "outline"
                            }
                            size="sm"
                            onClick={() => handlePageChange(page)}
                          >
                            {page}
                          </Button>
                        </React.Fragment>
                      ))}
                  </div>

                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === products.result.pageCount}
                  >
                    <ChevronRight className="h-4 w-4" />
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

export default CategoryDetailClient;
