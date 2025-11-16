/**
 * Ejemplo de uso del carrito en un componente de producto
 */

"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCartStore } from "@/hooks/stores/cart.store";
import { Minus, Plus, ShoppingCart } from "lucide-react";

interface AddToCartButtonProps {
  productId: number;
  quantity?: number;
  disabled?: boolean;
}

export function AddToCartButton({
  productId,
  quantity = 1,
  disabled = false,
}: AddToCartButtonProps) {
  const { addItem, loading } = useCartStore();

  const handleAddToCart = async () => {
    await addItem(productId, quantity);
  };

  return (
    <Button
      onClick={handleAddToCart}
      disabled={disabled || loading}
      className="gap-2"
    >
      <ShoppingCart className="h-4 w-4" />
      {loading ? "Agregando..." : "Agregar al carrito"}
    </Button>
  );
}

/**
 * Ejemplo de uso en página de producto con selector de cantidad
 */

interface ProductAddToCartProps {
  productId: number;
  stock: number;
}

export function ProductAddToCart({ productId, stock }: ProductAddToCartProps) {
  const { addItem, loading } = useCartStore();
  const [quantity, setQuantity] = useState(1);

  const handleAddToCart = async () => {
    const success = await addItem(productId, quantity);
    if (success) {
      setQuantity(1); // Reset quantity after successful add
    }
  };

  const incrementQuantity = () => {
    if (quantity < stock) {
      setQuantity(quantity + 1);
    }
  };

  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  const isOutOfStock = stock === 0;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <div className="flex items-center border rounded-md">
          <Button
            variant="ghost"
            size="icon"
            onClick={decrementQuantity}
            disabled={quantity <= 1 || loading}
          >
            <Minus className="h-4 w-4" />
          </Button>
          <Input
            type="number"
            value={quantity}
            onChange={(e) => {
              const val = parseInt(e.target.value);
              if (val > 0 && val <= stock) {
                setQuantity(val);
              }
            }}
            className="w-16 text-center border-0 focus-visible:ring-0"
            min={1}
            max={stock}
            disabled={loading}
          />
          <Button
            variant="ghost"
            size="icon"
            onClick={incrementQuantity}
            disabled={quantity >= stock || loading}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        {stock > 0 && stock < 10 && (
          <p className="text-sm text-orange-600">
            Solo quedan {stock} unidades
          </p>
        )}
      </div>

      <Button
        onClick={handleAddToCart}
        disabled={isOutOfStock || loading}
        className="w-full gap-2"
        size="lg"
      >
        <ShoppingCart className="h-5 w-5" />
        {loading
          ? "Agregando..."
          : isOutOfStock
          ? "Agotado"
          : "Agregar al carrito"}
      </Button>
    </div>
  );
}
