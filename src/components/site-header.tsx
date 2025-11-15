import { Cart } from "@/types/cart";
import Link from "next/link";
import { Menu, Search, User, X } from "lucide-react";
import { useEffect, useState } from "react";

export const SiteHeader = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);

  // Escuchar evento para abrir el cart sheet
  useEffect(() => {
    const handleOpenCart = () => {
      setCartOpen(true);
    };

    window.addEventListener("open-cart-sheet", handleOpenCart);

    return () => {
      window.removeEventListener("open-cart-sheet", handleOpenCart);
    };
  }, []);

  return (
    <header className="sticky top-0 z-50 border-b border-gray-200 bg-white">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-8">
        <Link href="/">
          <div className="items-center font-heading text-2xl leading-4 font-bold tracking-tight text-[#1E5B3E]">
            <h2>S & P</h2>
            <span className="text-[16px]">Soluciones Integrales</span>
          </div>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          <Link
            href="/categories"
            className="text-sm text-gray-700 transition hover:text-[#1E5B3E]"
          >
            Categorias
          </Link>
          <Link
            href="/products"
            className="text-sm text-gray-700 transition hover:text-[#1E5B3E]"
          >
            Productos
          </Link>
          <Link
            href="/about-us"
            className="text-sm text-gray-700 transition hover:text-[#1E5B3E]"
          >
            Sobre nosotros
          </Link>
          <Link
            href="/contact"
            className="text-sm text-gray-700 transition hover:text-[#1E5B3E]"
          >
            Contacto
          </Link>
        </nav>

        <div className="flex items-center gap-4">
          <button className="hidden text-gray-700 transition hover:text-[#1E5B3E] md:block">
            <Search className="h-5 w-5" />
          </button>
          <button className="hidden text-gray-700 transition hover:text-[#1E5B3E] md:block">
            <User className="h-5 w-5" />
          </button>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden"
          >
            {mobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="border-t border-gray-200 bg-white px-6 py-4 md:hidden">
          <nav className="flex flex-col gap-4">
            <a href="#" className="text-gray-700">
              Shop
            </a>
            <a href="#" className="text-gray-700">
              About
            </a>
            <a href="#" className="text-gray-700">
              Reviews
            </a>
            <a href="#" className="text-gray-700">
              Subscribe & Save
            </a>
          </nav>
        </div>
      )}
    </header>
  );
};
