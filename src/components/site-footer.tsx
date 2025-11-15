export const SiteFooter = () => {
  return (
    <footer className="bg-[#2E332A] py-12 text-white">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {/* Sobre Nosotros */}
          <div>
            <h3 className="mb-4 font-semibold uppercase">Sobre Nosotros</h3>
            <ul className="space-y-2 text-sm text-white/80">
              <li>
                <a href="/about-us" className="hover:text-[#D95D24]">
                  Nuestra Historia
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-[#D95D24]">
                  Preguntas Frecuentes
                </a>
              </li>
              <li>
                <a href="/contact" className="hover:text-[#D95D24]">
                  Contáctanos
                </a>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="mb-4 font-semibold uppercase">Legal</h3>
            <ul className="space-y-2 text-sm text-white/80">
              <li>
                <a href="#" className="hover:text-[#D95D24]">
                  Políticas de Privacidad
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-[#D95D24]">
                  Términos y Condiciones
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-[#D95D24]">
                  Política de Devoluciones
                </a>
              </li>
            </ul>
          </div>

          {/* Contacto */}
          <div>
            <h3 className="mb-4 font-semibold uppercase">Contacto</h3>
            <div className="space-y-2 text-sm text-white/80">
              <p>Av. Principal 123</p>
              <p>Lima, Perú</p>
              <p className="mt-3">Teléfono: +51 999 999 999</p>
              <p>Email: contacto@sp-soluciones.com</p>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 border-t border-white/20 pt-8 text-center text-xs text-white/60">
          <p>
            ©2025 S & P Soluciones Integrales. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
};
