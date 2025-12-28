import { PrismaClient } from "@prisma/client";

// Declare global type for prisma client to prevent multiple instances in development
declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

/**
 * Prisma client singleton
 * In development, we store the client on the global object to prevent
 * creating multiple instances due to hot reloading
 */
export const db = globalThis.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalThis.prisma = db;
}


