/**
 * Componentes modernos para agregar productos al carrito
 */

"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/hooks/stores/cart.store";
import { Minus, Plus, ShoppingCart } from "lucide-react";

/**
 * Botón simple para agregar al carrito (sin selector de cantidad)
 */
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
 * Componente completo con selector de cantidad para páginas de detalle de producto
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

  const handleQuantityChange = (delta: number) => {
    const newQuantity = quantity + delta;
    if (newQuantity >= 1 && newQuantity <= stock) {
      setQuantity(newQuantity);
    }
  };

  const isOutOfStock = stock === 0;

  if (isOutOfStock) {
    return null;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <span className="text-sm font-semibold">Cantidad:</span>
        <div className="flex items-center border-2 rounded-xl overflow-hidden">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleQuantityChange(-1)}
            disabled={quantity <= 1 || loading}
            className="h-12 w-12 rounded-none hover:bg-primary/10"
          >
            <Minus className="h-5 w-5" />
          </Button>
          <span className="px-8 font-bold text-lg">{quantity}</span>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleQuantityChange(1)}
            disabled={quantity >= stock || loading}
            className="h-12 w-12 rounded-none hover:bg-primary/10"
          >
            <Plus className="h-5 w-5" />
          </Button>
        </div>
      </div>

      <Button
        onClick={handleAddToCart}
        disabled={loading}
        size="lg"
        className="w-full gap-3 h-14 text-lg font-bold rounded-xl shadow-lg hover:shadow-xl transition-all"
      >
        <ShoppingCart className="h-6 w-6" />
        {loading ? "Agregando..." : "Agregar al carrito"}
      </Button>
    </div>
  );
}

/**
 * Componente compacto para tarjetas de producto
 */
interface ProductCardAddToCartProps {
  productId: number;
  stock: number;
  direction?: "horizontal" | "vertical";
  size?: "sm" | "md" | "lg";
}

export function ProductCardAddToCart({
  productId,
  stock,
  direction = "vertical",
  size = "md",
}: ProductCardAddToCartProps) {
  const { addItem, loading } = useCartStore();
  const [quantity, setQuantity] = useState(1);
  const [showQuantity, setShowQuantity] = useState(false);

  const handleAddToCart = async () => {
    const success = await addItem(productId, quantity);
    if (success) {
      setQuantity(1);
      setShowQuantity(false);
    }
  };

  const handleQuantityChange = (delta: number) => {
    const newQuantity = quantity + delta;
    if (newQuantity >= 1 && newQuantity <= stock) {
      setQuantity(newQuantity);
    }
  };

  const isOutOfStock = stock === 0;

  const buttonSizeClass = {
    sm: "h-9 text-sm",
    md: "h-10 text-base",
    lg: "h-12 text-lg",
  }[size];

  const iconSizeClass = {
    sm: "h-3 w-3",
    md: "h-4 w-4",
    lg: "h-5 w-5",
  }[size];

  if (isOutOfStock) {
    return (
      <Button disabled className={`w-full ${buttonSizeClass}`}>
        Agotado
      </Button>
    );
  }

  if (showQuantity) {
    return (
      <div
        className={`space-y-2 w-full ${
          direction === "horizontal" ? "flex items-center gap-2" : ""
        }`}
      >
        <div className="flex items-center border-2 rounded-lg overflow-hidden">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleQuantityChange(-1)}
            disabled={quantity <= 1 || loading}
            className="h-9 w-9 rounded-none hover:bg-primary/10"
          >
            <Minus className="h-4 w-4" />
          </Button>
          <span className="flex-1 text-center font-bold">{quantity}</span>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleQuantityChange(1)}
            disabled={quantity >= stock || loading}
            className="h-9 w-9 rounded-none hover:bg-primary/10"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        <Button
          onClick={handleAddToCart}
          disabled={loading}
          className={`w-full gap-2 ${buttonSizeClass}`}
        >
          <ShoppingCart className={iconSizeClass} />
          {loading ? "Agregando..." : "Confirmar"}
        </Button>
      </div>
    );
  }

  return (
    <Button
      onClick={() => setShowQuantity(true)}
      className={`w-full gap-2 ${buttonSizeClass}`}
    >
      <ShoppingCart className={iconSizeClass} />
      Agregar
    </Button>
  );
}
