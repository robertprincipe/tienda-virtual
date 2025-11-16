"use client";

import Link from "next/link";
import { Menu, Search, User, X, ShoppingCart } from "lucide-react";
import { useEffect, useState } from "react";
import { CartIcon } from "./cart-icon";
import { SearchDropdown } from "@/components/search-dropdown";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

import * as React from "react";

import { Icon } from "@iconify/react";

import { useScroll, useMotionValueEvent } from "framer-motion";

import { useCartStore } from "@/hooks/stores/cart.store";

import {
  getCurrentUser,
  logoutUser,
} from "@/services/auth/actions/auth.actions";
import { useRouter } from "next/navigation";
import type { SessionUser } from "@/types/auth";
import { Cart } from "./cart";

export const SiteHeader = () => {
  const [cartOpen, setCartOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const [hidden, setHidden] = React.useState(false);
  const [setOpen] = useCartStore((state) => [state.setOpen]);
  const [user, setUser] = React.useState<SessionUser | null>(null);
  const [loading, setLoading] = React.useState(true);
  const router = useRouter();
  const { scrollY } = useScroll();
  const lastYRef = React.useRef(0);

  useMotionValueEvent(scrollY, "change", (y) => {
    const difference = y - lastYRef.current;
    if (Math.abs(difference) > 180) {
      setHidden(difference > 0);
      lastYRef.current = y;
    }
  });

  React.useEffect(() => {
    getCurrentUser().then((currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
  }, []);

  const handleLogout = async () => {
    await logoutUser();
    setUser(null);
    router.push("/");
    router.refresh();
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

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
    <>
      <header className="sticky top-0 z-50 border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-8">
          {/* Hamburger button - Mobile only */}
          <div className="flex items-center gap-2">
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
          </div>

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
            <div className="hidden md:block">
              <SearchDropdown />
            </div>
            {!loading && (
              <>
                {user ? (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        className="relative h-10 gap-2 px-2"
                      >
                        <Avatar className="h-8 w-8">
                          <AvatarImage
                            src={user.photoUrl || undefined}
                            alt={user.name}
                          />
                          <AvatarFallback>
                            {getInitials(user.name)}
                          </AvatarFallback>
                        </Avatar>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                      <DropdownMenuLabel>
                        <div className="flex flex-col items-start text-left">
                          <span className="text-sm font-medium">
                            {user.name}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {user.email}
                          </span>
                        </div>
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link href="/account" className="cursor-pointer">
                          <Icon icon="mdi:account" className="mr-2 h-4 w-4" />
                          Editar perfil
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link
                          href="/account?tab=orders"
                          className="cursor-pointer"
                        >
                          <Icon
                            icon="mdi:package-variant"
                            className="mr-2 h-4 w-4"
                          />
                          Mis pedidos
                        </Link>
                      </DropdownMenuItem>
                      {(user.roleId === 1 || user.roleId === 2) && (
                        <>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem asChild>
                            <Link href="/dashboard" className="cursor-pointer">
                              <Icon
                                icon="mdi:view-dashboard"
                                className="mr-2 h-4 w-4"
                              />
                              Dashboard
                            </Link>
                          </DropdownMenuItem>
                        </>
                      )}
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={handleLogout}
                        className="cursor-pointer text-red-600"
                      >
                        <Icon icon="mdi:logout" className="mr-2 h-4 w-4" />
                        Cerrar sesión
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : (
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" asChild>
                      <Link href="/login">Iniciar sesión</Link>
                    </Button>
                    <Button asChild>
                      <Link href="/register">Registrarse</Link>
                    </Button>
                  </div>
                )}
              </>
            )}

            <CartIcon />
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
            <SearchDropdown />

            {/* Navigation Links */}
            <nav className="space-y-1">
              <Link
                href="/products"
                className="block border-b border-gray-200 py-3 text-base text-gray-900 transition hover:text-[#1E5B3E]"
                onClick={() => setMobileMenuOpen(false)}
              >
                Productos
              </Link>
              <Link
                href="/categories"
                className="flex items-center justify-between border-b border-gray-200 py-3 text-base text-gray-900 transition hover:text-[#1E5B3E]"
                onClick={() => setMobileMenuOpen(false)}
              >
                Categorías
                <span className="text-gray-400">›</span>
              </Link>
              <Link
                href="/products"
                className="block border-b border-gray-200 py-3 text-base text-gray-900 transition hover:text-[#1E5B3E]"
                onClick={() => setMobileMenuOpen(false)}
              >
                Sobre nosotros
              </Link>
              <Link
                href="/products"
                className="block border-b border-gray-200 py-3 text-base text-gray-900 transition hover:text-[#1E5B3E]"
                onClick={() => setMobileMenuOpen(false)}
              >
                Contactanos
              </Link>
            </nav>

            {!user ? (
              <div className="flex items-center gap-2">
                <Button variant="ghost" asChild>
                  <Link href="/login">Iniciar sesión</Link>
                </Button>
                <Button asChild>
                  <Link href="/register">Registrarse</Link>
                </Button>
              </div>
            ) : null}
          </div>
        </div>
      </header>
      <Cart />
    </>
  );
};
