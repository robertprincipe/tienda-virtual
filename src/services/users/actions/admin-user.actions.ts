"use server";

import { db } from "@/drizzle/db";
import { roles, users } from "@/drizzle/schema";
import { hashPassword } from "@/lib/password";
import {
  userFormSchema,
  type GetPaginatedUsersInput,
  type UserFormValues,
  type UserListItem,
} from "@/schemas/admin-user.schema";
import type { PaginatedUsers } from "@/types/user";
import {
  and,
  asc,
  count,
  desc,
  eq,
  getTableColumns,
  ilike,
  or,
} from "drizzle-orm";

const sanitizeValue = (value?: string | null) =>
  value && value.trim().length > 0 ? value.trim() : null;

const buildSort = (sort?: string) => {
  const [column, direction] = sort?.split(".") ?? ["createdAt", "desc"];

  switch (column) {
    case "name":
      return direction === "asc" ? asc(users.name) : desc(users.name);
    case "email":
      return direction === "asc" ? asc(users.email) : desc(users.email);
    case "role":
      return direction === "asc" ? asc(users.roleId) : desc(users.roleId);
    case "createdAt":
    default:
      return direction === "asc" ? asc(users.createdAt) : desc(users.createdAt);
  }
};

const buildFilters = (input: GetPaginatedUsersInput) => {
  const search = input.search?.trim();
  const searchFilter = search
    ? or(
        ilike(users.name, `%${search}%`),
        ilike(users.email, `%${search}%`),
        ilike(users.paternalLastName, `%${search}%`),
        ilike(users.maternalLastName, `%${search}%`)
      )
    : undefined;

  return and(searchFilter, input.roleId ? eq(users.roleId, input.roleId) : undefined);
};

export const getUsersPaginated = async (
  input: GetPaginatedUsersInput
): Promise<PaginatedUsers> => {
  const filters = buildFilters(input);
  const offset = (input.page - 1) * input.per_page;

  const userColumns = getTableColumns(users);
  const roleColumns = {
    id: roles.id,
    name: roles.name,
  };

  const { data, total } = await db.transaction(async (tx) => {
    const data = await tx
      .select({
        ...userColumns,
        role: roleColumns,
      })
      .from(users)
      .leftJoin(roles, eq(users.roleId, roles.id))
      .where(filters)
      .orderBy(buildSort(input.sort))
      .limit(input.per_page)
      .offset(offset);

    const total = await tx
      .select({ count: count() })
      .from(users)
      .where(filters)
      .execute()
      .then((rows) => rows[0]?.count ?? 0);

    return { data, total };
  });

  const pageCount = Math.ceil(total / input.per_page);

  return {
    message: "Usuarios obtenidos correctamente",
    result: {
      data: data as UserListItem[],
      count: data.length,
      pageCount,
      total,
      nextPage: input.page < pageCount ? input.page + 1 : null,
      currentPage: input.page,
      minMax: {
        min: data.length > 0 ? (input.page - 1) * input.per_page + 1 : 0,
        max:
          data.length > 0
            ? (input.page - 1) * input.per_page + data.length
            : 0,
      },
    },
  };
};

export const getUser = async (id: number) => {
  const user = await db.query.users.findFirst({
    where: eq(users.id, id),
    with: {
      role: true,
    },
  });

  if (!user) {
    return null;
  }

  return user as UserListItem;
};

export const getRoles = async () => {
  return await db.query.roles.findMany({
    orderBy: (roles, { asc }) => asc(roles.name),
  });
};

export const createUserAdmin = async (input: UserFormValues) => {
  const data = userFormSchema.parse(input);

  const existing = await db.query.users.findFirst({
    where: eq(users.email, data.email),
    columns: { id: true },
  });

  if (existing) {
    throw new Error("El correo ya está registrado");
  }

  if (!data.password) {
    throw new Error("La contraseña es obligatoria");
  }

  const hashedPassword = await hashPassword(data.password);

  const [created] = await db
    .insert(users)
    .values({
      roleId: data.roleId,
      name: data.name,
      paternalLastName: sanitizeValue(data.paternalLastName),
      maternalLastName: sanitizeValue(data.maternalLastName),
      photoUrl: sanitizeValue(data.photoUrl),
      line1: sanitizeValue(data.line1),
      line2: sanitizeValue(data.line2),
      city: sanitizeValue(data.city),
      region: sanitizeValue(data.region),
      phone: sanitizeValue(data.phone),
      email: data.email,
      password: hashedPassword,
    })
    .returning({ id: users.id });

  return {
    message: `Usuario #${created.id} creado correctamente`,
    result: {
      id: created.id,
    },
  };
};

export const updateUserAdmin = async (input: UserFormValues & { id: number }) => {
  const { id, ...rest } = input;
  const data = userFormSchema.parse(rest);

  const existing = await db.query.users.findFirst({
    where: eq(users.id, id),
    columns: { id: true, email: true },
  });

  if (!existing) {
    throw new Error("El usuario no existe");
  }

  if (existing.email !== data.email) {
    const duplicate = await db.query.users.findFirst({
      where: eq(users.email, data.email),
      columns: { id: true },
    });

    if (duplicate) {
      throw new Error("El correo ya está registrado");
    }
  }

  let hashedPassword: string | undefined;
  if (data.password) {
    hashedPassword = await hashPassword(data.password);
  }

  const updatePayload: Record<string, unknown> = {
    roleId: data.roleId,
    name: data.name,
    paternalLastName: sanitizeValue(data.paternalLastName),
    maternalLastName: sanitizeValue(data.maternalLastName),
    photoUrl: sanitizeValue(data.photoUrl),
    line1: sanitizeValue(data.line1),
    line2: sanitizeValue(data.line2),
    city: sanitizeValue(data.city),
    region: sanitizeValue(data.region),
    phone: sanitizeValue(data.phone),
    email: data.email,
    updatedAt: new Date(),
  };

  if (hashedPassword) {
    updatePayload.password = hashedPassword;
  }

  const [updated] = await db
    .update(users)
    .set(updatePayload)
    .where(eq(users.id, id))
    .returning({ id: users.id });

  return {
    message: `Usuario #${updated.id} actualizado correctamente`,
    result: {
      id: updated.id,
    },
  };
};

export const deleteUserAdmin = async (id: number) => {
  const [deleted] = await db
    .delete(users)
    .where(eq(users.id, id))
    .returning({ id: users.id });

  if (!deleted) {
    throw new Error("El usuario no existe");
  }

  return {
    message: `Usuario #${deleted.id} eliminado correctamente`,
    result: {
      id: deleted.id,
    },
  };
};
