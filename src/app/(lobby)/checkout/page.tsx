import { getSession } from "@/lib/session";
import CheckoutClient from "./page.client";

export default async function CheckoutPage() {
  const session = await getSession();

  // Permitir checkout tanto para usuarios autenticados como anónimos
  // Solo necesitamos pasar los datos del usuario si existe
  const user = session.user
    ? {
        id: session.user.id,
        email: session.user.email,
        name: session.user.name,
      }
    : null;

  return <CheckoutClient user={user} />;
}
