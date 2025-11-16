import { getCurrentUser } from "@/services/auth/actions/auth.actions";
import { getUserOrders } from "@/services/orders/actions/order.actions";
import { redirect } from "next/navigation";
import AccountClient from "./page.client";

export default async function AccountPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  // Obtener las órdenes del usuario
  const ordersResult = await getUserOrders(user.id);
  const orders = ordersResult.success ? ordersResult.data || [] : [];

  return <AccountClient user={user} orders={orders} />;
}
