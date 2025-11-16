"use client";

import Link from "next/link";
import { Badge } from "../ui/badge";

interface CategoryCardProps {
  title: string;
  slug: string;
  image: string;
  childrenCount?: number;
}

export function CategoryCard({
  title,
  slug,
  image,
  childrenCount,
}: CategoryCardProps) {
  return (
    <Link href={`/categories/${slug}`}>
      <div className="group relative h-64 cursor-pointer overflow-hidden rounded-lg">
        {/* Background Image */}
        <img
          src={image}
          alt={title}
          className="object-cover transition-transform duration-300 group-hover:scale-110"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />

        {/* Overlay */}
        <div className="absolute inset-0 bg-linear-to-t from-black/70 to-transparent" />

        {/* Category Title */}
        <div className="absolute bottom-0 left-0 right-0 p-6">
          <h3 className="font-heading text-xl font-bold uppercase text-white">
            {title}
          </h3>
          {childrenCount && childrenCount > 0 ? (
            <Badge variant="secondary">
              {childrenCount} subcategoría{childrenCount > 1 ? "s" : ""}
            </Badge>
          ) : null}
          <p className="mt-2 text-sm text-white/90 transition group-hover:text-[#D95D24]">
            Explorar →
          </p>
        </div>
      </div>
    </Link>
  );
}
