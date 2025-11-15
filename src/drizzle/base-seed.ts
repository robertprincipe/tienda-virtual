import { drizzle } from "drizzle-orm/node-postgres";
import { roles } from "./schema/users";

export async function baseSeeder() {
  const baseRoles = ["admin", "seller", "customer"];

  const categoriesPermissions = [
    "categories:view",
    "categories:create",
    "categories:update",
    "categories:delete",
  ];

  const productsPermissions = [
    "products:view",
    "products:create",
    "products:update",
    "products:delete",
  ];

  const ordersPermissions = [
    "orders:view",
    "orders:create",
    "orders:update",
    "orders:delete",
  ];

  const basePermissions = [
    ...categoriesPermissions,
    ...productsPermissions,
    ...ordersPermissions,
  ];

  const db = drizzle(process.env.DATABASE_URL!);

  // Insert roles

  for (const roleName of baseRoles) {
    await db.insert(roles).values({ name: roleName });
  }

  for (const permissionName of basePermissions) {
    await db.insert(roles).values({ name: permissionName });
  }
}
