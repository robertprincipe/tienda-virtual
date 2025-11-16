"use server";

import { db } from "@/drizzle/db";
import { users } from "@/drizzle/schema";
import { hashPassword, verifyPassword } from "@/lib/password";
import { getSession } from "@/lib/session";
import {
  loginUserSchema,
  registerUserSchema,
  type LoginUserInput,
  type RegisterUserInput,
} from "@/schemas/auth.schema";
import type { SessionUser } from "@/types/auth";
import { eq } from "drizzle-orm";

const DEFAULT_ROLE_ID = 3;

type UserRecord = typeof users.$inferSelect;

const buildFullName = (
  name?: string | null,
  paternal?: string | null,
  maternal?: string | null
) =>
  [name, paternal, maternal]
    .map((value) => value?.trim())
    .filter((value) => value && value.length > 0)
    .join(" ")
    .trim();

const mapSessionUser = (record: UserRecord): SessionUser => ({
  id: record.id,
  email: record.email,
  roleId: record.roleId,
  photoUrl: record.photoUrl,
  name:
    buildFullName(
      record.name,
      record.paternalLastName,
      record.maternalLastName
    ) || record.name,
});

export const registerUser = async (input: RegisterUserInput) => {
  const data = registerUserSchema.parse(input);

  const email = data.email.toLowerCase();
  const existing = await db.query.users.findFirst({
    where: eq(users.email, email),
  });

  if (existing) {
    throw new Error("El correo ya está registrado");
  }

  const hashedPassword = await hashPassword(data.password);

  const name = data.name.trim();
  const paternal = data.paternalLastName.trim();
  const maternal = data.maternalLastName?.trim();

  const [created] = await db
    .insert(users)
    .values({
      roleId: DEFAULT_ROLE_ID,
      name,
      paternalLastName: paternal,
      maternalLastName: maternal || null,
      email,
      password: hashedPassword,
    })
    .returning();

  const session = await getSession();
  session.user = mapSessionUser(created);
  await session.save();

  return {
    message: "Registro exitoso",
    user: session.user,
  };
};

export const loginUser = async (input: LoginUserInput) => {
  const data = loginUserSchema.parse(input);
  const email = data.email.toLowerCase();

  const userRecord = await db.query.users.findFirst({
    where: eq(users.email, email),
  });

  if (!userRecord) {
    throw new Error("Credenciales incorrectas");
  }

  const isValidPassword = await verifyPassword(
    data.password,
    userRecord.password
  );

  if (!isValidPassword) {
    throw new Error("Credenciales incorrectas");
  }

  const session = await getSession();
  session.user = mapSessionUser(userRecord);
  await session.save();

  return {
    message: "Inicio de sesión exitoso",
    user: session.user,
  };
};

export const logoutUser = async () => {
  const session = await getSession();
  await session.destroy();

  return {
    message: "Sesión cerrada",
  };
};

export const getCurrentUser = async () => {
  const session = await getSession();

  if (!session.user) {
    return null;
  }

  const userRecord = await db.query.users.findFirst({
    where: eq(users.id, session.user.id),
  });

  if (!userRecord) {
    await session.destroy();
    return null;
  }

  return mapSessionUser(userRecord);
};
