"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

interface PriceRangeFilterProps {
  min?: number;
  max?: number;
  step?: number;
}

export function PriceRangeFilter({
  min = 0,
  max = 1000,
  step = 10,
}: PriceRangeFilterProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const minFromUrl = Number(searchParams.get("minPrice")) || min;
  const maxFromUrl = Number(searchParams.get("maxPrice")) || max;

  const [range, setRange] = useState<[number, number]>([
    minFromUrl,
    maxFromUrl,
  ]);

  const handleApply = () => {
    const params = new URLSearchParams(searchParams.toString());

    if (range[0] > min) {
      params.set("minPrice", range[0].toString());
    } else {
      params.delete("minPrice");
    }

    if (range[1] < max) {
      params.set("maxPrice", range[1].toString());
    } else {
      params.delete("maxPrice");
    }

    params.set("page", "1");
    router.push(`/products?${params.toString()}`);
  };

  const handleReset = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("minPrice");
    params.delete("maxPrice");
    params.set("page", "1");
    setRange([min, max]);
    router.push(`/products?${params.toString()}`);
  };

  return (
    <div className="space-y-4">
      <div>
        <Label className="text-sm font-semibold">Rango de precio</Label>
      </div>

      <Slider
        min={min}
        max={max}
        step={step}
        value={range}
        onValueChange={(value) => setRange(value as [number, number])}
        className="w-full"
      />

      <div className="grid grid-cols-2 gap-2">
        <div>
          <Label htmlFor="minPrice" className="text-xs text-muted-foreground">
            Mínimo
          </Label>
          <Input
            id="minPrice"
            type="number"
            min={min}
            max={range[1]}
            value={range[0]}
            onChange={(e) => {
              const value = Number(e.target.value);
              if (value <= range[1]) {
                setRange([value, range[1]]);
              }
            }}
            className="h-8"
          />
        </div>
        <div>
          <Label htmlFor="maxPrice" className="text-xs text-muted-foreground">
            Máximo
          </Label>
          <Input
            id="maxPrice"
            type="number"
            min={range[0]}
            max={max}
            value={range[1]}
            onChange={(e) => {
              const value = Number(e.target.value);
              if (value >= range[0]) {
                setRange([range[0], value]);
              }
            }}
            className="h-8"
          />
        </div>
      </div>

      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>${range[0]}</span>
        <span>${range[1]}</span>
      </div>

      <div className="flex gap-2">
        <Button onClick={handleApply} className="flex-1" size="sm">
          Aplicar
        </Button>
        <Button
          onClick={handleReset}
          variant="outline"
          className="flex-1"
          size="sm"
        >
          Resetear
        </Button>
      </div>
    </div>
  );
}
