"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Icon } from "@iconify/react";
import { searchProductsDropdown } from "@/services/products/actions/search.actions";
import { useDebounce } from "@/hooks/use-debounce";
import { cn } from "@/lib/utils";

interface SearchResult {
  id: number;
  name: string;
  slug: string;
  price: string;
  image: string | null;
}

export function SearchDropdown() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const debouncedQuery = useDebounce(query, 300);

  // Handle search
  useEffect(() => {
    const performSearch = async () => {
      if (debouncedQuery.trim().length < 2) {
        setResults([]);
        return;
      }

      setIsLoading(true);
      try {
        const data = await searchProductsDropdown(debouncedQuery, 3);
        setResults(data as SearchResult[]);
      } catch (error) {
        console.error("Search error:", error);
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    };

    performSearch();
  }, [debouncedQuery]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
      setIsOpen(false);
      setQuery("");
    }
  };

  const handleInputFocus = () => {
    setIsOpen(true);
  };

  const handleResultClick = () => {
    setIsOpen(false);
    setQuery("");
  };

  return (
    <div ref={dropdownRef} className="relative w-full max-w-2xl">
      <form onSubmit={handleSubmit} className="relative">
        <Icon
          icon="material-symbols-light:search"
          className="absolute left-3 top-1/2 -translate-y-1/2 text-2xl text-muted-foreground pointer-events-none"
        />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={handleInputFocus}
          placeholder="Buscar productos..."
          className={cn(
            "w-full pl-12 pr-4 py-2.5 rounded-lg border bg-background",
            "focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent",
            "placeholder:text-muted-foreground"
          )}
        />
        {query && (
          <button
            type="button"
            onClick={() => {
              setQuery("");
              setResults([]);
              inputRef.current?.focus();
            }}
            className="absolute right-12 top-1/2 -translate-y-1/2 p-1 hover:bg-muted rounded-full transition-colors"
          >
            <Icon icon="material-symbols:close" className="text-xl" />
          </button>
        )}
        <button
          type="submit"
          className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 hover:bg-muted rounded-lg transition-colors"
        >
          <Icon
            icon="material-symbols:arrow-forward"
            className="text-xl text-muted-foreground"
          />
        </button>
      </form>

      {/* Dropdown Results */}
      {isOpen && query.trim().length >= 2 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-background border rounded-lg shadow-lg z-50 overflow-hidden">
          {isLoading ? (
            <div className="p-4 text-center text-muted-foreground">
              <Icon
                icon="svg-spinners:ring-resize"
                className="text-2xl mx-auto"
              />
              <p className="mt-2 text-sm">Buscando...</p>
            </div>
          ) : results.length > 0 ? (
            <>
              <div className="max-h-96 overflow-y-auto">
                {results.map((product) => (
                  <Link
                    key={product.id}
                    href={`/products/${product.slug}`}
                    onClick={handleResultClick}
                    className="flex items-center gap-3 p-3 hover:bg-muted transition-colors border-b last:border-b-0"
                  >
                    <div className="relative w-16 h-16 shrink-0 bg-muted rounded-md overflow-hidden">
                      {product.image ? (
                        <Image
                          src={product.image}
                          alt={product.name}
                          fill
                          className="object-cover"
                          sizes="64px"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Icon
                            icon="material-symbols:image-outline"
                            className="text-3xl text-muted-foreground"
                          />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-sm line-clamp-2">
                        {product.name}
                      </h4>
                      <p className="text-primary font-semibold mt-1">
                        ${parseFloat(product.price).toFixed(2)}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
              <Link
                href={`/search?q=${encodeURIComponent(query.trim())}`}
                onClick={handleResultClick}
                className="block p-3 text-center text-sm font-medium text-primary hover:bg-muted transition-colors border-t"
              >
                Ver todos los resultados
              </Link>
            </>
          ) : (
            <div className="p-6 text-center text-muted-foreground">
              <Icon
                icon="material-symbols:search-off"
                className="text-4xl mx-auto mb-2"
              />
              <p>No se encontraron productos</p>
              <p className="text-xs mt-1">
                Intenta con otros términos de búsqueda
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
