import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getSession } from "@/lib/session";

const CART_COOKIE_NAME = "cart_id";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Rutas donde necesitamos validar/crear cart_id
  const cartRoutes = ["/products", "/categories", "/checkout", "/cart"];
  const needsCart = cartRoutes.some((route) => pathname.startsWith(route));

  // Validar o crear cart_id si estamos en rutas relevantes
  if (needsCart) {
    const cartId = request.cookies.get(CART_COOKIE_NAME)?.value;

    if (!cartId) {
      // Si no hay cart_id, crear uno nuevo vía server action se hará en el cliente
      // Aquí solo podemos setear un header para indicar que falta
      const response = NextResponse.next();
      response.headers.set("x-cart-missing", "true");
      return response;
    }
  }

  // Rutas protegidas que requieren autenticación
  const protectedRoutes = ["/account", "/dashboard"];
  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  );

  if (isProtectedRoute) {
    const session = await getSession();

    // Si no está autenticado, redirigir a login
    if (!session.user) {
      const url = new URL("/login", request.url);
      url.searchParams.set("from", pathname);
      return NextResponse.redirect(url);
    }

    // Si es customer (roleId = 3) intentando acceder al dashboard
    if (pathname.startsWith("/dashboard") && session.user.roleId === 3) {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/account/:path*",
    "/dashboard/:path*",
    "/products/:path*",
    "/categories/:path*",
    "/checkout/:path*",
    "/cart/:path*",
  ],
};
