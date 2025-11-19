import { ContactForm } from "./_components/contact-form";
import { getPublicStoreInfo } from "@/services/store-settings/actions/public-settings.actions";
import Image from "next/image";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contacto",
  description:
    "¿Tienes preguntas? Contáctanos y nuestro equipo te ayudará. Estamos disponibles para resolver tus dudas y brindarte soporte.",
};

export default async function ContactPage() {
  const storeInfo = await getPublicStoreInfo();

  return (
    <div className="min-h-screen bg-[#FDFCF9]">
      {/* Hero Section */}
      <section className="relative flex h-[50vh] items-center justify-center overflow-hidden bg-[#2E332A]">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-30"
          style={{
            backgroundImage:
              "url(https://images.unsplash.com/photo-1423666639041-f56000c27a9a?q=80&w=2074)",
          }}
        />
        <div className="relative z-10 mx-auto max-w-4xl px-6 text-center">
          <h1 className="mb-6 font-heading text-5xl font-bold uppercase text-white md:text-6xl lg:text-7xl">
            Contacto
          </h1>
          <p className="text-xl text-white/90 md:text-2xl">
            Estamos aquí para responder todas tus preguntas
          </p>
        </div>
      </section>

      {/* Contact Section */}
      <section className="bg-white py-16">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <ContactForm storeInfo={storeInfo} />
        </div>
      </section>

      {/* Map Section (Optional - placeholder) */}
      <section className="bg-[#FDFCF9] py-16">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <h2 className="mb-8 text-center font-heading text-3xl font-bold uppercase text-[#2E332A] md:text-4xl">
            Encuéntranos
          </h2>
          <div className="overflow-hidden rounded-lg border border-gray-200">
            <div className="relative h-[400px] w-full bg-gray-200">
              <Image
                src="https://images.unsplash.com/photo-1524661135-423995f22d0b?q=80&w=2074"
                alt="Ubicación"
                fill
                className="object-cover opacity-50"
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="rounded-lg bg-white p-6 text-center shadow-lg">
                  <p className="text-lg font-semibold text-gray-900">
                    {storeInfo.companyName}
                  </p>
                  {storeInfo.companyCity && storeInfo.companyRegion && (
                    <p className="mt-2 text-gray-600">
                      {storeInfo.companyCity}, {storeInfo.companyRegion}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
          <p className="mt-4 text-center text-sm text-gray-600">
            * El mapa interactivo se puede integrar usando Google Maps API o
            similar
          </p>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="bg-white py-16">
        <div className="mx-auto max-w-4xl px-6 lg:px-8">
          <h2 className="mb-12 text-center font-heading text-3xl font-bold uppercase text-[#2E332A] md:text-4xl">
            Preguntas Frecuentes
          </h2>

          <div className="space-y-6">
            {/* FAQ 1 */}
            <div className="rounded-lg border border-gray-200 bg-[#FDFCF9] p-6">
              <h3 className="mb-2 text-lg font-bold text-gray-900">
                ¿Todos sus productos son realmente orgánicos?
              </h3>
              <p className="text-gray-700">
                Sí, todos nuestros productos cuentan con certificación orgánica
                y son cultivados sin el uso de pesticidas o fertilizantes
                químicos. Cada producto incluye información de trazabilidad.
              </p>
            </div>

            {/* FAQ 2 */}
            <div className="rounded-lg border border-gray-200 bg-[#FDFCF9] p-6">
              <h3 className="mb-2 text-lg font-bold text-gray-900">
                ¿Realizan envíos a todo el país?
              </h3>
              <p className="text-gray-700">
                Sí, realizamos envíos a nivel nacional. Los pedidos mayores a
                S/. 99 tienen envío gratuito. Los tiempos de entrega varían
                según la ubicación.
              </p>
            </div>

            {/* FAQ 3 */}
            <div className="rounded-lg border border-gray-200 bg-[#FDFCF9] p-6">
              <h3 className="mb-2 text-lg font-bold text-gray-900">
                ¿Puedo devolver un producto si no estoy satisfecho?
              </h3>
              <p className="text-gray-700">
                Ofrecemos garantía de satisfacción en todos nuestros productos.
                Si no estás completamente satisfecho, puedes solicitar un cambio
                o devolución dentro de los primeros 7 días.
              </p>
            </div>

            {/* FAQ 4 */}
            <div className="rounded-lg border border-gray-200 bg-[#FDFCF9] p-6">
              <h3 className="mb-2 text-lg font-bold text-gray-900">
                ¿Cómo puedo verificar la autenticidad de los productos?
              </h3>
              <p className="text-gray-700">
                Cada producto incluye información detallada sobre su origen,
                certificación y fecha de producción. Además, trabajamos solo con
                productores verificados y auditados regularmente.
              </p>
            </div>

            {/* FAQ 5 */}
            <div className="rounded-lg border border-gray-200 bg-[#FDFCF9] p-6">
              <h3 className="mb-2 text-lg font-bold text-gray-900">
                ¿Ofrecen descuentos para compras al por mayor?
              </h3>
              <p className="text-gray-700">
                Sí, ofrecemos precios especiales para compras al por mayor y
                clientes corporativos. Contáctanos directamente para conocer
                nuestras tarifas especiales.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
