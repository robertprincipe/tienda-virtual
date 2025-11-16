"use server";

import { db } from "@/drizzle/db";
import { users } from "@/drizzle/schema";
import { getSession } from "@/lib/session";
import { updateUserSchema, type UpdateUserInput } from "@/schemas/user.schema";
import { eq } from "drizzle-orm";

/**
 * Get current user data
 */
export const getCurrentUser = async () => {
  const session = await getSession();
  if (!session.user) {
    throw new Error("No autenticado");
  }

  const user = await db.query.users.findFirst({
    where: eq(users.id, session.user.id),
  });

  if (!user) {
    throw new Error("Usuario no encontrado");
  }

  return user;
};

/**
 * Update user profile
 * @param userId - ID of user to update (for admin editing other users)
 * @param input - User data to update
 */
export const updateUser = async (
  userId: number | undefined,
  input: UpdateUserInput
) => {
  const session = await getSession();
  if (!session.user) {
    throw new Error("No autenticado");
  }

  // Determine target user ID
  const targetUserId = userId ?? session.user.id;

  // Authorization check: admin can edit anyone, regular users can only edit themselves
  const isAdmin = session.user.roleId === 1;
  if (!isAdmin && targetUserId !== session.user.id) {
    throw new Error("No autorizado para editar este usuario");
  }

  // Validate input
  const data = updateUserSchema.parse(input);

  // Check if target user exists
  const existingUser = await db.query.users.findFirst({
    where: eq(users.id, targetUserId),
  });

  if (!existingUser) {
    throw new Error("Usuario no encontrado");
  }

  // Update user
  const [updatedUser] = await db
    .update(users)
    .set({
      name: data.name,
      paternalLastName: data.paternalLastName || null,
      maternalLastName: data.maternalLastName || null,
      photoUrl: data.photoUrl || null,
      line1: data.line1 || null,
      line2: data.line2 || null,
      city: data.city || null,
      region: data.region || null,
      phone: data.phone || null,
      updatedAt: new Date(),
    })
    .where(eq(users.id, targetUserId))
    .returning();

  // If user updated their own profile, update session
  if (targetUserId === session.user.id) {
    const fullName = [
      updatedUser.name,
      updatedUser.paternalLastName,
      updatedUser.maternalLastName,
    ]
      .filter(Boolean)
      .join(" ")
      .trim();

    session.user = {
      ...session.user,
      name: fullName || updatedUser.name,
      photoUrl: updatedUser.photoUrl,
    };
    await session.save();
  }

  return updatedUser;
};
