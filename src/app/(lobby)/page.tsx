import { CategoryCard } from "@/components/cards/category-card";
import { Metadata } from "next";

import { TestimonialCard } from "@/components/cards/testimonial-card";
import { ProductCard } from "@/components/products/product-card";
import { ProductCarousel } from "@/components/products/product-carousel";
import { getFeaturedCategories } from "@/services/categories/actions/category.actions";
import { getFeaturedProducts } from "@/services/products/actions/product.actions";
import { getRandomApprovedReviews } from "@/services/reviews/actions/review.actions";
import { Star } from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Inicio",
  description:
    "Descubre nuestra selección de productos destacados. Compra en línea con envío a todo el país. Calidad garantizada y los mejores precios.",
};

export default async function Index() {
  // Fetch data in parallel
  const [featuredProducts, featuredCategories, reviews] = await Promise.all([
    getFeaturedProducts(8),
    getFeaturedCategories(6),
    getRandomApprovedReviews(4),
  ]);

  // Transform products for display
  const productsForCarousel = featuredProducts;

  return (
    <div className="min-h-screen bg-[#FDFCF9] font-body text-[#1a1a1a]">
      {/* Hero Section */}
      <section className="relative flex min-h-[50vh] items-center overflow-hidden bg-[#2E332A] py-12 lg:min-h-[60vh]">
        {/* Background Image Overlay */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-40"
          style={{
            backgroundImage:
              "url('https://ik.imagekit.io/huvmeuk1y/Generated%20Image%20November%2019,%202025%20-%209_18AM%20(1)_i4oBdc0-R.webp')",
          }}
        />

        <div className="relative z-10 mx-auto grid max-w-7xl grid-cols-1 gap-8 px-6 lg:grid-cols-2 lg:items-center lg:px-8">
          <div className="text-left">
            {/* Trust Signal */}
            <div className="mb-6 flex items-center gap-2 text-sm font-medium text-white/90">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className="h-4 w-4 fill-[#D95D24] text-[#D95D24]"
                  />
                ))}
              </div>
              <span>Más de 40+ clientes satisfechos</span>
            </div>

            {/* Main Title */}
            <h1 className="mb-6 font-heading text-4xl font-bold leading-tight uppercase text-white md:text-5xl lg:text-6xl">
              Productos
              <br />
              <span className="bg-primary/70 px-1.5 rounded-lg">
                Orgánicos
              </span>{" "}
              de
              <br />
              Alta Calidad
            </h1>

            {/* Description */}
            <p className="mb-8 max-w-lg text-lg text-white/90 md:text-xl">
              Miel, quinua, café, leche, queso y más productos naturales que
              apoyan tu bienestar y el de tu familia.
            </p>

            {/* CTA Button */}
            <Link
              href="/products"
              className="inline-block rounded-md bg-[#D95D24] px-8 py-4 font-semibold uppercase tracking-wide text-white transition hover:bg-[#c04d1a]"
            >
              Ver Productos
            </Link>
          </div>

          {/* Right side placeholder */}
          <div className="hidden lg:block"></div>
        </div>
      </section>

      {/* Trust Banner */}
      <section className="border-b border-gray-200 bg-white py-8">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-6 px-6 md:grid-cols-2 lg:grid-cols-4 lg:px-8">
          <div className="flex flex-col items-center text-center">
            <div className="mb-2 text-3xl">🚚</div>
            <p className="text-sm font-medium text-gray-900">Envío Gratis</p>
            <p className="text-xs text-gray-600">En compras mayores a S/. 99</p>
          </div>
          <div className="flex flex-col items-center text-center">
            <div className="mb-2 text-3xl">✓</div>
            <p className="text-sm font-medium text-gray-900">
              Garantía de Calidad
            </p>
            <p className="text-xs text-gray-600">100% Productos Orgánicos</p>
          </div>
          <div className="flex flex-col items-center text-center">
            <div className="mb-2 text-3xl">🌿</div>
            <p className="text-sm font-medium text-gray-900">Certificados</p>
            <p className="text-xs text-gray-600">Productos verificados</p>
          </div>
          <div className="flex flex-col items-center text-center">
            <div className="mb-2 text-3xl">👨‍👩‍👧‍👦</div>
            <p className="text-sm font-medium text-gray-900">
              Para Toda la Familia
            </p>
            <p className="text-xs text-gray-600">Nutrición natural</p>
          </div>
        </div>
      </section>
      {/* Featured Products Section */}
      <section className="bg-white py-16">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mb-12 flex items-center justify-between">
            <h2 className="font-heading text-4xl font-bold uppercase md:text-5xl">
              Productos Destacados
            </h2>
            <Link href="/products" className="text-[#D95D24] hover:underline">
              Ver todos →
            </Link>
          </div>

          {featuredProducts.length > 0 ? (
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
              {featuredProducts.slice(0, 4).map((product) => (
                <ProductCard key={product.id} product={product} view="grid" />
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-600">
              No hay productos destacados disponibles en este momento.
            </p>
          )}
        </div>
      </section>
      {/* Testimonials Section */}
      <section className="bg-[#FDFCF9] py-16">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <h2 className="mb-12 text-center font-heading text-3xl font-bold uppercase md:text-4xl">
            Más de 1,000+ Clientes
            <br />
            Satisfechos Respaldan Nuestra Calidad
          </h2>

          {reviews.length > 0 ? (
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
              {reviews.map((review) => (
                <TestimonialCard
                  key={review.id}
                  quote={
                    review.body ||
                    review.title ||
                    "Excelente producto, totalmente recomendado."
                  }
                  author={review.user?.name || "Cliente Verificado"}
                  rating={review.rating}
                />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
              <TestimonialCard
                quote="Los productos orgánicos de S & P han transformado la alimentación de mi familia. La calidad es incomparable y el sabor es auténtico."
                author="María G."
                rating={5}
              />
              <TestimonialCard
                quote="La miel y el café son mis favoritos. Productos 100% naturales que se notan desde el primer uso. Excelente servicio."
                author="Carlos R."
                rating={5}
              />
              <TestimonialCard
                quote="Compro regularmente la quinua y los lácteos. Todo fresco, orgánico y con certificación. Vale cada sol invertido."
                author="Ana M."
                rating={5}
              />
              <TestimonialCard
                quote="Como nutricionista, recomiendo S & P a todos mis pacientes. Productos de confianza con trazabilidad completa."
                author="Dr. Luis P."
                rating={5}
              />
            </div>
          )}
        </div>
      </section>
      {/* Categories Section */}
      <section className="bg-white py-16">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <h2 className="mb-12 text-center font-heading text-4xl font-bold uppercase md:text-5xl">
            Categorías Destacadas
          </h2>

          {featuredCategories.length > 0 ? (
            <div className="mb-12 grid grid-cols-1 gap-6 md:grid-cols-3">
              {featuredCategories.slice(0, 3).map((category) => (
                <CategoryCard
                  key={category.id}
                  title={category.name}
                  slug={category.slug}
                  image={
                    category.imageUrl ||
                    "https://images.unsplash.com/photo-1593095948071-474c5cc2989d?q=80&w=800"
                  }
                />
              ))}
            </div>
          ) : (
            <p className="mb-12 text-center text-gray-600">
              No se encontraron categorías destacadas.
            </p>
          )}

          {/* Icons Banner */}
          <div className="grid grid-cols-2 gap-6 rounded-lg bg-[#FDFCF9] p-8 md:grid-cols-3 lg:grid-cols-6">
            <IconFeature icon="✓" text="Calidad garantizada" />
            <IconFeature icon="🚫" text="Sin aditivos artificiales" />
            <IconFeature icon="🥇" text="Productos premium" />
            <IconFeature icon="🧪" text="Certificados orgánicos" />
            <IconFeature icon="🌿" text="100% naturales" />
            <IconFeature icon="✨" text="Mejores precios" />
          </div>
        </div>
      </section>

      {/* Product Carousel Section */}
      {productsForCarousel.length > 4 && (
        <section className="bg-[#FDFCF9] py-16">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <h2 className="mb-12 text-center font-heading text-4xl font-bold uppercase md:text-5xl">
              Más Productos Orgánicos
            </h2>
            <ProductCarousel products={productsForCarousel} />
          </div>
        </section>
      )}
      {/* About Section */}
      <section className="bg-[#FDFCF9] py-16">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:items-center">
            {/* Content */}
            <div>
              <h2 className="mb-6 font-heading text-4xl font-bold uppercase md:text-5xl">
                Calidad y
                <br />
                Confianza.
                <br />
                Nuestra Garantía.
              </h2>
              <p className="mb-4 text-lg text-gray-700">
                En S & P Soluciones Integrales, creemos en ofrecer solo
                productos orgánicos de la más alta calidad que satisfagan las
                necesidades nutricionales de nuestros clientes.
              </p>
              <p className="mb-4 text-lg text-gray-700">
                Cada producto es cuidadosamente seleccionado desde el origen,
                garantizando su trazabilidad y certificación orgánica.
              </p>
              <p className="mb-6 text-lg text-gray-700">
                Trabajamos directamente con productores locales que comparten
                nuestros valores de sostenibilidad y calidad, asegurando
                frescura y autenticidad en cada compra.
              </p>
              <Link
                href="/products"
                className="inline-block rounded-md border-2 border-[#D95D24] px-6 py-3 font-semibold uppercase text-[#D95D24] transition hover:bg-[#D95D24] hover:text-white"
              >
                Conoce Nuestros Productos
              </Link>
            </div>

            {/* Image */}
            <div className="relative h-[400px] overflow-hidden rounded-lg lg:h-[500px]">
              <img
                src="https://images.unsplash.com/photo-1464226184884-fa280b87c399?q=80&w=800"
                alt="Productos orgánicos"
                className="h-full w-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

// Icon Feature Component
function IconFeature({ icon, text }: { icon: string; text: string }) {
  return (
    <div className="flex flex-col items-center text-center">
      <div className="mb-2 text-2xl">{icon}</div>
      <p className="text-xs text-gray-700">{text}</p>
    </div>
  );
}
