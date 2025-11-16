import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const CART_COOKIE_NAME = "cart_id";

export function cartMiddleware(request: NextRequest) {
  const response = NextResponse.next();

  // Verificar si existe la cookie del carrito
  const cartId = request.cookies.get(CART_COOKIE_NAME);

  // Si no existe cookie de carrito, no hacemos nada aquí
  // El carrito se creará cuando el usuario agregue un producto
  // Esto evita crear carritos vacíos innecesariamente

  return response;
}

/**
 * Hook del cliente para inicializar el carrito al cargar la aplicación
 */
export function useCartInitialization() {
  // Este hook se debe usar en el componente raíz de la aplicación
  // para cargar el carrito cuando el usuario accede a la página
}
