import { Star } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

interface ProductCardProps {
  id: number;
  slug: string;
  image: string;
  name: string;
  price: string;
  rating?: number;
  reviews?: number;
  description?: string;
}

export function ProductCard({
  slug,
  image,
  name,
  price,
  rating = 5,
  reviews = 0,
  description,
}: ProductCardProps) {
  return (
    <Link href={`/products/${slug}`}>
      <article className="group cursor-pointer rounded-lg border border-gray-200 bg-white transition-shadow hover:shadow-lg">
        {/* Product Image */}
        <div className="relative aspect-square overflow-hidden rounded-t-lg bg-gray-100">
          <Image
            src={image}
            alt={name}
            fill
            className="object-cover transition-transform group-hover:scale-105"
            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
          />
        </div>

        {/* Product Info */}
        <div className="p-4">
          {/* Rating */}
          <div className="mb-2 flex items-center gap-1">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`h-3 w-3 ${
                  i < rating
                    ? "fill-[#D95D24] text-[#D95D24]"
                    : "fill-gray-200 text-gray-200"
                }`}
              />
            ))}
            {reviews > 0 && (
              <span className="ml-1 text-xs text-gray-500">({reviews})</span>
            )}
          </div>

          {/* Product Name */}
          <h3 className="mb-2 line-clamp-2 text-sm font-semibold text-gray-900">
            {name}
          </h3>

          {/* Description */}
          {description && (
            <p className="mb-3 line-clamp-2 text-xs text-gray-600">
              {description}
            </p>
          )}

          {/* Price */}
          <div className="flex items-center justify-between">
            <span className="text-lg font-bold text-[#D95D24]">{price}</span>
            <button className="rounded-md bg-[#2E332A] px-3 py-1.5 text-xs font-semibold uppercase text-white transition hover:bg-[#1a1d16]">
              Ver más
            </button>
          </div>
        </div>
      </article>
    </Link>
  );
}
