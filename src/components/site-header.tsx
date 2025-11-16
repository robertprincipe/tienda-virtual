"use client";

import Link from "next/link";
import { Menu, Search, User, X, ShoppingCart } from "lucide-react";
import { useEffect, useState } from "react";

export const SiteHeader = () => {
  const [cartOpen, setCartOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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

  // Cerrar menú mobile al cambiar de tamaño
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setMobileMenuOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <header className="sticky top-0 z-50 border-b border-gray-200 bg-white">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-8">
        {/* Hamburger button - Mobile only */}
        <button
          className="text-gray-700 transition hover:text-[#1E5B3E] md:hidden"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? (
            <X className="h-6 w-6" />
          ) : (
            <Menu className="h-6 w-6" />
          )}
        </button>

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
          <button className="text-gray-700 transition hover:text-[#1E5B3E] md:hidden">
            <ShoppingCart className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        className={`absolute left-0 right-0 top-full border-b border-gray-200 bg-white shadow-lg transition-all duration-300 ease-in-out md:hidden ${
          mobileMenuOpen
            ? "translate-y-0 opacity-100"
            : "pointer-events-none -translate-y-4 opacity-0"
        }`}
      >
        <div className="mx-auto max-w-7xl px-6 py-4">
          {/* Search Bar */}
          <div className="mb-4 flex items-center gap-2 rounded-md border border-gray-300 px-3 py-2">
            <Search className="h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search for products"
              className="flex-1 border-none bg-transparent text-sm text-gray-700 outline-none placeholder:text-gray-400"
            />
          </div>

          {/* Banner */}
          <div className="mb-4 bg-black px-4 py-3">
            <p className="text-sm font-semibold text-yellow-400">
              BLACK FRIDAY
            </p>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1">
            <Link
              href="/categories"
              className="block border-b border-gray-200 py-3 text-base text-gray-900 transition hover:text-[#1E5B3E]"
              onClick={() => setMobileMenuOpen(false)}
            >
              New In
            </Link>
            <Link
              href="/categories"
              className="flex items-center justify-between border-b border-gray-200 py-3 text-base text-gray-900 transition hover:text-[#1E5B3E]"
              onClick={() => setMobileMenuOpen(false)}
            >
              Dining Room
              <span className="text-gray-400">›</span>
            </Link>
            <Link
              href="/products"
              className="block border-b border-gray-200 py-3 text-base text-gray-900 transition hover:text-[#1E5B3E]"
              onClick={() => setMobileMenuOpen(false)}
            >
              Marble Dining Sets
            </Link>
            <Link
              href="/products"
              className="block border-b border-gray-200 py-3 text-base text-gray-900 transition hover:text-[#1E5B3E]"
              onClick={() => setMobileMenuOpen(false)}
            >
              Dining Chairs
            </Link>
            <Link
              href="/about-us"
              className="flex items-center justify-between border-b border-gray-200 py-3 text-base text-gray-900 transition hover:text-[#1E5B3E]"
              onClick={() => setMobileMenuOpen(false)}
            >
              Sofas
              <span className="text-gray-400">›</span>
            </Link>
          </nav>

          {/* User Link */}
          <Link
            href="/login"
            className="mt-4 flex items-center gap-2 py-3 text-base text-gray-900 transition hover:text-[#1E5B3E]"
            onClick={() => setMobileMenuOpen(false)}
          >
            <User className="h-5 w-5" />
            <span>Log in</span>
          </Link>
        </div>
      </div>
    </header>
  );
};
