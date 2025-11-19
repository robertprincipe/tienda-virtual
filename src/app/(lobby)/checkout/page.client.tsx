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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
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
import {
  Loader2,
  Ticket,
  X,
  ShoppingCart,
  MapPin,
  CreditCard,
  Smartphone,
  Package,
  ChevronDown,
  Upload,
} from "lucide-react";
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
  const { items, cartId, amount, syncCart } = useCartStore();
  const [isInitializing, setIsInitializing] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<
    ApplyCouponResult["data"] | undefined
  >(undefined);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<string>("");
  const [voucherFile, setVoucherFile] = useState<File | null>(null);

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

  // Sincronizar carrito al montar el componente
  useEffect(() => {
    const initializeCart = async () => {
      await syncCart();
      setIsInitializing(false);
    };

    initializeCart();
  }, [syncCart]);

  // Redirigir si el carrito está vacío (solo después de cargar)
  useEffect(() => {
    if (!isInitializing && items.length === 0 && !cartId) {
      router.push("/products");
    }
  }, [isInitializing, items, cartId, router]);

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
        // Sincronizar el store del carrito para vaciarlo
        await useCartStore.getState().syncCart();

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

  // Mostrar loader mientras se inicializa el carrito
  if (isInitializing) {
    return (
      <div className="container max-w-6xl py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

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

  const displayTotal = appliedCoupon ? appliedCoupon.total : amount();
  const displaySubtotal = appliedCoupon ? appliedCoupon.subtotal : amount();
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

              <Card>
                <CardHeader>
                  <CardTitle>
                    Método de Pago (solo con fines academicos)
                  </CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    Todas las transacciones son seguras y encriptadas
                  </p>
                </CardHeader>
                <CardContent className="space-y-3">
                  <RadioGroup
                    value={paymentMethod}
                    onValueChange={setPaymentMethod}
                  >
                    {/* Tarjeta de Crédito/Débito */}
                    <div className="border rounded-lg overflow-hidden transition-all duration-300 hover:border-[#D95D24]">
                      <label
                        htmlFor="credit-card"
                        className={`flex items-center justify-between p-4 cursor-pointer transition-colors ${
                          paymentMethod === "credit-card"
                            ? "bg-[#D95D24]/5 border-l-4 border-l-[#D95D24]"
                            : ""
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <RadioGroupItem
                            value="credit-card"
                            id="credit-card"
                          />
                          <div className="flex items-center gap-2">
                            <CreditCard className="w-5 h-5 text-[#2E332A]" />
                            <span className="font-medium">
                              Tarjeta de Crédito/Débito
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <img
                            src="https://upload.wikimedia.org/wikipedia/commons/0/04/Visa.svg"
                            alt="Visa"
                            className="h-6"
                          />
                          <img
                            src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg"
                            alt="Mastercard"
                            className="h-6"
                          />
                          <ChevronDown
                            className={`w-5 h-5 transition-transform duration-300 ${
                              paymentMethod === "credit-card"
                                ? "rotate-180"
                                : ""
                            }`}
                          />
                        </div>
                      </label>
                      <div
                        className={`overflow-hidden transition-all duration-300 ease-in-out ${
                          paymentMethod === "credit-card"
                            ? "max-h-[400px] opacity-100"
                            : "max-h-0 opacity-0"
                        }`}
                      >
                        <div className="p-4 pt-0 space-y-4 bg-[#FDFCF9]">
                          <div>
                            <Label
                              htmlFor="card-number"
                              className="text-sm font-medium"
                            >
                              Número de Tarjeta
                            </Label>
                            <div className="relative mt-1">
                              <Input
                                id="card-number"
                                placeholder="1234 5678 9012 3456"
                                maxLength={19}
                                className="pr-10"
                              />
                              <CreditCard className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label
                                htmlFor="expiry"
                                className="text-sm font-medium"
                              >
                                Fecha de Expiración (MM/AA)
                              </Label>
                              <Input
                                id="expiry"
                                placeholder="MM/AA"
                                maxLength={5}
                                className="mt-1"
                              />
                            </div>
                            <div>
                              <Label
                                htmlFor="cvc"
                                className="text-sm font-medium"
                              >
                                Código de Seguridad
                              </Label>
                              <Input
                                id="cvc"
                                placeholder="123"
                                maxLength={4}
                                className="mt-1"
                              />
                            </div>
                          </div>
                          <div>
                            <Label
                              htmlFor="card-name"
                              className="text-sm font-medium"
                            >
                              Nombre en la Tarjeta
                            </Label>
                            <Input
                              id="card-name"
                              placeholder="NOMBRE APELLIDO"
                              className="mt-1 uppercase"
                            />
                          </div>
                          <div className="flex items-start gap-2">
                            <Checkbox id="save-card" />
                            <label
                              htmlFor="save-card"
                              className="text-sm text-muted-foreground cursor-pointer"
                            >
                              Usar dirección de envío como dirección de
                              facturación
                            </label>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Yape o Plin */}
                    <div className="border rounded-lg overflow-hidden transition-all duration-300 hover:border-[#D95D24]">
                      <label
                        htmlFor="digital-wallet"
                        className={`flex items-center justify-between p-4 cursor-pointer transition-colors ${
                          paymentMethod === "digital-wallet"
                            ? "bg-[#D95D24]/5 border-l-4 border-l-[#D95D24]"
                            : ""
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <RadioGroupItem
                            value="digital-wallet"
                            id="digital-wallet"
                          />
                          <div className="flex items-center gap-2">
                            <Smartphone className="w-5 h-5 text-[#2E332A]" />
                            <span className="font-medium">Yape o Plin</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">
                            Yape
                          </div>
                          <div className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                            Plin
                          </div>
                          <ChevronDown
                            className={`w-5 h-5 transition-transform duration-300 ${
                              paymentMethod === "digital-wallet"
                                ? "rotate-180"
                                : ""
                            }`}
                          />
                        </div>
                      </label>
                      <div
                        className={`overflow-hidden transition-all duration-300 ease-in-out ${
                          paymentMethod === "digital-wallet"
                            ? "max-h-[600px] opacity-100"
                            : "max-h-0 opacity-0"
                        }`}
                      >
                        <div className="p-4 pt-0 space-y-4 bg-[#FDFCF9]">
                          <div className="flex flex-col items-center justify-center p-6 bg-white rounded-lg border-2 border-dashed">
                            <p className="text-center font-medium mb-2">
                              Escanea el código QR con Yape o Plin
                            </p>
                            <p className="text-xs text-muted-foreground mb-3 text-center">
                              Ambas plataformas son interoperables
                            </p>
                            <div className="w-48 h-48 bg-gray-100 rounded-lg flex items-center justify-center mb-3">
                              <img
                                src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=932454821"
                                alt="QR Yape/Plin"
                                className="w-full h-full object-contain"
                              />
                            </div>
                            <p className="text-sm text-muted-foreground text-center">
                              Número:{" "}
                              <span className="font-bold text-[#2E332A]">
                                932 454 821
                              </span>
                            </p>
                            <p className="text-sm text-muted-foreground">
                              A nombre de:{" "}
                              <span className="font-bold text-[#2E332A]">
                                SP Soluciones
                              </span>
                            </p>
                          </div>
                          <div className="space-y-2">
                            <Label
                              htmlFor="digital-voucher"
                              className="text-sm font-medium"
                            >
                              Subir Voucher de Pago
                            </Label>
                            <div className="border-2 border-dashed rounded-lg p-4 hover:border-[#D95D24] transition-colors cursor-pointer">
                              <label
                                htmlFor="digital-voucher"
                                className="flex flex-col items-center gap-2 cursor-pointer"
                              >
                                <Upload className="w-8 h-8 text-muted-foreground" />
                                <span className="text-sm text-muted-foreground">
                                  {voucherFile
                                    ? voucherFile.name
                                    : "Haz clic para subir tu voucher"}
                                </span>
                                <span className="text-xs text-muted-foreground">
                                  PNG, JPG hasta 5MB
                                </span>
                                <Input
                                  id="digital-voucher"
                                  type="file"
                                  accept="image/*"
                                  className="hidden"
                                  onChange={(e) =>
                                    setVoucherFile(e.target.files?.[0] || null)
                                  }
                                />
                              </label>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Pago Contra Entrega */}
                    <div className="border rounded-lg overflow-hidden transition-all duration-300 hover:border-[#D95D24]">
                      <label
                        htmlFor="cash"
                        className={`flex items-center justify-between p-4 cursor-pointer transition-colors ${
                          paymentMethod === "cash"
                            ? "bg-[#D95D24]/5 border-l-4 border-l-[#D95D24]"
                            : ""
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <RadioGroupItem value="cash" id="cash" />
                          <div className="flex items-center gap-2">
                            <Package className="w-5 h-5 text-[#2E332A]" />
                            <span className="font-medium">
                              Pago Contra Entrega
                            </span>
                          </div>
                        </div>
                        <div className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                          Efectivo
                        </div>
                      </label>
                    </div>
                  </RadioGroup>

                  {!paymentMethod && (
                    <p className="text-sm text-muted-foreground text-center py-2">
                      Selecciona un método de pago para continuar
                    </p>
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
                          S/.{" "}
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
                        -S/. {appliedCoupon.discount.toFixed(2)} de descuento
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
                    <span>S/. {displaySubtotal.toFixed(2)}</span>
                  </div>
                  {displayDiscount > 0 && (
                    <div className="flex justify-between text-green-600 dark:text-green-400">
                      <span>Descuento</span>
                      <span>-S/. {displayDiscount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>Envío</span>
                    <span>S/. {displayShipping.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Impuestos</span>
                    <span>S/. {displayTax.toFixed(2)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span>S/. {displayTotal.toFixed(2)}</span>
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
