"use client";

import * as React from "react";

import { Icon } from "@iconify/react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

export function InputQuantity() {
  const [quantity, setQuantity] = React.useState(1);
  return (
    <div className="flex items-center border-2 border-zinc-900 rounded-md">
      <Button
        type="button"
        variant="outline"
        className="shrink-0 rounded-r-none border-none h-full"
        onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
      >
        <Icon icon="rivet-icons:minus" className="size-3" aria-hidden="true" />
        <span className="sr-only">Remove one item</span>
      </Button>
      <Separator orientation="vertical" className="bg-black w-0.5" />
      <Input
        // type="number"
        inputMode="numeric"
        min={1}
        max={9}
        value={quantity}
        onChange={(event) => setQuantity(Number(event.target.value))}
        className="w-12 text-center shadow-none rounded-none h-full text-lg border-transparent focus:ring-0 focus-visible:ring-0"
      />
      <Separator orientation="vertical" className="bg-black w-[1.5px]" />
      <Button
        type="button"
        variant="outline"
        className="shrink-0 rounded-l-none border-none h-full"
        onClick={() => setQuantity((prev) => Math.min(9, prev + 1))}
      >
        <Icon icon="rivet-icons:plus" className="size-3" aria-hidden="true" />
        <span className="sr-only">Add one item</span>
      </Button>
    </div>
  );
}
