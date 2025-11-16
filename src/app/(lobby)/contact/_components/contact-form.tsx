"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Mail, MapPin, Phone } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod/v4";

const contactFormSchema = z.object({
  name: z.string().min(1, "El nombre es requerido"),
  email: z.string().email("Email inválido"),
  phone: z.string().optional(),
  subject: z.string().min(1, "El asunto es requerido"),
  message: z.string().min(10, "El mensaje debe tener al menos 10 caracteres"),
});

type ContactFormValues = z.infer<typeof contactFormSchema>;

interface ContactFormProps {
  storeInfo: {
    companyName: string;
    email: string | null;
    phone: string | null;
    companyLine1: string | null;
    companyLine2: string | null;
    companyCity: string | null;
    companyRegion: string | null;
    companyPostalCode: string | null;
  };
}

export function ContactForm({ storeInfo }: ContactFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<ContactFormValues>({
    resolver: zodResolver(contactFormSchema),
  });

  const onSubmit = async (data: ContactFormValues) => {
    try {
      // Aquí puedes implementar el envío del formulario
      console.log("Form data:", data);

      // Simular envío
      await new Promise((resolve) => setTimeout(resolve, 1000));

      alert(
        "¡Mensaje enviado correctamente! Nos pondremos en contacto contigo pronto."
      );
      reset();
    } catch (error) {
      console.error("Error sending message:", error);
      alert(
        "Hubo un error al enviar el mensaje. Por favor, intenta nuevamente."
      );
    }
  };

  // Build address string
  const addressParts = [
    storeInfo.companyLine1,
    storeInfo.companyLine2,
    storeInfo.companyCity,
    storeInfo.companyRegion,
    storeInfo.companyPostalCode,
  ].filter(Boolean);
  const fullAddress = addressParts.length > 0 ? addressParts.join(", ") : null;

  return (
    <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
      {/* Contact Information */}
      <div>
        <h2 className="mb-6 font-heading text-3xl font-bold uppercase text-[#2E332A]">
          Información de Contacto
        </h2>
        <p className="mb-8 text-lg text-gray-700">
          Estamos aquí para ayudarte. Si tienes alguna pregunta sobre nuestros
          productos o servicios, no dudes en contactarnos.
        </p>

        <div className="space-y-6">
          {/* Email */}
          {storeInfo.email && (
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-[#D95D24]/10">
                <Mail className="h-6 w-6 text-[#D95D24]" />
              </div>
              <div>
                <h3 className="mb-1 font-semibold text-gray-900">Email</h3>
                <a
                  href={`mailto:${storeInfo.email}`}
                  className="text-gray-600 hover:text-[#D95D24]"
                >
                  {storeInfo.email}
                </a>
              </div>
            </div>
          )}

          {/* Phone */}
          {storeInfo.phone && (
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-[#D95D24]/10">
                <Phone className="h-6 w-6 text-[#D95D24]" />
              </div>
              <div>
                <h3 className="mb-1 font-semibold text-gray-900">Teléfono</h3>
                <a
                  href={`tel:${storeInfo.phone}`}
                  className="text-gray-600 hover:text-[#D95D24]"
                >
                  {storeInfo.phone}
                </a>
              </div>
            </div>
          )}

          {/* Address */}
          {fullAddress && (
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-[#D95D24]/10">
                <MapPin className="h-6 w-6 text-[#D95D24]" />
              </div>
              <div>
                <h3 className="mb-1 font-semibold text-gray-900">Dirección</h3>
                <p className="text-gray-600">{fullAddress}</p>
              </div>
            </div>
          )}
        </div>

        {/* Business Hours */}
        <div className="mt-8 rounded-lg border border-gray-200 bg-[#FDFCF9] p-6">
          <h3 className="mb-4 font-semibold text-gray-900">
            Horario de Atención
          </h3>
          <div className="space-y-2 text-sm text-gray-600">
            <div className="flex justify-between">
              <span>Lunes - Viernes:</span>
              <span className="font-medium">9:00 AM - 6:00 PM</span>
            </div>
            <div className="flex justify-between">
              <span>Sábado:</span>
              <span className="font-medium">9:00 AM - 2:00 PM</span>
            </div>
            <div className="flex justify-between">
              <span>Domingo:</span>
              <span className="font-medium">Cerrado</span>
            </div>
          </div>
        </div>
      </div>

      {/* Contact Form */}
      <div>
        <div className="rounded-lg border border-gray-200 bg-white p-8 shadow-sm">
          <h2 className="mb-6 font-heading text-3xl font-bold uppercase text-[#2E332A]">
            Envíanos un Mensaje
          </h2>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Name */}
            <div>
              <label
                htmlFor="name"
                className="mb-2 block text-sm font-medium text-gray-900"
              >
                Nombre completo <span className="text-red-500">*</span>
              </label>
              <input
                {...register("name")}
                type="text"
                id="name"
                className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-[#D95D24] focus:outline-none focus:ring-2 focus:ring-[#D95D24]/20"
                placeholder="Tu nombre"
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-500">
                  {errors.name.message}
                </p>
              )}
            </div>

            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-sm font-medium text-gray-900"
              >
                Email <span className="text-red-500">*</span>
              </label>
              <input
                {...register("email")}
                type="email"
                id="email"
                className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-[#D95D24] focus:outline-none focus:ring-2 focus:ring-[#D95D24]/20"
                placeholder="tu@email.com"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-500">
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Phone */}
            <div>
              <label
                htmlFor="phone"
                className="mb-2 block text-sm font-medium text-gray-900"
              >
                Teléfono (opcional)
              </label>
              <input
                {...register("phone")}
                type="tel"
                id="phone"
                className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-[#D95D24] focus:outline-none focus:ring-2 focus:ring-[#D95D24]/20"
                placeholder="+51 999 999 999"
              />
            </div>

            {/* Subject */}
            <div>
              <label
                htmlFor="subject"
                className="mb-2 block text-sm font-medium text-gray-900"
              >
                Asunto <span className="text-red-500">*</span>
              </label>
              <input
                {...register("subject")}
                type="text"
                id="subject"
                className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-[#D95D24] focus:outline-none focus:ring-2 focus:ring-[#D95D24]/20"
                placeholder="¿En qué podemos ayudarte?"
              />
              {errors.subject && (
                <p className="mt-1 text-sm text-red-500">
                  {errors.subject.message}
                </p>
              )}
            </div>

            {/* Message */}
            <div>
              <label
                htmlFor="message"
                className="mb-2 block text-sm font-medium text-gray-900"
              >
                Mensaje <span className="text-red-500">*</span>
              </label>
              <textarea
                {...register("message")}
                id="message"
                rows={5}
                className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-[#D95D24] focus:outline-none focus:ring-2 focus:ring-[#D95D24]/20"
                placeholder="Escribe tu mensaje aquí..."
              />
              {errors.message && (
                <p className="mt-1 text-sm text-red-500">
                  {errors.message.message}
                </p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-lg bg-[#D95D24] px-6 py-4 font-semibold uppercase text-white transition hover:bg-[#c04d1a] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSubmitting ? "Enviando..." : "Enviar Mensaje"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
