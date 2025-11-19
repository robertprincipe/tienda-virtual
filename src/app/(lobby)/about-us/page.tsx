import { getPublicStoreInfo } from "@/services/store-settings/actions/public-settings.actions";
import { CheckCircle, Heart, Leaf, ShieldCheck, Users } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Nosotros",
  description:
    "Conoce nuestra historia, misión y valores. Descubre quiénes somos y por qué somos tu mejor opción de compra.",
};

export default async function AboutUsPage() {
  const storeInfo = await getPublicStoreInfo();

  return (
    <div className="min-h-screen bg-[#FDFCF9]">
      {/* Hero Section */}
      <section className="relative flex h-[60vh] items-center justify-center overflow-hidden bg-[#2E332A]">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-30"
          style={{
            backgroundImage:
              "url(https://images.unsplash.com/photo-1464226184884-fa280b87c399?q=80&w=2070)",
          }}
        />
        <div className="relative z-10 mx-auto max-w-4xl px-6 text-center">
          <h1 className="mb-6 font-heading text-5xl font-bold uppercase text-white md:text-6xl lg:text-7xl">
            Sobre Nosotros
          </h1>
          <p className="text-xl text-white/90 md:text-2xl">
            Comprometidos con la calidad y autenticidad de productos orgánicos
          </p>
        </div>
      </section>

      {/* Mission Section */}
      <section className="bg-white py-16">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:items-center">
            <div className="relative h-[400px] overflow-hidden rounded-lg lg:h-[500px]">
              <Image
                src="https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=2074"
                alt="Productos orgánicos"
                fill
                className="object-cover"
              />
            </div>
            <div>
              <h2 className="mb-6 font-heading text-4xl font-bold uppercase text-[#2E332A] md:text-5xl">
                Nuestra Misión
              </h2>
              <p className="mb-4 text-lg leading-relaxed text-gray-700">
                En <strong>{storeInfo.companyName}</strong>, nos dedicamos a
                ofrecer productos orgánicos de la más alta calidad que promuevan
                un estilo de vida saludable y sostenible.
              </p>
              <p className="mb-4 text-lg leading-relaxed text-gray-700">
                Creemos que la alimentación consciente comienza con la elección
                de productos auténticos, cultivados con respeto por la
                naturaleza y sin el uso de químicos dañinos.
              </p>
              <p className="text-lg leading-relaxed text-gray-700">
                Trabajamos directamente con productores locales que comparten
                nuestros valores, garantizando transparencia y trazabilidad en
                cada etapa del proceso.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="bg-[#FDFCF9] py-16">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <h2 className="mb-12 text-center font-heading text-4xl font-bold uppercase text-[#2E332A] md:text-5xl">
            Nuestros Valores
          </h2>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {/* Value 1 */}
            <div className="rounded-lg border border-gray-200 bg-white p-8 text-center shadow-sm transition hover:shadow-md">
              <div className="mb-4 flex justify-center">
                <Leaf className="h-12 w-12 text-[#D95D24]" />
              </div>
              <h3 className="mb-3 text-xl font-bold text-gray-900">
                100% Orgánico
              </h3>
              <p className="text-gray-600">
                Todos nuestros productos están certificados como orgánicos, sin
                pesticidas ni químicos artificiales.
              </p>
            </div>

            {/* Value 2 */}
            <div className="rounded-lg border border-gray-200 bg-white p-8 text-center shadow-sm transition hover:shadow-md">
              <div className="mb-4 flex justify-center">
                <ShieldCheck className="h-12 w-12 text-[#D95D24]" />
              </div>
              <h3 className="mb-3 text-xl font-bold text-gray-900">
                Calidad Garantizada
              </h3>
              <p className="text-gray-600">
                Rigurosos controles de calidad en cada etapa para asegurar la
                excelencia de nuestros productos.
              </p>
            </div>

            {/* Value 3 */}
            <div className="rounded-lg border border-gray-200 bg-white p-8 text-center shadow-sm transition hover:shadow-md">
              <div className="mb-4 flex justify-center">
                <Users className="h-12 w-12 text-[#D95D24]" />
              </div>
              <h3 className="mb-3 text-xl font-bold text-gray-900">
                Apoyo Local
              </h3>
              <p className="text-gray-600">
                Trabajamos con productores locales, impulsando la economía y
                agricultura sostenible de nuestra región.
              </p>
            </div>

            {/* Value 4 */}
            <div className="rounded-lg border border-gray-200 bg-white p-8 text-center shadow-sm transition hover:shadow-md">
              <div className="mb-4 flex justify-center">
                <Heart className="h-12 w-12 text-[#D95D24]" />
              </div>
              <h3 className="mb-3 text-xl font-bold text-gray-900">
                Pasión por la Salud
              </h3>
              <p className="text-gray-600">
                Nuestro compromiso es contribuir al bienestar de nuestros
                clientes y sus familias.
              </p>
            </div>

            {/* Value 5 */}
            <div className="rounded-lg border border-gray-200 bg-white p-8 text-center shadow-sm transition hover:shadow-md">
              <div className="mb-4 flex justify-center">
                <CheckCircle className="h-12 w-12 text-[#D95D24]" />
              </div>
              <h3 className="mb-3 text-xl font-bold text-gray-900">
                Transparencia
              </h3>
              <p className="text-gray-600">
                Trazabilidad completa desde el origen hasta tu mesa, para que
                sepas exactamente qué consumes.
              </p>
            </div>

            {/* Value 6 */}
            <div className="rounded-lg border border-gray-200 bg-white p-8 text-center shadow-sm transition hover:shadow-md">
              <div className="mb-4 flex justify-center">
                <Leaf className="h-12 w-12 text-[#D95D24]" />
              </div>
              <h3 className="mb-3 text-xl font-bold text-gray-900">
                Sostenibilidad
              </h3>
              <p className="text-gray-600">
                Prácticas agrícolas responsables que protegen el medio ambiente
                para futuras generaciones.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Our Story Section */}
      <section className="bg-white py-16">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:items-center">
            <div className="order-2 lg:order-1">
              <h2 className="mb-6 font-heading text-4xl font-bold uppercase text-[#2E332A] md:text-5xl">
                Nuestra Historia
              </h2>
              <p className="mb-4 text-lg leading-relaxed text-gray-700">
                {storeInfo.companyName} nació de la convicción de que todos
                merecen acceso a alimentos genuinos y nutritivos. Lo que comenzó
                como un pequeño proyecto familiar, ha crecido hasta convertirse
                en una referencia de productos orgánicos en la región.
              </p>
              <p className="mb-4 text-lg leading-relaxed text-gray-700">
                Desde nuestros inicios, hemos mantenido nuestro compromiso con
                la autenticidad, seleccionando cuidadosamente cada producto y
                forjando relaciones duraderas con productores que comparten
                nuestra visión.
              </p>
              <p className="mb-6 text-lg leading-relaxed text-gray-700">
                Hoy, con más de 1,000 clientes satisfechos, continuamos
                trabajando para hacer que la alimentación orgánica sea accesible
                para todas las familias.
              </p>
              <Link
                href="/products"
                className="inline-block rounded-md bg-[#D95D24] px-8 py-4 font-semibold uppercase text-white transition hover:bg-[#c04d1a]"
              >
                Ver Productos
              </Link>
            </div>
            <div className="order-1 lg:order-2">
              <div className="relative h-[400px] overflow-hidden rounded-lg lg:h-[500px]">
                <Image
                  src="https://images.unsplash.com/photo-1464226184884-fa280b87c399?q=80&w=2070"
                  alt="Nuestra historia"
                  fill
                  className="object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-[#2E332A] py-16">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <h2 className="mb-6 font-heading text-4xl font-bold uppercase text-white md:text-5xl">
            Únete a Nuestra Comunidad
          </h2>
          <p className="mb-8 text-xl text-white/90">
            Forma parte de la familia que elige calidad, salud y sostenibilidad
            en cada compra.
          </p>
          <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
            <Link
              href="/products"
              className="inline-block rounded-md bg-[#D95D24] px-8 py-4 font-semibold uppercase text-white transition hover:bg-[#c04d1a]"
            >
              Explorar Productos
            </Link>
            <Link
              href="/contact"
              className="inline-block rounded-md border-2 border-white bg-transparent px-8 py-4 font-semibold uppercase text-white transition hover:bg-white hover:text-[#2E332A]"
            >
              Contáctanos
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
