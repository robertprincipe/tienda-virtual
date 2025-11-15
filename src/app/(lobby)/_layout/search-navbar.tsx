"use client";

import * as React from "react";

import { Input } from "@/components/ui/input";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import useClickOutside from "@/hooks/use-click-outside";
import { useDebounce } from "@uidotdev/usehooks";
import { useSearchProductsQuery } from "~/ecommerce/products/queries/product.query";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useCategories,
  useSearchCategories,
} from "~/ecommerce/categories/queries";
import SelectCategory from "./select-category";
import { environments } from "@/env";

export default function SearchNavbar() {
  const [open, setOpen] = React.useState(false);

  const [tabActive, setTabActive] = React.useState<"products" | "categories">(
    "products"
  );

  const inputRef = React.useRef<HTMLInputElement>(null);

  // const ref = useClickOutside(() => {

  // });

  const onClose = () => {
    if (inputRef.current) inputRef.current.value = "";
    setOpen(false);
    setTabActive("products");
  };

  const [searchTerm, setSearchTerm] = React.useState<{
    query: string;
    category: string;
  }>({ query: "", category: "all" });

  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  const { data: productsSearchData, isLoading } = useSearchProductsQuery({
    ...searchTerm,
    category:
      searchTerm.category === "all" || searchTerm.query === ""
        ? ""
        : searchTerm.category,
  });

  const { data } = useSearchCategories(
    debouncedSearchTerm.query,
    tabActive === "categories" && !!debouncedSearchTerm.query
  );

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm({
      ...searchTerm,
      query: e.target.value,
    });
    setOpen(e.target.value.length > 0);
  };

  // setOpen when input has value any value

  return (
    <>
      <div className=" lg:max-w-(--breakpoint-xl) sm:w-[500px] lg:w-[800px]">
        <div className="relative">
          <div className="flex z-40 relative gap-px mt-3 sm:mt-0">
            <SelectCategory
              value={searchTerm.category}
              onValueChange={(value) =>
                setSearchTerm({ ...searchTerm, category: value })
              }
            />
            <Input
              type="text"
              className="bg-zinc-200 hover:bg-zinc-200 focus:bg-zinc-200 hover:ring-transparent focus:ring-transparent h-11 focus:ring-0 focus:ring-transparent focus:border-transparent rounded-none rounded-r-md border-none"
              onChange={onChange}
              placeholder="Buscar productos"
              ref={inputRef}
            />
          </div>

          <div
            className={`transition-all absolute grid duration-200 ease-in-out top-0 bg-white shadow-2xl -mt-2 rounded-lg overflow-hidden w-[calc(100%+16px)] -translate-x-2 z-20 ${
              open
                ? " grid-rows-[1fr] opacity-100"
                : "opacity-0 grid-rows-[0fr]"
            }`}
          >
            <div className="overflow-hidden">
              <div className="mt-16 grid border-t divide-x md:grid-cols-5">
                <Tabs
                  value={tabActive}
                  className="items-center md:col-span-3 px-5 py-4"
                  onValueChange={(value) =>
                    setTabActive(value as "products" | "categories")
                  }
                >
                  <TabsList className="text-foreground h-auto gap-2 rounded-none border-b bg-transparent px-0 py-1">
                    <TabsTrigger
                      value="products"
                      className="hover:bg-accent hover:text-foreground data-[state=active]:after:bg-primary data-[state=active]:hover:bg-accent relative after:absolute after:inset-x-0 after:bottom-0 after:-mb-1 after:h-0.5 data-[state=active]:bg-transparent data-[state=active]:shadow-none"
                    >
                      Productos
                    </TabsTrigger>
                    <TabsTrigger
                      value="categories"
                      className="hover:bg-accent hover:text-foreground data-[state=active]:after:bg-primary data-[state=active]:hover:bg-accent relative after:absolute after:inset-x-0 after:bottom-0 after:-mb-1 after:h-0.5 data-[state=active]:bg-transparent data-[state=active]:shadow-none"
                    >
                      Categorias
                    </TabsTrigger>
                  </TabsList>
                  <TabsContent value="products" className="grid gap-2">
                    {isLoading ? <Skeleton className="h-28" /> : null}
                    {productsSearchData?.result
                      ? productsSearchData.result.data.map((product) => (
                          <article
                            key={product.id}
                            className="flex gap-2 items-center"
                          >
                            <img
                              src={`${environments.API_URL}/statics/${product.images?.[0]?.static.urn}`}
                              alt=""
                              className="h-24 object-cover"
                            />
                            <div>
                              <h3 className="text-lg font-medium line-clamp-2">
                                {product.name}
                              </h3>
                              <p className="font-medium text-red-500 text-lg">
                                S/. {product.variants[0]?.price}
                              </p>
                            </div>
                          </article>
                        ))
                      : null}
                    {productsSearchData?.result.data.length === 0 ? (
                      <div>
                        <h4>No se encontraron productos</h4>
                      </div>
                    ) : null}
                  </TabsContent>
                  <TabsContent value="categories">
                    {data?.result.data.map((category) => (
                      <article
                        key={category.id}
                        className="flex gap-2 items-center"
                      >
                        <img
                          src={`${environments.API_URL}/statics/${category.static.urn}`}
                          alt=""
                          className="h-28 object-cover"
                        />
                        <div>
                          <h3 className="text-lg font-semibold">
                            {category.name}
                          </h3>
                        </div>
                      </article>
                    ))}
                  </TabsContent>
                </Tabs>
                <div className="bg-zinc-100 md:col-span-2 px-5 py-4">
                  <h3 className="font-medium">Sugerencias</h3>
                  <ul>
                    <li>Carros</li>
                    <li>Motos</li>
                    <li>Celulares</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div
        onClick={onClose}
        className={`${
          open ? "fixed inset-0 block" : "opacity-0 hidden"
        } transition-all duration-200 ease-in-out bg-zinc-950/50 z-10`}
      />
    </>
  );
}
