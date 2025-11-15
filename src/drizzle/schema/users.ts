// schema/users.ts
import { relations } from "drizzle-orm";
import {
  pgTable,
  serial,
  varchar,
  timestamp,
  integer,
} from "drizzle-orm/pg-core";

export const roles = pgTable("roles", {
  id: serial("id").primaryKey().notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { mode: "date" }).$onUpdateFn(
    () => new Date()
  ),
});

export const permissions = pgTable("permissions", {
  id: serial("id").primaryKey().notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { mode: "date" }).$onUpdateFn(
    () => new Date()
  ),
});

export const rolePermissions = pgTable("role_permissions", {
  roleId: integer("role_id")
    .notNull()
    .references(() => roles.id, {
      onDelete: "cascade",
      onUpdate: "cascade",
    }),
  permissionId: integer("permission_id")
    .notNull()
    .references(() => permissions.id, {
      onDelete: "cascade",
      onUpdate: "cascade",
    }),
});

export const users = pgTable("users", {
  id: serial("id").primaryKey().notNull(),
  roleId: integer("role_id")
    .notNull()
    .references(() => roles.id, {
      onDelete: "restrict",
      onUpdate: "cascade",
    }),
  name: varchar("name", { length: 255 }).notNull(),
  paternalLastName: varchar("paternal_last_name", { length: 255 }),
  maternalLastName: varchar("maternal_last_name", { length: 255 }),
  photoUrl: varchar("photo_url", { length: 500 }),
  line1: varchar("line1", { length: 200 }),
  line2: varchar("line2", { length: 200 }),
  city: varchar("city", { length: 100 }),
  region: varchar("region", { length: 100 }),
  phone: varchar("phone", { length: 32 }),
  email: varchar("email", { length: 255 }).notNull().unique(),
  password: varchar("password", { length: 255 }).notNull(),
  rememberToken: varchar("remember_token", { length: 100 }),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { mode: "date" }).$onUpdateFn(
    () => new Date()
  ),
});

export const rolesRelations = relations(roles, ({ many }) => ({
  users: many(users),
  permissions: many(rolePermissions),
}));

export const usersRelations = relations(users, ({ one }) => ({
  role: one(roles, {
    fields: [users.roleId],
    references: [roles.id],
  }),
}));

export const permissionsRelations = relations(permissions, ({ many }) => ({
  roles: many(rolePermissions),
}));

export const rolePermissionsRelations = relations(
  rolePermissions,
  ({ one }) => ({
    role: one(roles, {
      fields: [rolePermissions.roleId],
      references: [roles.id],
    }),
    permission: one(permissions, {
      fields: [rolePermissions.permissionId],
      references: [permissions.id],
    }),
  })
);
