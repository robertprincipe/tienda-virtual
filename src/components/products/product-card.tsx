"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { ProductListItem } from "@/schemas/product.schema";
import { ShoppingCart } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { ProductAddToCart } from "../cart/add-to-cart-button";

interface ProductCardProps {
  product: ProductListItem;
  view?: "grid" | "list";
}

export function ProductCard({ product, view = "grid" }: ProductCardProps) {
  const price = parseFloat(product.price ?? "0");
  const comparePrice = product.compareAtPrice
    ? parseFloat(product.compareAtPrice)
    : null;
  const discount =
    comparePrice && comparePrice > price
      ? Math.round(((comparePrice - price) / comparePrice) * 100)
      : null;

  if (view === "list") {
    return (
      <Card className="overflow-hidden hover:shadow-lg transition-shadow">
        <div className="flex flex-col sm:flex-row">
          <Link
            href={`/products/${product.slug}`}
            className="relative w-full sm:w-48 h-48 shrink-0 bg-muted"
          >
            {product.primaryImage ? (
              <Image
                src={product.primaryImage}
                alt={product.name}
                fill
                className="object-cover"
                sizes="(max-width: 640px) 100vw, 192px"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                Sin imagen
              </div>
            )}
            {discount && (
              <Badge className="absolute top-2 left-2 bg-red-500">
                -{discount}%
              </Badge>
            )}
          </Link>

          <div className="flex-1 flex flex-col p-4">
            <div className="flex-1">
              <Link href={`/products/${product.slug}`}>
                <CardTitle className="text-lg hover:text-primary transition-colors line-clamp-2">
                  {product.name}
                </CardTitle>
              </Link>
              {product.category && (
                <p className="text-sm text-muted-foreground mt-1">
                  {product.category.name}
                </p>
              )}
              {product.shortDesc && (
                <CardDescription className="mt-2 line-clamp-2">
                  {product.shortDesc}
                </CardDescription>
              )}
            </div>

            <div className="flex items-center justify-between mt-4">
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold text-primary">
                    ${price.toFixed(2)}
                  </span>
                  {comparePrice && comparePrice > price && (
                    <span className="text-sm text-muted-foreground line-through">
                      ${comparePrice.toFixed(2)}
                    </span>
                  )}
                </div>
              </div>

              <Button
                size="lg"
                disabled={product.stock === 0}
                className="gap-2"
              >
                <ShoppingCart className="h-4 w-4" />
                Agregar
              </Button>
            </div>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow group">
      <Link
        href={`/products/${product.slug}`}
        className="relative aspect-square bg-muted block"
      >
        {product.primaryImage ? (
          <Image
            src={product.primaryImage}
            alt={product.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground">
            Sin imagen
          </div>
        )}
        {discount && (
          <Badge className="absolute top-2 left-2 bg-red-500">
            -{discount}%
          </Badge>
        )}
      </Link>

      <CardHeader className="p-4">
        {product.category && (
          <p className="text-xs text-muted-foreground uppercase tracking-wide">
            {product.category.name}
          </p>
        )}
        <Link href={`/products/${product.slug}`}>
          <CardTitle className="text-base hover:text-primary transition-colors line-clamp-2">
            {product.name}
          </CardTitle>
        </Link>
      </CardHeader>

      <CardContent className="p-4 pt-0">
        <div className="flex items-baseline gap-2">
          <span className="text-xl font-bold text-primary">
            ${price.toFixed(2)}
          </span>
          {comparePrice && comparePrice > price && (
            <span className="text-sm text-muted-foreground line-through">
              ${comparePrice.toFixed(2)}
            </span>
          )}
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0">
        <ProductAddToCart productId={product.id} stock={1} />
      </CardFooter>
    </Card>
  );
}
