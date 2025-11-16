"use client";

import * as React from "react";

import { Icon } from "@iconify/react";

import { Cart } from "./cart";
import { useScroll, useMotionValueEvent } from "framer-motion";

// import SearchNavbar from "./search-navbar";
import Link from "next/link";
import { CartIcon } from "./cart-icon";
import { useCartStore } from "@/hooks/stores/cart.store";
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
import {
  getCurrentUser,
  logoutUser,
} from "@/services/auth/actions/auth.actions";
import { useRouter } from "next/navigation";
import type { SessionUser } from "@/types/auth";

export const SiteHeader = () => {
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

  return (
    <>
      <header className="border-b py-4 sticky top-0 inset-x-0 z-40 bg-white shadow-2xs">
        <nav className="flex justify-between flex-col sm:flex-row container sm:items-center gap-4">
          <div className="flex justify-between items-center">
            <Link href="/">
              <Icon
                icon="fluent-emoji-flat:sunrise-over-mountains"
                className="text-6xl"
              />
            </Link>
            <button
              type="button"
              className="sm:hidden"
              onClick={() => setOpen(true)}
            >
              <Icon
                icon="material-symbols-light:shopping-basket"
                className="text-4xl"
              />
            </button>
          </div>
          {/* <SearchNavbar /> */}
          <div className="hidden sm:flex items-center gap-4">
            <CartIcon />

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
                        <div className="flex flex-col items-start text-left">
                          <span className="text-sm font-medium">
                            {user.name}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {user.email}
                          </span>
                        </div>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                      <DropdownMenuLabel>Mi Cuenta</DropdownMenuLabel>
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
          </div>
        </nav>
      </header>
      <Cart />
    </>
  );
};
