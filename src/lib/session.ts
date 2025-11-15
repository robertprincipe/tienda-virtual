import { getIronSession, type SessionOptions } from "iron-session";
import { cookies } from "next/headers";

import type { SessionData } from "@/types/auth";

const sessionPassword = process.env.IRON_SESSION_PASSWORD;

if (!sessionPassword) {
  throw new Error(
    "IRON_SESSION_PASSWORD env variable is required for authentication"
  );
}

export const sessionOptions: SessionOptions = {
  password: sessionPassword,
  cookieName:
    process.env.IRON_SESSION_COOKIE_NAME ?? "sp-soluciones-integrales-session",
  cookieOptions: {
    secure: process.env.NODE_ENV === "production",
  },
  ttl: 60 * 60 * 24 * 7, // 7 days
};

export async function getSession() {
  const cookiesSession = await cookies();
  const session = await getIronSession<SessionData>(
    cookiesSession,
    sessionOptions
  );
  return session;
}
