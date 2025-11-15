"use client";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import type { SelectCategory } from "@/schemas/category.schema";
import { useRouter, useSearchParams } from "next/navigation";

interface CategoryFilterProps {
  categories: SelectCategory[];
}

export function CategoryFilter({ categories }: CategoryFilterProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const categoryParam = searchParams.get("categoryId");
  const selectedCategories = categoryParam
    ? categoryParam.split(",").map(Number)
    : [];

  // Organize categories into parent and child structure
  const parentCategories = categories.filter((cat) => !cat.parentId);
  const childCategoriesMap = new Map<number, SelectCategory[]>();

  categories.forEach((cat) => {
    if (cat.parentId) {
      const children = childCategoriesMap.get(cat.parentId) || [];
      children.push(cat);
      childCategoriesMap.set(cat.parentId, children);
    }
  });

  const handleCategoryToggle = (categoryId: number, checked: boolean) => {
    const params = new URLSearchParams(searchParams.toString());
    let newSelected = [...selectedCategories];

    if (checked) {
      newSelected.push(categoryId);
    } else {
      newSelected = newSelected.filter((id) => id !== categoryId);
    }

    if (newSelected.length === 0) {
      params.delete("categoryId");
    } else {
      params.set("categoryId", newSelected.join(","));
    }

    params.set("page", "1");
    router.push(`/products?${params.toString()}`);
  };

  const clearFilters = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("categoryId");
    params.set("page", "1");
    router.push(`/products?${params.toString()}`);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label className="text-sm font-semibold">Categorías</Label>
        {selectedCategories.length > 0 && (
          <Button
            onClick={clearFilters}
            variant="ghost"
            className="h-auto p-0 text-xs"
          >
            Limpiar
          </Button>
        )}
      </div>

      <ScrollArea className="h-[400px] pr-4">
        <Accordion type="multiple" className="w-full">
          {parentCategories.map((parent) => {
            const children = childCategoriesMap.get(parent.id) || [];
            const hasChildren = children.length > 0;

            if (hasChildren) {
              return (
                <AccordionItem key={parent.id} value={`parent-${parent.id}`}>
                  <AccordionTrigger className="py-2 hover:no-underline">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id={`category-${parent.id}`}
                        checked={selectedCategories.includes(parent.id)}
                        onCheckedChange={(checked) =>
                          handleCategoryToggle(parent.id, checked as boolean)
                        }
                        onClick={(e) => e.stopPropagation()}
                      />
                      <Label
                        htmlFor={`category-${parent.id}`}
                        className="text-sm font-normal cursor-pointer"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {parent.name}
                      </Label>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="ml-6 space-y-2 pt-2">
                      {children.map((child) => (
                        <div
                          key={child.id}
                          className="flex items-center space-x-2 py-1"
                        >
                          <Checkbox
                            id={`category-${child.id}`}
                            checked={selectedCategories.includes(child.id)}
                            onCheckedChange={(checked) =>
                              handleCategoryToggle(child.id, checked as boolean)
                            }
                          />
                          <Label
                            htmlFor={`category-${child.id}`}
                            className="text-sm font-normal cursor-pointer"
                          >
                            {child.name}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              );
            }

            // Category without children
            return (
              <div
                key={parent.id}
                className="flex items-center space-x-2 py-3 border-b"
              >
                <Checkbox
                  id={`category-${parent.id}`}
                  checked={selectedCategories.includes(parent.id)}
                  onCheckedChange={(checked) =>
                    handleCategoryToggle(parent.id, checked as boolean)
                  }
                />
                <Label
                  htmlFor={`category-${parent.id}`}
                  className="text-sm font-normal cursor-pointer"
                >
                  {parent.name}
                </Label>
              </div>
            );
          })}
        </Accordion>
      </ScrollArea>
    </div>
  );
}
