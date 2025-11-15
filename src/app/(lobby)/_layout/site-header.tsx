"use client";

import * as React from "react";

import { Icon } from "@iconify/react";

import { Cart } from "./cart";
import { useScroll, motion, useMotionValueEvent } from "framer-motion";

// import SearchNavbar from "./search-navbar";
import Link from "next/link";
import { CartIcon } from "./cart-icon";
import { useCartStore } from "@/hooks/stores/cart.store";

export const SiteHeader = () => {
  const [hidden, setHidden] = React.useState(false);
  const [setOpen] = useCartStore((state) => [state.setOpen]);
  const { scrollY } = useScroll();
  const lastYRef = React.useRef(0);

  useMotionValueEvent(scrollY, "change", (y) => {
    const difference = y - lastYRef.current;
    if (Math.abs(difference) > 180) {
      setHidden(difference > 0);
      lastYRef.current = y;
    }
  });

  return (
    <>
      <header className="border-b py-4 sticky top-0 inset-x-0 z-40 bg-white shadow-2xs">
        <nav className="flex justify-between flex-col sm:flex-row container sm:items-center">
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
              {/* <PiShoppingCartBold className="text-4xl" /> */}
              {/* <Icon icon="bi:cart-dash"/> */}
              {/* <Icon icon="bitcoin-icons:cart-outline"  /> */}
              <Icon
                icon="material-symbols-light:shopping-basket"
                className="text-4xl"
              />
            </button>
          </div>
          {/* <SearchNavbar /> */}
          <CartIcon />
        </nav>
      </header>
      <Cart />
    </>
  );
};
