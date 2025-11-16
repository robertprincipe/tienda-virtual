"use client";

import { ProductCard } from "@/components/cards/product-card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

interface Product {
  id: number;
  slug: string;
  name: string;
  price: string;
  primaryImage?: string | null;
  shortDesc?: string | null;
  description?: string | null;
}

interface ProductCarouselProps {
  products: Product[];
}

export function ProductCarousel({ products }: ProductCarouselProps) {
  return (
    <Carousel
      opts={{
        align: "start",
        loop: true,
      }}
      className="w-full"
    >
      <CarouselContent className="-ml-2 md:-ml-4">
        {products.map((product) => (
          <CarouselItem
            key={product.id}
            className="pl-2 md:pl-4 basis-full sm:basis-1/2 lg:basis-1/3 xl:basis-1/4"
          >
            <ProductCard
              id={product.id}
              slug={product.slug}
              image={
                product.primaryImage ||
                "https://images.unsplash.com/photo-1579722820308-d74e571900a9?q=80&w=800"
              }
              name={product.name}
              price={product.price}
              rating={5}
              reviews={0}
              description={
                product.shortDesc || product.description || undefined
              }
            />
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious className="hidden md:flex" />
      <CarouselNext className="hidden md:flex" />
    </Carousel>
  );
}
