import { Icon } from "@iconify/react";
import Link from "next/link";

// export const sql = `--sql
// SELECT firstName FROM dia.users WHERE id = 1;
// `

export const SiteFooter = () => {
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
                <li>
                  Telefono:
                  <a href="tel:+51910675721">+51 910 675 721</a>
                </li>
                <li>
                  Correo electrónico:
                  <a href="mailto:mail@to.com">mail@to.com</a>
                </li>
                <li>
                  Whatsapp:{" "}
                  <a
                    href="https://api.whatsapp.com/send?phone=51910675721&text=%F0%9F%98%AC%20hola%20como%20esta"
                    target="_blank"
                  >
                    aquí
                  </a>
                </li>
              </ul>
              <div className="flex items-center gap-2">
                <Icon icon="logos:tiktok-icon" className="text-2xl" />
                <Icon icon="skill-icons:instagram" className="text-2xl" />
                <Icon icon="logos:facebook" className="text-2xl" />
              </div>
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
                <li>
                  <Link href="/faq">Preguntas frecuentes</Link>
                </li>
              </ul>
            </div>
            <div className="space-y-7">
              <h3 className="font-semibold text-sm">Servicios</h3>
              <ul className="space-y-7 text-zinc-600 mb-3 text-sm">
                <li>Servicio al cliente</li>
                <li>
                  <Link href="/shipping">Envíos a todo el Perú</Link>
                </li>
                <li>
                  <Link href="/returns">Devoluciones</Link>
                </li>
              </ul>
            </div>
            <div className="space-y-7">
              <h3 className="font-semibold text-sm">Terminos y condiciones</h3>
              <ul className="space-y-7 text-zinc-600 mb-3 text-sm">
                <li>
                  <Link href="/">Política de reembolso</Link>
                </li>

                <li>
                  <Link href="/">Política de privacidad</Link>
                </li>

                <li>
                  <Link href="/terms">Términos y condiciones</Link>
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
          <div className="flex items-center gap-0.5 text-xs">
            <div>&copy; {new Date().getFullYear()} Dia. desarrolla por </div>
            <a
              href="http://make.com.pe"
              target="_blank"
              rel="noopener noreferrer"
            >
              make
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};
