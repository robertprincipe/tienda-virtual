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

export function Cart() {
  const { open, setOpen, items, loading, amount, total } = useCartStore();

  const isLoading = loading;

  const containerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [items.length]);

  const totalAmount = amount();
  const totalItems = total();

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetContent
        className="sm:max-w-lg p-0 inset-y-2 right-2 rounded-xl w-[calc(100%-16px)] h-[calc(100%-16px)] overflow-hidden border shadow-2xs"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <div className="flex flex-col h-full">
          <SheetHeader className="border-b p-6">
            <SheetTitle>
              Carrito de compras
              {totalItems > 0 && (
                <span className="ml-2 text-sm text-muted-foreground">
                  ({totalItems} {totalItems === 1 ? "producto" : "productos"})
                </span>
              )}
            </SheetTitle>
          </SheetHeader>

          <div
            className={`grow overflow-y-auto ${
              items.length === 0
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
                {!isLoading && items.length === 0 ? (
                  <div className="flex items-center justify-center gap-3 flex-col">
                    <Icon
                      icon="material-symbols-light:shopping-basket"
                      className="text-6xl"
                    />
                    <p>Tu carrito está vacío</p>
                    <Link
                      href="/products"
                      onClick={() => setOpen(false)}
                      className="bg-zinc-950 text-white w-full rounded-md flex justify-center items-center gap-1 py-2 text-lg hover:bg-zinc-800 transition-colors"
                    >
                      <span>Empezar a comprar</span>
                    </Link>
                  </div>
                ) : null}

                {items.map((item) => (
                  <CartItemCard key={item.id} item={item} />
                ))}
              </div>
            )}
          </div>

          {items.length > 0 ? (
            <div className="mt-auto border-t bg-white py-4 px-6 space-y-3">
              <div className="flex justify-between items-center text-sm">
                <span className="font-medium">Subtotal:</span>
                <p className="text-lg font-semibold">
                  S/. {totalAmount.toFixed(2)}
                </p>
              </div>
              <p className="text-xs text-muted-foreground">IGV incluido</p>
              <Link
                href="/cart"
                onClick={() => setOpen(false)}
                className="bg-white text-zinc-950 border border-zinc-300 w-full rounded-md flex justify-center items-center gap-2 py-2 text-base hover:bg-zinc-50 transition-colors"
              >
                <Icon icon="solar:cart-large-2-linear" className="text-xl" />
                <span>Ir al carrito</span>
              </Link>
              <Link
                href="/checkout"
                onClick={() => setOpen(false)}
                className="bg-primary text-white w-full rounded-md flex justify-center items-center gap-1 py-2 text-lg hover:bg-primary/90 transition-colors"
              >
                <span>Ir a pagar</span>
              </Link>
            </div>
          ) : null}
        </div>
      </SheetContent>
    </Sheet>
  );
}

interface CartItemCardProps {
  item: {
    id: number;
    productId: number;
    quantity: number;
    product: {
      id: number;
      name: string;
      price: string;
      compareAtPrice: string | null;
      primaryImage: string | null;
      slug: string;
      stock: number;
    };
  };
}

export function CartItemCard({ item }: CartItemCardProps) {
  const { updateQuantity, removeItem, loading } = useCartStore();
  const [localQuantity, setLocalQuantity] = React.useState(item.quantity);

  // Sincronizar cantidad local con la del store
  React.useEffect(() => {
    setLocalQuantity(item.quantity);
  }, [item.quantity]);

  const handleQuantityChange = async (newQuantity: number) => {
    setLocalQuantity(newQuantity);

    if (newQuantity === 0) {
      await removeItem(item.productId);
    } else {
      await updateQuantity(item.productId, newQuantity);
    }
  };

  const handleRemove = async () => {
    await removeItem(item.productId);
  };

  const price = parseFloat(item.product.price || "0");
  const comparePrice = item.product.compareAtPrice
    ? parseFloat(item.product.compareAtPrice)
    : null;
  const itemTotal = price * localQuantity;

  return (
    <article
      className={`grid grid-cols-4 gap-4 py-3 ${
        loading ? "opacity-50 pointer-events-none" : ""
      }`}
    >
      <Link
        href={`/products/${item.product.slug}`}
        className="aspect-square bg-muted rounded-md overflow-hidden"
      >
        {item.product.primaryImage ? (
          <img
            src={item.product.primaryImage}
            alt={item.product.name}
            className="w-full h-full object-cover object-center"
          />
        ) : (
          <div className="h-full w-full flex items-center justify-center text-muted-foreground text-xs">
            Sin imagen
          </div>
        )}
      </Link>
      <div className="col-span-3 gap-2 grid grid-cols-3 md:grid-cols-4">
        <div className="col-span-2 md:col-span-3">
          <Link href={`/products/${item.product.slug}`}>
            <h3 className="font-medium md:text-base text-sm line-clamp-2 hover:text-primary transition-colors">
              {item.product.name}
            </h3>
          </Link>

          <p className="text-sm font-medium text-zinc-500 mt-1">
            {localQuantity} {localQuantity === 1 ? "unidad" : "unidades"}
          </p>
          {item.product.stock < 5 && item.product.stock > 0 && (
            <p className="text-xs text-orange-600 mt-1">
              Solo quedan {item.product.stock} unidades
            </p>
          )}
          <div className="flex items-center gap-2 mt-2">
            <QuantityInputBasic
              quantity={localQuantity}
              disabled={loading}
              onChange={handleQuantityChange}
            />
            <button
              type="button"
              disabled={loading}
              className="cursor-pointer hover:text-red-600 transition-colors"
              onClick={handleRemove}
            >
              <Icon icon="gg:trash" className="size-6" />
            </button>
          </div>
        </div>
        <div className="flex flex-col items-end gap-1 py-2">
          <p className="font-semibold text-lg">S/. {itemTotal.toFixed(2)}</p>
          {comparePrice && comparePrice > price && (
            <p className="line-through font-medium decoration-2 text-zinc-600 text-sm">
              S/. {(comparePrice * localQuantity).toFixed(2)}
            </p>
          )}
          <p className="text-xs text-muted-foreground">
            S/. {price.toFixed(2)} c/u
          </p>
        </div>
      </div>
    </article>
  );
}
