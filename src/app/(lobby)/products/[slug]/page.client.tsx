"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { ProductWithRelations } from "@/schemas/product.schema";
import type { SessionUser } from "@/types/auth";
import { ProductReviewForm } from "@/components/product-review-form";
import {
  Minus,
  Plus,
  ShoppingCart,
  ChevronLeft,
  Star,
  Award,
  Package,
} from "lucide-react";

interface ProductDetailClientProps {
  product: ProductWithRelations;
  user: SessionUser | null;
  hasReviewed: boolean;
  reviews: Array<{
    id: number;
    rating: string;
    title: string | null;
    body: string | null;
    createdAt: Date;
    user: {
      id: number;
      name: string;
      photoUrl: string | null;
    } | null;
  }>;
}

export default function ProductDetailClient({
  product,
  user,
  hasReviewed,
  reviews,
}: ProductDetailClientProps) {
  const [quantity, setQuantity] = useState(1);
  const [showFloatingButton, setShowFloatingButton] = useState(false);

  const price = parseFloat(product.price ?? "0");
  const comparePrice = product.compareAtPrice
    ? parseFloat(product.compareAtPrice)
    : null;
  const discount =
    comparePrice && comparePrice > price
      ? Math.round(((comparePrice - price) / comparePrice) * 100)
      : null;

  const images = product.images || [];
  const hasImages = images.length > 0;

  const handleQuantityChange = (delta: number) => {
    const newQuantity = quantity + delta;
    if (newQuantity >= 1 && newQuantity <= (product.stock ?? 0)) {
      setQuantity(newQuantity);
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      setShowFloatingButton(window.scrollY > 600);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <div className="container py-6 md:py-8">
        {/* Breadcrumb */}
        <div className="mb-6">
          <Link
            href="/products"
            className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Volver a productos
          </Link>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Image Gallery - Sticky on desktop */}
          <div className="lg:sticky lg:top-6 lg:self-start space-y-4 h-fit">
            {/* Main Carousel */}
            <div className="relative aspect-square bg-gradient-to-br from-muted to-muted/50 rounded-2xl overflow-hidden shadow-lg">
              {hasImages ? (
                <Carousel className="w-full h-full">
                  <CarouselContent>
                    {images.map((image, index) => (
                      <CarouselItem key={image.id}>
                        <div className="relative aspect-square">
                          <Image
                            src={image.imageUrl}
                            alt={image.altText || product.name}
                            fill
                            className="object-contain p-8"
                            priority={index === 0}
                            sizes="(max-width: 768px) 100vw, 50vw"
                          />
                        </div>
                      </CarouselItem>
                    ))}
                  </CarouselContent>
                  {images.length > 1 && (
                    <>
                      <CarouselPrevious className="left-4" />
                      <CarouselNext className="right-4" />
                    </>
                  )}
                </Carousel>
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground">
                  <Package className="h-20 w-20 mb-4 opacity-20" />
                  <p>Sin imagen disponible</p>
                </div>
              )}

              {discount && (
                <Badge className="absolute top-4 left-4 bg-green-600 text-white text-lg px-3 py-1 shadow-lg">
                  AHORRA {discount}%
                </Badge>
              )}
            </div>

            {/* Thumbnail Gallery */}
            {images.length > 1 && (
              <div className="grid grid-cols-6 gap-2">
                {images.map((image) => (
                  <button
                    key={image.id}
                    className="relative aspect-square rounded-lg overflow-hidden border-2 border-border hover:border-primary transition-colors bg-muted"
                  >
                    <Image
                      src={image.imageUrl}
                      alt={image.altText || product.name}
                      fill
                      className="object-cover"
                      sizes="100px"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="flex flex-col space-y-6">
            {/* Header Section */}
            <div>
              {/* Badge Guarantee */}
              <div className="bg-yellow-400 text-yellow-900 px-4 py-2 rounded-full inline-flex items-center gap-2 text-sm font-semibold mb-4">
                <Award className="h-4 w-4" />
                30-DÍAS GARANTÍA DE DEVOLUCIÓN
              </div>

              {/* Rating & Social Proof */}
              <div className="flex items-center gap-2 mb-2">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className="h-4 w-4 fill-yellow-400 text-yellow-400"
                    />
                  ))}
                </div>
                <span className="text-sm font-semibold">4.9/5</span>
                <span className="text-sm text-muted-foreground">
                  | 312,300+ Clientes Verificados
                </span>
              </div>

              {/* Sales Badge */}
              <Badge
                variant="outline"
                className="mb-4 bg-amber-50 text-amber-700 border-amber-200"
              >
                🔥 553 COMPRADOS ESTE MES
              </Badge>

              {/* Title */}
              <h1 className="text-3xl md:text-5xl font-black uppercase mb-4 leading-tight">
                {product.name}
              </h1>

              {/* Short Description */}
              {product.shortDesc && (
                <p className="text-base md:text-lg text-muted-foreground leading-relaxed">
                  {product.shortDesc}
                </p>
              )}
            </div>

            {/* Price Section */}
            <div className="flex items-baseline gap-3">
              <span className="text-4xl md:text-5xl font-bold text-primary">
                ${price.toFixed(2)}
              </span>
              {comparePrice && comparePrice > price && (
                <>
                  <span className="text-2xl text-muted-foreground line-through">
                    ${comparePrice.toFixed(2)}
                  </span>
                  <Badge className="bg-green-600 text-white text-base px-3 py-1">
                    AHORRA {discount}%
                  </Badge>
                </>
              )}
            </div>

            {/* Category Badge */}
            {product.category && (
              <Link href={`/products?categoryId=${product.category.id}`}>
                <Badge
                  variant="secondary"
                  className="text-xs uppercase tracking-wide"
                >
                  {product.category.name}
                </Badge>
              </Link>
            )}

            {/* Feature Badges */}
            <div className="grid grid-cols-2 gap-3">
              <Card className="p-4 bg-primary/5 border-primary/20">
                <div className="flex items-start gap-3">
                  <div className="bg-primary/10 p-2 rounded-lg">
                    <Package className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm">Envío Rápido</p>
                    <p className="text-xs text-muted-foreground">
                      Entrega en 2-3 días
                    </p>
                  </div>
                </div>
              </Card>
              <Card className="p-4 bg-green-50 border-green-200">
                <div className="flex items-start gap-3">
                  <div className="bg-green-100 p-2 rounded-lg">
                    <Award className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm">Garantizado</p>
                    <p className="text-xs text-muted-foreground">
                      30 días devolución
                    </p>
                  </div>
                </div>
              </Card>
            </div>

            {/* Stock Status */}
            <div>
              {product.stock !== null && product.stock > 0 ? (
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-green-500 animate-pulse" />
                  <span className="text-sm font-medium text-green-700">
                    En stock - {product.stock} disponibles
                  </span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-red-500" />
                  <span className="text-sm font-medium text-red-700">
                    Agotado
                  </span>
                </div>
              )}
            </div>

            {/* Quantity Selector & Add to Cart */}
            {product.stock !== null && product.stock > 0 && (
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <span className="text-sm font-semibold">Cantidad:</span>
                  <div className="flex items-center border-2 rounded-xl overflow-hidden">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleQuantityChange(-1)}
                      disabled={quantity <= 1}
                      className="h-12 w-12 rounded-none hover:bg-primary/10"
                    >
                      <Minus className="h-5 w-5" />
                    </Button>
                    <span className="px-8 font-bold text-lg">{quantity}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleQuantityChange(1)}
                      disabled={quantity >= (product.stock ?? 0)}
                      className="h-12 w-12 rounded-none hover:bg-primary/10"
                    >
                      <Plus className="h-5 w-5" />
                    </Button>
                  </div>
                </div>

                <Button
                  size="lg"
                  className="w-full gap-3 h-14 text-lg font-bold rounded-xl shadow-lg hover:shadow-xl transition-all"
                >
                  <ShoppingCart className="h-6 w-6" />
                  Agregar al carrito
                </Button>
              </div>
            )}

            {/* SKU */}
            <p className="text-xs text-muted-foreground">SKU: {product.sku}</p>

            {/* Full Description */}
            {product.description && (
              <div className="space-y-3 pt-6 border-t">
                <h2 className="text-2xl font-bold">Descripción del Producto</h2>
                <div
                  className="prose prose-sm max-w-none text-muted-foreground leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: product.description }}
                />
              </div>
            )}

            {/* Product Specifications */}
            {(product.weightGrams ||
              product.length ||
              product.width ||
              product.height) && (
              <div className="space-y-3 pt-6 border-t">
                <h2 className="text-2xl font-bold">Especificaciones</h2>
                <Card className="p-6 bg-muted/50">
                  <dl className="grid grid-cols-2 gap-4 text-sm">
                    {product.weightGrams && (
                      <>
                        <dt className="text-muted-foreground font-medium">
                          Peso:
                        </dt>
                        <dd className="font-semibold">
                          {product.weightGrams}g
                        </dd>
                      </>
                    )}
                    {product.length && (
                      <>
                        <dt className="text-muted-foreground font-medium">
                          Largo:
                        </dt>
                        <dd className="font-semibold">{product.length}cm</dd>
                      </>
                    )}
                    {product.width && (
                      <>
                        <dt className="text-muted-foreground font-medium">
                          Ancho:
                        </dt>
                        <dd className="font-semibold">{product.width}cm</dd>
                      </>
                    )}
                    {product.height && (
                      <>
                        <dt className="text-muted-foreground font-medium">
                          Alto:
                        </dt>
                        <dd className="font-semibold">{product.height}cm</dd>
                      </>
                    )}
                  </dl>
                </Card>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Floating Add to Cart Button */}
      {showFloatingButton && product.stock !== null && product.stock > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-background border-t shadow-2xl z-50 animate-in slide-in-from-bottom-5">
          <div className="container py-4">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                {hasImages && (
                  <div className="relative h-16 w-16 rounded-lg overflow-hidden border bg-muted shrink-0">
                    <Image
                      src={images[0].imageUrl}
                      alt={product.name}
                      fill
                      className="object-cover"
                      sizes="64px"
                    />
                  </div>
                )}
                <div className="min-w-0">
                  <h3 className="font-bold text-sm truncate">{product.name}</h3>
                  <p className="text-lg font-bold text-primary">
                    ${price.toFixed(2)}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <div className="flex items-center border-2 rounded-lg overflow-hidden">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleQuantityChange(-1)}
                    disabled={quantity <= 1}
                    className="h-10 w-10 rounded-none"
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="px-4 font-bold">{quantity}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleQuantityChange(1)}
                    disabled={quantity >= (product.stock ?? 0)}
                    className="h-10 w-10 rounded-none"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>

                <Button size="lg" className="gap-2 shadow-lg">
                  <ShoppingCart className="h-5 w-5" />
                  <span className="hidden sm:inline">Agregar</span>
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Review Form Section */}
      {user && !hasReviewed && (
        <div className="container mx-auto px-4 py-8">
          <ProductReviewForm productId={product.id} />
        </div>
      )}

      {/* Reviews List Section */}
      {reviews.length > 0 && (
        <div className="container mx-auto px-4 py-8">
          <Card>
            <CardHeader>
              <CardTitle>Reseñas ({reviews.length})</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {reviews.map((review) => (
                <div
                  key={review.id}
                  className="border-b last:border-b-0 pb-6 last:pb-0"
                >
                  <div className="flex items-start gap-4">
                    <Avatar>
                      <AvatarImage src={review.user?.photoUrl || undefined} />
                      <AvatarFallback>
                        {review.user?.name.charAt(0).toUpperCase() || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-semibold">
                          {review.user?.name || "Usuario"}
                        </span>
                        <div className="flex items-center">
                          {Array.from({ length: 5 }).map((_, index) => (
                            <Star
                              key={index}
                              className={`h-4 w-4 ${
                                index < parseFloat(review.rating)
                                  ? "fill-yellow-400 text-yellow-400"
                                  : "text-gray-300"
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {new Date(review.createdAt).toLocaleDateString(
                            "es-ES",
                            {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            }
                          )}
                        </span>
                      </div>
                      {review.title && (
                        <h4 className="font-semibold mb-2">{review.title}</h4>
                      )}
                      {review.body && (
                        <p className="text-muted-foreground">{review.body}</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
}
