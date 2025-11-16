import { Star } from "lucide-react";

type TestimonialCardProps = {
  quote: string;
  author: string;
  rating?: number;
};

export function TestimonialCard({
  quote,
  author,
  rating = 5,
}: TestimonialCardProps) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm transition hover:shadow-md">
      {/* Rating */}
      <div className="mb-4 flex">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`h-4 w-4 ${
              i < rating
                ? "fill-[#D95D24] text-[#D95D24]"
                : "fill-gray-200 text-gray-200"
            }`}
          />
        ))}
      </div>

      {/* Quote */}
      <p className="mb-4 text-gray-700">&quot;{quote}&quot;</p>

      {/* Author */}
      <div className="flex items-center gap-2">
        <p className="font-semibold text-gray-900">— {author}</p>
        <span className="text-xs text-[#D95D24]">✓ Cliente Verificado</span>
      </div>
    </div>
  );
}
