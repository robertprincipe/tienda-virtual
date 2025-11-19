import { Metadata } from "next";
import Link from "next/link";
import { Home, Search, ShoppingBag, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Página no encontrada",
  description:
    "La página que buscas no existe o ha sido movida. Regresa al inicio para continuar navegando.",
};

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#FDFCF9] font-body">
      {/* Hero Section with Background */}
      <section className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#2E332A]">
        {/* Background Image Overlay */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-20"
          style={{
            backgroundImage:
              "url(https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=2074)",
          }}
        />

        {/* Decorative Elements */}
        <div className="absolute left-10 top-20 h-32 w-32 rounded-full bg-[#D95D24]/10 blur-3xl" />
        <div className="absolute bottom-20 right-10 h-40 w-40 rounded-full bg-[#1E5B3E]/10 blur-3xl" />

        <div className="relative z-10 mx-auto max-w-4xl px-6 text-center">
          {/* 404 Number */}
          <div className="mb-8">
            <h1 className="font-heading text-9xl font-bold uppercase text-[#D95D24] md:text-[12rem] lg:text-[16rem]">
              404
            </h1>
          </div>

          {/* Title */}
          <h2 className="mb-6 font-heading text-4xl font-bold uppercase text-white md:text-5xl lg:text-6xl">
            Página no encontrada
          </h2>

          {/* Description */}
          <p className="mx-auto mb-12 max-w-2xl text-lg text-white/80 md:text-xl">
            Lo sentimos, no pudimos encontrar la página que estás buscando.
            Puede que haya sido movida o eliminada.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button
              asChild
              size="lg"
              className="group h-14 bg-[#D95D24] px-8 text-base font-semibold uppercase tracking-wide text-white transition-all hover:bg-[#D95D24]/90 hover:shadow-lg"
            >
              <Link href="/" className="flex items-center gap-2">
                <Home className="h-5 w-5 transition-transform group-hover:-translate-x-1" />
                Volver al Inicio
              </Link>
            </Button>

            <Button
              asChild
              size="lg"
              variant="outline"
              className="h-14 border-2 border-white bg-transparent px-8 text-base font-semibold uppercase tracking-wide text-white transition-all hover:bg-white hover:text-[#2E332A]"
            >
              <Link href="/products" className="flex items-center gap-2">
                <ShoppingBag className="h-5 w-5" />
                Ver Productos
              </Link>
            </Button>
          </div>

          {/* Quick Links */}
          <div className="mt-16">
            <p className="mb-6 text-sm uppercase tracking-wider text-white/60">
              Enlaces rápidos
            </p>
            <div className="flex flex-wrap items-center justify-center gap-6 text-sm">
              <Link
                href="/categories"
                className="text-white/80 transition-colors hover:text-[#D95D24]"
              >
                Categorías
              </Link>
              <span className="text-white/40">•</span>
              <Link
                href="/about-us"
                className="text-white/80 transition-colors hover:text-[#D95D24]"
              >
                Nosotros
              </Link>
              <span className="text-white/40">•</span>
              <Link
                href="/contact"
                className="text-white/80 transition-colors hover:text-[#D95D24]"
              >
                Contacto
              </Link>
              <span className="text-white/40">•</span>
              <Link
                href="/search"
                className="flex items-center gap-1 text-white/80 transition-colors hover:text-[#D95D24]"
              >
                <Search className="h-4 w-4" />
                Buscar
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Bottom Section */}
      <section className="bg-[#FDFCF9] py-12">
        <div className="mx-auto max-w-7xl px-6">
          <div className="flex flex-col items-center justify-center gap-4 text-center">
            <p className="text-[#2E332A]/60">
              ¿Crees que esto es un error?{" "}
              <Link
                href="/contact"
                className="font-semibold text-[#D95D24] transition-colors hover:text-[#D95D24]/80"
              >
                Contáctanos
              </Link>
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
