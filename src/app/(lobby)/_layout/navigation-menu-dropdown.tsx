import React, { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Icon } from "@iconify/react/dist/iconify.js";
import Link from "next/link";
import { useCategories } from "@/services/categories/queries/category.query";

export const NavigationMenuDropdown = () => {
  const { data } = useCategories();
  return (
    <div className="flex justify-center px-3 gap-3">
      {data?.map((category) => (
        <FlyoutLink
          key={category.id}
          href={`/${category.slug}`}
          FlyoutContent={PricingContent}
        >
          <span>{category.name}</span>
        </FlyoutLink>
      ))}
    </div>
  );
};

const FlyoutLink = ({
  children,
  href,
  FlyoutContent,
}: {
  children: React.ReactNode;
  href: string;
  FlyoutContent?: React.FC;
}) => {
  const [open, setOpen] = useState(false);

  const showFlyout = FlyoutContent && open;

  return (
    <>
      <div>
        <Link
          href={href}
          className="group flex flex-col"
          onMouseEnter={() => setOpen(true)}
          onMouseLeave={() => setOpen(false)}
        >
          <div className="flex items-center">
            {children}

            {FlyoutContent ? (
              <Icon icon="ri:arrow-down-s-line" className="text-2xl" />
            ) : null}
          </div>
          <span
            className={`group-hover:bg-black h-0.5 w-full ${
              open ? "bg-black" : ""
            }`}
          />
        </Link>
      </div>
      <AnimatePresence>
        {showFlyout && (
          <motion.div
            onMouseEnter={() => setOpen(true)}
            onMouseLeave={() => setOpen(false)}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 15 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="absolute inset-x-0 top-[52px] text-black border-t border-t-zinc-200"
          >
            <div className="absolute -top-6 left-0 right-0 h-6 bg-transparent" />
            <FlyoutContent />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

const PricingContent = () => {
  return (
    <div className="bg-white p-6 shadow-xl">
      <div className="container">
        <div className="mb-3 space-y-3">
          <h3 className="font-semibold">For Individuals</h3>
          <a href="#" className="block text-sm hover:underline">
            Introduction
          </a>
          <a href="#" className="block text-sm hover:underline">
            Pay as you go
          </a>
        </div>
        <div className="mb-6 space-y-3">
          <h3 className="font-semibold">For Companies</h3>
          <a href="#" className="block text-sm hover:underline">
            Startups
          </a>
          <a href="#" className="block text-sm hover:underline">
            SMBs
          </a>
          <a href="#" className="block text-sm hover:underline">
            Enterprise
          </a>
        </div>
      </div>
    </div>
  );
};
