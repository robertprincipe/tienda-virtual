"use client";

import * as React from "react";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Icon } from "@iconify/react/dist/iconify.js";

import { QuantityInputBasic } from "./input-quantity";
import Link from "next/link";
import { useCartStore } from "@/hooks/stores/cart.store";
import { CartItem } from "@/types/cart";
import { parseIntSafety } from "@/lib/utils";

// Datos inventados para placeholder
const fakeData = {
  result: {
    cartItems: [
      {
        id: 1,
        quantity: 2,
        product: { name: "Otro producto", price: "50", compareAtPrice: "70" },
      },
      {
        id: 2,
        quantity: 1,
        product: { name: "Otro producto", price: "80", compareAtPrice: "100" },
      },
    ],
  },
};

export function Cart() {
  const [open, setOpen, total] = useCartStore((state) => [
    state.open,
    state.setOpen,
    state.total,
  ]);

  const data = fakeData;
  const isLoading = false;

  const containerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [data?.result?.cartItems.length]);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetContent className="sm:max-w-lg p-0 inset-y-2 right-2 rounded-xl w-[calc(100%-16px)] h-[calc(100%-16px)] overflow-hidden border shadow-2xs">
        <div className="flex flex-col h-full">
          <SheetHeader className="border-b p-6">
            <SheetTitle>Carrito de compras</SheetTitle>
          </SheetHeader>

          <div
            className={`grow overflow-y-auto ${
              data?.result.cartItems.length === 0
                ? "flex items-center justify-center gap-3 flex-col"
                : ""
            }`}
            ref={containerRef}
          >
            {isLoading ? (
              <div className="flex justify-center items-center h-full">
                <Icon
                  icon="line-md:loading-twotone-loop"
                  className="size-16 animate-spin text-zinc-400"
                />
              </div>
            ) : (
              <div className="divide-y px-6 w-full">
                {!isLoading && (data?.result.cartItems.length ?? 0) === 0 ? (
                  <div className="flex items-center justify-center gap-3 flex-col">
                    <Icon
                      icon="material-symbols-light:shopping-basket"
                      className="text-6xl"
                    />
                    <p>Tu carrito esta vacio</p>
                    <button className="bg-zinc-950 text-white w-full rounded-md flex justify-center items-center gap-1 py-2 text-lg">
                      <span>Empezar a comprar</span>
                    </button>
                  </div>
                ) : null}

                {data?.result.cartItems.map((item) => (
                  <CartItemCard key={item.id} item={item} />
                ))}
              </div>
            )}
          </div>

          {(data?.result.cartItems.length ?? 0) > 0 ? (
            <div className="mt-auto border-t bg-white py-4 px-6">
              <div className="flex justify-between items-center mb-3 text-sm">
                <span className="underline">Agregar una nota</span>
                <p>Incluido IGV</p>
              </div>
              <Link
                href="/checkout"
                className="bg-zinc-950 text-white w-full rounded-md flex justify-center items-center gap-1 py-2 text-lg"
              >
                <span>Pagar - S/. {total()}</span>
              </Link>
            </div>
          ) : null}
        </div>
      </SheetContent>
    </Sheet>
  );
}

export function CartItemCard({ item }: { item: CartItem }) {
  // Placeholder sin lógica real
  const isPending = false;

  const [quantity, setQuantity] = React.useState(
    item.quantity ? item.quantity : 1
  );

  const onIncrement = (q: number) => {
    setQuantity(q);
  };

  return (
    <article
      key={item.id}
      className={`grid grid-cols-4 gap-4 py-3 ${
        quantity === 0 ? "animate-pulse" : ""
      }`}
    >
      <div>
        <img src={""} alt="" className="h-full object-cover" />
      </div>
      <div className="col-span-3 gap-2 grid grid-cols-3 md:grid-cols-4">
        <div className="col-span-2 md:col-span-3">
          <h3 className="font-medium md:text-base text-sm line-clamp-2">
            {item.product.name}
          </h3>

          <p className="text-sm font-medium text-zinc-500">{quantity} unidad</p>
          <div className="flex items-center gap-2">
            <QuantityInputBasic
              quantity={quantity}
              disabled={isPending}
              onChange={onIncrement}
            />
            <button
              type="button"
              disabled={isPending}
              className="cursor-pointer"
              onClick={() => onIncrement(0)}
            >
              <Icon icon="gg:trash" className="size-6 text-zinc-700" />
            </button>
          </div>
        </div>
        <div className="flex flex-col items-end gap-1 py-2">
          <p className="font-semibold text-red-600 text-lg">
            {item.product.price}
            S./ {(parseIntSafety(item.product.price) ?? 0) * quantity}
          </p>
          <p className="line-through font-medium decoration-2 text-zinc-600">
            S./ {(parseIntSafety(item.product.compareAtPrice) ?? 0) * quantity}
          </p>
        </div>
      </div>
    </article>
  );
}
