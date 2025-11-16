"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

export function AvailabilityFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleInStockChange = (checked: boolean) => {
    const params = new URLSearchParams(searchParams.toString());

    if (checked) {
      params.set("inStock", "true");
    } else {
      params.delete("inStock");
    }

    params.set("page", "1");
    router.push(`?${params.toString()}`);
  };

  const handleOutOfStockChange = (checked: boolean) => {
    const params = new URLSearchParams(searchParams.toString());

    if (checked) {
      params.set("inStock", "false");
    } else {
      params.delete("inStock");
    }

    params.set("page", "1");
    router.push(`?${params.toString()}`, { scroll: false });
  };

  const inStockValue = searchParams.get("inStock");
  const isInStockChecked = inStockValue === "true";
  const isOutOfStockChecked = inStockValue === "false";

  return (
    <div className="space-y-4">
      <h3 className="font-medium text-sm">Disponibilidad</h3>
      <div className="space-y-3">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="in-stock"
            checked={isInStockChecked}
            onCheckedChange={handleInStockChange}
          />
          <Label
            htmlFor="in-stock"
            className="text-sm font-normal cursor-pointer"
          >
            En stock
          </Label>
        </div>
        <div className="flex items-center space-x-2">
          <Checkbox
            id="out-of-stock"
            checked={isOutOfStockChecked}
            onCheckedChange={handleOutOfStockChange}
          />
          <Label
            htmlFor="out-of-stock"
            className="text-sm font-normal cursor-pointer"
          >
            Agotado
          </Label>
        </div>
      </div>
    </div>
  );
}
