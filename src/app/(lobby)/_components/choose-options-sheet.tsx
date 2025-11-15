"use client";

import * as React from "react";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { useChooseOption } from "@/lib/store/choose-options";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { AddToCart } from "../products/[handle]/add-to-cart";
import ModalPay from "../products/[handle]/_components/modal-pay";
import { useProductQuery } from "~/ecommerce/products/queries/product.query";
import { ProductVariant } from "~/ecommerce/products/validations";
import Link from "next/link";
import { environments } from "@/env";

export const ChooseOptionsSheet = () => {
  const [productId, setProductId] = useChooseOption((s) => [
    s.productId,
    s.setProductId,
  ]);

  const { data } = useProductQuery(productId);

  const [variant, setVariant] = React.useState<ProductVariant | null>(null);

  React.useEffect(() => {
    if (data?.result.product.variants?.[0]?.name) {
      setVariant(data.result.product.variants[0] as ProductVariant);
      console.log(data.result.product.variants[0]);
    } else {
      setVariant(null);
    }
  }, [data]);

  const onVariant = (setIndex: number, value: string) => {
    const vTitle = variant?.name?.split(" / ") || [];

    vTitle[setIndex] = value;

    const v = data?.result.product.variants?.find(
      (v) => v.name === vTitle.join(" / ")
    );

    setVariant((v as ProductVariant) || null);
  };

  return (
    <Sheet open={!!productId} onOpenChange={() => setProductId(null)}>
      <SheetContent className="inset-y-2 right-2 rounded-xl w-[calc(100%-16px)] h-[calc(100%-16px)] overflow-hidden border shadow-2xs sm:max-w-md">
        <div className="relative flex flex-col h-full">
          <SheetHeader>
            <SheetTitle>Elegir opciones</SheetTitle>
          </SheetHeader>
          <hr className="-mx-6" />
          <div className="grow">
            <div className="py-6">
              <article className="grid grid-cols-3 gap-2">
                <div className="relative">
                  <img
                    src={
                      data?.result.product.images?.[0]
                        ? `${environments.API_URL}/statics/${data?.result.product.images?.[0]?.static.urn}`
                        : "https://galaximart.com/cdn/shop/files/DT235-Photoroom_c50c40d9-cf4d-4618-a8ba-537b38dfbeea.jpg?v=1708274255&width=1500"
                    }
                    alt=""
                  />
                </div>
                <div className="col-span-2">
                  <h3 className="font-medium text-lg pb-1">
                    {data?.result.product.name}
                  </h3>
                  <hr className="" />
                  <div className="flex items-center gap-1 py-2">
                    <p className="text-2xl font-medium text-red-600">
                      S/. {variant?.price}
                    </p>
                  </div>
                  <p className="text-sm">Incluido IGV</p>
                  <Link
                    href={`/products/${data?.result.product.handle}`}
                    className="underline text-sm"
                  >
                    Ver detalles
                  </Link>
                </div>
              </article>

              <div className="grid gap-4 pt-6">
                {data?.result.product.optionSets?.map((optionSet, idx) => (
                  <div key={optionSet.id}>
                    <span className="text-sm font-medium text-zinc-600">
                      {optionSet.name}
                    </span>
                    <Select
                      onValueChange={(v) => onVariant(idx, v)}
                      defaultValue={variant?.name?.split(" / ")[idx] || ""}
                    >
                      <SelectTrigger className="ps-2 [&>span]:flex [&>span]:items-center [&>span]:gap-2 [&>span_[data-square]]:shrink-0">
                        <SelectValue placeholder="Selecciona una opción" />
                      </SelectTrigger>
                      <SelectContent className="[&_*[role=option]>span]:end-2 [&_*[role=option]>span]:start-auto [&_*[role=option]>span]:flex [&_*[role=option]>span]:items-center [&_*[role=option]>span]:gap-2 [&_*[role=option]]:pe-8 [&_*[role=option]]:ps-2">
                        <SelectGroup>
                          {optionSet?.options?.map((option) => {
                            if (optionSet.set_type === "IMAGE") {
                              return (
                                <SelectItem
                                  key={option.id}
                                  value={option.label}
                                >
                                  <img
                                    className="size-5 rounded"
                                    src={`${environments.API_URL}/statics/${option.value}`}
                                    alt="Frank Allison"
                                    width={20}
                                    height={20}
                                  />
                                  <span className="truncate">
                                    {option.label}
                                  </span>
                                </SelectItem>
                              );
                            }

                            if (optionSet.set_type === "COLOR") {
                              return (
                                <SelectItem
                                  key={option.id}
                                  value={option.label}
                                >
                                  <span className="flex items-center gap-2">
                                    <svg
                                      width="8"
                                      height="8"
                                      fill="currentColor"
                                      viewBox="0 0 8 8"
                                      xmlns="http://www.w3.org/2000/svg"
                                      style={{
                                        color: option.value,
                                        stroke: "currentColor",
                                      }}
                                      aria-hidden="true"
                                    >
                                      <circle cx="4" cy="4" r="4" />
                                    </svg>
                                    <span className="truncate">
                                      {option.label}
                                    </span>
                                  </span>
                                </SelectItem>
                              );
                            }

                            return (
                              <SelectItem key={option.id} value={option.label}>
                                {option.label}
                              </SelectItem>
                            );
                          })}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <hr className="-mx-6 block" />
          {data?.result && variant ? (
            <div className="pt-6 mt-auto">
              <AddToCart product={data?.result.product} variant={variant} />
              <ModalPay product={data?.result.product} variant={variant} />
            </div>
          ) : null}
        </div>
      </SheetContent>
    </Sheet>
  );
};
