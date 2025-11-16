"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Resolver, SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  checkoutFormSchema,
  type CheckoutFormInput,
} from "@/schemas/checkout.schema";
import { placeOrder } from "@/services/orders/actions/order.actions";
import { applyCoupon } from "@/services/coupons/actions/coupon.actions";
import { useCartStore } from "@/hooks/stores/cart.store";
import { Loader2, Ticket, X, ShoppingCart, MapPin } from "lucide-react";
import type { ApplyCouponResult } from "@/services/coupons/actions/coupon.actions";

interface Props {
  user: {
    id: number;
    email: string;
    name: string;
  } | null;
}

export default function CheckoutClient({ user }: Props) {
  const router = useRouter();
  const { items, cartId, total, amount } = useCartStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<
    ApplyCouponResult["data"] | undefined
  >(undefined);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);

  const form = useForm<CheckoutFormInput>({
    resolver: zodResolver(
      checkoutFormSchema
    ) as unknown as Resolver<CheckoutFormInput>,
    defaultValues: {
      email: user?.email || "",
      useStoredAddress: false,
      fullName: user?.name || "",
      line1: "",
      line2: "",
      city: "",
      region: "",
      postalCode: "",
      countryCode: "PE",
      phone: "",
      couponCode: "",
      notes: "",
    },
  });

  const useStoredAddress = form.watch("useStoredAddress");

  // Redirigir si el carrito está vacío
  useEffect(() => {
    if (items.length === 0 && !cartId) {
      router.push("/products");
    }
  }, [items, cartId, router]);

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;

    setIsApplyingCoupon(true);
    setCouponError(null);

    try {
      const result = await applyCoupon(cartId!, couponCode);

      if (result.success && result.data) {
        setAppliedCoupon(result.data);
        form.setValue("couponCode", result.data.couponCode);
      } else {
        setCouponError(result.error || "Error al aplicar cupón");
      }
    } catch {
      setCouponError("Error al aplicar cupón");
    } finally {
      setIsApplyingCoupon(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(undefined);
    setCouponCode("");
    form.setValue("couponCode", "");
    setCouponError(null);
  };

  const onSubmit: SubmitHandler<CheckoutFormInput> = async (data) => {
    if (!cartId) {
      setError("No se encontró el carrito");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const result = await placeOrder(data, cartId);

      if (result.success && result.publicId) {
        // Redirigir a la página de tracking
        router.push(`/order/${result.publicId}`);
      } else {
        setError(result.error || "Error al crear la orden");
      }
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Error al crear la orden"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="container max-w-6xl py-8">
        <Alert>
          <ShoppingCart className="h-4 w-4" />
          <AlertDescription>
            Tu carrito está vacío. Agrega productos antes de continuar con el
            checkout.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const displayTotal = appliedCoupon ? appliedCoupon.total : total();
  const displaySubtotal = appliedCoupon ? appliedCoupon.subtotal : total();
  const displayDiscount = appliedCoupon ? appliedCoupon.discount : 0;
  const displayShipping = appliedCoupon ? appliedCoupon.shipping : 0;
  const displayTax = appliedCoupon ? appliedCoupon.tax : 0;

  return (
    <div className="container max-w-6xl py-8">
      <h1 className="text-3xl font-bold mb-6">Checkout</h1>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Formulario */}
        <div className="lg:col-span-2">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Email */}
              <Card>
                <CardHeader>
                  <CardTitle>Información de Contacto</CardTitle>
                </CardHeader>
                <CardContent>
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input
                            type="email"
                            placeholder="tu@email.com"
                            {...field}
                            disabled={!!user}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              {/* Dirección */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="w-5 h-5" />
                    Dirección de Envío
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {user && (
                    <FormField
                      control={form.control}
                      name="useStoredAddress"
                      render={({ field }) => (
                        <FormItem className="flex items-center gap-2">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <FormLabel className="mt-0! cursor-pointer">
                            Usar mi dirección guardada
                          </FormLabel>
                        </FormItem>
                      )}
                    />
                  )}

                  {!useStoredAddress && (
                    <>
                      <FormField
                        control={form.control}
                        name="fullName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Nombre Completo</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="line1"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Dirección</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="line2"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Dirección 2 (Opcional)</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="grid md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="city"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Ciudad</FormLabel>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="region"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Región (Opcional)</FormLabel>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="grid md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="postalCode"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Código Postal (Opcional)</FormLabel>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="countryCode"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>País</FormLabel>
                              <FormControl>
                                <Input {...field} maxLength={2} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={form.control}
                        name="phone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Teléfono (Opcional)</FormLabel>
                            <FormControl>
                              <Input {...field} type="tel" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </>
                  )}
                </CardContent>
              </Card>

              {/* Notas */}
              <Card>
                <CardHeader>
                  <CardTitle>Notas del Pedido (Opcional)</CardTitle>
                </CardHeader>
                <CardContent>
                  <FormField
                    control={form.control}
                    name="notes"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Textarea
                            placeholder="Instrucciones especiales para la entrega..."
                            {...field}
                            rows={4}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <Button
                type="submit"
                size="lg"
                className="w-full"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Procesando...
                  </>
                ) : (
                  "Realizar Pedido"
                )}
              </Button>
            </form>
          </Form>
        </div>

        {/* Resumen */}
        <div className="lg:col-span-1">
          <div className="sticky top-4 space-y-4">
            {/* Items */}
            <Card>
              <CardHeader>
                <CardTitle>Tu Orden ({amount()} items)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {items.map((item) => (
                    <div key={item.id} className="flex gap-3">
                      <div className="flex-1">
                        <p className="font-medium text-sm">
                          {item.product.name}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Cantidad: {item.quantity}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">
                          $
                          {(
                            parseFloat(item.product.price) * item.quantity
                          ).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Cupón */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Ticket className="w-5 h-5" />
                  Cupón de Descuento
                </CardTitle>
              </CardHeader>
              <CardContent>
                {!appliedCoupon ? (
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <Input
                        placeholder="Código de cupón"
                        value={couponCode}
                        onChange={(e) =>
                          setCouponCode(e.target.value.toUpperCase())
                        }
                        disabled={isApplyingCoupon}
                      />
                      <Button
                        type="button"
                        variant="secondary"
                        onClick={handleApplyCoupon}
                        disabled={isApplyingCoupon || !couponCode.trim()}
                      >
                        {isApplyingCoupon ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          "Aplicar"
                        )}
                      </Button>
                    </div>
                    {couponError && (
                      <p className="text-sm text-destructive">{couponError}</p>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-950 rounded-lg">
                    <div>
                      <Badge variant="secondary" className="mb-1">
                        {appliedCoupon.couponCode}
                      </Badge>
                      <p className="text-sm text-green-700 dark:text-green-300">
                        -${appliedCoupon.discount.toFixed(2)} de descuento
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={handleRemoveCoupon}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Totales */}
            <Card>
              <CardHeader>
                <CardTitle>Resumen</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>${displaySubtotal.toFixed(2)}</span>
                  </div>
                  {displayDiscount > 0 && (
                    <div className="flex justify-between text-green-600 dark:text-green-400">
                      <span>Descuento</span>
                      <span>-${displayDiscount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>Envío</span>
                    <span>${displayShipping.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Impuestos</span>
                    <span>${displayTax.toFixed(2)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span>${displayTotal.toFixed(2)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
