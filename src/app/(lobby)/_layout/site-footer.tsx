import { Icon } from "@iconify/react";
import Link from "next/link";
import { getFooterInfo } from "@/services/store-settings/actions/public-settings.actions";

export const SiteFooter = async () => {
  const settings = await getFooterInfo();

  // Format phone number for links (remove spaces and special chars)
  const phoneFormatted = settings.phone?.replace(/\s+/g, "") ?? "";
  const whatsappLink = phoneFormatted
    ? `https://api.whatsapp.com/send?phone=${phoneFormatted}&text=Hola,%20necesito%20información`
    : "#";

  return (
    <footer className="bg-zinc-100 py-6">
      <div className="container">
        <div className="grid md:grid-cols-[200px_1fr]">
          <div>
            <Icon
              icon="fluent-emoji-flat:sunrise-over-mountains"
              className="text-6xl"
            />
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-7">
              <h3 className="font-semibold text-sm">Contacto</h3>
              <ul className="space-y-7 text-zinc-600 mb-3 text-sm">
                {settings.phone && (
                  <li>
                    Teléfono:{" "}
                    <a href={`tel:${phoneFormatted}`}>{settings.phone}</a>
                  </li>
                )}
                {settings.email && (
                  <li>
                    Correo electrónico:{" "}
                    <a href={`mailto:${settings.email}`}>{settings.email}</a>
                  </li>
                )}
                {settings.phone && (
                  <li>
                    Whatsapp:{" "}
                    <a
                      href={whatsappLink}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      aquí
                    </a>
                  </li>
                )}
              </ul>
            </div>
            <div className="space-y-7">
              <h3 className="font-semibold text-sm">Enlaces rápidos</h3>
              <ul className="space-y-7 text-zinc-600 mb-3 text-sm">
                <li>
                  <Link href="/about-us">Sobre nosotros</Link>
                </li>
                <li>
                  <Link href="/contact">Contacto</Link>
                </li>
              </ul>
            </div>
            <div className="space-y-7">
              <h3 className="font-semibold text-sm">Servicios</h3>
              <ul className="space-y-7 text-zinc-600 mb-3 text-sm">
                <li>Servicio al cliente</li>
                <li>
                  <Link href="/policies/shipping">Envíos a todo el Perú</Link>
                </li>
              </ul>
            </div>
            <div className="space-y-7">
              <h3 className="font-semibold text-sm">Términos y condiciones</h3>
              <ul className="space-y-7 text-zinc-600 mb-3 text-sm">
                <li>
                  <Link href="/policies/refund">Política de reembolso</Link>
                </li>
                <li>
                  <Link href="/policies/privacy">Política de privacidad</Link>
                </li>
                <li>
                  <Link href="/policies/terms">Términos y condiciones</Link>
                </li>
                <li>
                  <Link href="/policies/shippging">Políticas de envio</Link>
                </li>
              </ul>
            </div>
          </div>
        </div>
        <div>
          <div className="flex justify-end">
            <div className="flex items-center gap-2">
              <Icon icon="logos:visa" />
              <Icon icon="logos:mastercard" className="text-3xl" />
            </div>
          </div>
          <hr className="my-5" />
          <div className="text-xs text-zinc-600">
            &copy; {new Date().getFullYear()} {settings.companyName}. Todos los
            derechos reservados.
          </div>
        </div>
      </div>
    </footer>
  );
};
