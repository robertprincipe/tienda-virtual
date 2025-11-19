"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useCartStore } from "@/hooks/stores/cart.store";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Icon } from "@iconify/react/dist/iconify.js";
import { ShoppingCart, Loader2, Trash2, Plus, Minus } from "lucide-react";

export default function CartPageClient() {
  const router = useRouter();
  const { items, amount, total, loading, syncCart } = useCartStore();
  const [isInitializing, setIsInitializing] = useState(true);

  // Sincronizar carrito al montar el componente
  useEffect(() => {
    const initializeCart = async () => {
      await syncCart();
      setIsInitializing(false);
    };

    initializeCart();
  }, [syncCart]);

  const totalAmount = amount();
  const totalItems = total();

  // Mostrar loader mientras se inicializa
  if (isInitializing) {
    return (
      <div className="container max-w-7xl py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  // Si el carrito está vacío
  if (items.length === 0) {
    return (
      <div className="container max-w-7xl py-8">
        <h1 className="text-3xl font-bold mb-6">Carrito de Compras</h1>
        <Alert>
          <ShoppingCart className="h-4 w-4" />
          <AlertDescription className="flex flex-col gap-4">
            <span>
              Tu carrito está vacío. Explora nuestros productos y agrega los que
              más te gusten.
            </span>
            <Link href="/products">
              <Button>
                <ShoppingCart className="mr-2 h-4 w-4" />
                Ir a la tienda
              </Button>
            </Link>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container max-w-7xl py-8">
      <h1 className="text-3xl font-bold mb-6">Carrito de Compras</h1>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Lista de productos */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardContent className="p-6">
              <div className="space-y-4">
                {items.map((item, index) => (
                  <div key={item.id}>
                    {index > 0 && <Separator className="my-4" />}
                    <CartItem item={item} />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Link href="/products">
            <Button variant="outline" className="w-full">
              <ShoppingCart className="mr-2 h-4 w-4" />
              Continuar comprando
            </Button>
          </Link>
        </div>

        {/* Resumen del pedido */}
        <div className="lg:col-span-1">
          <Card className="sticky top-4">
            <CardContent className="p-6 space-y-4">
              <h2 className="text-xl font-semibold">Resumen del pedido</h2>

              <Separator />

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">
                    Productos ({totalItems})
                  </span>
                  <span>S/. {totalAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">IGV incluido</span>
                  <span className="text-xs text-muted-foreground">
                    S/. {(totalAmount * 0.18).toFixed(2)}
                  </span>
                </div>
              </div>

              <Separator />

              <div className="flex justify-between text-lg font-semibold">
                <span>Total</span>
                <span>S/. {totalAmount.toFixed(2)}</span>
              </div>

              <Button
                className="w-full"
                size="lg"
                onClick={() => router.push("/checkout")}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Procesando...
                  </>
                ) : (
                  <>
                    <ShoppingCart className="mr-2 h-4 w-4" />
                    Proceder al pago
                  </>
                )}
              </Button>

              <p className="text-xs text-center text-muted-foreground">
                Envío calculado en el siguiente paso
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

interface CartItemProps {
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

function CartItem({ item }: CartItemProps) {
  const { updateQuantity, removeItem, loading } = useCartStore();
  const [localQuantity, setLocalQuantity] = useState(item.quantity);
  const [isUpdating, setIsUpdating] = useState(false);

  // Sincronizar cantidad local con la del store
  useEffect(() => {
    setLocalQuantity(item.quantity);
  }, [item.quantity]);

  const handleQuantityChange = async (newQuantity: number) => {
    if (newQuantity < 1 || newQuantity > item.product.stock) return;

    setIsUpdating(true);
    setLocalQuantity(newQuantity);

    try {
      await updateQuantity(item.productId, newQuantity);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleRemove = async () => {
    setIsUpdating(true);
    try {
      await removeItem(item.productId);
    } finally {
      setIsUpdating(false);
    }
  };

  const price = parseFloat(item.product.price || "0");
  const comparePrice = item.product.compareAtPrice
    ? parseFloat(item.product.compareAtPrice)
    : null;
  const itemTotal = price * localQuantity;
  const discount = comparePrice ? (comparePrice - price) * localQuantity : 0;

  return (
    <div
      className={`flex gap-4 ${
        isUpdating || loading ? "opacity-50 pointer-events-none" : ""
      }`}
    >
      {/* Imagen del producto */}
      <Link
        href={`/products/${item.product.slug}`}
        className="flex-shrink-0 w-24 h-24 sm:w-32 sm:h-32 bg-muted rounded-md overflow-hidden"
      >
        {item.product.primaryImage ? (
          <img
            src={item.product.primaryImage}
            alt={item.product.name}
            className="w-full h-full object-cover object-center hover:scale-105 transition-transform"
          />
        ) : (
          <div className="h-full w-full flex items-center justify-center text-muted-foreground">
            <ShoppingCart className="w-8 h-8" />
          </div>
        )}
      </Link>

      {/* Detalles del producto */}
      <div className="flex-1 flex flex-col sm:flex-row justify-between gap-4">
        <div className="flex-1">
          <Link href={`/products/${item.product.slug}`}>
            <h3 className="font-medium text-base sm:text-lg hover:text-primary transition-colors line-clamp-2">
              {item.product.name}
            </h3>
          </Link>

          <div className="mt-2 space-y-1">
            <p className="text-sm text-muted-foreground">
              Precio: S/. {price.toFixed(2)}
            </p>
            {comparePrice && comparePrice > price && (
              <p className="text-sm text-green-600">
                Ahorras: S/. {discount.toFixed(2)}
              </p>
            )}
            {item.product.stock < 5 && item.product.stock > 0 && (
              <p className="text-sm text-orange-600">
                Solo quedan {item.product.stock} unidades
              </p>
            )}
          </div>

          {/* Controles de cantidad */}
          <div className="mt-4 flex items-center gap-3">
            <div className="flex items-center border rounded-md">
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => handleQuantityChange(localQuantity - 1)}
                disabled={localQuantity <= 1 || isUpdating || loading}
              >
                <Minus className="h-4 w-4" />
              </Button>
              <span className="w-12 text-center text-sm font-medium">
                {localQuantity}
              </span>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => handleQuantityChange(localQuantity + 1)}
                disabled={
                  localQuantity >= item.product.stock || isUpdating || loading
                }
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={handleRemove}
              disabled={isUpdating || loading}
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <Trash2 className="h-4 w-4 mr-1" />
              Eliminar
            </Button>
          </div>
        </div>

        {/* Precio total */}
        <div className="flex flex-col items-end justify-between">
          <div className="text-right">
            <p className="text-lg font-semibold">S/. {itemTotal.toFixed(2)}</p>
            {comparePrice && comparePrice > price && (
              <p className="text-sm text-muted-foreground line-through">
                S/. {(comparePrice * localQuantity).toFixed(2)}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
